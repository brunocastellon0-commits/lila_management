from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional


# --------------------------------------------------------------------
# Analytics: Ingresos por Hora
# --------------------------------------------------------------------
class IngresosPorHora(BaseModel):
    """Ingresos totales agrupados por hora del día (0-23)."""
    hora: int = Field(..., ge=0, le=23, description="Hora del día (0 = medianoche, 23 = 11pm).")
    total: Decimal = Field(..., description="Total de ingresos en esa hora.")

    model_config = {"from_attributes": True}


# --------------------------------------------------------------------
# Analytics: Ingresos por Día
# --------------------------------------------------------------------
class IngresosPorDia(BaseModel):
    """Ingresos totales agrupados por día (últimos 7 días)."""
    dia: str = Field(..., description="Fecha en formato 'YYYY-MM-DD' o nombre de día (ej: 'Lun').")
    total: Decimal = Field(..., description="Total de ingresos en ese día.")

    model_config = {"from_attributes": True}


# --------------------------------------------------------------------
# Analytics: Resumen del Dashboard
# --------------------------------------------------------------------
class ResumenDashboard(BaseModel):
    """
    KPIs consolidados del dashboard de servicio.
    Agrupa conteos de mesas, pedidos e ingresos del día actual.
    """
    ingresos_dia: Decimal = Field(
        ...,
        description="Total de ingresos generados hoy (movimientos de tipo Venta)."
    )
    pedidos_total: int = Field(
        ...,
        description="Cantidad total de pedidos creados hoy."
    )
    pedidos_activos: int = Field(
        ...,
        description="Pedidos con estado Pendiente, En Preparacion o Servido."
    )
    mesas_ocupadas: int = Field(
        ...,
        description="Mesas con estado 'Ocupado' en este momento."
    )
    mesas_total: int = Field(
        ...,
        description="Total de mesas registradas en el sistema."
    )
    tiempo_promedio_min: Optional[float] = Field(
        None,
        description="Tiempo promedio de servicio en minutos para los pedidos activos actuales."
    )
