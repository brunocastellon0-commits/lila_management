# rh_service/app/schemas/employee_schedule.py

from pydantic import BaseModel, Field
from datetime import time

# --------------------------------------------------------------------
# 1. EmployeeScheduleCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class EmployeeScheduleCreate(BaseModel):
    """ 
    Schema para crear un nuevo patrón de horario semanal (segmento) para un empleado.
    """
    
    # Clave foránea obligatoria (FK)
    employee_id: int = Field(..., description="ID del empleado al que se asigna el horario.")
    nombre_horario: str = Field(..., max_length=50, description="Etiqueta del patrón (Ej: Turno AM Base, Horario Universitario).")
    dia_semana: int = Field(..., ge=1, le=7, description="Día de la semana (1: Lunes, 7: Domingo).")
    hora_inicio_patron: time = Field(..., description="Hora de inicio del segmento de trabajo.")
    hora_fin_patron: time = Field(..., description="Hora de fin del segmento de trabajo.")
    # Campo opcional que indica si el patrón está vigente
    es_actual: bool = Field(default=True, description="Indica si este patrón de horario está activo.")


# --------------------------------------------------------------------
# 2. EmployeeScheduleUpdate (Schema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------
class EmployeeScheduleUpdate(BaseModel):
    """
    Schema para actualizar un patrón de horario existente. Todos los campos son opcionales.
    """
    # El employee_id no debería poder cambiarse fácilmente en el update, 
    # pero lo dejamos opcional para flexibilidad si es necesario reasignar el patrón.
    employee_id: int | None = Field(None, description="ID del empleado a reasignar (opcional).")
    nombre_horario: str | None = Field(None, max_length=50)
    dia_semana: int | None = Field(None, ge=1, le=7)
    hora_inicio_patron: time | None = None
    hora_fin_patron: time | None = None
    es_actual: bool | None = None


# --------------------------------------------------------------------
# 3. EmployeeScheduleResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class EmployeeScheduleResponse(BaseModel): 
    """
    Schema de respuesta que incluye campos generados por el sistema (ID, fechas, estado).
    """
    id: int 
    employee_id: int
    nombre_horario: str
    dia_semana: int
    hora_inicio_patron: time
    hora_fin_patron: time
    es_actual: bool
    
    model_config = {
        "from_attributes": True 
    }
