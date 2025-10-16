# rh_service/app/schemas/shift.py

from datetime import date, time
from pydantic import BaseModel, Field

# -------------------------------------------------------------------- 
# 1. ShiftCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------

class ShiftCreate(BaseModel):
    """
    Schema para crear o planificar un nuevo turno de trabajo.
    """
    
    fecha: date = Field(..., description="Día en que se realiza el turno (YYYY-MM-DD).")
    hora_inicio_real: time = Field(..., description="Hora real de inicio del turno (HH:MM:SS).")
    hora_fin_real: time = Field(..., description="Hora real de finalización del turno (HH:MM:SS).")
    
    puesto_requerido: str = Field(..., max_length=50, description="Puesto que debe cubrir este turno (Ej: Mesero, Barista).")
    
    # FK opcional: si se crea un turno, podría estar inicialmente sin asignar (NULL).
    assigned_employee_id: int | None = Field(None, description="ID del empleado asignado a cubrir este turno. NULL si no está cubierto.")
    
    # Campo para indicar si esta asignación difiere del horario base del empleado.
    es_alteracion: bool = Field(default=False, description="Indica si el turno es diferente al patrón de horario habitual del empleado.")
    
    notas: str | None = Field(None, max_length=255, description="Notas internas sobre el turno (Ej: Motivo de la alteración).")

# -------------------------------------------------------------------- 
# 2. ShiftUpdate (Schema de Entrada: PATCH/Actualización General)
# --------------------------------------------------------------------

class ShiftUpdate(BaseModel):
    """
    Schema para actualizar campos generales de un turno existente. 
    Todos los campos son opcionales.
    """
    fecha: date | None = None
    hora_inicio_real: time | None = None
    hora_fin_real: time | None = None
    puesto_requerido: str | None = Field(None, max_length=50)
    assigned_employee_id: int | None = None
    es_alteracion: bool | None = None
    notas: str | None = Field(None, max_length=255)


# -------------------------------------------------------------------- 
# 3. ShiftAssign (Schema de Entrada: PATCH/Asignación)
# --------------------------------------------------------------------

class ShiftAssign(BaseModel):
    """
    Schema usado para asignar un empleado a un turno ya existente.
    """
    assigned_employee_id: int = Field(..., description="ID del empleado que tomará el turno.")
    
    # El servidor debe usar este campo para actualizar 'is_covered' a True.
    is_covered: bool = Field(default=True, description="Debe ser True al asignar un empleado.")
    
    
# -------------------------------------------------------------------- 
# 4. ShiftResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------

class ShiftResponse(BaseModel):
    """
    Schema de respuesta que incluye el ID y el estado de cobertura del turno.
    """
    id: int
    fecha: date
    hora_inicio_real: time
    hora_fin_real: time
    puesto_requerido: str
    assigned_employee_id: int | None
    is_covered: bool
    es_alteracion: bool
    notas: str | None
    
    model_config = {
        "from_attributes": True
    }
