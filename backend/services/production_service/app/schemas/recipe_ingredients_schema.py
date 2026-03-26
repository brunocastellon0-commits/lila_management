from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ==========================================
# SCHEMAS PARA INGREDIENTES DE RECETA (RecipeIngredient)
# ==========================================

# Esquema Base
class RecipeIngredientBase(BaseModel):
    recipe_id: int
    ingredient_id: int
    # Validamos que la cantidad sea estrictamente mayor a 0 (gt=0)
    quantity: float = Field(..., gt=0, description="Cantidad del insumo a usar")
    # Validamos que el desmedro sea mayor o igual a 0 (ge=0)
    waste_factor: float = Field(0.0, ge=0, description="Factor de desmedro/merma")

# Esquema para Crear
class RecipeIngredientCreate(RecipeIngredientBase):
    pass

# Esquema para Actualizar
class RecipeIngredientUpdate(BaseModel):
    recipe_id: Optional[int] = None
    ingredient_id: Optional[int] = None
    quantity: Optional[float] = Field(None, gt=0)
    waste_factor: Optional[float] = Field(None, ge=0)

# Esquema de Respuesta
class RecipeIngredientResponse(RecipeIngredientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)