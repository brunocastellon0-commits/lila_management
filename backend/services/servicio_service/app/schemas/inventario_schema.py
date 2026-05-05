from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional
from enum import Enum
from datetime import datetime


# --------------------------------------------------------------------
# Enums
# --------------------------------------------------------------------
class CategoriaInventario(str, Enum):
    carnes = "Carnes"
    vegetales = "Vegetales"
    lacteos = "Lacteos"
    bebidas = "Bebidas"
    especias = "Especias"


# --------------------------------------------------------------------
# 1. InventarioLocalCreate — Entrada POST
# --------------------------------------------------------------------
class InventarioLocalCreate(BaseModel):
    """
    Datos requeridos para registrar un nuevo insumo en el inventario local.
    """
    id_producto_origen: int = Field(
        ...,
        description="ID del producto en el production_service al que corresponde este insumo."
    )
    nombre_producto: str = Field(
        ...,
        max_length=255,
        description="Nombre del producto (snapshot al momento de la recepción)."
    )
    categoria: CategoriaInventario = Field(
        ...,
        description="Categoría del insumo para agrupar en la vista de inventario."
    )
    cantidad_actual: Decimal = Field(
        Decimal("0.000"),
        ge=0,
        decimal_places=3,
        description="Stock inicial al registrar el ítem."
    )
    unidad: str = Field(
        ...,
        max_length=20,
        description="Unidad de medida (kg, L, unidad, etc.)."
    )
    min_stock: Decimal = Field(
        Decimal("0.000"),
        ge=0,
        decimal_places=3,
        description="Umbral mínimo de stock antes de alerta crítica."
    )
    max_stock: Decimal = Field(
        Decimal("0.000"),
        ge=0,
        decimal_places=3,
        description="Umbral máximo de almacenamiento."
    )
    costo_unitario: Decimal = Field(
        Decimal("0.00"),
        ge=0,
        decimal_places=2,
        description="Costo por unidad para análisis financiero."
    )


# --------------------------------------------------------------------
# 2. InventarioLocalUpdate — Entrada PATCH
# --------------------------------------------------------------------
class InventarioLocalUpdate(BaseModel):
    """
    Permite actualizar umbrales y costos de un insumo.
    La cantidad_actual solo debe modificarse a través de recepciones de stock.
    """
    min_stock: Optional[Decimal] = Field(None, ge=0, decimal_places=3)
    max_stock: Optional[Decimal] = Field(None, ge=0, decimal_places=3)
    costo_unitario: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    categoria: Optional[CategoriaInventario] = None


# --------------------------------------------------------------------
# 3. InventarioLocalResponse — Salida GET
# --------------------------------------------------------------------
class InventarioLocalResponse(BaseModel):
    """
    Representación completa de un ítem del inventario local.
    Incluye campo 'es_critico' calculado en la capa de servicio.
    """
    id: int
    id_producto_origen: int
    nombre_producto: str
    categoria: CategoriaInventario
    cantidad_actual: Decimal
    unidad: str
    min_stock: Decimal
    max_stock: Decimal
    costo_unitario: Decimal
    es_critico: bool = Field(
        False,
        description="True si cantidad_actual < min_stock. Calculado en el servicio."
    )
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# --------------------------------------------------------------------
# 4. RecepcionStockCreate — Entrada POST /inventario/recepcion
# --------------------------------------------------------------------
class RecepcionStockCreate(BaseModel):
    """
    Registra la recepción de un despacho de producción.
    Suma la cantidad_recibida al inventario local del ítem correspondiente.
    """
    id_inventario_local: int = Field(
        ...,
        description="ID del ítem en el inventario local al que se suma el stock."
    )
    cantidad_recibida: Decimal = Field(
        ...,
        gt=0,
        decimal_places=3,
        description="Cantidad recibida en esta operación. Debe ser mayor a cero."
    )
    id_produccion_origen: Optional[int] = Field(
        None,
        description="ID del despacho o lote en production_service. Null si es ajuste manual."
    )
    recibido_por: int = Field(
        ...,
        description="ID del empleado que firma la recepción (referencia al rh_service)."
    )
    notas: Optional[str] = Field(
        None,
        max_length=1000,
        description="Observaciones sobre la recepción."
    )


# --------------------------------------------------------------------
# 5. RecepcionStockResponse — Salida POST /inventario/recepcion
# --------------------------------------------------------------------
class RecepcionStockResponse(BaseModel):
    id: int
    id_inventario_local: int
    cantidad_recibida: Decimal
    id_produccion_origen: Optional[int]
    recibido_por: int
    fecha_recepcion: datetime
    notas: Optional[str]

    model_config = {"from_attributes": True}
