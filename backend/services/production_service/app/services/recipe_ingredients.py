from sqlalchemy.orm import Session
from app.models.recipe_ingredients import RecipeIngredient # Asegúrate de la ruta correcta
import app.schemas.recipe_ingredients_schema as schemas

# ==========================================
# LEER (Read)
# ==========================================

def get_recipe_ingredient(db: Session, recipe_ingredient_id: int):
    """Obtiene un registro específico de la tabla intermedia."""
    return db.query(RecipeIngredient).filter(RecipeIngredient.id == recipe_ingredient_id).first()

def get_ingredients_by_recipe(db: Session, recipe_id: int):
    """
    ¡Función clave! Devuelve la lista completa de insumos 
    necesarios para fabricar una receta específica.
    """
    return db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).all()

# ==========================================
# CREAR (Create)
# ==========================================

def create_recipe_ingredient(db: Session, recipe_ingredient: schemas.RecipeIngredientCreate):
    """Asigna un nuevo ingrediente a una receta."""
    db_recipe_ingredient = RecipeIngredient(**recipe_ingredient.model_dump())
    
    db.add(db_recipe_ingredient)
    db.commit()
    db.refresh(db_recipe_ingredient)
    
    return db_recipe_ingredient

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

def update_recipe_ingredient(db: Session, recipe_ingredient_id: int, recipe_ingredient_update: schemas.RecipeIngredientUpdate):
    """Actualiza la cantidad o el desmedro de un ingrediente en la receta."""
    db_recipe_ingredient = get_recipe_ingredient(db, recipe_ingredient_id)
    
    if not db_recipe_ingredient:
        return None
    
    update_data = recipe_ingredient_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_recipe_ingredient, key, value)
        
    db.add(db_recipe_ingredient)
    db.commit()
    db.refresh(db_recipe_ingredient)
    
    return db_recipe_ingredient

# ==========================================
# BORRAR (Delete)
# ==========================================

def delete_recipe_ingredient(db: Session, recipe_ingredient_id: int):
    """Quita permanentemente un ingrediente de una receta."""
    db_recipe_ingredient = get_recipe_ingredient(db, recipe_ingredient_id)
    
    if db_recipe_ingredient:
        db.delete(db_recipe_ingredient)
        db.commit()
        
    return db_recipe_ingredient