from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class PostulanteBase(BaseModel):
    nombre: Optional[str] = None
    telefono: str
    correo: EmailStr

class PostulanteCreate(PostulanteBase):
    ruta_cv: str
    
class PostulanteUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    es_apto: Optional[bool] = None
    match_score: Optional[int] = None
    estado_entrevista: Optional[str] = None
    fecha_entrevista: Optional[str] = None
    modalidad_entrevista: Optional[str] = None
    notas_entrevista: Optional[str] = None

class PostulanteResponse(PostulanteBase):
    id: int
    ruta_cv: str
    match_score: Optional[int] = None
    analisis_ia: Optional[str] = None
    es_apto: bool
    fecha_postulacion: datetime
    estado_entrevista: str
    fecha_entrevista: Optional[datetime] = None
    modalidad_entrevista: Optional[str] = None
    notas_entrevista: Optional[str] = None

    class Config:
        from_attributes = True 
