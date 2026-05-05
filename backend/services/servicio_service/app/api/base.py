from fastapi import APIRouter

from app.api import caja_router
from app.api import sesion_caja_router
from app.api import pedido_router
from app.api import venta_router
from app.api import movimiento_caja_router
from app.api import mesa_router
from app.api import inventario_router
from app.api import analytics_router

# Router principal que agrupa todo el dominio de servicio
api_router = APIRouter()

# 1. Puntos de venta
api_router.include_router(
    caja_router.router,
    prefix="/cajas",
    tags=["Cajas"]
)

# 2. Sesiones / Turnos de caja
api_router.include_router(
    sesion_caja_router.router,
    prefix="/sesiones",
    tags=["Sesiones de Caja"]
)

# 3. Pedidos (CRUD, KDS, Historial)
api_router.include_router(
    pedido_router.router,
    prefix="/pedidos",
    tags=["Pedidos"]
)

# 4. Líneas de detalle de pedido
api_router.include_router(
    venta_router.router,
    prefix="/detalles",
    tags=["Detalles de Pedido"]
)

# 5. Movimientos de caja (ingresos, egresos, retiros)
api_router.include_router(
    movimiento_caja_router.router,
    prefix="/movimientos",
    tags=["Movimientos de Caja"]
)

# 6. Salón y Mesas
api_router.include_router(
    mesa_router.router,
    prefix="/mesas",
    tags=["Mesas"]
)

# 7. Inventario Local
api_router.include_router(
    inventario_router.router,
    prefix="/inventario",
    tags=["Inventario Local"]
)

# 8. Analytics / Dashboard
api_router.include_router(
    analytics_router.router,
    prefix="/analytics",
    tags=["Analytics"]
)
