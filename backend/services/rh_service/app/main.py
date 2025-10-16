# rh_service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importa el router principal de tu API
from app.api.base import api_router 
from app.utils.config import settings 

# 1. Inicialización de la aplicación FastAPI

app = FastAPI(
    title="RH Service API",
    description="Microservicio para la gestión de Recursos Humanos (HR).",
    version="1.0.0",
    debug=settings.DEBUG # Usa la configuración de DEBUG
)

# 2. Configuración del Middleware CORS 

origins = [
    "http://localhost",
    "http://localhost:5173",  # El puerto más común para React/Vue
    # "https://tu-dominio-frontend.com", # Si ya está desplegado
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

# 4. Inclusión de las Rutas (Endpoints)
app.include_router(
    api_router, 
    prefix="/api",  # Prefijo general sin versión (ej: /api/employees)
    tags=["API General"]
)

@app.get("/")
def read_root():
    return {"message": "RH Service is running!"}

@app.get("/health")
def health_check():
    
    return {"status": "ok", "service": "rh_service"}
