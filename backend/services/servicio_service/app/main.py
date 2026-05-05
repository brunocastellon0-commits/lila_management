from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import settings
from app.api.base import api_router

# ── Aplicación ───────────────────────────────────────────────
app = FastAPI(
    title="Servicio Service API",
    description=(
        "Microservicio de gestión de ventas y operaciones del restaurante. "
        "Maneja cajas, sesiones de turno, pedidos, detalles y movimientos de caja."
    ),
    version="1.0.0",
    debug=settings.DEBUG,
    redirect_slashes=False,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(api_router)

# ── Rutas utilitarias ────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "Servicio Service is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "servicio_service"}
