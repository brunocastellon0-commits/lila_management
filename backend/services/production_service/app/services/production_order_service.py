from sqlalchemy.orm import Session
from app.models.production_order import ProductionOrder # Verifica que la ruta sea correcta
import app.schemas.production_order_Schema as schemas

# ==========================================
# LEER (Read)
# ==========================================

def get_production_order(db: Session, order_id: int):
    """Obtiene los detalles de una orden de producción específica."""
    return db.query(ProductionOrder).filter(ProductionOrder.id == order_id).first()

def get_production_orders(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene el historial de órdenes de producción."""
    return db.query(ProductionOrder).offset(skip).limit(limit).all()

def get_orders_by_status(db: Session, status: str):
    """Útil para saber qué se está cocinando ahora (IN_PROGRESS) o qué falta (PENDING)."""
    return db.query(ProductionOrder).filter(ProductionOrder.status == status).all()

# ==========================================
# CREAR (Create)
# ==========================================

def create_production_order(db: Session, order: schemas.ProductionOrderCreate):
    """Crea una nueva orden para mandar a cocinar."""
    db_order = ProductionOrder(**order.model_dump())
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

def update_production_order(db: Session, order_id: int, order_update: schemas.ProductionOrderUpdate):
    """Actualiza la orden (ej. cambiar estado a COMPLETED y anotar la cantidad 'real')."""
    db_order = get_production_order(db, order_id)
    
    if not db_order:
        return None
    
    update_data = order_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_order, key, value)
        
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order

# ==========================================
# CANCELAR (Lógica de negocio en vez de borrar)
# ==========================================

def cancel_production_order(db: Session, order_id: int):
    """Cambia el estado de la orden a CANCELLED en lugar de borrarla físicamente."""
    db_order = get_production_order(db, order_id)
    
    if db_order:
        db_order.status = "CANCELLED"
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
    return db_order