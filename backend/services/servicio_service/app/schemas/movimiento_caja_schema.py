from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from enum import Enum


# --------------------------------------------------------------------
# Enums compartidos
# --------------------------------------------------------------------
class TipoMovimiento(str, Enum):
    ingreso = "Ingreso"
    egreso = "Egreso"


class ConceptoMovimiento(str, Enum):
    venta = "Venta"
    propina = "Propina"
    retiro_proveedores = "Retiro para proveedores"
    retiro_caja_menor = "Retiro caja menor"
    ajuste = "Ajuste"


class MetodoPago(str, Enum):
    efectivo = "Efectivo"
    tarjeta = "Tarjeta"
    qr = "QR"
    transferencia = "Transferencia"


# --------------------------------------------------------------------
# 1. MovimientoCajaCreate — Entrada POST
# --------------------------------------------------------------------
class MovimientoCajaCreate(BaseModel):
    """
    Registra un movimiento de dinero dentro de una sesión.

    Casos de uso principales:
    - Pago de un pedido (id_pedido requerido, tipo=Ingreso, concepto=Venta).
    - Propina (id_pedido requerido, tipo=Ingreso, concepto=Propina).
    - Retiro de caja menor (id_pedido=None, tipo=Egreso, concepto=Retiro caja menor).

    Pagos fraccionados: se crean DOS instancias de este schema
    con distintos metodo_pago apuntando al mismo id_pedido.
    """
    id_sesion: int = Field(
        ...,
        description="Sesión de caja a la que pertenece el movimiento."
    )
    id_pedido: Optional[int] = Field(
        None,
        description="Pedido que originó el movimiento. Null para egresos sin pedido (ej: retiro)."
    )
    tipo_movimiento: TipoMovimiento = Field(
        ...,
        description="Ingreso suma al balance de caja; Egreso resta."
    )
    concepto: ConceptoMovimiento = Field(
        ...,
        description="Categoría descriptiva para reportes."
    )
    metodo_pago: MetodoPago = Field(
        ...,
        description="Canal de pago. Solo 'Efectivo' impacta el conteo físico de la caja."
    )
    monto: Decimal = Field(
        ...,
        gt=0,
        decimal_places=2,
        description="Valor del movimiento (siempre positivo)."
    )


# --------------------------------------------------------------------
# 2. MovimientoCajaUpdate — Entrada PATCH (uso admin/corrección)
# --------------------------------------------------------------------
class MovimientoCajaUpdate(BaseModel):
    """
    Corrección puntual de un movimiento. Uso restringido a administradores.
    """
    concepto: Optional[ConceptoMovimiento] = None
    metodo_pago: Optional[MetodoPago] = None
    monto: Optional[Decimal] = Field(None, gt=0, decimal_places=2)


# --------------------------------------------------------------------
# 3. MovimientoCajaResponse — Salida GET
# --------------------------------------------------------------------
class MovimientoCajaResponse(BaseModel):
    """
    Representación completa de un movimiento de caja.
    """
    id: int
    id_sesion: int
    id_pedido: Optional[int]
    tipo_movimiento: TipoMovimiento
    concepto: ConceptoMovimiento
    metodo_pago: MetodoPago
    monto: Decimal
    fecha_movimiento: datetime

    model_config = {"from_attributes": True}
