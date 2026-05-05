from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from enum import Enum

from app.schemas.ventas_schema import DetallePedidoResponse


# --------------------------------------------------------------------
# Enums compartidos
# --------------------------------------------------------------------
class EstadoPedido(str, Enum):
    pendiente = "Pendiente"
    en_preparacion = "En Preparacion"
    servido = "Servido"
    pagado = "Pagado"
    anulado = "Anulado"


# --------------------------------------------------------------------
# 1. PedidoCreate — Entrada POST
# --------------------------------------------------------------------
class PedidoCreate(BaseModel):
    """
    Datos requeridos para registrar un nuevo pedido.

    id_sesion: el backend lo inyecta automáticamente desde la sesión
    activa de la caja; se incluye aquí para que el endpoint lo reciba
    del frontend o lo sobreescriba según el flujo de negocio.
    """
    id_sesion: int = Field(
        ...,
        description="ID de la sesión de caja activa al momento de crear el pedido."
    )
    id_mesero: Optional[int] = Field(
        None,
        description="ID del empleado-mesero (referencia al rh_service). Opcional si el pedido es en barra."
    )
    id_mesa: Optional[int] = Field(
        None,
        description="ID de la mesa en la tabla mesas. Null si es para llevar o pedido en barra."
    )
    cubiertos: Optional[int] = Field(
        None,
        ge=1,
        description="Número de comensales. Informativo para cocina."
    )
    detalles: List["DetallePedidoCreate"] = Field(
        ...,
        min_length=1,
        description="Al menos un producto debe incluirse en el pedido."
    )


# --------------------------------------------------------------------
# 2. PedidoUpdate — Entrada PATCH
# --------------------------------------------------------------------
class PedidoUpdate(BaseModel):
    """
    Permite actualizar el estado del pedido o reasignar mesero/mesa.
    """
    id_mesero: Optional[int] = None
    id_mesa: Optional[int] = None
    cubiertos: Optional[int] = Field(None, ge=1)
    estado_pedido: Optional[EstadoPedido] = None


# --------------------------------------------------------------------
# 3. PedidoResponse — Salida GET
# --------------------------------------------------------------------
class PedidoResponse(BaseModel):
    """
    Representación completa de un pedido, incluyendo sus líneas de detalle.
    El campo nombre_mesero se enriquece desde el rh_service en la capa de servicio.
    """
    id: int
    id_sesion: int
    id_mesero: Optional[int]
    nombre_mesero: Optional[str] = Field(
        None,
        description="Nombre completo del mesero. Obtenido del rh_service (campo calculado, no en BD)."
    )
    id_mesa: Optional[int]
    cubiertos: Optional[int]
    fecha_creacion: datetime
    estado_pedido: EstadoPedido
    subtotal: Decimal
    impuestos: Decimal
    descuentos: Decimal
    total: Decimal
    detalles: List[DetallePedidoResponse] = []

    model_config = {"from_attributes": True}


# Necesario para que PedidoCreate pueda referenciar DetallePedidoCreate
# que está en ventas_schema (importación circular evitada con update_refs)
from app.schemas.ventas_schema import DetallePedidoCreate  # noqa: E402
PedidoCreate.model_rebuild()
