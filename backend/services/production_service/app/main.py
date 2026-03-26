# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.base import api_router

# ── Aplicación FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Lila Management - Product Service",
    description="Microservicio de gestión de productos, recetas y producción",
    version="1.0.0",
    debug=settings.DEBUG,
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
@app.get("/", tags=["Health"])
def root():
    return {"message": "Product Service is running!"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "product_service"}