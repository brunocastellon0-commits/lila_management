# rh_service/app/models/employee_schedule.py

from sqlalchemy import Column, Integer, String, Time, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base 

class EmployeeSchedule(Base):
    """
    Define el patrón de horario recurrente de un empleado (Ej: Lunes a Viernes 7am-3pm).
    Un empleado puede tener múltiples patrones para diferentes días o turnos.
    """
    __tablename__ = "employee_schedules"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    sucursal_id = Column(Integer, ForeignKey('sucursal.id'), nullable=False)
    
    nombre_horario = Column(String(100), nullable=False)
    dias_semana = Column(String(20), nullable=False)      # Múltiples días (ej: "1,2,3,4,5")
    hora_inicio_patron = Column(Time, nullable=False)
    hora_fin_patron = Column(Time, nullable=False)
    es_actual = Column(Boolean, default=True)
    descripcion = Column(Text, nullable=True)

    # Relaciones
    employee = relationship("Employee", back_populates="schedules")
    sucursal = relationship("Sucursal", back_populates="employee_schedules")