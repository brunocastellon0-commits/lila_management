from sqlalchemy import Column, Integer, String, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base 

class EmployeeSchedule(Base):
    """
    Define el patrón de horario base o fijo de un empleado (Ej: Lunes 8am-4pm).
    Un empleado puede tener múltiples patrones, pero solo uno debe ser 'es_actual'.
    """
    __tablename__ = "employee_schedules"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    nombre_horario = Column(String(50), nullable=False)
    dia_semana = Column(Integer, nullable=False) # 1=Lunes, 7=Domingo
    hora_inicio_patron = Column(Time, nullable=False)
    hora_fin_patron = Column(Time, nullable=False)
    es_actual = Column(Boolean, default=True) # Indica el patrón de horario activo

    # Mapeo de regreso
    employee = relationship("Employee", back_populates="schedules")