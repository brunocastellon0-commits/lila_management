from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from enum import Enum


# --------------------------------------------------------------------
# Enums compartidos
# --------------------------------------------------------------------
class EstadoSesion(str, Enum):
    abierta = "Abierta"
    cerrada = "Cerrada"
    descuadrada = "Descuadrada"


# --------------------------------------------------------------------
# 1. SesionCajaCreate — Entrada POST (Apertura de caja)
# --------------------------------------------------------------------
class SesionCajaCreate(BaseModel):
    """
    Datos requeridos para abrir un nuevo turno de caja.

    El backend valida que la caja no tenga ya una sesión 'Abierta'
    antes de persistir este registro.
    """
    id_caja: int = Field(
        ...,
        description="ID de la caja física/lógica a la que se le abre el turno."
    )
    id_usuario: int = Field(
        ...,
        description="ID del empleado-cajero que abre el turno (referencia al rh_service)."
    )
    monto_inicial: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
        description="Dinero en efectivo con el que inicia el turno (fondo de cambio)."
    )


# --------------------------------------------------------------------
# 2. SesionCajaCierre — Entrada PUT (Cierre de caja)
# --------------------------------------------------------------------
class SesionCajaCierre(BaseModel):
    """
    Datos que el cajero envía al cerrar su turno.
    El backend calcula monto_calculado_cierre y compara con monto_declarado_cierre
    para determinar si la sesión cierra como 'Cerrada' o 'Descuadrada'.
    """
    monto_declarado_cierre: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
        description="Monto total de efectivo que el cajero cuenta físicamente al cerrar."
    )


# --------------------------------------------------------------------
# 3. SesionCajaUpdate — Entrada PATCH (uso interno/admin)
# --------------------------------------------------------------------
class SesionCajaUpdate(BaseModel):
    """
    Actualización parcial de una sesión. Uso restringido (solo administradores).
    """
    estado: Optional[EstadoSesion] = None
    monto_declarado_cierre: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    monto_calculado_cierre: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    fecha_cierre: Optional[datetime] = None


# --------------------------------------------------------------------
# 4. SesionCajaResponse — Salida GET
# --------------------------------------------------------------------
class SesionCajaResponse(BaseModel):
    """
    Representación completa de una sesión de caja tal como la devuelve la API.
    Incluye todos los montos para facilitar el cuadre en el frontend.
    """
    id: int
    id_caja: int
    id_usuario: int
    fecha_apertura: datetime
    fecha_cierre: Optional[datetime]
    monto_inicial: Decimal
    monto_declarado_cierre: Optional[Decimal]
    monto_calculado_cierre: Optional[Decimal]
    estado: EstadoSesion

    model_config = {"from_attributes": True}
