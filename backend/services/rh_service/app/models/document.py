from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base 

class Document(Base):
    """
    Registro de documentos legales del empleado. 
    Crucial para la alerta de 'Documentos por vencer' y 'Pendientes de revisión'.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    tipo = Column(String(50), nullable=False) # Ej: 'Carnet Sanitario', 'Contrato'
    url_archivo = Column(String(255), nullable=False)
    fecha_vencimiento = Column(Date, nullable=True) # Puede ser NULL si no aplica vencimiento
    aprobado_admin = Column(Boolean, default=False) # Si el administrador lo ha validado

    # Mapeo de regreso
    employee = relationship("Employee", back_populates="documents")