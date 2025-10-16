# rh_service/app/api/employee_schedule_router.py
# Rutas para la gestión de patrones de horario semanales recurrentes (EmployeeSchedule).

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Importación de dependencias y servicios
from app.database import get_db
from app.services.employee_Schedule_service import EmployeeScheduleService
from app.schemas.schema_employee_schedule import EmployeeScheduleCreate, EmployeeScheduleUpdate, EmployeeScheduleResponse

# Inicialización del router
router = APIRouter()
service = EmployeeScheduleService()

# --------------------------------------------------------------------
# RUTA 1: CREAR PATRÓN DE HORARIO (POST)
# --------------------------------------------------------------------
@router.post(
    "/",
    response_model=EmployeeScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo patrón de horario para un empleado"
)
def create_schedule_route(
    schedule_in: EmployeeScheduleCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo segmento de horario recurrente para un empleado específico.
    El `employee_id` se incluye directamente en el cuerpo de la solicitud (EmployeeScheduleCreate).
    """
    # La validación de FK y de horas se maneja dentro del servicio.
    try:
        db_schedule = service.create_schedule(db=db, schedule_data=schedule_in)
        return db_schedule
    except HTTPException as e:
        # Re-lanza errores 404/400 del servicio (ej. empleado no existe o horas inválidas)
        raise e
    except Exception as e:
        # Captura errores de base de datos no manejados específicamente
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno al crear el horario: {str(e)}"
        )


# --------------------------------------------------------------------
# RUTA 2: OBTENER HORARIOS (GET - General o por Empleado)
# --------------------------------------------------------------------
@router.get(
    "/",
    response_model=List[EmployeeScheduleResponse],
    summary="Obtiene todos los patrones de horario o filtra por empleado"
)
def read_schedules_route(
    employee_id: int | None = Query(None, description="ID del empleado para filtrar sus horarios."),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Si se proporciona `employee_id`, devuelve todos los patrones de horario de ese empleado.
    De lo contrario, devuelve una lista paginada de todos los patrones de horario en el sistema.
    """
    if employee_id is not None:
        schedules = service.get_schedules_by_employee(db, employee_id=employee_id)
        if not schedules:
             # Opcional: Levantar 404 si el empleado no tiene horarios, o devolver []
             # Optamos por devolver una lista vacía si el empleado no tiene horarios
             pass 
    else:
        schedules = service.get_all_schedules(db, skip=skip, limit=limit)
        
    return schedules


# --------------------------------------------------------------------
# RUTA 3: OBTENER HORARIO POR ID (GET - Detalle)
# --------------------------------------------------------------------
@router.get(
    "/{schedule_id}",
    response_model=EmployeeScheduleResponse,
    summary="Obtiene un patrón de horario específico por su ID"
)
def read_schedule_by_id_route(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles de un patrón de horario semanal usando su ID único.
    Lanza HTTPException 404 (Not Found) si el ID no existe.
    """
    # El método get_schedule_by_id ya maneja el 404.
    return service.get_schedule_by_id(db, schedule_id=schedule_id)


# --------------------------------------------------------------------
# RUTA 4: ACTUALIZAR PATRÓN DE HORARIO (PUT)
# --------------------------------------------------------------------
@router.put(
    "/{schedule_id}",
    response_model=EmployeeScheduleResponse,
    summary="Actualiza un patrón de horario existente"
)
def update_schedule_route(
    schedule_id: int,
    schedule_in: EmployeeScheduleUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un patrón de horario. 
    Se validará que las horas sean correctas y que el nuevo `employee_id` (si se proporciona) exista.
    """
    try:
        updated_schedule = service.update_schedule(
            db=db, 
            schedule_id=schedule_id, 
            schedule_update=schedule_in
        )
        return updated_schedule
    except HTTPException as e:
        # Re-lanza errores 404/400 del servicio (ej. horario no encontrado o horas inválidas)
        raise e


# --------------------------------------------------------------------
# RUTA 5: ELIMINAR PATRÓN DE HORARIO (DELETE)
# --------------------------------------------------------------------
@router.delete(
    "/{schedule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un patrón de horario"
)
def delete_schedule_route(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina un patrón de horario por su ID.
    Lanza HTTPException 404 si el horario no existe.
    """
    # El servicio maneja la verificación de existencia y la eliminación.
    service.delete_schedule(db=db, schedule_id=schedule_id)
    # Retorna 204 No Content sin cuerpo de respuesta.
    return 
