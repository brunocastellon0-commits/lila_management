from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import httpx
from typing import Optional, Any
import json
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
    
@router.post("/employees-with-user", status_code=201)
async def create_employee_with_user(request: Request):
    """
    Crea un nuevo empleado y su usuario automáticamente.
    """
    data = await request.json()
    
    try:
        # 1. Primero crear el empleado en RH service
        employee_response = await forward_request(
            "POST",
            f"{settings.rh_service_url}/employees",
            data=data,
            headers=dict(request.headers.items()),
        )
        
        # Si el empleado se creó exitosamente
        if employee_response.status_code == 201:
            # ✅ CORRECCIÓN: Obtener el contenido directamente del JSONResponse
            employee_content = employee_response.body
            employee_data = json.loads(employee_content.decode()) if employee_content else {}
            
            # 2. Crear el usuario en User service
# En gateway/app/routes.py - ya está usando data.get("password")
            user_data = {
                "username": f"{data.get('nombre', '').lower()}.{data.get('apellido', '').lower()}",
                "email": data.get("email"),
                "password": data.get("password"),  # ← USA LA CONTRASEÑA DEL FORMULARIO
                "role": get_role_name(data.get("rol_id")),
                "employee_id": employee_data.get("id")
            }
            
            user_response = await forward_request(
                "POST",
                f"{settings.user_service_url}/auth/register-employee",
                data=user_data,
                headers=dict(request.headers.items()),
            )
            
            # Combinar respuestas
            if user_response.status_code == 201:
                # ✅ CORRECCIÓN: Obtener contenido del user_response
                user_content = user_response.body
                user_data_response = json.loads(user_content.decode()) if user_content else {}
                
                employee_data["user"] = user_data_response
                return JSONResponse(content=employee_data, status_code=201)
            else:
                # Si falla crear usuario, eliminar el empleado (rollback)
                await forward_request(
                    "DELETE",
                    f"{settings.rh_service_url}/employees/{employee_data['id']}",
                    headers=dict(request.headers.items()),
                )
                return user_response
        
        return employee_response
        
    except Exception as e:
        # Manejo de errores generales
        raise HTTPException(
            status_code=500,
            detail=f"Error en la creación coordinada: {str(e)}"
        )


# Función auxiliar para convertir ID de rol a nombre
def get_role_name(rol_id: int) -> str:
    role_mapping = {
        1: "employee",
        2: "admin", 
        3: "manager",
        4: "supervisor"
    }
    return role_mapping.get(rol_id, "employee")


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