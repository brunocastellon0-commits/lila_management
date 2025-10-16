# rh_service/app/schemas/employee.py

from pydantic import BaseModel, Field, EmailStr
from datetime import date
from decimal import Decimal # Necesario para manejar tarifas monetarias

# --------------------------------------------------------------------
# 1. EmployeeCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class EmployeeCreate(BaseModel):
    """
    Schema para crear un nuevo registro de empleado.
    """
    nombre: str = Field(..., max_length=50, description="Nombre de pila.")
    apellido: str = Field(..., max_length=50, description="Apellido de pila.")
    email: EmailStr = Field(..., max_length=100, description="Correo electrónico único del empleado.")
    puesto: str = Field(..., max_length=50, description="Puesto de trabajo (ej: Barista, Mesero).")
    
    # Campo Requerido por el Modelo ORM
    fecha_ingreso: date = Field(..., description="Fecha de inicio de labores (YYYY-MM-DD).") 
    
    # Campos de Nómina
    # Nota: Usamos Decimal para manejar dinero con precisión.
    tarifa_hora: Decimal | None = Field(None, decimal_places=2, description="Monto por hora de trabajo.")
    es_salario_fijo: bool = Field(default=False, description="True si recibe salario fijo mensual.")
    
    # El desempeño es opcional y tiene un rango de validación (1 a 100).
    desempeño_score: int | None = Field(default=50, ge=1, le=100, description="Puntuación inicial de desempeño.")
    


# --------------------------------------------------------------------
# 2. EmployeeUpdate (Schema de Entrada: PUT/Actualización)
# --------------------------------------------------------------------
class EmployeeUpdate(BaseModel):
    """
    Schema para actualizar datos de un empleado. Todos los campos son opcionales.
    """
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    puesto: str | None = None
    is_active: bool | None = None
    desempeño_score: int | None = None
    tarifa_hora: Decimal | None = None
    es_salario_fijo: bool | None = None

# --------------------------------------------------------------------
# 3. EmployeeResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class EmployeeResponse(BaseModel):
    """
    Schema de respuesta que incluye el ID generado por la base de datos y métricas.
    """
    id: int
    nombre: str
    apellido: str
    email: EmailStr
    puesto: str
    fecha_ingreso: date
    is_active: bool
    desempeño_score: int
    
    # Campos de Nómina
    tarifa_hora: Decimal | None
    es_salario_fijo: bool
    
    model_config = {
        "from_attributes": True
    }
