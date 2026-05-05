from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


# --------------------------------------------------------------------
# Enums
# --------------------------------------------------------------------
class FormaMesa(str, Enum):
    square = "square"
    circle = "circle"


class ZonaMesa(str, Enum):
    interior = "Interior"
    terraza = "Terraza"
    vip = "VIP"
    barra = "Barra"


class EstadoMesa(str, Enum):
    libre = "Libre"
    ocupado = "Ocupado"
    reservado = "Reservado"
    atencion = "Atencion"


# --------------------------------------------------------------------
# 1. MesaCreate — Entrada POST
# --------------------------------------------------------------------
class MesaCreate(BaseModel):
    """
    Datos requeridos para registrar una nueva mesa en el sistema.
    """
    numero: int = Field(
        ...,
        ge=1,
        description="Número visible de mesa. Debe ser único en el restaurante."
    )
    capacidad: int = Field(
        ...,
        ge=1,
        le=20,
        description="Cantidad máxima de comensales."
    )
    forma: FormaMesa = Field(
        FormaMesa.square,
        description="Forma geométrica para el mapa visual del salón."
    )
    zona: ZonaMesa = Field(
        ZonaMesa.interior,
        description="Zona del restaurante donde se ubica la mesa."
    )


# --------------------------------------------------------------------
# 2. MesaUpdate — Entrada PATCH (todos opcionales)
# --------------------------------------------------------------------
class MesaUpdate(BaseModel):
    """
    Permite actualizar propiedades de una mesa.
    Todos los campos son opcionales; solo se actualizan los enviados.
    """
    capacidad: Optional[int] = Field(None, ge=1, le=20)
    forma: Optional[FormaMesa] = None
    zona: Optional[ZonaMesa] = None
    estado_actual: Optional[EstadoMesa] = None
    id_mesero_asignado: Optional[int] = None


# --------------------------------------------------------------------
# 3. MesaEstadoUpdate — Entrada PATCH /mesas/{id}/estado
# --------------------------------------------------------------------
class MesaEstadoUpdate(BaseModel):
    """
    Payload para el endpoint de cambio de estado.
    Opcionalmente puede reasignar mesero en la misma operación.
    """
    estado_actual: EstadoMesa = Field(
        ...,
        description="Nuevo estado de la mesa."
    )
    id_mesero_asignado: Optional[int] = Field(
        None,
        description="Reasigna mesero en la misma operación. Null para desasignar."
    )


# --------------------------------------------------------------------
# 4. MesaResponse — Salida GET
# --------------------------------------------------------------------
class MesaResponse(BaseModel):
    """
    Representación completa de una mesa incluyendo el nombre del mesero
    enriquecido desde el rh_service.
    """
    id: int
    numero: int
    capacidad: int
    forma: FormaMesa
    zona: ZonaMesa
    estado_actual: EstadoMesa
    id_mesero_asignado: Optional[int]
    nombre_mesero: Optional[str] = Field(
        None,
        description="Nombre completo del mesero asignado. Obtenido del rh_service en tiempo real."
    )
    timestamp_ocupacion: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
