# rh_service/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import settings
from app.api.base import api_router

# ── Aplicación ───────────────────────────────────────────────
app = FastAPI(
    title="RH Service API",
    description="Microservicio para la gestión de Recursos Humanos (HR).",
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
app.include_router(api_router, tags=["API General"])

# ── Rutas utilitarias ────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "RH Service is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "rh_service"}