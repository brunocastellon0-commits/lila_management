# rh_service/app/models/sucursal.py

from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from app.database import Base 

class Sucursal(Base):
    """Tabla de sucursales"""
    __tablename__ = "sucursal"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_sucursal = Column(String(50), nullable=False)
    fecha_inauguracion = Column(Date, nullable=False)
    ubicacion = Column(String(200), nullable=False)
    telefono = Column(String(20), nullable=True)

    # Relaciones
    employees = relationship("Employee", back_populates="sucursal")
    employee_schedules = relationship("EmployeeSchedule", back_populates="sucursal")
    
    def __repr__(self):
        return f"<Sucursal(id={self.id}, nombre='{self.nombre_sucursal}')>"