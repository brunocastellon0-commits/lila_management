# user_service/app/main.py
# ─────────────────────────────────────────────────────────────
# Única responsabilidad: inicializar FastAPI, middlewares y routers.
# Nada de engine ni SessionLocal aquí — eso ya vive en db.py
# ─────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.user_routes import routes as user_router
from app.routes.auth_routes import routes as auth_router

# ── Aplicación ───────────────────────────────────────────────
app = FastAPI(
    title="Lila Management - User Service",
    description="Microservicio de usuarios y login",
    version="1.0.0",
    debug=settings.DEBUG,
)

# ── CORS ─────────────────────────────────────────────────────
# Los origins vienen del .env — no hay nada hardcodeado aquí.
# Para agregar un origen nuevo, solo editas el .env:
#   ALLOWED_ORIGINS=http://localhost:5173,http://mi-dominio.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

# ── Rutas utilitarias ────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Lila Management User Service is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "user_service"}