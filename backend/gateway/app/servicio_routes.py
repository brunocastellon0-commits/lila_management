# gateway/app/servicio_routes.py
# Rutas del gateway que reenvían al servicio_service (ventas del restaurante).
# Prefijo en gateway/main.py: /servicio
# Prefijo en servicio_service: cada router define el suyo en base.py

from fastapi import APIRouter, Request, status
from gateway.app.routes import forward_request   # reutiliza la función central
from gateway.app.config import settings

router = APIRouter(redirect_slashes=False)

BASE = settings.servicio_service_url


# ═══════════════════════════════════════════════════════════════
# CAJAS  —  /servicio/cajas
# ═══════════════════════════════════════════════════════════════

@router.post("/cajas", status_code=201, summary="Crear punto de venta")
async def gw_create_caja(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/cajas", data=data, headers=dict(request.headers))


@router.get("/cajas", summary="Listar puntos de venta")
async def gw_read_cajas(request: Request):
    return await forward_request("GET", f"{BASE}/cajas",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.get("/cajas/{caja_id}", summary="Obtener caja por ID")
async def gw_read_caja(caja_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/cajas/{caja_id}", headers=dict(request.headers))


@router.put("/cajas/{caja_id}", summary="Actualizar caja")
async def gw_update_caja(caja_id: int, request: Request):
    data = await request.json()
    return await forward_request("PUT", f"{BASE}/cajas/{caja_id}", data=data, headers=dict(request.headers))


@router.delete("/cajas/{caja_id}", status_code=204, summary="Eliminar caja")
async def gw_delete_caja(caja_id: int, request: Request):
    return await forward_request("DELETE", f"{BASE}/cajas/{caja_id}", headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# SESIONES DE CAJA  —  /servicio/sesiones
# ═══════════════════════════════════════════════════════════════

@router.post("/sesiones", status_code=201, summary="Abrir turno de caja")
async def gw_abrir_sesion(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/sesiones", data=data, headers=dict(request.headers))


@router.get("/sesiones", summary="Listar sesiones")
async def gw_read_sesiones(request: Request):
    return await forward_request("GET", f"{BASE}/sesiones",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.get("/sesiones/caja/{caja_id}/activa", summary="Sesión activa de una caja")
async def gw_sesion_activa(caja_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/sesiones/caja/{caja_id}/activa",
                                 headers=dict(request.headers))


@router.get("/sesiones/{sesion_id}", summary="Obtener sesión por ID")
async def gw_read_sesion(sesion_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/sesiones/{sesion_id}", headers=dict(request.headers))


@router.post("/sesiones/{sesion_id}/cerrar", summary="Cerrar turno de caja")
async def gw_cerrar_sesion(sesion_id: int, request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/sesiones/{sesion_id}/cerrar",
                                 data=data, headers=dict(request.headers))


@router.patch("/sesiones/{sesion_id}", summary="Actualizar sesión (admin)")
async def gw_update_sesion(sesion_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/sesiones/{sesion_id}",
                                 data=data, headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# PEDIDOS  —  /servicio/pedidos
# ═══════════════════════════════════════════════════════════════

@router.post("/pedidos", status_code=201, summary="Crear pedido")
async def gw_crear_pedido(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/pedidos", data=data, headers=dict(request.headers))


@router.get("/pedidos/sesion/{sesion_id}", summary="Pedidos por sesión")
async def gw_pedidos_por_sesion(sesion_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/pedidos/sesion/{sesion_id}",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.get("/pedidos/kds", summary="Pedidos activos para KDS")
async def gw_pedidos_kds(request: Request):
    return await forward_request("GET", f"{BASE}/pedidos/kds",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.get("/pedidos/historial", summary="Historial de pedidos con filtros")
async def gw_pedidos_historial(request: Request):
    return await forward_request("GET", f"{BASE}/pedidos/historial",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.get("/pedidos/{pedido_id}", summary="Obtener pedido por ID")
async def gw_read_pedido(pedido_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/pedidos/{pedido_id}", headers=dict(request.headers))


@router.patch("/pedidos/{pedido_id}", summary="Actualizar pedido")
async def gw_update_pedido(pedido_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/pedidos/{pedido_id}",
                                 data=data, headers=dict(request.headers))


@router.post("/pedidos/{pedido_id}/pagar", summary="Cobrar pedido")
async def gw_pagar_pedido(pedido_id: int, request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/pedidos/{pedido_id}/pagar",
                                 data=data, headers=dict(request.headers))


@router.post("/pedidos/{pedido_id}/anular", summary="Anular pedido")
async def gw_anular_pedido(pedido_id: int, request: Request):
    return await forward_request("POST", f"{BASE}/pedidos/{pedido_id}/anular",
                                 headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# DETALLES DE PEDIDO  —  /servicio/detalles
# ═══════════════════════════════════════════════════════════════

@router.get("/detalles/pedido/{pedido_id}", summary="Detalles de un pedido")
async def gw_detalles_por_pedido(pedido_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/detalles/pedido/{pedido_id}",
                                 headers=dict(request.headers))


@router.get("/detalles/{detalle_id}", summary="Obtener detalle por ID")
async def gw_read_detalle(detalle_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/detalles/{detalle_id}", headers=dict(request.headers))


@router.patch("/detalles/{detalle_id}", summary="Actualizar línea de detalle")
async def gw_update_detalle(detalle_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/detalles/{detalle_id}",
                                 data=data, headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# MOVIMIENTOS DE CAJA  —  /servicio/movimientos
# ═══════════════════════════════════════════════════════════════

@router.get("/movimientos/sesion/{sesion_id}", summary="Movimientos de una sesión")
async def gw_movimientos_por_sesion(sesion_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/movimientos/sesion/{sesion_id}",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.get("/movimientos/sesion/{sesion_id}/resumen", summary="Resumen financiero de sesión")
async def gw_resumen_sesion(sesion_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/movimientos/sesion/{sesion_id}/resumen",
                                 headers=dict(request.headers))


@router.get("/movimientos/{movimiento_id}", summary="Obtener movimiento por ID")
async def gw_read_movimiento(movimiento_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/movimientos/{movimiento_id}",
                                 headers=dict(request.headers))


@router.post("/movimientos/retiro", status_code=201, summary="Registrar retiro de efectivo")
async def gw_retiro(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/movimientos/retiro",
                                 data=data, headers=dict(request.headers))


@router.post("/movimientos", status_code=201, summary="Registrar movimiento manual (admin)")
async def gw_crear_movimiento(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/movimientos",
                                 data=data, headers=dict(request.headers))


@router.patch("/movimientos/{movimiento_id}", summary="Corregir movimiento (admin)")
async def gw_update_movimiento(movimiento_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/movimientos/{movimiento_id}",
                                 data=data, headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# MESAS  —  /servicio/mesas
# ═══════════════════════════════════════════════════════════════

@router.get("/mesas", summary="Listar mesas del salón")
async def gw_read_mesas(request: Request):
    return await forward_request("GET", f"{BASE}/mesas",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.post("/mesas", status_code=201, summary="Crear mesa")
async def gw_crear_mesa(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/mesas", data=data, headers=dict(request.headers))


@router.get("/mesas/{mesa_id}", summary="Obtener mesa por ID")
async def gw_read_mesa(mesa_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/mesas/{mesa_id}", headers=dict(request.headers))


@router.patch("/mesas/{mesa_id}", summary="Actualizar datos de mesa")
async def gw_update_mesa(mesa_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/mesas/{mesa_id}",
                                 data=data, headers=dict(request.headers))


@router.patch("/mesas/{mesa_id}/estado", summary="Cambiar estado de mesa")
async def gw_cambiar_estado_mesa(mesa_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/mesas/{mesa_id}/estado",
                                 data=data, headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# INVENTARIO LOCAL  —  /servicio/inventario
# ═══════════════════════════════════════════════════════════════

@router.get("/inventario", summary="Listar inventario local")
async def gw_read_inventario(request: Request):
    return await forward_request("GET", f"{BASE}/inventario",
                                 params=dict(request.query_params),
                                 headers=dict(request.headers))


@router.post("/inventario", status_code=201, summary="Crear insumo")
async def gw_crear_insumo(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/inventario", data=data, headers=dict(request.headers))


@router.get("/inventario/criticos", summary="Insumos con stock crítico")
async def gw_inventario_criticos(request: Request):
    return await forward_request("GET", f"{BASE}/inventario/criticos", headers=dict(request.headers))


@router.post("/inventario/recepcion", status_code=201, summary="Registrar recepción de stock")
async def gw_recibir_stock(request: Request):
    data = await request.json()
    return await forward_request("POST", f"{BASE}/inventario/recepcion",
                                 data=data, headers=dict(request.headers))


@router.get("/inventario/{item_id}", summary="Obtener insumo por ID")
async def gw_read_insumo(item_id: int, request: Request):
    return await forward_request("GET", f"{BASE}/inventario/{item_id}", headers=dict(request.headers))


@router.patch("/inventario/{item_id}", summary="Actualizar umbrales de insumo")
async def gw_update_insumo(item_id: int, request: Request):
    data = await request.json()
    return await forward_request("PATCH", f"{BASE}/inventario/{item_id}",
                                 data=data, headers=dict(request.headers))


# ═══════════════════════════════════════════════════════════════
# ANALYTICS / DASHBOARD  —  /servicio/analytics
# ═══════════════════════════════════════════════════════════════

@router.get("/analytics/resumen", summary="KPIs del Dashboard")
async def gw_analytics_resumen(request: Request):
    return await forward_request("GET", f"{BASE}/analytics/resumen", headers=dict(request.headers))


@router.get("/analytics/ingresos-hoy", summary="Ingresos por hora (hoy)")
async def gw_analytics_ingresos_hoy(request: Request):
    return await forward_request("GET", f"{BASE}/analytics/ingresos-hoy", headers=dict(request.headers))


@router.get("/analytics/ingresos-semana", summary="Ingresos por día (últimos 7 días)")
async def gw_analytics_ingresos_semana(request: Request):
    return await forward_request("GET", f"{BASE}/analytics/ingresos-semana", headers=dict(request.headers))


# Final del archivo
