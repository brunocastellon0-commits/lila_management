from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base 

class PayrollPeriod(Base):
    """
    Define un ciclo de pago. Crucial para la alerta de 'Planillas'.
    """
    __tablename__ = "payroll_periods"

    id = Column(Integer, primary_key=True, index=True)
    nombre_periodo = Column(String(100), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    fecha_corte_revision = Column(Date, nullable=False) # Fecha límite para revisar la planilla
    estado = Column(String(20), default="Pendiente de Revisión") # Para la alerta
    finalizado = Column(Boolean, default=False)

    # Relación a los detalles de pago de este período
    details = relationship("PaymentDetail", back_populates="period")