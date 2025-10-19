from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.base import api_router 
from app.utils.config import settings 

# 1. Inicialización de la aplicación FastAPI
app = FastAPI(
    title="RH Service API",
    description="Microservicio para la gestión de Recursos Humanos (HR).",
    version="1.0.0",
    debug=settings.DEBUG
)

# 2. Configuración del Middleware CORS 
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:7000",  # ✅ Agregar el gateway
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Inclusión de las Rutas (Endpoints)
# ✅ CORRECCIÓN: SIN prefijo /rh porque el gateway ya lo maneja
app.include_router(
    api_router,
    # prefix="/rh",  ❌ ELIMINAR ESTO - El gateway ya usa /rh
    tags=["API General"]
)

@app.get("/")
def read_root():
    return {"message": "RH Service is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "rh_service"}