from datetime import date
from pydantic import BaseModel, Field

# --------------------------------------------------------------------
# 1. SucursalCreate (Schema de Entrada: POST/Creación)
# --------------------------------------------------------------------

class SucursalCreate(BaseModel):
    #schema que se encarga de crear una sucursal
    nombre_sucursal:str= Field(..., max_length=(50),description="nombre sucursal")
    fecha_inauguracion:date=Field(...,description="fecha de fundacionde la sucursal")
    ubicacion:str=Field(...,max_length=200,description="ubicacion de la sucursal")
    telefono:int=Field(description="telefono de la sucursal")
    
# --------------------------------------------------------------------
# 2. SucursalUpdate (Schema de Entrada: PUT/Actualización)
# --------------------------------------------------------------------

class SucursalUpdate(BaseModel):
    nombre_sucursal:str
    fecha_inauguracion:date
    ubicacion:str
    telefono:int
    
# --------------------------------------------------------------------
# 3. SucursalResponse (Schema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class SucursalResponse(BaseModel):
    id:int
    nombre_sucursal:str
    fecha_inauguracion:date
    ubicacion:str
    telefono:int
    
        
    model_config = {
        "from_attributes": True
    }
