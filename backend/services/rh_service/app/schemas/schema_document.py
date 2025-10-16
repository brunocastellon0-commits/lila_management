from pydantic import BaseModel, Field
from datetime import time, date
# -------------------------------------------------------------------- 
# 1. DocumentCreate (Esquema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class DocumentCreate(BaseModel):
    tipo:str= Field(..., max_length=50 , description="Tipo de documento del empelado")
    url_archivo:str=Field(..., max_length=250, descriptiom="Almacenamietno de documetnos en la nube")
    fecha_vencimiento:date |None=Field (None, description="Fecha de vencimiento si aplica" )
    aprobado_admin:bool=Field(default=False, description="revisado y aprobado por administrador")

# --------------------------------------------------------------------
# 2. DocumentUpdate (Schema de Entrada: PUT/Actualización)
# --------------------------------------------------------------------
class DocumentUpdate(BaseModel):
    """
    Schema para actualizar un documento existente. Todos los campos son opcionales.
    """
    tipo: str | None = None
    url_archivo: str | None = None
    fecha_vencimiento: date | None = None
    # Campo crucial para el flujo de trabajo del administrador y las alertas
    aprobado_admin: bool | None = None
# -------------------------------------------------------------------- 
# 3. DocumentResponse (Esquema de Entrada: GET/Lectura)
# --------------------------------------------------------------------
class DocumentResponse(BaseModel):
    id: int
    employee_id:int
    tipo:str
    url_archivo:str
    fecha_vencimiento:date| None
    aprobado_admin:bool
    
    model_config = {
        "from_attributes": True
    }