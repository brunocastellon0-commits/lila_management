# gateway/app/routes.py - VERSIÓN CORREGIDA
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import httpx
from typing import Optional, Any
import json
from gateway.app.config import settings

# ✅ CRÍTICO: redirect_slashes=False para evitar 307
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

            # ✅ CORRECCIÓN CRÍTICA: Manejar respuestas vacías correctamente
            if response.status_code == 204:
                content = None
            elif not response.content or len(response.content) == 0:
                # Para endpoints de listas, devolver array vacío
                if any(x in url for x in ['/sucursales', '/employees', '/schedules', '/roles', '/postulantes']):
                    content = []
                else:
                    content = None
            else:
                try:
                    content = response.json()
                    # ✅ Si el JSON es null, convertir a array vacío para endpoints de lista
                    if content is None:
                        if any(x in url for x in ['/sucursales', '/employees', '/schedules', '/roles', '/postulantes']):
                            content = []
                except json.JSONDecodeError:
                    content = {"detail": response.text if response.text else "Invalid JSON response"}
                except Exception as e:
                    content = {"detail": f"Error parsing response: {str(e)}"}
            
            # ✅ Headers CORS consistentes
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
# RUTAS DE SUCURSALES - SIN BARRA FINAL
# ========================================

@router.post("/sucursales", status_code=201)
async def create_sucursal_via_gateway(request: Request):
    """Crea una nueva sucursal."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/sucursales",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/sucursales")
async def read_all_sucursales_via_gateway(request: Request):
    """Obtiene la lista paginada de todas las sucursales."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/sucursales",
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


@router.get("/sucursales/{sucursal_id}")
async def read_sucursal_by_id_via_gateway(sucursal_id: int, request: Request):
    """Obtiene una sucursal específica por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/sucursales/{sucursal_id}",
        headers=dict(request.headers.items()),
    )


@router.put("/sucursales/{sucursal_id}")
async def update_sucursal_via_gateway(sucursal_id: int, request: Request):
    """Actualiza completamente los datos de una sucursal."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/sucursales/{sucursal_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.delete("/sucursales/{sucursal_id}", status_code=204)
async def delete_sucursal_via_gateway(sucursal_id: int, request: Request):
    """Elimina una sucursal por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/sucursales/{sucursal_id}",
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
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


@router.post("/employees/with-user", status_code=201)
async def create_employee_with_user_via_gateway(request: Request):
    """
    Endpoint Gateway: /rh/employees/with-user
    Redirige a: Service /employees/with-user
    """
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/employees/with-user",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.post("/employees-with-user", status_code=201)
async def create_employee_with_user_alt_via_gateway(request: Request):
    """
    Endpoint Gateway alternativo: /rh/employees-with-user (con guion)
    Redirige a: Service /employees/with-user
    """
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/employees/with-user",
        data=data,
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
# RUTAS DE HORARIOS (SCHEDULES)
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
        params=dict(request.query_params),
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
# RUTAS DE ROLES
# ========================================

@router.post("/roles", status_code=201)
async def create_role_via_gateway(request: Request):
    """Crea un nuevo rol."""
    data = await request.json()
    return await forward_request(
        "POST",
        f"{settings.rh_service_url}/roles",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.get("/roles")
async def read_all_roles_via_gateway(request: Request):
    """Obtiene la lista paginada de todos los roles."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/roles",
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


@router.get("/roles/{role_id}")
async def read_role_by_id_via_gateway(role_id: int, request: Request):
    """Obtiene un rol específico por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/roles/{role_id}",
        headers=dict(request.headers.items()),
    )


# ========================================
# OTRAS RUTAS (DOCUMENTOS, TURNOS, ETC)
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
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


# ALIAS EN ESPAÑOL: Documentos Legales
@router.get("/documentos_legales")
async def read_documentos_legales_via_gateway(request: Request):
    """Obtiene todos los documentos legales (alias en español de /documents)."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/documentos_legales",
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


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
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


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
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


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
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )
    
@router.get("/training/{training_id}")
async def read_training_by_id_via_gateway(training_id: int, request: Request):
    """Obtiene una capacitación específica por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/training/{training_id}",
        headers=dict(request.headers.items()),
    )

@router.put("/training/{training_id}")
async def update_training_via_gateway(training_id: int, request: Request):
    """Actualiza una capacitación (ej: marcar como completada)."""
    data = await request.json()
    return await forward_request(
        "PUT",
        f"{settings.rh_service_url}/training/{training_id}",
        data=data,
        headers=dict(request.headers.items()),
    )

@router.delete("/training/{training_id}", status_code=204)
async def delete_training_via_gateway(training_id: int, request: Request):
    """Elimina una capacitación por ID."""
    return await forward_request(
        "DELETE",
        f"{settings.rh_service_url}/training/{training_id}",
        headers=dict(request.headers.items()),
    )


# ========================================
# RUTAS DE POSTULANTES (IA)
# ========================================

@router.post("/postulantes", status_code=201)
async def create_postulante_via_gateway(request: Request):
    """
    Crea un postulante con archivo PDF (Multipart).
    Reenvía la solicitud multipart al microservicio.
    """
    # Leemos el form data (incluye archivos)
    form = await request.form()
    
    # Preparamos los datos para httpx
    files_to_send = {}
    data_to_send = {}
    
    for key, value in form.items():
        if isinstance(value, str):
            data_to_send[key] = value
        else:
            # Es un UploadFile
            content = await value.read()
            files_to_send[key] = (value.filename, content, value.content_type)
            
    # Headers: Copiamos auth, pero NO content-type (httpx lo pone con boundary)
    headers = {}
    if "authorization" in request.headers:
        headers["authorization"] = request.headers["authorization"]

    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        try:
            response = await client.post(
                f"{settings.rh_service_url}/postulantes",
                files=files_to_send,
                data=data_to_send,
                headers=headers
            )
            
            # CORS headers
            cors_headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true"
            }
            
            return JSONResponse(
                content=response.json(), 
                status_code=response.status_code,
                headers=cors_headers
            )
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Error forwarding multipart: {str(e)}")


@router.get("/postulantes")
async def read_postulantes_via_gateway(request: Request):
    """Listar postulantes."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/postulantes",
        params=dict(request.query_params),
        headers=dict(request.headers.items()),
    )


@router.get("/postulantes/{postulante_id}")
async def read_postulante_by_id_via_gateway(postulante_id: int, request: Request):
    """Obtener postulante por ID."""
    return await forward_request(
        "GET",
        f"{settings.rh_service_url}/postulantes/{postulante_id}",
        headers=dict(request.headers.items()),
    )


@router.patch("/postulantes/{postulante_id}")
async def update_postulante_via_gateway(postulante_id: int, request: Request):
    """Actualizar postulante (ej: apto/no apto)."""
    data = await request.json()
    return await forward_request(
        "PATCH",
        f"{settings.rh_service_url}/postulantes/{postulante_id}",
        data=data,
        headers=dict(request.headers.items()),
    )


@router.post("/postulantes/chat-rrhh/")
@router.post("/postulantes/chat-rrhh") 
async def chat_rrhh_via_gateway(request: Request):
    """
    Chat con IA para consultas sobre postulantes (RAG).
    Usa timeout extendido para operaciones de IA con Ollama.
    """
    data = await request.json()
    
    # Timeout extendido para operaciones de IA (3 minutos)
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(180.0, connect=10.0),
        follow_redirects=False
    ) as client:
        try:
            response = await client.post(
                f"{settings.rh_service_url}/postulantes/chat-rrhh",
                json=data,
                headers={
                    k: v for k, v in request.headers.items()
                    if k.lower() in ["authorization", "content-type"]
                }
            )
            
            # CORS headers
            cors_headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true"
            }
            
            return JSONResponse(
                content=response.json() if response.content else {"error": "No response"},
                status_code=response.status_code,
                headers=cors_headers
            )
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="El modelo de IA está tardando demasiado. Intenta con una pregunta más corta o verifica que Ollama esté funcionando correctamente."
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error en el chat de IA: {str(e)}"
            )