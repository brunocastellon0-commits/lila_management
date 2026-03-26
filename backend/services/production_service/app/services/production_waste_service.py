from sqlalchemy.orm import Session
from app.models.production_waste_logs import ProductionWasteLog # Asegúrate de que la ruta sea correcta
import app.schemas.production_waste_schema as schemas

# ==========================================
# LEER (Read)
# ==========================================

def get_waste_log(db: Session, log_id: int):
    """Obtiene un registro de merma específico por su ID."""
    return db.query(ProductionWasteLog).filter(ProductionWasteLog.id == log_id).first()

def get_waste_logs_by_order(db: Session, order_id: int):
    """
    Obtiene todo el historial de pérdidas y mermas que ocurrieron 
    durante una Orden de Producción específica.
    """
    return db.query(ProductionWasteLog).filter(ProductionWasteLog.order_id == order_id).all()

def get_all_waste_logs(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene un listado general de todas las mermas (útil para reportes mensuales)."""
    return db.query(ProductionWasteLog).offset(skip).limit(limit).all()

# ==========================================
# CREAR (Create)
# ==========================================

def create_waste_log(db: Session, waste_log: schemas.ProductionWasteLogCreate):
    """Registra una nueva merma en el sistema."""
    db_waste_log = ProductionWasteLog(**waste_log.model_dump())
    
    db.add(db_waste_log)
    db.commit()
    db.refresh(db_waste_log)
    
    return db_waste_log

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

def update_waste_log(db: Session, log_id: int, log_update: schemas.ProductionWasteLogUpdate):
    """Corrige un registro de merma (ej. si el cocinero se equivocó en la cantidad)."""
    db_waste_log = get_waste_log(db, log_id)
    
    if not db_waste_log:
        return None
    
    update_data = log_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_waste_log, key, value)
        
    db.add(db_waste_log)
    db.commit()
    db.refresh(db_waste_log)
    
    return db_waste_log

# ==========================================
# BORRAR (Delete)
# ==========================================

def delete_waste_log(db: Session, log_id: int):
    """
    Borra físicamente un registro de merma. 
    (Úsalo con precaución, idealmente solo para corregir errores de tipeo inmediatos).
    """
    db_waste_log = get_waste_log(db, log_id)
    
    if db_waste_log:
        db.delete(db_waste_log)
        db.commit()
        
    return db_waste_log