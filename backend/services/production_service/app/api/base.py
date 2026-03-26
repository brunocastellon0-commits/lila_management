from fastapi import APIRouter


from app.api import (
    product_api,
    product_order_router,
    production_waste_router,
    recipe_ingredient_router,
    recipe_router
)

# El router principal que consumirá el main.py
api_router = APIRouter()

# ---------------------------------------------------
# Inclusión de las rutas con Prefijos y Tags Centralizados
# ---------------------------------------------------

# 1. Gestión de Productos Base
api_router.include_router(
    product_api.router, 
    tags=["Productos"], 
    prefix="/productos"
)

# 2. Gestión de Recetas (Fichas Técnicas)
api_router.include_router(
    recipe_router.router, 
    tags=["Recetas"], 
    prefix="/recetas"
)

# 3. Ingredientes de Recetas (Tabla Intermedia)
api_router.include_router(
    recipe_ingredient_router.router, 
    tags=["Configuración de Recetas"], 
    prefix="/receta-ingredientes"
)

# 4. Órdenes de Producción (Cocina/Fábrica)
api_router.include_router(
    product_order_router.router, 
    tags=["Órdenes de Producción"], 
    prefix="/produccion"
)

# 5. Registro de Mermas y Desperdicios
api_router.include_router(
    production_waste_router.router, 
    tags=["Mermas de Producción"], 
    prefix="/mermas"
)

# ---------------------------------------------------
# ALIAS O RUTAS DE COMPATIBILIDAD (Opcional)
# ---------------------------------------------------
# Ejemplo: Si el frontend busca "articulos" en vez de "productos"
@api_router.get("/articulos", tags=["Alias"], include_in_schema=False)
def alias_articulos():
    """Redirección lógica o alias para compatibilidad."""
    return {"message": "Utilice el endpoint /productos"}