# rh_service/app/api/training_router.py
# Rutas para la gestión de la entidad Training (Registros de Capacitación).

from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

# Importación de dependencias, servicios y schemas
from app.database import get_db
from app.services.training_service import TrainingService
from app.schemas.schema_training import TrainingCreate, TrainingUpdate, TrainingResponse 

# Inicialización del router
router = APIRouter()
service = TrainingService()

# ----------------------------------------------------------------------
# ENDPOINTS CRUD
# ----------------------------------------------------------------------

@router.post(
    "/", 
    response_model=TrainingResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo registro de capacitación asignada"
)
def create_training_route(
    training_in: TrainingCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra una nueva capacitación asignada a un empleado específico.
    Valida la existencia del empleado y que la fecha de asignación no sea 
    posterior a la fecha límite (si existe).
    """
    return service.create_training(db=db, training_data=training_in)


@router.get(
    "/", 
    response_model=List[TrainingResponse],
    summary="Lista todas las capacitaciones o filtra por empleado"
)
def read_trainings_route(
    employee_id: Optional[int] = Query(None, description="Filtrar por ID del empleado"),
    skip: int = Query(0, description="Número de registros a omitir para paginación"),
    limit: int = Query(100, description="Límite de registros a devolver"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de todos los registros de capacitación. Opcionalmente,
    permite filtrar la lista para obtener solo las capacitaciones de un empleado.
    """
    if employee_id is not None:
        return service.get_trainings_by_employee(db, employee_id=employee_id)
    return service.get_all_trainings(db, skip=skip, limit=limit)


@router.get(
    "/{training_id}", 
    response_model=TrainingResponse,
    summary="Obtiene un registro de capacitación por ID"
)
def read_training_route(
    training_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles completos de un registro de capacitación específico.
    Lanza 404 si no existe.
    """
    return service.get_training_by_id(db, training_id=training_id)


@router.put(
    "/{training_id}", 
    response_model=TrainingResponse,
    summary="Actualiza un registro de capacitación (Incluye estado de finalización)"
)
def update_training_route(
    training_id: int, 
    training_in: TrainingUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza cualquier campo del registro de capacitación, incluyendo el estado
    de 'completado' y la URL del certificado. Valida la coherencia de las fechas 
    y el ID del empleado si se modifican.
    """
    return service.update_training(
        db=db, 
        training_id=training_id, 
        training_update=training_in
    )


@router.delete(
    "/{training_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un registro de capacitación"
)
def delete_training_route(
    training_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina el registro de capacitación por ID.
    Lanza 404 si no existe.
    """
    service.delete_training(db=db, training_id=training_id)
    return {"ok": True}