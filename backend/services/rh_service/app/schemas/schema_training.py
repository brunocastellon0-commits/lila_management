from datetime import date
from pydantic import BaseModel, Field

# -------------------------------------------------------------------- 
# 1. TrainingCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------

class TrainingCreate(BaseModel):
    """
    Schema para registrar una nueva capacitación asignada a un empleado.
    """
    employee_id: int = Field(..., description="ID del empleado al que se asigna la capacitación.")
    nombre_capacitacion: str = Field(..., max_length=100, description="Nombre o título de la capacitación (Ej: Primeros Auxilios).")
    
    fecha_asignacion: date = Field(..., description="Fecha en que se asignó la capacitación (YYYY-MM-DD).")
    fecha_limite: date | None = Field(None, description="Fecha límite para completar la capacitación. NULL si no aplica.")
    
    # URL de acceso o subida del certificado. Opcional al crear.
    certificado_url: str | None = Field(None, max_length=255, description="Ruta o URL del certificado de finalización.")
    
    # Permite al admin registrar una capacitación como completada en la creación.
    completado: bool = Field(default=False, description="Estado de finalización.")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "employee_id": 101,
                    "nombre_capacitacion": "Manejo de Alimentos Nivel 1",
                    "fecha_asignacion": "2025-10-01",
                    "fecha_limite": "2025-12-31"
                }
            ]
        }
    }
    
# -------------------------------------------------------------------- 
# 2. TrainingUpdate (Schema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------

class TrainingUpdate(BaseModel):
    """
    Schema para actualizar el estado o detalles de una capacitación. Todos los campos son opcionales.
    """
    employee_id: int | None = None
    nombre_capacitacion: str | None = Field(None, max_length=100)
    fecha_asignacion: date | None = None
    fecha_limite: date | None = None
    certificado_url: str | None = Field(None, max_length=255)
    completado: bool | None = None


# -------------------------------------------------------------------- 
# 3. TrainingResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------

class TrainingResponse(BaseModel):
    """
    Schema de respuesta que incluye el ID generado por el sistema y el estado.
    """
    id: int
    employee_id: int
    nombre_capacitacion: str
    fecha_asignacion: date
    fecha_limite: date | None
    completado: bool
    certificado_url: str | None
    
    model_config = {
        "from_attributes": True
    }
