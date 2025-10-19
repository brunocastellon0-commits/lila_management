# rh_service/app/services/document_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import date,timedelta
from sqlalchemy.exc import IntegrityError

# Importa modelos y schemas
from app.models.document import Document
from app.schemas.schema_document import DocumentCreate, DocumentUpdate
from app.models.employee import Employee # Necesario para verificar la FK

class DocumentService:
    """
    Contiene la lógica de negocio para las operaciones CRUD 
    sobre el modelo Document. Gestiona la carga y actualización de documentos,
    incluyendo la verificación del empleado asociado.
    """

    def get_document_by_id(self, db: Session, document_id: int) -> Document:
        """
        Obtiene un documento por su ID.
        Lanza 404 si no se encuentra.
        """
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Documento con ID {document_id} no encontrado.")
        return document

    def get_documents_by_employee(self, db: Session, employee_id: int) -> List[Document]:
        """
        Obtiene todos los documentos asociados a un empleado específico.
        """
        return db.query(Document).filter(Document.employee_id == employee_id).all()

    def get_all_documents(self, db: Session, skip: int = 0, limit: int = 100) -> List[Document]:
        """
        Obtiene una lista paginada de todos los documentos.
        """
        return db.query(Document).offset(skip).limit(limit).all()

    def create_document(self, db: Session, employee_id: int, document: DocumentCreate) -> Document:
        """
        Crea un nuevo registro de documento para el empleado dado.
        Verifica la existencia del empleado antes de la creación.
        """
        # Lógica de negocio 1: Verificar que el employee_id exista (FK)
        employee_exists = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee_exists:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                 detail=f"El empleado con ID {employee_id} no existe.")

        db_document = Document(
            employee_id=employee_id,
            tipo=document.tipo,
            url_archivo=document.url_archivo,
            fecha_vencimiento=document.fecha_vencimiento,
            aprobado_admin=document.aprobado_admin
        )
        
        try:
            db.add(db_document)
            db.commit()
            db.refresh(db_document)
            return db_document
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="Error de integridad. Verifique el empleado o los datos.")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear documento: {str(e)}")


    def update_document(self, db: Session, document_id: int, document_update: DocumentUpdate) -> Document:
        """
        Actualiza los campos de un documento existente.
        """
        db_document = self.get_document_by_id(db, document_id)

        update_data = document_update.model_dump(exclude_unset=True)
        
        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_document, key, value)
            
        try:
            db.add(db_document)
            db.commit()
            db.refresh(db_document)
            return db_document
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar documento: {str(e)}")


    def delete_document(self, db: Session, document_id: int) -> dict:
        """
        Elimina un documento de la base de datos.
        """
        db_document = self.get_document_by_id(db, document_id)
        
        db.delete(db_document)
        db.commit()
        return {"message": f"Documento con ID {document_id} eliminado exitosamente."}

    def get_compliance_alerts(self, db: Session, expiration_days_threshold: int = 30) -> List[Document]:
        """
        OBTIENE documentos que están a punto de vencer o que están pendientes de aprobación.
        Fuente de alertas de 'Cumplimiento'.
        """
        today = date.today()
        # El límite futuro para el vencimiento (ej. documentos que vencen en los próximos 30 días)
        future_limit = today + timedelta(days=expiration_days_threshold)
        
        # Filtra documentos que cumplen AL MENOS una de las siguientes condiciones:
        
        # Condición 1: Documento vencido o próximo a vencer (y que aún no esté aprobado como 'cumplido')
        # Filtra: fecha_vencimiento IS NOT NULL AND (fecha_vencimiento <= today + threshold)
        vencimiento_query = db.query(Document).filter(
            Document.fecha_vencimiento.isnot(None),
            Document.fecha_vencimiento <= future_limit
        )

        # Condición 2: Documento pendiente de aprobación administrativa
        # Filtra: aprobado_admin == False
        aprobacion_query = db.query(Document).filter(
            Document.aprobado_admin == False
        )
        
        # Combina las dos condiciones con OR para obtener un listado completo de documentos problemáticos.
        # Es necesario prevenir duplicados si un documento está pendiente Y pronto a vencer.
        combined_query = vencimiento_query.union(aprobacion_query)
        
        return combined_query.all()