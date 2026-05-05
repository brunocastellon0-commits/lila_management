# gateway/app/main.py
# ─────────────────────────────────────────────────────────────
# El Gateway es un proxy puro: no tiene base de datos propia.
# Solo reenvía peticiones a los microservicios correctos.
# ─────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gateway.app.config import settings
from gateway.app.routes import router as rh_router
from gateway.app.auth_routes import auth_router
from gateway.app.servicio_routes import router as servicio_router
from gateway.app.production_routes import router as production_router

app = FastAPI(
    title="Lila Management - API Gateway",
    description="Gateway central que enruta peticiones a los microservicios",
    version="1.0.0",
    debug=settings.debug,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
# Rutas de RH (empleados, sucursales, roles, postulantes, etc.)
app.include_router(rh_router, prefix="/rh")

# Rutas de Servicio (cajas, sesiones, pedidos, mesas, inventario, analytics)
app.include_router(servicio_router, prefix="/servicio")

# Rutas de Producción (productos, despacho a servicio)
app.include_router(production_router, prefix="/produccion")

# Rutas de autenticación (login, register, me, verify)
app.include_router(auth_router)

# ── Rutas utilitarias ────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Lila Management Gateway is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "gateway"}