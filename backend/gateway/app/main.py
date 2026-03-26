# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.routers import producto_router

# ── Motor de base de datos ───────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,   
    future=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(
    title="Lila Management - Product Service",
    description="Microservicio de gestión de productos",
    version="1.0.0",
    debug=settings.DEBUG,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(producto_router.router)

# ── Rutas utilitarias ────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Product Service is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "product_service"}