from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date

# ==========================================
# SCHEMAS PARA RECIPES (RECETAS)
# ==========================================

# Esquema Base (Campos comunes)
class RecipeBase(BaseModel):
    product_id: int
    rendimiento_receta: float # Pydantic lo mapeará al Numeric de la BD
    prep_time: Optional[int] = Field(None, description="Tiempo de preparación en minutos")
    instruction: str = Field(..., max_length=255)

# Esquema para Crear
class RecipeCreate(RecipeBase):
    pass

# Esquema para Actualizar (Todos los campos opcionales)
class RecipeUpdate(BaseModel):
    product_id: Optional[int] = None
    rendimiento_receta: Optional[float] = None
    prep_time: Optional[int] = None
    instruction: Optional[str] = Field(None, max_length=255)

# Esquema de Respuesta (Lo que devuelve la API)
class RecipeResponse(RecipeBase):
    id: int
    created_at: Optional[date] # Usamos date porque el modelo tiene Column(Date)
    updated_at: Optional[date]

    model_config = ConfigDict(from_attributes=True)