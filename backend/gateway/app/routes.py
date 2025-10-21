from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import httpx
from typing import Optional, Any

from gateway.app.config import settings

# ✅ SOLUCIÓN: Deshabilitar trailing slash redirect
router = APIRouter(redirect_slashes=False)

# ========================================
# FUNCIÓN CENTRAL: FORWARD REQUEST
# ========================================

async def forward_request(
    method: str,
    url: str,
    data: Optional[Any] = None,
    headers: Optional[dict] = None,
    params: Optional[dict] = None
) -> JSONResponse:
    """
    Reenvía una solicitud al microservicio de destino y maneja la respuesta.
    """
    if headers:
        forward_headers = {
            k: v for k, v in headers.items()
            if k.lower() in ["authorization", "content-type"]
        }
    else:
        forward_headers = {}

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(settings.request_timeout, connect=settings.connect_timeout),
        follow_redirects=False  # ✅ No seguir redirects
    ) as client:
        try:
            response = await client.request(
                method,
                url,
                json=data,
                headers=forward_headers,
                params=params
            )

            # ✅ CORRECCIÓN: Manejar respuestas vacías y errores de JSON
            if response.status_code == 204 or not response.content:
                content = None
            else:
                try:
                    content = response.json()
                except Exception:
                    content = {"detail": response.text if response.text else "Empty response"}
            
            # ✅ CORRECCIÓN: No incluir headers del microservicio, solo CORS
            cors_headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true"
            }
            
            return JSONResponse(
                content=content,
                status_code=response.status_code,
                headers=cors_headers
            )

        except httpx.ConnectError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Servicio no disponible: {url}"
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Tiempo de espera agotado para el servicio: {url}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error interno del Gateway: {str(e)}"
            )


# ========================================
# RUTAS DE EMPLEADOS - SIN BARRA FINAL
# ========================================

@router.post("/employees", status_code=201)
async def create_employee_via_gateway(request: Request):
    """Crea un nuevo empleado."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/employees",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/employees")
async def read_all_employees_via_gateway(request: Request):
    """Obtiene la lista paginada de todos los empleados."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/employees",
        params=request.query_params,
        headers=dict(request.headers.items()),
    )


@router.get("/employees/{employee_id}")
async def read_employee_by_id_via_gateway(employee_id: int, request: Request):
    """Obtiene un empleado específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/employees/{employee_id}",
        headers=dict(request.headers.items()),
    )


@router.put("/employees/{employee_id}")
async def update_employee_via_gateway(employee_id: int, request: Request):
    """Actualiza completamente los datos de un empleado."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/employees/{employee_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/employees/{employee_id}", status_code=204)
async def delete_employee_via_gateway(employee_id: int, request: Request):
    """Elimina un empleado por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/employees/{employee_id}",
        headers=dict(request.headers.items()),
    )




# ========================================
# RUTAS DE DOCUMENTOS
# ========================================

@router.post("/documents/employees/{employee_id}/documents", status_code=201)
async def create_document_for_employee_via_gateway(employee_id: int, request: Request):
    """Registra un nuevo documento para un empleado."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/documents/employees/{employee_id}/documents",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/documents")
async def read_documents_via_gateway(request: Request):
    """Obtiene todos los documentos."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/documents",
        params=request.query_params,
        headers=dict(request.headers.items()),
    )


# ========================================
# RUTAS DE HORARIOS
# ========================================

@router.post("/schedules", status_code=201)
async def create_schedule_via_gateway(request: Request):
    """Crea un nuevo patrón de horario."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/schedules",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/schedules")
async def read_schedules_via_gateway(request: Request):
    """Obtiene todos los horarios."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/schedules",
        params=request.query_params,
        headers=dict(request.headers.items()),
    )


# ========================================
# RUTAS DE SOLICITUDES (REQUEST)
# ========================================

@router.post("/request", status_code=201)
async def create_request_via_gateway(request: Request):
    """Crea una nueva solicitud."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/request",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/request")
async def read_requests_via_gateway(request: Request):
    """Obtiene todas las solicitudes."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/request",
        params=request.query_params,
        headers=dict(request.headers.items()),
    )


# ========================================
# RUTAS DE TURNOS (SHIFT)
# ========================================

@router.post("/shift", status_code=201)
async def create_shift_via_gateway(request: Request):
    """Crea un nuevo turno."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/shift",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/shift")
async def read_shifts_via_gateway(request: Request):
    """Obtiene todos los turnos."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/shift",
        params=request.query_params,
        headers=dict(request.headers.items()),
    )


# ========================================
# RUTAS DE CAPACITACIÓN (TRAINING)
# ========================================

@router.post("/training", status_code=201)
async def create_training_via_gateway(request: Request):
    """Crea un nuevo registro de capacitación."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/training",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/training")
async def read_trainings_via_gateway(request: Request):
    """Obtiene todos los registros de capacitación."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/training",
        params=request.query_params,
        headers=dict(request.headers.items()),
    )