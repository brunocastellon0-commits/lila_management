from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
from enum import Enum

# --- ENUMERACIONES PARA TIPOS CONTROLADOS ---

class OrigenAlerta(str, Enum):
    """Define los posibles orígenes de una alerta para mantener la consistencia."""
    REQUEST = "REQUEST"
    SHIFT = "SHIFT"
    DOCUMENT = "DOCUMENT"
    TRAINING = "TRAINING"
    PAYROLL = "PAYROLL"


class PrioridadAlerta(str, Enum):
    """Define los niveles de prioridad de las alertas."""
    CRITICA = "CRITICA"
    ALTA = "ALTA"
    MEDIA = "MEDIA"
    BAJA = "BAJA"


# --- ESQUEMAS PARA ALERTAS ---

class AlertaBase(BaseModel):
    """
    Esquema base para una alerta. Contiene los campos comunes
    que se usarán tanto para la creación como para la respuesta.
    """
    id_entidad: int = Field(..., description="ID de la entidad original que genera la alerta (solicitud, turno, etc.).")
    origen: OrigenAlerta = Field(..., description="Módulo o servicio que originó la alerta.")
    descripcion: str = Field(..., max_length=255, description="Texto descriptivo de la alerta, claro y conciso.")
    prioridad: PrioridadAlerta = Field(..., description="Nivel de urgencia de la alerta.")
    fecha_referencia: date = Field(..., description="Fecha relevante para la alerta (vencimiento, inicio, etc.).")


class AlertaResponse(AlertaBase):
    """
    Esquema de respuesta para las alertas. Se utiliza para devolver datos
    al cliente y se asegura de que la respuesta tenga el formato correcto.
    """
    class Config:
        from_attributes = True


# --- ESQUEMAS PARA ESTADÍSTICAS (KPIs) ---

class ResumenStatsResponse(BaseModel):
    """
    ✅ CORRECCIÓN: Nombres de campos alineados con el frontend React.
    
    El frontend espera estos nombres EXACTOS:
    - total_employees (NO total_activos)
    - employees_added_month
    - shifts_today (NO turnos_cubiertos_hoy)
    - pending_shifts (NO turnos_sin_cubrir)
    - active_trainings (NO capacitaciones_activas)
    - expiring_trainings (NO capacitaciones_pendientes)
    - compliance_rate (NO cumplimiento_porcentaje)
    - compliance_change
    """
    # ✅ Campos principales (DEBEN coincidir con React)
    total_employees: int = Field(..., description="Número total de empleados activos")
    employees_added_month: int = Field(..., description="Empleados agregados este mes")
    shifts_today: int = Field(..., description="Turnos cubiertos hoy")
    pending_shifts: int = Field(..., description="Turnos sin cubrir")
    active_trainings: int = Field(..., description="Capacitaciones activas")
    expiring_trainings: int = Field(..., description="Capacitaciones próximas a vencer")
    compliance_rate: int = Field(..., ge=0, le=100, description="Porcentaje de cumplimiento (0-100)")
    compliance_change: int = Field(..., description="Cambio de cumplimiento vs mes anterior")
    
    # ✅ Campo opcional adicional
    proximo_cierre_nomina: Optional[date] = Field(None, description="Fecha del próximo corte de nómina")

    class Config:
        from_attributes = True
        # ✅ Permitir alias para compatibilidad (opcional)
        populate_by_name = True