from sqlalchemy import Column, Integer, String, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base 

class Shift(Base):
    """
    Representa una asignación de trabajo real para un día específico.
    Crucial para la alerta de 'Turnos sin cubrir'.
    """
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    hora_inicio_real = Column(Time, nullable=False)
    hora_fin_real = Column(Time, nullable=False)
    puesto_requerido = Column(String(50))
    
    # FK a Employee. Puede ser NULL si el turno NO está cubierto.
    assigned_employee_id = Column(Integer, ForeignKey('employees.id'), nullable=True) 
    
    is_covered = Column(Boolean, default=False) # True si assigned_employee_id no es NULL
    es_alteracion = Column(Boolean, default=False) # Si es diferente al horario base
    notas = Column(String(255))

    # Mapeo de regreso (usando nombre diferente en la relación)
    assigned_employee = relationship("Employee", back_populates="shifts", 
                                    foreign_keys=[assigned_employee_id])