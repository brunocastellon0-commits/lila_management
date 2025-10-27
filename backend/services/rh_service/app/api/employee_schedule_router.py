# rh_service/app/api/employee_schedule_router.py
# Rutas para la gestión de patrones de horario recurrentes (EmployeeSchedule).

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Importación de dependencias y servicios
from app.database import get_db
from app.services.employee_Schedule_service import EmployeeScheduleService 
from app.schemas.schema_employee_schedule import (  
    EmployeeScheduleCreate, 
    EmployeeScheduleUpdate, 
    EmployeeScheduleResponse,
    MonthlyScheduleResponse,
    BulkScheduleCreate
)

# Inicialización del router
router = APIRouter()
service = EmployeeScheduleService()

# --------------------------------------------------------------------
# RUTA 1: CREAR PATRÓN DE HORARIO (POST)
# --------------------------------------------------------------------
@router.post(
    "",
    response_model=EmployeeScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo patrón de horario recurrente para un empleado"
)
def create_schedule_route(
    schedule_in: EmployeeScheduleCreate,  # ← USA EL NUEVO SCHEMA
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo patrón de horario recurrente para un empleado específico.
    Incluye sucursal y múltiples días de la semana.
    """
    try:
        db_schedule = service.create_schedule(db=db, schedule_data=schedule_in)
        return db_schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno al crear el horario: {str(e)}"
        )


# --------------------------------------------------------------------
# RUTA 2: OBTENER HORARIOS (GET - General, por Empleado o por Sucursal)
# --------------------------------------------------------------------
@router.get(
    "",
    response_model=List[EmployeeScheduleResponse],
    summary="Obtiene patrones de horario con filtros"
)
def read_schedules_route(
    employee_id: int | None = Query(None, description="ID del empleado para filtrar sus horarios."),
    sucursal_id: int | None = Query(None, description="ID de la sucursal para filtrar horarios."),  # ← NUEVO FILTRO
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Filtra patrones de horario por empleado, sucursal o devuelve todos los patrones.
    """
    # Filtro por empleado Y sucursal
    if employee_id is not None and sucursal_id is not None:
        schedules = service.get_employee_schedules_by_sucursal(
            db, sucursal_id=sucursal_id, employee_id=employee_id
        )
    
    # Filtro solo por empleado
    elif employee_id is not None:
        schedules = service.get_schedules_by_employee(db, employee_id=employee_id)
    
    # Filtro solo por sucursal
    elif sucursal_id is not None:
        schedules = service.get_schedules_by_sucursal(db, sucursal_id=sucursal_id)
    
    # Sin filtros
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
    Obtiene los detalles de un patrón de horario recurrente usando su ID único.
    """
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
    schedule_in: EmployeeScheduleUpdate,  # ← USA EL NUEVO SCHEMA
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un patrón de horario recurrente.
    """
    try:
        updated_schedule = service.update_schedule(
            db=db, 
            schedule_id=schedule_id, 
            schedule_update=schedule_in
        )
        return updated_schedule
    except HTTPException as e:
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
    """
    service.delete_schedule(db=db, schedule_id=schedule_id)
    return None  # ← CORRECCIÓN MANTENIDA


# --------------------------------------------------------------------
# RUTA 6: OBTENER HORARIO MENSUAL GENERADO (NUEVA)
# --------------------------------------------------------------------
@router.get(
    "/{employee_id}/monthly",
    response_model=List[MonthlyScheduleResponse],  # ← NUEVO SCHEMA
    summary="Obtiene el horario mensual generado para un empleado"
)
def get_monthly_schedule_route(
    employee_id: int,
    year: int = Query(..., ge=2020, le=2100, description="Año del horario"),
    month: int = Query(..., ge=1, le=12, description="Mes del horario (1-12)"),
    db: Session = Depends(get_db)
):
    """
    Genera y retorna el horario mensual completo para un empleado,
    basado en sus patrones de horario recurrentes activos.
    """
    try:
        monthly_schedule = service.get_monthly_schedule(
            db=db, 
            employee_id=employee_id, 
            year=year, 
            month=month
        )
        return monthly_schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generando horario mensual: {str(e)}"
        )


# --------------------------------------------------------------------
# RUTA 7: CREACIÓN MASIVA DE HORARIOS (NUEVA)
# --------------------------------------------------------------------
@router.post(
    "/bulk",
    summary="Crea patrones de horario para múltiples empleados"
)
def create_bulk_schedules_route(
    bulk_data: BulkScheduleCreate,  # ← NUEVO SCHEMA
    db: Session = Depends(get_db)
):
    """
    Crea el mismo patrón de horario para múltiples empleados de una sucursal.
    Útil para asignar turnos similares a un grupo de empleados.
    """
    try:
        result = service.create_bulk_schedules(db=db, bulk_data=bulk_data)
        return {
            "message": f"Horarios creados: {result['total_created']}, Fallidos: {result['total_failed']}",
            "detail": result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en creación masiva: {str(e)}"
        )


# --------------------------------------------------------------------
# RUTA 8: OBTENER HORARIOS POR SUCURSAL (NUEVA)
# --------------------------------------------------------------------
@router.get(
    "/sucursal/{sucursal_id}",
    response_model=List[EmployeeScheduleResponse],
    summary="Obtiene todos los patrones de horario de una sucursal"
)
def get_schedules_by_sucursal_route(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los patrones de horario activos de una sucursal específica.
    """
    try:
        schedules = service.get_schedules_by_sucursal(db, sucursal_id=sucursal_id)
        return schedules
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo horarios de sucursal: {str(e)}"
        )