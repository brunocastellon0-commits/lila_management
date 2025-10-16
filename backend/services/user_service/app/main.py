# user_service/app/main.py

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings  # Asegúrate de que el path sea correcto
from app.routes.user_routes import routes as user_router
from app.routes.auth_routes import routes as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.db import get_db
# --------------------------
# Configuración de la Base de Datos
# --------------------------
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, echo=settings.DEBUG, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --------------------------
# Inicialización de FastAPI
# --------------------------
app = FastAPI(
    title="Lila Management - User Service",
    description="Microservicio de usuarios y login",
    version="1.0.0",
    debug=settings.DEBUG
)
origins = [
    "http://localhost:5173",  # Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Routers
# --------------------------
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

# --------------------------
# Ruta raíz
# --------------------------
@app.get("/")
def root():
    return {"message": "Lila Management User Service is running!"}

