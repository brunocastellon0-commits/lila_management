# rh_service/app/api/shift_router.py
# Rutas para la gestión de la entidad Shift (Turnos de Trabajo).

from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from datetime import date # Necesario para filtrar por fecha

# Importación de dependencias, servicios y schemas
from app.database import get_db
from app.services.shift_service import ShiftService
# Importación de los schemas correctos
from app.schemas.schema_shift import ShiftCreate, ShiftUpdate, ShiftAssign, ShiftResponse 

# Inicialización del router
router = APIRouter()
service = ShiftService()

# ----------------------------------------------------------------------
# ENDPOINTS CRUD & Funcional
# ----------------------------------------------------------------------

@router.post(
    "/", 
    response_model=ShiftResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea o planifica un nuevo turno de trabajo"
)
def create_shift_route(
    shift_in: ShiftCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo turno. Valida que las horas sean correctas 
    (inicio < fin) y verifica si el ID de empleado asignado existe.
    """
    return service.create_shift(db=db, shift_data=shift_in)


@router.get(
    "/", 
    response_model=List[ShiftResponse],
    summary="Lista turnos o filtra por empleado o fecha"
)
def read_shifts_route(
    employee_id: Optional[int] = Query(None, description="Filtrar por ID de empleado asignado"),
    target_date: Optional[date] = Query(None, description="Filtrar por fecha específica (YYYY-MM-DD)"),
    skip: int = Query(0, description="Número de registros a omitir para paginación"),
    limit: int = Query(100, description="Límite de registros a devolver"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de turnos. Permite filtrado por:
    - ID de empleado (`employee_id`)
    - Fecha específica (`target_date`)
    Si no se provee filtro, devuelve la lista paginada de todos los turnos.
    """
    if employee_id is not None:
        return service.get_shifts_by_employee(db, employee_id=employee_id)
    if target_date is not None:
        return service.get_shifts_by_date(db, target_date=target_date)
    return service.get_all_shifts(db, skip=skip, limit=limit)


@router.get(
    "/{shift_id}", 
    response_model=ShiftResponse,
    summary="Obtiene un turno por ID"
)
def read_shift_route(
    shift_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles completos de un turno específico.
    Lanza 404 si no existe.
    """
    return service.get_shift_by_id(db, shift_id=shift_id)


@router.patch(
    "/{shift_id}/assign", 
    response_model=ShiftResponse,
    summary="Asigna un empleado a un turno"
)
def assign_employee_to_shift_route(
    shift_id: int, 
    assignment_in: ShiftAssign, 
    db: Session = Depends(get_db)
):
    """
    Endpoint dedicado a asignar un empleado a un turno previamente creado.
    Utiliza el schema ShiftAssign para validar el ID del empleado.
    """
    return service.assign_employee_to_shift(
        db=db, 
        shift_id=shift_id, 
        assignment_data=assignment_in
    )

@router.put(
    "/{shift_id}", 
    response_model=ShiftResponse,
    summary="Actualiza campos generales de un turno"
)
def update_shift_route(
    shift_id: int, 
    shift_in: ShiftUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza cualquier información del turno (horas, puesto, notas, etc.).
    Maneja la lógica de actualizar 'is_covered' si la asignación del empleado cambia.
    """
    return service.update_shift(
        db=db, 
        shift_id=shift_id, 
        shift_update=shift_in
    )


@router.delete(
    "/{shift_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un turno de trabajo"
)
def delete_shift_route(
    shift_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina un turno por ID.
    Lanza 404 si no existe.
    """
    service.delete_shift(db=db, shift_id=shift_id)
    return {"ok": True}