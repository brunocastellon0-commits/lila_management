from pydantic import BaseModel, Field
from datetime import date
from typing import Literal

# --- Definición de la Respuesta Unificada de Alertas ---
class AlertaResponse(BaseModel):
    """
    Schema unificado para devolver una alerta al Frontend,
    independientemente de su origen (Request, Shift, Document, etc.).
    """
    id_entidad: int = Field(..., description="ID del objeto de origen (ej. ID del Documento o del Shift).")
    origen: Literal['REQUEST', 'SHIFT', 'DOCUMENT', 'PAYROLL', 'TRAINING', 'EMPLOYEE'] = Field(
        ..., description="Tipo de entidad que generó la alerta."
    )
    descripcion: str = Field(..., max_length=255, description="Mensaje conciso que describe la alerta (Ej: 'Pendiente de aprobación').")
    prioridad: Literal['CRITICA', 'ALTA', 'MEDIA', 'BAJA'] = Field(..., description="Nivel de urgencia de la alerta.")
    fecha_referencia: date = Field(..., description="Fecha clave para la alerta (ej. fecha de vencimiento o de solicitud).")

    model_config = {
        "from_attributes": True
    }