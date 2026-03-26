from sqlalchemy.orm import Session
from app.models.recipes import Recipe # Asegúrate de que la ruta sea la correcta
import app.schemas.recipes_schema as schemas

# ==========================================
# LEER (Read)
# ==========================================

def get_recipe(db: Session, recipe_id: int):
    """Obtiene una receta específica por su ID."""
    return db.query(Recipe).filter(Recipe.id == recipe_id).first()

def get_recipes(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene una lista general de recetas paginada."""
    return db.query(Recipe).offset(skip).limit(limit).all()

def get_recipes_by_product(db: Session, product_id: int):
    """Obtiene todas las recetas asociadas a un producto final específico."""
    return db.query(Recipe).filter(Recipe.product_id == product_id).all()

# ==========================================
# CREAR (Create)
# ==========================================

def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    """Crea una nueva receta/ficha técnica en la base de datos."""
    db_recipe = Recipe(**recipe.model_dump())
    
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

def update_recipe(db: Session, recipe_id: int, recipe_update: schemas.RecipeUpdate):
    """Actualiza las instrucciones, tiempos o rendimientos de una receta."""
    db_recipe = get_recipe(db, recipe_id)
    
    if not db_recipe:
        return None
    
    update_data = recipe_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_recipe, key, value)
        
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe

# ==========================================
# BORRAR (Delete)
# ==========================================

def delete_recipe(db: Session, recipe_id: int):
    """Borrado físico de la receta (Ojo: puede fallar si hay Órdenes de Producción vinculadas)."""
    db_recipe = get_recipe(db, recipe_id)
    
    if db_recipe:
        db.delete(db_recipe)
        db.commit()
        
    return db_recipe