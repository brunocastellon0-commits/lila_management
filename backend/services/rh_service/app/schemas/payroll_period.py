from pydantic import BaseModel, Field
from datetime import date
from typing import Optional 

# --------------------------------------------------------------------
# 0. PayrollPeriodBase (Clase Base para Reutilizar Campos)
# --------------------------------------------------------------------
class PayrollPeriodBase(BaseModel):
    """
    Clase base con los campos de datos esenciales.
    """
    nombre_periodo: str = Field(..., max_length=100, description="Nombre descriptivo (Ej: Nómina de Septiembre).")
    
    # Fechas de cobertura
    fecha_inicio: date = Field(..., description="Fecha inicial del período de trabajo incluido en este pago (YYYY-MM-DD).")
    fecha_fin: date = Field(..., description="Fecha final del período de trabajo incluido en este pago (YYYY-MM-DD).")
    
    # Fecha administrativa
    fecha_corte_revision: date = Field(..., description="Fecha límite para que el administrador finalice la revisión de la nómina (YYYY-MM-DD).")


# --------------------------------------------------------------------
# 1. PayrollPeriodCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class PayrollPeriodCreate(PayrollPeriodBase):
    """
    Schema para registrar un nuevo ciclo de pago. Hereda todos los campos obligatorios.
    """
    pass


# --------------------------------------------------------------------
# 2. PayrollPeriodUpdate (Schema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------
class PayrollPeriodUpdate(BaseModel):
    """
    Schema para actualizar un ciclo de pago existente. 
    Todos los campos son opcionales (Optional) para permitir actualizaciones parciales (PATCH).
    """
    nombre_periodo: Optional[str] = Field(None, max_length=100, description="Nombre descriptivo (Ej: Nómina de Septiembre).")
    
    # Fechas de cobertura
    fecha_inicio: Optional[date] = Field(None, description="Fecha inicial del período de trabajo incluido en este pago (YYYY-MM-DD).")
    fecha_fin: Optional[date] = Field(None, description="Fecha final del período de trabajo incluido en este pago (YYYY-MM-DD).")
    
    # Fecha administrativa
    fecha_corte_revision: Optional[date] = Field(None, description="Fecha límite para que el administrador finalice la revisión de la nómina (YYYY-MM-DD).")
    
    # Campos que se pueden actualizar administrativamente
    estado: Optional[str] = Field(None, description="Nuevo estado del período de nómina (Ej: 'Aprobado').") 
    finalizado: Optional[bool] = Field(None, description="Indica si el periodo de nómina ha sido marcado como finalizado.") 

    # Configuración de Pydantic v2 para ignorar campos extra o no seteados
    model_config = {
        "extra": "ignore" 
    }
    
# --------------------------------------------------------------------
# 3. PayrollPeriodResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class PayrollPeriodResponse(BaseModel):
    """
    Schema de respuesta completa, ideal para leer datos.
    """
    id: int
    nombre_periodo: str
    fecha_inicio: date
    fecha_fin: date
    fecha_corte_revision: date
    estado: str
    finalizado: bool
    
    # Configuración para permitir el mapeo de atributos de la DB (ORM mode)
    model_config = {
        "from_attributes": True 
    }
