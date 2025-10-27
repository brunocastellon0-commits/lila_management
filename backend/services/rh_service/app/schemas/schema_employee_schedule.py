# rh_service/app/schemas/employee_schedule.py

from pydantic import BaseModel, Field, validator
from datetime import time
from typing import List, Optional

# --------------------------------------------------------------------
# 1. EmployeeScheduleCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class EmployeeScheduleCreate(BaseModel):
    """ 
    Schema para crear un nuevo patrón de horario recurrente para un empleado.
    """
    
    # Claves foráneas obligatorias
    employee_id: int = Field(..., description="ID del empleado al que se asigna el horario.")
    sucursal_id: int = Field(..., description="ID de la sucursal donde trabaja el empleado.")  # ← NUEVO
    
    nombre_horario: str = Field(..., max_length=100, description="Nombre del patrón (Ej: Turno Mañana - Lunes a Viernes).")  # ← Longitud aumentada
    
    # CAMBIO: Ahora es una lista de días
    dias_semana: List[int] = Field(..., description="Lista de días de la semana (1: Lunes, 7: Domingo).")  # ← CAMBIO PRINCIPAL
    
    hora_inicio_patron: time = Field(..., description="Hora de inicio del turno.")
    hora_fin_patron: time = Field(..., description="Hora de fin del turno.")
    
    es_actual: bool = Field(default=True, description="Indica si este patrón de horario está activo.")
    descripcion: Optional[str] = Field(None, description="Descripción adicional del horario.")  # ← NUEVO

    @validator('dias_semana')
    def validate_dias_semana(cls, v):
        """Valida que la lista de días sea válida"""
        if not v:
            raise ValueError('Debe seleccionar al menos un día de la semana')
        
        if any(day < 1 or day > 7 for day in v):
            raise ValueError('Los días deben estar entre 1 (Lunes) y 7 (Domingo)')
        
        # Eliminar duplicados y ordenar
        unique_days = sorted(set(v))
        return unique_days

    @validator('hora_fin_patron')
    def validate_horas(cls, v, values):
        """Valida que la hora de fin sea posterior a la hora de inicio"""
        if 'hora_inicio_patron' in values and v <= values['hora_inicio_patron']:
            raise ValueError('La hora de fin debe ser posterior a la hora de inicio')
        return v


# --------------------------------------------------------------------
# 2. EmployeeScheduleUpdate (Schema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------
class EmployeeScheduleUpdate(BaseModel):
    """
    Schema para actualizar un patrón de horario existente. Todos los campos son opcionales.
    """
    employee_id: Optional[int] = Field(None, description="ID del empleado a reasignar.")
    sucursal_id: Optional[int] = Field(None, description="ID de la sucursal.")  # ← NUEVO
    
    nombre_horario: Optional[str] = Field(None, max_length=100)
    dias_semana: Optional[List[int]] = Field(None, description="Lista de días de la semana")  # ← CAMBIO
    
    hora_inicio_patron: Optional[time] = None
    hora_fin_patron: Optional[time] = None
    es_actual: Optional[bool] = None
    descripcion: Optional[str] = Field(None, description="Descripción adicional del horario.")  # ← NUEVO

    @validator('dias_semana')
    def validate_dias_semana_update(cls, v):
        """Valida la lista de días en actualización (si se proporciona)"""
        if v is not None:
            if not v:
                raise ValueError('Debe seleccionar al menos un día de la semana')
            
            if any(day < 1 or day > 7 for day in v):
                raise ValueError('Los días deben estar entre 1 (Lunes) y 7 (Domingo)')
            
            # Eliminar duplicados y ordenar
            unique_days = sorted(set(v))
            return unique_days
        return v


# --------------------------------------------------------------------
# 3. EmployeeScheduleResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class EmployeeScheduleResponse(BaseModel): 
    """
    Schema de respuesta que incluye todos los campos del patrón de horario.
    """
    id: int 
    employee_id: int
    sucursal_id: int  # ← NUEVO
    nombre_horario: str
    dias_semana: List[int]  # ← CAMBIO: Ahora es lista
    hora_inicio_patron: time
    hora_fin_patron: time
    es_actual: bool
    descripcion: Optional[str] = None  # ← NUEVO
    
    class Config:
        from_attributes = True


# --------------------------------------------------------------------
# 4. NUEVO: Schema para Horario Mensual Generado
# --------------------------------------------------------------------
class MonthlyScheduleResponse(BaseModel):
    """
    Schema para el horario mensual generado a partir de los patrones recurrentes.
    """
    date: str  # Fecha en formato YYYY-MM-DD
    day_name: str  # Nombre del día (Lunes, Martes, etc.)
    start_time: time
    end_time: time
    schedule_name: str
    sucursal_id: int
    employee_name: Optional[str] = None  # Para enriquecer la respuesta
    
    class Config:
        from_attributes = True


# --------------------------------------------------------------------
# 5. NUEVO: Schema para Creación Rápida de Horarios
# --------------------------------------------------------------------
class BulkScheduleCreate(BaseModel):
    """
    Schema para crear múltiples patrones de horario de una vez.
    Útil para asignar el mismo horario a varios empleados.
    """
    employee_ids: List[int] = Field(..., description="Lista de IDs de empleados")
    sucursal_id: int = Field(..., description="ID de la sucursal")
    nombre_base: str = Field(..., description="Nombre base para los horarios")
    dias_semana: List[int] = Field(..., description="Días de la semana")
    hora_inicio_patron: time = Field(..., description="Hora de inicio")
    hora_fin_patron: time = Field(..., description="Hora de fin")
    descripcion: Optional[str] = None

    @validator('employee_ids')
    def validate_employee_ids(cls, v):
        if not v:
            raise ValueError('Debe seleccionar al menos un empleado')
        return v