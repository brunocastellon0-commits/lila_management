# gateway/app/production_routes.py
# Rutas del gateway que reenvían al production_service (:8002).
# Prefijo en gateway/main.py: /produccion
# Actualmente expone endpoints mínimos necesarios para el flujo de despacho a servicio_service.

from fastapi import APIRouter, Request, status
from gateway.app.routes import forward_request
from gateway.app.config import settings

router = APIRouter(redirect_slashes=False)

BASE = settings.production_service_url


# ═══════════════════════════════════════════════════════════════
# PRODUCTOS  —  /produccion/products
# ═══════════════════════════════════════════════════════════════

@router.get("/products", summary="Listar productos del catálogo de producción")
async def gw_read_products(request: Request):
    """
    Proxy para GET /products en production_service.
    Usado por el frontend y por servicio_service para obtener precios.
    """
    return await forward_request(
        "GET", f"{BASE}/products",
        params=dict(request.query_params),
        headers=dict(request.headers)
    )


@router.get("/products/{product_id}", summary="Obtener producto por ID")
async def gw_read_product(product_id: int, request: Request):
    return await forward_request(
        "GET", f"{BASE}/products/{product_id}",
        headers=dict(request.headers)
    )


# ═══════════════════════════════════════════════════════════════
# DESPACHO  —  /produccion/products/despacho
# ═══════════════════════════════════════════════════════════════

@router.post(
    "/products/despacho",
    status_code=status.HTTP_201_CREATED,
    summary="Despachar stock a servicio",
    description=(
        "Descuenta stock de un producto en production_service y notifica "
        "a servicio_service para que registre la recepción en su inventario local. "
        "Payload esperado: {product_id, cantidad, id_inventario_local_destino, recibido_por, notas?}"
    ),
)
async def gw_despacho(request: Request):
    data = await request.json()
    return await forward_request(
        "POST", f"{BASE}/products/despacho",
        data=data, headers=dict(request.headers)
    )
