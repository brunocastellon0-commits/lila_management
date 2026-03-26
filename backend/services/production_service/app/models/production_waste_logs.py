from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db import Base

class ProductionWasteLog(Base):
    __tablename__ = "production_waste_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("production_orders.id"), nullable=False)
    
    # Tipo de merma: Quemado, Vencido, Se cayó, Fallo de calidad
    waste_type = Column(Enum("BURNT", "EXPIRED", "DROPPED", "QUALITY_FAIL"), nullable=False)
    
    quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(String(255), nullable=True) # Comentario extra del cocinero
    
    created_at = Column(DateTime, default=func.now())

    # Relación
    order = relationship("ProductionOrder", back_populates="waste_logs")