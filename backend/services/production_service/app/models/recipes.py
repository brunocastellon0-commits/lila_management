from sqlalchemy import Column, Integer, String, Date, func, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db import Base

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    rendimiento_receta = Column(Numeric(10, 2), nullable=False)
    prep_time = Column(Integer)  
    instruction = Column(String(255), nullable=False)
    
    created_at = Column(Date, default=func.now())
    updated_at = Column(Date, default=func.now(), onupdate=func.now())

    # El producto que se obtiene de esta receta
    product = relationship("Product", back_populates="recipes")
    
    # Los ingredientes que componen esta receta
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    # Dentro de la clase Recipe:
    production_orders = relationship("ProductionOrder", back_populates="recipe")