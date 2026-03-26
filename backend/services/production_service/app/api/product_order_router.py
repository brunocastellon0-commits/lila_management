from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db 
import app.schemas.production_order_Schema as schemas
import app.services.production_order_service as service

router = APIRouter()
# ==========================================
# LEER (Read)
# ==========================================

@router.get("/", response_model=List[schemas.ProductionOrderResponse])
def read_production_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtiene el historial completo de órdenes de producción."""
    return crud.get_production_orders(db, skip=skip, limit=limit)

@router.get("/estado/{status}", response_model=List[schemas.ProductionOrderResponse])
def read_orders_by_status(status: str, db: Session = Depends(get_db)):
    """Filtra órdenes por estado (ej: 'PENDING', 'IN_PROGRESS', 'COMPLETED')."""
    return crud.get_orders_by_status(db, status=status)

@router.get("/{order_id}", response_model=schemas.ProductionOrderResponse)
def read_production_order(order_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de una orden de producción específica por su ID."""
    db_order = crud.get_production_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Orden de producción no encontrada")
    return db_order

# ==========================================
# CREAR (Create)
# ==========================================

@router.post("/", response_model=schemas.ProductionOrderResponse, status_code=status.HTTP_201_CREATED)
def create_production_order(order: schemas.ProductionOrderCreate, db: Session = Depends(get_db)):
    """Crea una nueva orden para iniciar el proceso de producción."""
    return crud.create_production_order(db=db, order=order)

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

@router.patch("/{order_id}", response_model=schemas.ProductionOrderResponse)
def update_production_order(
    order_id: int, 
    order_update: schemas.ProductionOrderUpdate, 
    db: Session = Depends(get_db)
):
    """Actualiza datos de la orden, como el estado o las cantidades reales producidas."""
    db_order = crud.update_production_order(db=db, order_id=order_id, order_update=order_update)
    if db_order is None:
        raise HTTPException(status_code=404, detail="No se pudo encontrar la orden para actualizar")
    return db_order

# ==========================================
# CANCELAR (Business Logic Delete)
# ==========================================

@router.post("/{order_id}/cancelar", response_model=schemas.ProductionOrderResponse)
def cancel_production_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancela una orden de producción. 
    Lógica de negocio: No se borra, se marca como 'CANCELLED'.
    """
    db_order = crud.cancel_production_order(db=db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada para cancelar")
    return db_order