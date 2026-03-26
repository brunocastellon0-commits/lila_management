from sqlalchemy import Column, Integer, ForeignKey, Numeric, DateTime, func
from sqlalchemy.orm import relationship
from app.db import Base

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    ingredient_id = Column(Integer, ForeignKey("products.id"))
    
    quantity = Column(Numeric(10, 2), nullable=False)
    waste_factor = Column(Numeric(10, 2), nullable=False) # Factor de desmedro
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relaciones para acceder a los datos vinculados
    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Product", back_populates="used_in_recipes")