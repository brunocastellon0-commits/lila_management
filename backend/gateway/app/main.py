# gateway/app/main.py

from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from gateway.app.routes import router,forward_request
from gateway.app.config import settings

app = FastAPI(
    title="API Gateway - Sistema LILA",
    description="Gateway central para microservicios",
    version="1.0.0",
    debug=settings.debug
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router, prefix="/rh")
# ✅ RUTAS DE AUTENTICACIÓN DIRECTAS EN EL MAIN
@app.post("/auth/login")
async def login_user_via_gateway(request: Request):
    """Reenvía la solicitud de login al User Service."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/login",
        data=data,
        headers=dict(request.headers.items()),
    )

@app.post("/auth/register")
async def register_user_via_gateway(request: Request):
    """Reenvía la solicitud de registro al User Service."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/register",
        data=data,
        headers=dict(request.headers.items()),
    )

@app.get("/auth/me")
async def get_current_user_via_gateway(request: Request):
    """Reenvía la solicitud para obtener el usuario actual."""
    return await forward_request(
        "GET",
        f"{settings.user_service_url}/auth/me",
        headers=dict(request.headers.items()),
    )


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