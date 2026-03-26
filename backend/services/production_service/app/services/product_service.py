from sqlalchemy.orm import Session
from app.models.products_model import Product 
import app.schemas.producto_schema as schemas 

# ==========================================
# LEER (Read)
# ==========================================

def get_product(db: Session, product_id: int):
    """Obtiene un producto específico por su ID."""
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100, solo_activos: bool = True):
    """Obtiene una lista de productos. Por defecto, solo los activos."""
    query = db.query(Product)
    if solo_activos:
        query = query.filter(Product.activo == True)
    return query.offset(skip).limit(limit).all()

# ==========================================
# CREAR (Create)
# ==========================================

def create_product(db: Session, product: schemas.ProductCreate):
    """Crea un nuevo producto en la base de datos."""
    # Convertimos el esquema de Pydantic a un diccionario y se lo pasamos al modelo SQLAlchemy
    db_product = Product(**product.model_dump())
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product) # Actualiza el objeto con el ID y fechas generadas
    
    return db_product

# ==========================================
# ACTUALIZAR (Update)
# ==========================================

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    """Actualiza los datos de un producto existente."""
    db_product = get_product(db, product_id)
    
    if not db_product:
        return None
    
    # Extraemos solo los datos que fueron enviados (excluyendo los nulos)
    update_data = product_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

# ==========================================
# BORRAR (Delete - Soft Delete)
# ==========================================

def deactivate_product(db: Session, product_id: int):
    """Baja lógica (Soft Delete): En lugar de borrar, marca el producto como inactivo."""
    db_product = get_product(db, product_id)
    
    if not db_product:
        return None
        
    db_product.activo = False
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

def delete_product_permanently(db: Session, product_id: int):
    """Borrado físico de la base de datos."""
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product