# gateway/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gateway.app.routes import router
from gateway.app.config import settings

app = FastAPI(
    title="API Gateway - Sistema LILA",
    description="Gateway central para microservicios",
    version="1.0.0",
    debug=settings.debug
)
USER_SERVICE_URL = "http://localhost:8000"  
# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(router)


@app.get("/")
async def root():
    """Endpoint raíz del gateway"""
    return {
        "message": "API Gateway - Sistema LILA",
        "version": "1.0.0",
        "status": "online",
        "environment": settings.env
    }


@app.get("/health")
async def health_check():
    """Health check del gateway"""
    return {
        "status": "healthy",
        "environment": settings.env
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "gateway.app.main:app",
        host="0.0.0.0",
        port=settings.gateway_port,
        reload=settings.debug
    )