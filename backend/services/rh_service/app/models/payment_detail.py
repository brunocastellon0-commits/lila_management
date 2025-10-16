from sqlalchemy import Column, Integer, Numeric, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base 

class PaymentDetail(Base):
    """
    Modelo ORM para 'payment_details'. 
    Contiene el resumen financiero del pago de un empleado para un ciclo de nómina específico.
    Se adapta para manejar pagos por horas o salario fijo.
    """
    __tablename__ = "payment_details"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False, doc="ID del empleado receptor del pago.")
    period_id = Column(Integer, ForeignKey('payroll_periods.id'), nullable=False, doc="ID del período de nómina asociado.")
    
    # --- Componentes Base del Pago ---
    
    # Campo para almacenar las horas totales trabajadas en el período. 
    # Será NULL si el empleado tiene un salario fijo.
    horas_totales_trabajadas = Column(Numeric(5, 2), nullable=True, 
                                     doc="Total de horas registradas en el período (Numeric(5, 2)).")
    
    # Monto base calculado (horas * tarifa) o el valor del salario fijo.
    monto_base_calculado = Column(Numeric(10, 2), nullable=True, 
                                 doc="Monto base antes de deducciones/bonificaciones.")
    
    # --- Ajustes y Totales ---
    
    total_descuentos = Column(Numeric(10, 2), default=0.00, doc="Suma total de deducciones aplicadas.")
    total_bonificaciones = Column(Numeric(10, 2), default=0.00, doc="Suma total de bonos y pagos extra.")
    
    # Monto final a desembolsar. Es nullable hasta que se finaliza la nómina.
    monto_neto = Column(Numeric(10, 2), nullable=True, doc="Monto final (neto) a pagar al empleado.") 

    # --- Relaciones ORM (Mapeos) ---
    employee = relationship("Employee", back_populates="payments", doc="Relación con el empleado.")
    period = relationship("PayrollPeriod", back_populates="details", doc="Relación con el período de nómina.")
    components = relationship("PayComponent", back_populates="detail", doc="Componentes de pago asociados (líneas de recibo).")
