from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


# --------------------------------------------------------------------
# Enum compartido
# --------------------------------------------------------------------
class EstadoCaja(str, Enum):
    activa = "Activa"
    inactiva = "Inactiva"


# --------------------------------------------------------------------
# 1. CajaCreate — Entrada POST
# --------------------------------------------------------------------
class CajaCreate(BaseModel):
    """
    Datos requeridos para registrar un nuevo punto de venta.
    """
    nombre: str = Field(
        ...,
        max_length=100,
        description="Nombre descriptivo del punto de venta (ej: Caja Principal, Caja Barra)."
    )
    estado: EstadoCaja = Field(
        default=EstadoCaja.activa,
        description="Estado operativo inicial de la caja."
    )


# --------------------------------------------------------------------
# 2. CajaUpdate — Entrada PUT/PATCH
# --------------------------------------------------------------------
class CajaUpdate(BaseModel):
    """
    Campos opcionales para modificar una caja existente.
    """
    nombre: Optional[str] = Field(None, max_length=100, description="Nuevo nombre del punto de venta.")
    estado: Optional[EstadoCaja] = Field(None, description="Nuevo estado operativo.")


# --------------------------------------------------------------------
# 3. CajaResponse — Salida GET
# --------------------------------------------------------------------
class CajaResponse(BaseModel):
    """
    Representación completa de una caja tal como la devuelve la API.
    """
    id: int
    nombre: str
    estado: EstadoCaja
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
