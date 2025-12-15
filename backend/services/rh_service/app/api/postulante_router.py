from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import ollama # Necesario para el chat final

# Importaciones de tu proyecto
from app.database import get_db
from app.services.postulante_service import PostulanteService
from app.schemas.schema_postulante import PostulanteResponse, PostulanteUpdate

router = APIRouter(redirect_slashes=False)

# --- Esquema simple para el Chat (Request Body) ---
class ChatRequest(BaseModel):
    pregunta: str

# 1. Endpoint para POSTULAR (Subir CV)
@router.post("", response_model=PostulanteResponse, status_code=status.HTTP_201_CREATED)
async def crear_postulacion(
    file: UploadFile = File(...), 
    telefono: str = Form(...), 
    correo: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Recibe un PDF, telefono y correo. 
    Analiza el PDF con IA y guarda el postulante.
    """
    service = PostulanteService(db)
    
    # Validar extensión
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

    return await service.crear_postulante_desde_cv(file, telefono, correo)

# 2. Endpoint para LISTAR Postulantes
@router.get("", response_model=List[PostulanteResponse])
def listar_postulantes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = PostulanteService(db)
    return service.obtener_postulantes(skip, limit)

# 3. Endpoint para obtener un Postulante por ID
@router.get("/{postulante_id}", response_model=PostulanteResponse)
def obtener_postulante(postulante_id: int, db: Session = Depends(get_db)):
    service = PostulanteService(db)
    postulante = service.obtener_postulante_por_id(postulante_id)
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")
    return postulante

# 4. Endpoint para ACTUALIZAR (Ej: Cambiar a Apto manualmente)
@router.patch("/{postulante_id}", response_model=PostulanteResponse)
def actualizar_postulante(
    postulante_id: int, 
    datos: PostulanteUpdate, 
    db: Session = Depends(get_db)
):
    service = PostulanteService(db)
    postulante = service.actualizar_postulante(postulante_id, datos)
    if not postulante:
        raise HTTPException(status_code=404, detail="Postulante no encontrado")
    return postulante

# 5. Endpoint para el CHATBOT DE RRHH (RAG)
@router.post("/chat-rrhh")
def chat_rrhh(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Interactúa con la IA inyectando el contexto de los candidatos actuales.
    """
    service = PostulanteService(db)
    
    # Paso 1: Recuperar contexto de la BD
    contexto_bd = service.generar_contexto_para_chatbot()
    
    # Paso 2: Construir el prompt del sistema
    system_prompt = f"""
    Eres un asistente experto en Recursos Humanos para un restaurante. 
    Responde preguntas basándote ÚNICAMENTE en la siguiente lista de candidatos.
    Si no encuentras información, dilo. No inventes datos.
    
    {contexto_bd}
    """
    
    # Paso 3: Llamar a Ollama
    try:
        response = ollama.chat(
            model='llama3.1:8b', 
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': request.pregunta}
            ],
            options={'temperature': 0.3}
        )
        return {"respuesta": response['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en IA: {str(e)}")