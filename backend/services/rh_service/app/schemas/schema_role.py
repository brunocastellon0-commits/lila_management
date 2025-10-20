from pydantic import BaseModel, Field
from typing import Optional

# --------------------------------------------------------------------
# 1. Role Create (Esquema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class RoleCreate(BaseModel):
    """
    Esquema para la creación de un nuevo rol en la empresa (trabajadores)
    """
    rol: str = Field(..., max_length=50, description="Rol de trabajo (Ej: Mesero, Cocinero, Gerente)")
    descripcion: str = Field(..., max_length=100, description="Descripción breve del rol de trabajo")


# --------------------------------------------------------------------
# 2. Role Update (Esquema de Entrada: PUT/PATCH)
# --------------------------------------------------------------------
class RoleUpdate(BaseModel):
    """
    Esquema para editar un rol existente
    """
    rol: Optional[str] = Field(None, max_length=50, description="Nuevo nombre del rol (opcional)")
    descripcion: Optional[str] = Field(None, max_length=100, description="Nueva descripción (opcional)")


# --------------------------------------------------------------------
# 3. Role Response (Esquema de Salida: GET/Response)
# --------------------------------------------------------------------
class RoleResponse(BaseModel):
    """
    Esquema de salida (respuesta) para un rol
    """
    id: int
    rol: str
    descripcion: str

    model_config = {
        "from_attributes": True
    }