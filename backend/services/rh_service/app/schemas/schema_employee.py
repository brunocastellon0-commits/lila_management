from pydantic import BaseModel, Field, EmailStr
from datetime import date
from decimal import Decimal 
from typing import Optional

# Importar los schemas de respuesta de Rol y Sucursal para la serialización de salida
# Asegúrate de que las rutas de importación sean correctas
from app.schemas.schema_role import RoleResponse 
from app.schemas.schema_sucursal import SucursalResponse 

# --------------------------------------------------------------------
# 1. EmployeeCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class EmployeeCreate(BaseModel):
    """
    Schema para crear un nuevo registro de empleado. 
    Se espera que el frontend envíe los ID numéricos para Rol y Sucursal.
    """
    nombre: str = Field(..., max_length=50, description="Nombre de pila.")
    apellido: str = Field(..., max_length=50, description="Apellido de pila.")
    email: EmailStr = Field(..., max_length=100, description="Correo electrónico único del empleado.")
    puesto: str = Field(..., max_length=50, description="Puesto de trabajo (ej: Barista, Mesero).")
    
    fecha_ingreso: date = Field(..., description="Fecha de inicio de labores (YYYY-MM-DD).") 
    
    # Campos de Nómina
    tarifa_hora: Decimal | None = Field(None, decimal_places=2, description="Monto por hora de trabajo.")
    es_salario_fijo: bool = Field(default=False, description="True si recibe salario fijo mensual.")
    
    # *** CAMBIO CLAVE: Usamos los IDs numéricos en el input ***
    rol_id: int = Field(..., description="ID numérico del rol del empleado.")
    sucursal_id: int = Field(..., description="ID numérico de la sucursal del empleado.")
    
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
    
    # *** CAMBIO CLAVE: Usamos los IDs numéricos en el update ***
    rol_id: int | None = None
    sucursal_id: int | None = None

# --------------------------------------------------------------------
# 3. EmployeeResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class EmployeeResponse(BaseModel):
    """
    Schema de respuesta que incluye el ID generado por la base de datos y métricas,
    además de las relaciones completas para Rol y Sucursal (necesario para FastAPI).
    """
    id: int
    nombre: str
    apellido: str
    email: EmailStr
    puesto: str
    fecha_ingreso: date
    is_active: bool = Field(default=True) # Agregar is_active
    desempeño_score: int
    
    # Campos de Nómina
    tarifa_hora: Decimal | None
    es_salario_fijo: bool
    
    # *** CAMBIO CLAVE: Incluir los IDs y los objetos de Relación ***
    sucursal_id: int
    rol_id: int

    # Los objetos de relación completos, si el modelo ORM los carga (back_populates)
    # ¡Asegúrate de que estas importaciones sean correctas!
    rol: RoleResponse 
    sucursal: SucursalResponse 
    
    model_config = {
        "from_attributes": True
    }
