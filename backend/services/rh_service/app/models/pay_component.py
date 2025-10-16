# rh_service/app/models/pay_component.py

from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base 

class PayComponent(Base):
    """
    Modelo ORM para la tabla 'pay_components'.
    
    Representa una línea individual (componente) que constituye un pago
    (ej: salario base, bono por desempeño, descuento de impuestos).
    Esto permite un desglose detallado de la nómina.
    """
    __tablename__ = "pay_components"
 
    # --- Campos de Identificación ---
    id = Column(Integer, primary_key=True, index=True)
    
    # Clave Foránea al detalle del pago (la cual pertenece a un empleado y período)
    payment_detail_id = Column(Integer, ForeignKey('payment_details.id'), nullable=False)
    
    # --- Campos de Detalle del Componente ---
    tipo = Column(String(50), nullable=False) # Ej: 'Bono', 'Descuento', 'Horas Extra'
    descripcion = Column(String(255))
    
    # Usa Numeric(10, 2) para precisión monetaria. Puede ser positivo o negativo.
    monto = Column(Numeric(10, 2), nullable=False) 

    # --- Relaciones ORM ---
    # Mapeo de regreso: permite acceder al PaymentDetail padre desde este componente.
    detail = relationship("PaymentDetail", back_populates="components",
                          doc="Detalle de pago al que pertenece este componente.")

    def __repr__(self):
        """Representación para la depuración."""
        return f"<PayComponent(id={self.id}, tipo='{self.tipo}', monto={self.monto})>"