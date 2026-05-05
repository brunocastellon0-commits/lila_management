from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional
from enum import Enum


# --------------------------------------------------------------------
# Enums compartidos
# --------------------------------------------------------------------
class EstadoPreparacion(str, Enum):
    pendiente = "Pendiente"
    listo = "Listo"
    entregado = "Entregado"


class EstacionCocina(str, Enum):
    fuegos = "Fuegos"
    frios = "Frios"
    postres = "Postres"
    barra = "Barra"


# --------------------------------------------------------------------
# 1. DetallePedidoCreate — Entrada (embebido en PedidoCreate)
# --------------------------------------------------------------------
class DetallePedidoCreate(BaseModel):
    """
    Línea de producto incluida al crear un pedido.

    El backend consulta el production_service para obtener el
    precio_unitario actual y calcular el subtotal antes de persistir.
    """
    id_producto: int = Field(
        ...,
        description="ID del producto en el production_service."
    )
    cantidad: Decimal = Field(
        ...,
        gt=0,
        decimal_places=3,
        description="Cantidad pedida. Decimal para permitir fracciones (ej: 0.5 kg)."
    )
    notas: Optional[str] = Field(
        None,
        max_length=500,
        description="Instrucciones especiales del cliente (ej: sin cebolla, poco hielo)."
    )
    estacion_cocina: Optional[EstacionCocina] = Field(
        EstacionCocina.fuegos,
        description="Estación de cocina a la que se envía este ítem. Por defecto: Fuegos."
    )


# --------------------------------------------------------------------
# 2. DetallePedidoUpdate — Entrada PATCH
# --------------------------------------------------------------------
class DetallePedidoUpdate(BaseModel):
    """
    Permite corregir una línea de pedido antes de que pase a cocina.
    """
    cantidad: Optional[Decimal] = Field(None, gt=0, decimal_places=3)
    notas: Optional[str] = Field(None, max_length=500)
    estado_preparacion: Optional[EstadoPreparacion] = None


# --------------------------------------------------------------------
# 3. DetallePedidoResponse — Salida GET
# --------------------------------------------------------------------
class DetallePedidoResponse(BaseModel):
    """
    Línea de pedido tal como la devuelve la API.
    Incluye el precio_unitario snapshot, el subtotal calculado y la estación KDS.
    """
    id: int
    id_pedido: int
    id_producto: int
    nombre_producto: str
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal
    notas: Optional[str]
    estacion_cocina: EstacionCocina
    estado_preparacion: EstadoPreparacion

    model_config = {"from_attributes": True}
