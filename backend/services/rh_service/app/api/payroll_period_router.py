# rh_service/app/api/payroll_period_router.py
# Rutas para la gestión de la entidad PayrollPeriod (Ciclos de Nómina).

from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

# Importación de dependencias, servicios y schemas
from app.database import get_db
# Asegúrate de que el path de importación sea correcto en tu entorno
from app.services.payroll_period_service import PayrollPeriodService
from app.schemas.payroll_period import PayrollPeriodCreate, PayrollPeriodUpdate, PayrollPeriodResponse 
# Asumo que tienes un schema 'PayrollPeriodResponse' para la salida

# Inicialización del router
router = APIRouter()
service = PayrollPeriodService()

# ----------------------------------------------------------------------
# ENDPOINTS CRUD
# ----------------------------------------------------------------------

@router.post(
    "/", 
    response_model=PayrollPeriodResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo período o ciclo de nómina"
)
def create_payroll_period_route(
    period_in: PayrollPeriodCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo ciclo de pago, validando que la fecha de inicio sea 
    anterior a la fecha de fin y gestionando posibles solapamientos.
    Lanza 400 si las fechas son inválidas.
    """
    return service.create_period(db=db, period=period_in)


@router.get(
    "/", 
    response_model=List[PayrollPeriodResponse],
    summary="Lista todos los períodos de nómina, con paginación"
)
def read_payroll_periods_route(
    skip: int = Query(0, description="Número de registros a omitir para paginación"),
    limit: int = Query(100, description="Límite de registros a devolver"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de todos los períodos de nómina disponibles, ordenados 
    de forma descendente por su fecha de inicio.
    """
    return service.get_all_periods(db, skip=skip, limit=limit)


@router.get(
    "/{period_id}", 
    response_model=PayrollPeriodResponse,
    summary="Obtiene un período de nómina por ID"
)
def read_payroll_period_route(
    period_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene la información completa de un ciclo de nómina específico.
    Lanza 404 si el período no existe.
    """
    return service.get_period_by_id(db, period_id=period_id)


@router.put(
    "/{period_id}", 
    response_model=PayrollPeriodResponse,
    summary="Actualiza un período de nómina existente"
)
def update_payroll_period_route(
    period_id: int, 
    period_in: PayrollPeriodUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un período de nómina. Valida la cronología 
    de las fechas (inicio < fin) antes de aplicar los cambios.
    Lanza 404 si no existe.
    """
    return service.update_period(
        db=db, 
        period_id=period_id, 
        period_update=period_in
    )


@router.delete(
    "/{period_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un período de nómina"
)
def delete_payroll_period_route(
    period_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina el ciclo de nómina por ID.
    Lanza 404 si no existe. Lanza 400 si tiene detalles de pago (nóminas) asociados.
    """
    service.delete_period(db=db, period_id=period_id)
    # Al retornar 204 No Content, no es necesario devolver cuerpo.
    return {"ok": True}