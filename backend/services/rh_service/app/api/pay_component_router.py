# rh_service/app/api/pay_component_router.py
# Rutas para la gestión de la entidad PayComponent.

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

# Importación de dependencias y servicios
from app.database import get_db
from app.services.pay_component_service import PayComponentService
from app.schemas.schema_pay_component import PayComponentCreate, PayComponentUpdate, PayComponentResponse

# Inicialización del router
router = APIRouter()
service = PayComponentService()

# ----------------------------------------------------------------------
# ENDPOINTS ANIDADOS POR DETALLE DE PAGO (PaymentDetail)
# ----------------------------------------------------------------------

@router.post(
    "/details/{payment_detail_id}/components", 
    response_model=PayComponentResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo componente de pago para un detalle de pago específico"
)
def create_pay_component_route(
    payment_detail_id: int,
    component_in: PayComponentCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra una nueva línea de pago (bono, deducción, etc.) asociada 
    al detalle de pago (PaymentDetail) proporcionado por ID.
    """
    # Sobreescribimos el payment_detail_id del body con el de la URL para consistencia.
    component_in.payment_detail_id = payment_detail_id
    return service.create_component(db=db, component_data=component_in)


@router.get(
    "/details/{payment_detail_id}/components", 
    response_model=List[PayComponentResponse],
    summary="Obtiene todos los componentes de un detalle de pago (PaymentDetail)"
)
def read_components_by_detail_route(
    payment_detail_id: int, 
    db: Session = Depends(get_db)
):
    """
    Lista todos los componentes (líneas) que conforman el detalle de pago especificado.
    """
    return service.get_components_by_detail_id(db, detail_id=payment_detail_id)


# ----------------------------------------------------------------------
# ENDPOINTS DIRECTOS POR ID (CRUD estándar)
# ----------------------------------------------------------------------

@router.get(
    "/{component_id}", 
    response_model=PayComponentResponse,
    summary="Obtiene un componente de pago por su ID"
)
def read_pay_component_route(
    component_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles de un componente de pago específico (línea de nómina).
    Lanza 404 si no existe.
    """
    return service.get_component_by_id(db, component_id=component_id)


@router.put(
    "/{component_id}", 
    response_model=PayComponentResponse,
    summary="Actualiza un componente de pago"
)
def update_pay_component_route(
    component_id: int, 
    component_in: PayComponentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un componente de pago existente.
    Lanza 404 si no existe.
    """
    return service.update_component(
        db=db, 
        component_id=component_id, 
        component_update=component_in
    )


@router.delete(
    "/{component_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un componente de pago"
)
def delete_pay_component_route(
    component_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina un componente de pago (línea) por ID.
    Lanza 404 si no existe.
    """
    service.delete_component(db=db, component_id=component_id)
    return {"ok": True}
