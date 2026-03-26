from sqlalchemy import Column, Integer, String, DateTime, Boolean, func, Numeric, Enum
from sqlalchemy.orm import relationship
from app.db import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    product_type = Column(Enum("Insumo", "Masa base", "Producto venta"), nullable=False)
    medida = Column(Enum("Kg", "Gr", "Ltr", "Ml", "Unidad"), nullable=False)
    costo = Column(Numeric(10, 2), nullable=False)
    activo = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)
    stock = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relación con las recetas que PRODUCEN este producto
    recipes = relationship("Recipe", back_populates="product")
    
    # Relación con las líneas de ingredientes donde este producto es USADO
    used_in_recipes = relationship("RecipeIngredient", back_populates="ingredient")