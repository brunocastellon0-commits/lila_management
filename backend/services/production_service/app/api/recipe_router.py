from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
import app.schemas.recipes_schema as schemas
import app.services.recipes_service as crud
router = APIRouter()
# ==========================================
# LEER (Read)
# ==========================================

@router.get("/", response_model=List[schemas.RecipeResponse])
def read_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtiene el listado general de todas las recetas configuradas."""
    return crud.get_recipes(db, skip=skip, limit=limit)

@router.get("/{recipe_id}", response_model=schemas.RecipeResponse)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el detalle completo de una receta, incluyendo su 
    rendimiento e instrucciones de preparación.
    """
    db_recipe = crud.get_recipe(db, recipe_id=recipe_id)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return db_recipe

@router.get("/producto/{product_id}", response_model=List[schemas.RecipeResponse])
def read_recipes_by_product(product_id: int, db: Session = Depends(get_db)):
    """Obtiene las recetas asociadas a un producto específico."""
    return crud.get_recipes_by_product(db, product_id=product_id)

# ==========================================
# CREAR (Create)
# ==========================================

@router.post("/", response_model=schemas.RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """Registra una nueva receta base para un producto."""
    return crud.create_recipe(db=db, recipe=recipe)

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

@router.patch("/{recipe_id}", response_model=schemas.RecipeResponse)
def update_recipe(recipe_id: int, recipe_update: schemas.RecipeUpdate, db: Session = Depends(get_db)):
    """
    Actualiza la información de la receta (rendimiento, tiempo de 
    preparación o instrucciones).
    """
    db_recipe = crud.update_recipe(db=db, recipe_id=recipe_id, recipe_update=recipe_update)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="No se encontró la receta para actualizar")
    return db_recipe

# ==========================================
# BORRAR (Delete)
# ==========================================

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Elimina físicamente la receta. 
    Nota: Debido a cascade='all, delete-orphan', esto también borrará 
    sus asociaciones de ingredientes.
    """
    db_recipe = crud.delete_recipe(db=db, recipe_id=recipe_id)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return None