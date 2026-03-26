from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
import app.schemas.recipe_ingredients_schema as schemas
import app.services.recipe_ingredients as crud
router = APIRouter()
# ==========================================
# LEER (Read)
# ==========================================

@router.get("/receta/{recipe_id}", response_model=List[schemas.RecipeIngredientResponse])
def read_ingredients_by_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los insumos y cantidades configurados para una receta.
    Ideal para mostrar la 'ficha técnica' de un producto.
    """
    return crud.get_ingredients_by_recipe(db, recipe_id=recipe_id)

@router.get("/{recipe_ingredient_id}", response_model=schemas.RecipeIngredientResponse)
def read_recipe_ingredient(recipe_ingredient_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de un ingrediente específico dentro de una receta."""
    db_item = crud.get_recipe_ingredient(db, recipe_ingredient_id=recipe_ingredient_id) 
    if db_item is None:
        raise HTTPException(status_code=404, detail="Ingrediente de receta no encontrado")
    return db_item

# ==========================================
# CREAR (Create)
# ==========================================

@router.post("/", response_model=schemas.RecipeIngredientResponse, status_code=status.HTTP_201_CREATED)
def create_recipe_ingredient(
    recipe_ingredient: schemas.RecipeIngredientCreate, 
    db: Session = Depends(get_db)
):
    """Asigna un insumo a una receta (ej: añadir 'Harina' a la receta de 'Pan')."""
    return crud.create_recipe_ingredient(db=db, recipe_ingredient=recipe_ingredient)

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

@router.patch("/{recipe_ingredient_id}", response_model=schemas.RecipeIngredientResponse)
def update_recipe_ingredient(
    recipe_ingredient_id: int, 
    recipe_ingredient_update: schemas.RecipeIngredientUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la cantidad o el porcentaje de desmedro de un ingrediente 
    sin necesidad de borrarlo y volverlo a crear.
    """
    db_item = crud.update_recipe_ingredient(
        db=db, 
        recipe_ingredient_id=recipe_ingredient_id, 
        recipe_ingredient_update=recipe_ingredient_update
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="No se encontró el registro para actualizar")
    return db_item

# ==========================================
# BORRAR (Delete)
# ==========================================

@router.delete("/{recipe_ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe_ingredient(recipe_ingredient_id: int, db: Session = Depends(get_db)):
    """
    Quita un ingrediente de una receta de forma permanente.
    """
    db_item = crud.delete_recipe_ingredient(db=db, recipe_ingredient_id=recipe_ingredient_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="El ingrediente no forma parte de la receta")
    return None