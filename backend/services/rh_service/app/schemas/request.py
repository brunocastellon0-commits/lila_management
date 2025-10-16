from datetime import date
from pydantic import BaseModel, Field

# -------------------------------------------------------------------- 
# 1. RequestCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------

class RequestCreate(BaseModel):
    """
    Schema para crear una nueva solicitud por parte del empleado.
    El estado inicial siempre será 'Pendiente' (gestionado por el servidor).
    """
    employee_id: int = Field(..., description="ID del empleado que realiza la solicitud.") 
    tipo: str = Field(..., max_length=100, description="Tipo de solicitud (Ej: 'Vacación', 'Permiso Personal', 'Reemplazo').")    
    motivo: str = Field(..., max_length=255, description="Descripción detallada de la razón de la solicitud.")
    
    # La fecha de solicitud se usa para el registro, la DB puede inyectarla automáticamente.
    fecha_solicitud: date = Field(..., description="Fecha en la que se registra la solicitud (YYYY-MM-DD).")
    
    # Período solicitado
    fecha_inicio: date = Field(..., description="Fecha de inicio del período de la solicitud.")
    fecha_fin: date = Field(..., description="Fecha de finalización del período de la solicitud.")
    
    
# -------------------------------------------------------------------- 
# 2. RequestUpdate (Schema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------

class RequestUpdate(BaseModel):
    """
    Schema usado por un ADMINISTRADOR para cambiar el estado de la solicitud.
    """
    estado: str = Field(..., max_length=50, description="Nuevo estado: 'Aprobado', 'Negado', 'Pendiente de Información'.")
    # Nota: También se podría incluir un campo 'razon_rechazo' si el estado es 'Negado'.


# -------------------------------------------------------------------- 
# 3. RequestResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------

class RequestResponse(BaseModel):
    """
    Schema de respuesta que incluye los campos completos y el estado actual.
    """
    id: int
    employee_id: int 
    tipo: str
    motivo: str
    fecha_solicitud: date
    fecha_inicio: date
    fecha_fin: date
    estado: str
    
    model_config = {
        "from_attributes": True
    }
