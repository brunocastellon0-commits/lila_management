from sqlalchemy import Column, Integer, String, DateTime, Numeric, Enum, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db import Base

class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    
    # Código de lote para trazabilidad (ej: LOTE-2026-03-22-01)
    Lote = Column(String(50), unique=True, nullable=False)
    
    planeacion = Column(Numeric(10, 2), nullable=False) # Lo que esperamos producir
    real = Column(Numeric(10, 2), nullable=True)  # Lo que realmente salió
    
    status = Column(Enum("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"), default="PENDING")
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Metadatos
    created_at = Column(DateTime, default=func.now())
    created_by = Column(String(100), nullable=True) # Aquí podrías usar un FK a tabla de Usuarios

    # Relaciones
    recipe = relationship("Recipe", back_populates="production_orders")
    waste_logs = relationship("ProductionWasteLog", back_populates="order", cascade="all, delete-orphan")