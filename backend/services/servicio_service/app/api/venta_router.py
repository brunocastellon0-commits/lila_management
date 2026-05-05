from typing import List
from fastapi import APIRouter, Depends, Body, status
from decimal import Decimal
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ventas_schema import DetallePedidoUpdate, DetallePedidoResponse
from app.services.ventas_service import DetallePedidoService

router = APIRouter(redirect_slashes=False)


@router.get(
    "/pedido/{pedido_id}",
    response_model=List[DetallePedidoResponse],
    summary="Listar detalles de un pedido",
    description="Devuelve todas las líneas de producto de un pedido específico."
)
def read_detalles_por_pedido(pedido_id: int, db: Session = Depends(get_db)):
    return DetallePedidoService().get_by_pedido(db, pedido_id)


@router.get(
    "/{detalle_id}",
    response_model=DetallePedidoResponse,
    summary="Obtener línea de detalle por ID"
)
def read_detalle(detalle_id: int, db: Session = Depends(get_db)):
    return DetallePedidoService().get_by_id(db, detalle_id)


@router.patch(
    "/{detalle_id}",
    response_model=DetallePedidoResponse,
    summary="Actualizar línea de detalle",
    description=(
        "Permite corregir cantidad, notas o estado de preparación de una línea. "
        "Recalcula el subtotal automáticamente si cambia la cantidad. "
        "No aplica a líneas en estado 'Entregado'."
    ),
)
def update_detalle(
    detalle_id: int,
    payload: DetallePedidoUpdate,
    db: Session = Depends(get_db)
):
    return DetallePedidoService().update(db, detalle_id, payload)
