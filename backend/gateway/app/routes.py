# gateway/app/routes.py

from fastapi import APIRouter, Request, HTTPException
import httpx
from typing import Any
from gateway.app.config import settings

router = APIRouter()

# Configuración de timeout desde settings
TIMEOUT = httpx.Timeout(
    settings.request_timeout, 
    connect=settings.connect_timeout
)


async def forward_request(
    method: str,
    url: str,
    data: dict = None,
    headers: dict = None,
    params: dict = None
) -> Any:
    """
    Función auxiliar para hacer forwarding de requests con manejo de errores.
    
    Args:
        method: Método HTTP (GET, POST, PUT, DELETE)
        url: URL completa del servicio
        data: Datos JSON para el body
        headers: Headers adicionales
        params: Query parameters
        
    Returns:
        Respuesta JSON del servicio
        
    Raises:
        HTTPException: Si hay errores en la comunicación
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            request_kwargs = {"headers": headers}
            
            if data is not None:
                request_kwargs["json"] = data
            if params is not None:
                request_kwargs["params"] = params
            
            if method == "GET":
                response = await client.get(url, **request_kwargs)
            elif method == "POST":
                response = await client.post(url, **request_kwargs)
            elif method == "PUT":
                response = await client.put(url, **request_kwargs)
            elif method == "DELETE":
                response = await client.delete(url, **request_kwargs)
            elif method == "PATCH":
                response = await client.patch(url, **request_kwargs)
            else:
                raise HTTPException(
                    status_code=405, 
                    detail=f"Método {method} no permitido"
                )
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        # Reenviar el error del microservicio con el detalle original
        try:
            error_detail = e.response.json()
        except:
            error_detail = {"detail": e.response.text or "Error en el servicio"}
        
        raise HTTPException(
            status_code=e.response.status_code,
            detail=error_detail.get("detail", "Error en el servicio")
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="El servicio no respondió a tiempo. Intenta nuevamente."
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo conectar con el servicio. Verifica que esté activo."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error de conexión: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado: {str(e)}"
        )


# ========================================
# RUTAS DE AUTENTICACIÓN
# ========================================

# auth
@router.post("/auth/register")
async def register_via_gateway(request: Request):
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/register",
        data=data
    )

@router.post("/auth/login")
async def login_via_gateway(request: Request):
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/login",
        data=data
    )

@router.post("/auth/refresh")
async def refresh_token_via_gateway(request: Request):
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/refresh",
        data=data
    )



# ========================================
# RUTAS DE USUARIOS
# ========================================

@router.get("/users")
async def get_users_via_gateway(
    skip: int = 0,
    limit: int = 100
):
    """Obtiene la lista de usuarios con paginación"""
    return await forward_request(
        "GET",
        f"{settings.user_service_url}/users",
        params={"skip": skip, "limit": limit}
    )


@router.get("/users/{username}")
async def get_user_via_gateway(username: str):
    """Obtiene un usuario específico por username"""
    return await forward_request(
        "GET",
        f"{settings.user_service_url}/users/{username}"
    )


@router.put("/users/{user_id}")
async def update_user_via_gateway(user_id: int, request: Request):
    """Actualiza los datos de un usuario"""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.user_service_url}/users/{user_id}",
        data=data
    )


@router.delete("/users/{user_id}")
async def delete_user_via_gateway(user_id: int):
    """Elimina un usuario"""
    return await forward_request(
        "DELETE",
        f"{settings.user_service_url}/users/{user_id}"
    )


@router.patch("/users/{user_id}/activate")
async def activate_user_via_gateway(user_id: int):
    """Activa un usuario"""
    return await forward_request(
        "PATCH",
        f"{settings.user_service_url}/users/{user_id}/activate"
    )


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user_via_gateway(user_id: int):
    """Desactiva un usuario"""
    return await forward_request(
        "PATCH",
        f"{settings.user_service_url}/users/{user_id}/deactivate"
    )


# ========================================
# HEALTH CHECK
# ========================================

@router.get("/health")
async def health_check_services():
    """
    Verifica el estado de todos los microservicios
    """
    services_status = {}
    
    # Verificar User Service
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(f"{settings.user_service_url}/health")
            services_status["user_service"] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "url": settings.user_service_url
            }
    except:
        services_status["user_service"] = {
            "status": "unreachable",
            "url": settings.user_service_url
        }
    
    # Verificar RH Service (cuando esté disponible)
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(f"{settings.rh_service_url}/health")
            services_status["rh_service"] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "url": settings.rh_service_url
            }
    except:
        services_status["rh_service"] = {
            "status": "unreachable",
            "url": settings.rh_service_url
        }
    
    # Determinar estado general
    all_healthy = all(
        service["status"] == "healthy" 
        for service in services_status.values()
    )
    
    return {
        "gateway": "healthy",
        "services": services_status,
        "overall_status": "healthy" if all_healthy else "degraded"
    }