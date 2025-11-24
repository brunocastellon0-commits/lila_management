from sqlalchemy import Column, Integer, String, Date, Boolean, func, ForeignKey, Numeric, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base 
from datetime import datetime

class postulante(Base):
    __tablename__ = "postulante"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=True)
    telefono = Column(String(50), nullable=False)
    correo = Column(String(100), nullable=False)
    ruta_cv = Column(String(255), nullable=False)
    
    # Relación con el Rol/Puesto (Vital para que la IA sepa qué evaluar)
    rol_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    
    # Campos de IA
    match_score = Column(Integer, nullable=True)
    analisis_ia = Column(Text, nullable=True) 
    es_apto = Column(Boolean, default=False)
    
    # Campos de gestión de entrevistas
    fecha_postulacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    estado_entrevista = Column(String(20), default="pendiente", nullable=False)  # pendiente, agendada, completada
    fecha_entrevista = Column(DateTime, nullable=True)
    modalidad_entrevista = Column(String(20), nullable=True)  # presencial, virtual, telefonica
    notas_entrevista = Column(Text, nullable=True)