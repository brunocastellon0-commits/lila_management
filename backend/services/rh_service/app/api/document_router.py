# rh_service/app/api/document_router.py
# Rutas para la gestión de la entidad Document (Documentos Legales).

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Importación de dependencias y servicios
from app.database import get_db
from app.services.document_service import DocumentService
from app.schemas.schema_document import DocumentCreate, DocumentUpdate, DocumentResponse

# Inicialización del router
router = APIRouter()
service = DocumentService() # Instancia del servicio

# --- Rutas CRUD para Document ---

@router.post(
    "/employees/{employee_id}/documents", 
    response_model=DocumentResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Registra un nuevo documento para un empleado"
)
def create_document_route(
    employee_id: int, # El ID del empleado se pasa en la ruta
    document_in: DocumentCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo documento asociado a un empleado.
    
    Lanza HTTPException 404 si el `employee_id` no existe (verificado en el Service).
    """
    # El Service maneja la verificación de existencia del empleado y la creación
    db_document = service.create_document(
        db=db, 
        employee_id=employee_id, 
        document=document_in
    )
    return db_document

@router.get(
    "/", 
    response_model=List[DocumentResponse],
    summary="Obtiene todos los documentos o filtra por ID de empleado"
)
def read_documents_route(
    employee_id: Optional[int] = Query(None, description="Filtra documentos por ID de empleado. Si es `None`, trae todos."),
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de todos los documentos. 
    Permite filtrar por `employee_id` como parámetro de consulta (`query parameter`).
    """
    if employee_id is not None:
        documents = service.get_documents_by_employee(db, employee_id=employee_id)
    else:
        documents = service.get_all_documents(db, skip=skip, limit=limit)
    return documents

@router.get(
    "/{document_id}", 
    response_model=DocumentResponse,
    summary="Obtiene un documento por ID"
)
def read_document_route(
    document_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles de un documento específico por su ID.
    
    Lanza HTTPException 404 (Not Found) si el documento no existe (manejado por el Service).
    """
    # El Service maneja la obtención y el manejo del 404
    db_document = service.get_document_by_id(db, document_id=document_id)
    return db_document

@router.put(
    "/{document_id}", 
    response_model=DocumentResponse,
    summary="Actualiza la información de un documento"
)
def update_document_route(
    document_id: int, 
    document_in: DocumentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un documento existente.
    
    Lanza HTTPException 404 si el documento no existe (manejado por el Service).
    """
    # El Service maneja la verificación de existencia y la actualización
    updated_document = service.update_document(
        db=db, 
        document_id=document_id, 
        document_update=document_in
    )
    return updated_document

@router.delete(
    "/{document_id}", 
    status_code=status.HTTP_200_OK, # Cambiado a 200 OK para devolver el mensaje de éxito
    summary="Elimina un documento"
)
def delete_document_route(
    document_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina permanentemente un documento por ID.
    
    Lanza HTTPException 404 si el documento no existe (manejado por el Service).
    """
    # El Service maneja la verificación de existencia y la eliminación
    result = service.delete_document(db=db, document_id=document_id)
    return result
