"""
Script para poblar la base de datos con documentos legales de ejemplo del restaurante.
Estos son documentos a nivel de negocio (licencias, permisos), no de empleados individuales.
"""
import sys
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.document import Document
from app.models.employee import Employee

def seed_legal_documents():
    """
    Crea documentos legales de ejemplo si no existen.
    Para que funcione con el sistema actual, los asignaremos al primer empleado
    que tengamos, o crearemos un "empleado ficticio" que represente al restaurante.
    """
    db: Session = SessionLocal()
    
    try:
        # Verificar si ya tenemos documentos
        existing_docs = db.query(Document).count()
        if existing_docs > 0:
            print(f"✅ Ya existen {existing_docs} documentos en la base de datos.")
            print("¿Deseas agregar más documentos de ejemplo? (S/N)")
            response = input().strip().upper()
            if response != 'S':
                print("Operación cancelada.")
                return
        
        # Buscar el primer empleado o crear uno ficticio para el restaurante
        first_employee = db.query(Employee).first()
        
        if not first_employee:
            print("⚠️  No hay empleados en la base de datos.")
            print("Los documentos legales necesitan estar asociados a un empleado.")
            print("Por favor, crea al menos un empleado primero.")
            return
        
        employee_id = first_employee.id
        print(f"📄 Creando documentos legales asociados al empleado ID: {employee_id}")
        
        # Documentos legales de ejemplo para el restaurante
        legal_docs = [
            {
                "tipo": "Licencia de Funcionamiento",
                "url_archivo": "https://example.com/licenses/funcionamiento_2024.pdf",
                "fecha_vencimiento": date.today() + timedelta(days=120),  # En 4 meses
                "aprobado_admin": True
            },
            {
                "tipo": "Certificado Sanitario",
                "url_archivo": "https://example.com/licenses/sanitario_2024.pdf",
                "fecha_vencimiento": date.today() + timedelta(days=25),  # Por vencer (warning)
                "aprobado_admin": True
            },
            {
                "tipo": "Permiso de Bomberos",
                "url_archivo": "https://example.com/licenses/bomberos_2024.pdf",
                "fecha_vencimiento": date.today() - timedelta(days=10),  # Vencido (critical)
                "aprobado_admin": True
            },
            {
                "tipo": "Registro de Impuestos (SIN)",
                "url_archivo": "https://example.com/licenses/sin_2024.pdf",
                "fecha_vencimiento": None,  # Indefinido
                "aprobado_admin": True
            },
            {
                "tipo": "Licencia de Publicidad Exterior",
                "url_archivo": "https://example.com/licenses/publicidad_2024.pdf",
                "fecha_vencimiento": date.today() + timedelta(days=200),
                "aprobado_admin": False  # Pendiente de aprobación
            },
            {
                "tipo": "Permiso de Uso de Suelo",
                "url_archivo": "https://example.com/licenses/uso_suelo_2024.pdf",
                "fecha_vencimiento": date.today() + timedelta(days=90),
                "aprobado_admin": True
            },
        ]
        
        # Crear documentos
        created_count = 0
        for doc_data in legal_docs:
            new_doc = Document(
                employee_id=employee_id,
                tipo=doc_data["tipo"],
                url_archivo=doc_data["url_archivo"],
                fecha_vencimiento=doc_data["fecha_vencimiento"],
                aprobado_admin=doc_data["aprobado_admin"]
            )
            db.add(new_doc)
            created_count += 1
            
            # Status visual
            status = "✅" if doc_data["aprobado_admin"] else "⏳"
            venc = doc_data["fecha_vencimiento"]
            venc_str = venc.strftime("%d/%m/%Y") if venc else "Indefinido"
            print(f"{status} {doc_data['tipo']} - Vence: {venc_str}")
        
        db.commit()
        print(f"\n✅ Se crearon {created_count} documentos legales exitosamente!")
        print(f"🔗 Puedes verlos en: http://localhost:5173 (sección Cumplimiento Legal)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al crear documentos: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🏢 SEED: Documentos Legales del Restaurante")
    print("=" * 60)
    seed_legal_documents()
