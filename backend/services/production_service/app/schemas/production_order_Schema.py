from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

# ==========================================
# SCHEMAS PARA ÓRDENES DE PRODUCCIÓN (ProductionOrder)
# ==========================================

# Definimos los estados permitidos de la orden
class OrderStatusEnum(str, Enum):
    pending = "PENDING"
    in_progress = "IN_PROGRESS"
    completed = "COMPLETED"
    cancelled = "CANCELLED"

# Esquema Base
class ProductionOrderBase(BaseModel):
    recipe_id: int
    Lote: str = Field(..., max_length=50, description="Código de lote (Ej: LOTE-2026-03-22-01)")
    
    # Validamos que siempre se planee hacer una cantidad mayor a 0
    planeacion: float = Field(..., gt=0, description="Cantidad esperada a producir")
    
    # La cantidad real puede ser 0 (si se arruinó todo) o mayor, y es opcional al inicio
    real: Optional[float] = Field(None, ge=0, description="Cantidad real obtenida al finalizar")
    
    status: OrderStatusEnum = OrderStatusEnum.pending
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: Optional[str] = Field(None, max_length=100)

# Esquema para Crear (Cuando el jefe de cocina manda la orden)
class ProductionOrderCreate(ProductionOrderBase):
    pass

# Esquema para Actualizar (Cuando el cocinero anota lo que realmente salió o cambia el estado)
class ProductionOrderUpdate(BaseModel):
    recipe_id: Optional[int] = None
    Lote: Optional[str] = Field(None, max_length=50)
    planeacion: Optional[float] = Field(None, gt=0)
    real: Optional[float] = Field(None, ge=0)
    status: Optional[OrderStatusEnum] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: Optional[str] = Field(None, max_length=100)

# Esquema de Respuesta
class ProductionOrderResponse(ProductionOrderBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)