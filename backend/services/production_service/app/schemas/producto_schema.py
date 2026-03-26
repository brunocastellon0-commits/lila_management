from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

# Definimos los Enums 
class ProductTypeEnum(str, Enum):
    insumo = "Insumo"
    masa_base = "Masa base"
    producto_venta = "Producto venta"

class MedidaEnum(str, Enum):
    kg = "Kg"
    gr = "Gr"
    ltr = "Ltr"
    ml = "Ml"
    unidad = "Unidad"

# Esquema Base (Campos comunes)
class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    product_type: ProductTypeEnum
    medida: MedidaEnum
    costo: float 
    activo: bool = True
    description: Optional[str] = Field(None, max_length=255)
    stock: int

# Esquema para Crear 
class ProductCreate(ProductBase):
    pass

# Esquema para Actualizar 
class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    product_type: Optional[ProductTypeEnum] = None
    medida: Optional[MedidaEnum] = None
    costo: Optional[float] = None
    activo: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=255)
    stock: Optional[int] = None

# Esquema de Respuesta 
class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    # Configuración para que Pydantic lea modelos de SQLAlchemy (V2)
    model_config = ConfigDict(from_attributes=True)