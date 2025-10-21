from fastapi import APIRouter, Request
from gateway.app.routes import forward_request
from gateway.app.config import settings

# Router para autenticación SIN prefijo
auth_router = APIRouter()

@auth_router.post("/auth/login")
async def login_user_via_gateway(request: Request):
    """Reenvía la solicitud de login al User Service."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/login",  # → http://localhost:8000/auth/login
        data=data,
        headers=dict(request.headers.items()),
    )

@auth_router.post("/auth/register")
async def register_user_via_gateway(request: Request):
    """Reenvía la solicitud de registro al User Service."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/register",  # → http://localhost:8000/auth/register
        data=data,
        headers=dict(request.headers.items()),
    )

@auth_router.get("/auth/me")
async def get_current_user_via_gateway(request: Request):
    """Reenvía la solicitud para obtener el usuario actual."""
    return await forward_request(
        "GET",
        f"{settings.user_service_url}/auth/me",  # → http://localhost:8000/auth/me
        headers=dict(request.headers.items()),
    )