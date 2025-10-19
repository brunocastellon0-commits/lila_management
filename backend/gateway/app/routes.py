from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import httpx
from typing import Optional, Any

from gateway.app.config import settings

router = APIRouter()

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
        timeout=httpx.Timeout(settings.request_timeout, connect=settings.connect_timeout)
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
            try:
                content = response.json() if response.content else None
            except Exception:
                # Si no se puede parsear como JSON, devolver el texto plano
                content = {"detail": response.text if response.text else "Empty response"}
            
            return JSONResponse(
                content=content,
                status_code=response.status_code,
                headers=dict(response.headers)
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
# ✅ RUTAS CONSOLIDADAS (SIN PREFIJO /rh)
# El prefijo /rh se agrega en main.py
# ========================================

# --- ESTADÍSTICAS Y ALERTAS (PRIORIDAD ALTA) ---

@router.get("/stats/resumen")
async def get_resumen_stats_via_gateway(request: Request):
    """Obtiene el resumen de estadísticas consolidadas del sistema RH."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/alert/stats/resumen",
        headers=dict(request.headers.items()),
        params=request.query_params,
    )


@router.get("/alertas/pendientes")
async def get_pending_alerts_via_gateway(request: Request):
    """Obtiene todas las alertas pendientes consolidadas del sistema RH."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/alert/alertas/pendientes",
        headers=dict(request.headers.items()),
        params=request.query_params,
    )


# ========================================
# RUTAS DE USUARIOS (USER SERVICE)
# ========================================

@router.post("/auth/register", status_code=201)
async def register_user_via_gateway(request: Request):
    """Reenvía la solicitud de registro al User Service."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/register",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.post("/auth/login")
async def login_user_via_gateway(request: Request):
    """Reenvía la solicitud de login al User Service."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.user_service_url}/auth/login",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/auth/me")
async def get_current_user_via_gateway(request: Request):
    """Reenvía la solicitud para obtener el usuario actual."""
    return await forward_request(
        "GET",
        f"{settings.user_service_url}/auth/me",
        headers=dict(request.headers.items()),
    )


@router.get("/users/{user_id}")
async def get_user_by_id_via_gateway(user_id: int, request: Request):
    """Obtiene un usuario específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.user_service_url}/users/{user_id}",
        headers=dict(request.headers.items()),
    )


# ========================================
# RUTAS DE EMPLEADOS
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
async def read_employee_by_id_via_gateway(employee_id: int):
    """Obtiene un empleado específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/employees/{employee_id}"
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


@router.get("/documents/{document_id}")
async def read_document_by_id_via_gateway(document_id: int):
    """Obtiene un documento específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/documents/{document_id}"
    )


@router.put("/documents/{document_id}")
async def update_document_via_gateway(document_id: int, request: Request):
    """Actualiza un documento por ID."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/documents/{document_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document_via_gateway(document_id: int, request: Request):
    """Elimina un documento por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/documents/{document_id}",
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


@router.get("/schedules/{schedule_id}")
async def read_schedule_by_id_via_gateway(schedule_id: int):
    """Obtiene un horario específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/schedules/{schedule_id}"
    )


@router.put("/schedules/{schedule_id}")
async def update_schedule_via_gateway(schedule_id: int, request: Request):
    """Actualiza un horario por ID."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/schedules/{schedule_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/schedules/{schedule_id}", status_code=204)
async def delete_schedule_via_gateway(schedule_id: int, request: Request):
    """Elimina un horario por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/schedules/{schedule_id}",
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


@router.get("/request/{request_id}")
async def read_request_by_id_via_gateway(request_id: int):
    """Obtiene una solicitud específica por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/request/{request_id}"
    )


@router.patch("/request/{request_id}")
async def update_request_status_via_gateway(request_id: int, request: Request):
    """Actualiza el estado de una solicitud."""
    data = await request.json()
    return await forward_request(
        "PATCH",
        f"{settings.rh_service_url}/request/{request_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/request/{request_id}", status_code=204)
async def delete_request_via_gateway(request_id: int, request: Request):
    """Elimina una solicitud por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/request/{request_id}",
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


@router.get("/shift/{shift_id}")
async def read_shift_by_id_via_gateway(shift_id: int):
    """Obtiene un turno específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/shift/{shift_id}"
    )


@router.put("/shift/{shift_id}")
async def update_shift_via_gateway(shift_id: int, request: Request):
    """Actualiza un turno por ID."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/shift/{shift_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.patch("/shift/{shift_id}/assign")
async def assign_employee_to_shift_via_gateway(shift_id: int, request: Request):
    """Asigna un empleado a un turno."""
    data = await request.json()
    return await forward_request(
        "PATCH",
        f"{settings.rh_service_url}/shift/{shift_id}/assign",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/shift/{shift_id}", status_code=204)
async def delete_shift_via_gateway(shift_id: int, request: Request):
    """Elimina un turno por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/shift/{shift_id}",
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


@router.get("/training/{training_id}")
async def read_training_by_id_via_gateway(training_id: int):
    """Obtiene un registro de capacitación por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/training/{training_id}"
    )


@router.put("/training/{training_id}")
async def update_training_via_gateway(training_id: int, request: Request):
    """Actualiza un registro de capacitación por ID."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/training/{training_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/training/{training_id}", status_code=204)
async def delete_training_via_gateway(training_id: int, request: Request):
    """Elimina un registro de capacitación por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/training/{training_id}",
        headers=dict(request.headers.items()),
    )