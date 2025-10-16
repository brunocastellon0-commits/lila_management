from sqlalchemy import Column, Integer, String, Date, Boolean, func, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.database import Base # Importa la Base declarativa

class Employee(Base):
    """
    Modelo ORM (Object-Relational Mapping) para la tabla 'employees'.
    
    Esta es la entidad central del servicio RH.
    Incluye las relaciones (mappings) con otras tablas del servicio (Horarios, Documentos, Pagos).
    """
    __tablename__ = "employees"

    # --- Campos Básicos y de Identificación ---
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    puesto = Column(String(50), nullable=False)
    
    # --- Campos de Nómina (NUEVOS) ---
    # Tarifa por hora (ej: 15.50). Numeric(6, 2) permite hasta 9,999.99
    tarifa_hora = Column(Numeric(6, 2), nullable=False, default=0.00)
    # Bandera que indica si se le paga un monto fijo (True) o por horas (False)
    es_salario_fijo = Column(Boolean, default=False) 
    
    # --- Campos de Estado y Métricas para Dashboards ---
    fecha_ingreso = Column(Date, nullable=False, default=func.curdate())
    is_active = Column(Boolean, default=True)  # Usado para el dashboard de Empleados Activos.
    desempeño_score = Column(Integer, default=50) # Usado para métricas de Cumplimiento/Desempeño.

    # --- Relaciones ORM (Mappings) ---
    schedules = relationship("EmployeeSchedule", back_populates="employee", 
                             doc="Patrones de horario base asignados al empleado.")
    
    shifts = relationship("Shift", foreign_keys="[Shift.assigned_employee_id]", 
                          back_populates="assigned_employee",
                          doc="Turnos específicos asignados a este empleado.")
    
    documents = relationship("Document", back_populates="employee", 
                             doc="Documentos legales y certificaciones subidas por el empleado.")
    trainings = relationship("Training", back_populates="employee", 
                              doc="Capacitaciones y su estado de cumplimiento.")
    
    requests = relationship("Request", back_populates="employee", 
                            doc="Solicitudes activas o históricas del empleado (ej. vacaciones).")
    
    payments = relationship("PaymentDetail", back_populates="employee", 
                             doc="Detalles de pago asociados a un período de nómina.")

    def __repr__(self):
        """Representación para la depuración."""
        return f"<Employee(id={self.id}, nombre='{self.nombre} {self.apellido}')>"
