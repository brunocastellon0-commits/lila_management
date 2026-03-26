from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db 
import app.schemas.production_waste_schema as schemas
import app.services.production_waste_service as crud

router = APIRouter()
# ==========================================
# LEER (Read)
# ==========================================

@router.get("/", response_model=List[schemas.ProductionWasteLogResponse])
def read_all_waste_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtiene un listado general de mermas. Ideal para auditorías y reportes."""
    return crud.get_all_waste_logs(db, skip=skip, limit=limit)

@router.get("/orden/{order_id}", response_model=List[schemas.ProductionWasteLogResponse])
def read_waste_logs_by_order(order_id: int, db: Session = Depends(get_db)):
    """Obtiene todas las mermas asociadas a una orden de producción específica."""
    return crud.get_waste_logs_by_order(db, order_id=order_id)

@router.get("/{log_id}", response_model=schemas.ProductionWasteLogResponse)
def read_waste_log(log_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de un registro de merma específico."""
    db_log = crud.get_waste_log(db, log_id=log_id)
    if db_log is None:
        raise HTTPException(status_code=404, detail="Registro de merma no encontrado")
    return db_log

# ==========================================
# CREAR (Create)
# ==========================================

@router.post("/", response_model=schemas.ProductionWasteLogResponse, status_code=status.HTTP_201_CREATED)
def create_waste_log(waste_log: schemas.ProductionWasteLogCreate, db: Session = Depends(get_db)):
    """Registra una nueva pérdida o merma ocurrida en el proceso."""
    return crud.create_waste_log(db=db, waste_log=waste_log)

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

@router.patch("/{log_id}", response_model=schemas.ProductionWasteLogResponse)
def update_waste_log(
    log_id: int, 
    log_update: schemas.ProductionWasteLogUpdate, 
    db: Session = Depends(get_db)
):
    """Corrige la cantidad o el motivo de un registro de merma existente."""
    db_log = crud.update_waste_log(db=db, log_id=log_id, log_update=log_update)
    if db_log is None:
        raise HTTPException(status_code=404, detail="No se encontró el registro para actualizar")
    return db_log

# ==========================================
# BORRAR (Delete)
# ==========================================

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_waste_log(log_id: int, db: Session = Depends(get_db)):
    """
    Elimina físicamente un registro de merma. 
    Advertencia: Esta acción es irreversible.
    """
    db_log = crud.delete_waste_log(db=db, log_id=log_id)
    if db_log is None:
        raise HTTPException(status_code=404, detail="El registro no existe")
    return None