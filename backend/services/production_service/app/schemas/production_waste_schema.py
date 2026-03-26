from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

# ==========================================
# SCHEMAS PARA REGISTRO DE MERMAS (ProductionWasteLog)
# ==========================================

# Definimos los tipos de merma permitidos
class WasteTypeEnum(str, Enum):
    burnt = "BURNT"
    expired = "EXPIRED"
    dropped = "DROPPED"
    quality_fail = "QUALITY_FAIL"

# Esquema Base
class ProductionWasteLogBase(BaseModel):
    order_id: int
    waste_type: WasteTypeEnum
    # Validamos que la pérdida sea mayor a 0
    quantity: float = Field(..., gt=0, description="Cantidad desperdiciada")
    reason: Optional[str] = Field(None, max_length=255, description="Justificación del cocinero")

# Esquema para Crear
class ProductionWasteLogCreate(ProductionWasteLogBase):
    pass

# Esquema para Actualizar
class ProductionWasteLogUpdate(BaseModel):
    waste_type: Optional[WasteTypeEnum] = None
    quantity: Optional[float] = Field(None, gt=0)
    reason: Optional[str] = Field(None, max_length=255)

# Esquema de Respuesta
class ProductionWasteLogResponse(ProductionWasteLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)