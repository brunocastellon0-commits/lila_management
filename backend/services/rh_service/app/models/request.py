from sqlalchemy import Column, Integer, String, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base 

class Request(Base):
    """
    Gestión de solicitudes de empleados (Vacaciones, Permisos, Reemplazos).
    Soporta la alerta de 'Permisos Pendientes de Revisión'.
    """
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    tipo = Column(String(50), nullable=False) # Ej: 'Vacaciones', 'Permiso Médico', 'Reemplazo'
    motivo = Column(String(255))
    fecha_solicitud = Column(Date, default=func.curdate())
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(String(20), default="Pendiente") # Ej: 'Pendiente', 'Aprobado', 'Rechazado'

    # Mapeo de regreso
    employee = relationship("Employee", back_populates="requests")