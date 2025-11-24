import os
import shutil
import uuid
import json
import pdfplumber
import ollama
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.postulante import postulante as PostulanteModel
from app.schemas.schema_postulante import PostulanteCreate, PostulanteUpdate

# Constantes
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PostulanteService:
    
    def __init__(self, db: Session):
        self.db = db

    def _extraer_texto_pdf(self, ruta_archivo: str) -> str:
        """Función privada para leer texto de un PDF"""
        texto_completo = ""
        try:
            with pdfplumber.open(ruta_archivo) as pdf:
                for pagina in pdf.pages:
                    texto_extraido = pagina.extract_text()
                    if texto_extraido:
                        texto_completo += texto_extraido + "\n"
        except Exception as e:
            print(f"Error leyendo PDF: {e}")
            return ""
        return texto_completo

    def _analizar_con_ollama(self, texto_cv: str, descripcion_puesto: str = "Puesto genérico en restaurante") -> dict:
        """
        Envía el texto a Ollama (Llama 3.1) y fuerza una respuesta JSON estructurada.
        """
        prompt = f"""
        Actúa como un reclutador experto para un restaurante. Analiza el siguiente CV.
        
        DESCRIPCIÓN DEL PUESTO:
        {descripcion_puesto}
        
        CV DEL CANDIDATO:
        {texto_cv}
        
        INSTRUCCIONES:
        1. Extrae el nombre del candidato (si no está, pon "Desconocido").
        2. Evalúa sus habilidades.
        3. Asigna un puntaje de 0 a 100 basado en relevancia para el puesto.
        4. Decide si es APTO para una entrevista.
        
        Responde ÚNICAMENTE con este formato JSON:
        {{
            "nombre": "Nombre detectado",
            "puntuacion": 85,
            "razonamiento": "Resumen breve de 2 lineas sobre sus habilidades.",
            "es_apto": true
        }}
        """
        
        try:
            response = ollama.chat(
                model='llama3.1:8b', 
                messages=[{'role': 'user', 'content': prompt}],
                format='json', 
                options={'temperature': 0.1}
            )
            return json.loads(response['message']['content'])
        except Exception as e:
            print(f"Error en Ollama: {e}")
            # Retorno por defecto en caso de fallo de IA para no romper la app
            return {
                "nombre": "Error IA",
                "puntuacion": 0,
                "razonamiento": "No se pudo procesar el CV con IA.",
                "es_apto": False
            }

    async def crear_postulante_desde_cv(self, file: UploadFile, telefono: str, correo: str) -> PostulanteModel:
        """
        Lógica principal: Sube archivo -> Lee PDF -> Analiza con IA -> Guarda en BD
        """
        # 1. Generar nombre único y guardar archivo
        extension = file.filename.split(".")[-1]
        nombre_archivo = f"{uuid.uuid4()}.{extension}"
        ruta_completa = os.path.join(UPLOAD_DIR, nombre_archivo)
        
        try:
            with open(ruta_completa, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error guardando archivo: {e}")

        # 2. Procesar con IA
        texto_cv = self._extraer_texto_pdf(ruta_completa)
        if not texto_cv:
            # Si el PDF es imagen y no tiene texto seleccionable, advertimos
            analisis = {
                "nombre": "No legible", 
                "puntuacion": 0, 
                "razonamiento": "El PDF parece ser una imagen o está vacío.", 
                "es_apto": False
            }
        else:
            analisis = self._analizar_con_ollama(texto_cv)

        # 3. Crear registro en BD
        # Priorizamos los datos del formulario (correo/telefono), pero usamos el nombre detectado por la IA si se desea
        db_postulante = PostulanteModel(
            nombre=analisis.get("nombre", "Candidato"),
            telefono=telefono,
            correo=correo,
            ruta_cv=ruta_completa,
            rol_id=1,  # Rol genérico por defecto
            match_score=analisis.get("puntuacion", 0),
            analisis_ia=analisis.get("razonamiento", ""),
            es_apto=analisis.get("es_apto", False)
        )

        self.db.add(db_postulante)
        self.db.commit()
        self.db.refresh(db_postulante)
        
        return db_postulante

    def obtener_postulantes(self, skip: int = 0, limit: int = 100):
        """Obtiene la lista paginada de postulantes"""
        return self.db.query(PostulanteModel).offset(skip).limit(limit).all()

    def obtener_postulante_por_id(self, postulante_id: int):
        """Obtiene un postulante por ID"""
        return self.db.query(PostulanteModel).filter(PostulanteModel.id == postulante_id).first()

    def actualizar_postulante(self, postulante_id: int, datos_update: PostulanteUpdate):
        """Actualiza datos manuales (ej: RRHH cambia si es apto o corrige el teléfono)"""
        db_postulante = self.obtener_postulante_por_id(postulante_id)
        if not db_postulante:
            return None
        
        # Actualizamos solo los campos que vienen en el schema (excluyendo nulos)
        for key, value in datos_update.dict(exclude_unset=True).items():
            setattr(db_postulante, key, value)
            
        self.db.commit()
        self.db.refresh(db_postulante)
        return db_postulante

    def generar_contexto_para_chatbot(self, limite: int = 50) -> str:
        """
        RAG SIMPLE: Convierte los datos de la base de datos en un String 
        para que el Chatbot tenga contexto.
        """
        # Filtramos preferiblemente los que tienen match_score alto primero
        candidatos = self.db.query(PostulanteModel).order_by(PostulanteModel.match_score.desc()).limit(limite).all()
        
        if not candidatos:
            return "No hay candidatos disponibles en la base de datos."
            
        contexto = "LISTA DE CANDIDATOS (Formato: ID | Nombre | Score | Resumen):\n"
        for c in candidatos:
            estado = "APTO" if c.es_apto else "NO APTO"
            contexto += f"- ID {c.id}: {c.nombre} ({c.correo}). Score: {c.match_score}/100. Estado: {estado}. Habilidades: {c.analisis_ia}\n"
            
        return contexto