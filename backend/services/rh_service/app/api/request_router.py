# rh_service/app/api/request_router.py
# Rutas para la gestión de la entidad Request (Vacaciones, Permisos, etc.).

from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

# Importación de dependencias, servicios y schemas
from app.database import get_db
# Asegúrate de que el path de importación sea correcto en tu entorno
from app.services.request_service import RequestService
from app.schemas.request import RequestCreate, RequestUpdate, RequestResponse 

# Inicialización del router
router = APIRouter()
service = RequestService()

# ----------------------------------------------------------------------
# ENDPOINTS CRUD
# ----------------------------------------------------------------------

@router.post(
    "/", 
    response_model=RequestResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea una nueva solicitud de vacaciones o permiso"
)
def create_request_route(
    request_in: RequestCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra una solicitud de tiempo libre o permiso por parte de un empleado.
    Valida la existencia del empleado y la cronología de las fechas.
    El estado inicial es automáticamente 'Pendiente'.
    """
    return service.create_request(db=db, request=request_in)


@router.get(
    "/", 
    response_model=List[RequestResponse],
    summary="Lista todas las solicitudes o filtra por empleado"
)
def read_requests_route(
    employee_id: Optional[int] = Query(None, description="Filtrar por ID de empleado"),
    skip: int = Query(0, description="Número de registros a omitir para paginación"),
    limit: int = Query(100, description="Límite de registros a devolver"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de todas las solicitudes. Opcionalmente, permite filtrar 
    para ver solo las solicitudes de un empleado específico usando 'employee_id'.
    """
    if employee_id is not None:
        return service.get_requests_by_employee(db, employee_id=employee_id)
    return service.get_all_requests(db, skip=skip, limit=limit)


@router.get(
    "/{request_id}", 
    response_model=RequestResponse,
    summary="Obtiene una solicitud específica por ID"
)
def read_request_route(
    request_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles completos de una solicitud.
    Lanza 404 si no existe.
    """
    return service.get_request_by_id(db, request_id=request_id)


@router.patch(
    "/{request_id}", 
    response_model=RequestResponse,
    summary="Actualiza el ESTADO de una solicitud (Administrador)"
)
def update_request_status_route(
    request_id: int, 
    request_in: RequestUpdate, 
    db: Session = Depends(get_db)
):
    """
    Permite a un administrador cambiar el estado de la solicitud 
    (Ej: de 'Pendiente' a 'Aprobado' o 'Negado').
    """
    return service.update_request_status(
        db=db, 
        request_id=request_id, 
        request_update=request_in
    )


@router.delete(
    "/{request_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina una solicitud"
)
def delete_request_route(
    request_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina una solicitud por ID.
    Lanza 404 si no existe. Lanza 400 si la solicitud ya ha sido Aprobada,
    para evitar inconsistencias en el sistema de turnos.
    """
    service.delete_request(db=db, request_id=request_id)
    return {"ok": True}