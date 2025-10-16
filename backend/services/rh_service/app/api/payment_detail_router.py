# rh_service/app/api/payment_detail_router.py
# Rutas para la gestión de la entidad PaymentDetail.

from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

# Importación de dependencias y servicios
from app.database import get_db
from app.services.payment_detail_service import PaymentDetailService
from app.schemas.schema_payment_detail import PaymentDetailCreate, PaymentDetailUpdate, PaymentDetailResponse

# Inicialización del router
router = APIRouter()
service = PaymentDetailService()

# ----------------------------------------------------------------------
# ENDPOINTS CRUD
# ----------------------------------------------------------------------

@router.post(
    "/", 
    response_model=PaymentDetailResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo detalle de pago (línea de nómina principal)"
)
def create_payment_detail_route(
    detail_in: PaymentDetailCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra el resumen de pago de un empleado para un período de nómina específico.
    El monto neto se calcula automáticamente.
    """
    return service.create_detail(db=db, detail_data=detail_in)


@router.get(
    "/", 
    response_model=List[PaymentDetailResponse],
    summary="Lista todos los detalles de pago o filtra por empleado"
)
def read_payment_details_route(
    employee_id: int = Query(None, description="Filtrar por ID de empleado"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de todos los detalles de pago. Opcionalmente, se puede 
    filtrar la lista para obtener solo los pagos de un empleado específico.
    """
    if employee_id is not None:
        return service.get_details_by_employee(db, employee_id=employee_id)
    return service.get_all_details(db)


@router.get(
    "/{detail_id}", 
    response_model=PaymentDetailResponse,
    summary="Obtiene un detalle de pago por ID"
)
def read_payment_detail_route(
    detail_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles completos de un pago específico.
    Lanza 404 si no existe.
    """
    return service.get_detail_by_id(db, detail_id=detail_id)


@router.put(
    "/{detail_id}", 
    response_model=PaymentDetailResponse,
    summary="Actualiza un detalle de pago"
)
def update_payment_detail_route(
    detail_id: int, 
    detail_in: PaymentDetailUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un detalle de pago. El monto neto se recalcula 
    si se modifican los campos base (monto_base, bonificaciones, descuentos).
    """
    return service.update_detail(
        db=db, 
        detail_id=detail_id, 
        detail_update=detail_in
    )


@router.delete(
    "/{detail_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un detalle de pago"
)
def delete_payment_detail_route(
    detail_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina el detalle de pago por ID.
    Lanza 404 si no existe.
    """
    service.delete_detail(db=db, detail_id=detail_id)
    return {"ok": True}
