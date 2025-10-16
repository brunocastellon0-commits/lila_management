from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base 

class Training(Base):
    """
    Registro de capacitaciones y cumplimiento.
    Soporta el dashboard de 'Capacitaciones Pendientes'.
    """
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    nombre_capacitacion = Column(String(100), nullable=False)
    fecha_asignacion = Column(Date, nullable=False)
    fecha_limite = Column(Date, nullable=True) # Para la alerta
    completado = Column(Boolean, default=False) # Si es False, es pendiente
    certificado_url = Column(String(255))

    # Mapeo de regreso
    employee = relationship("Employee", back_populates="trainings")