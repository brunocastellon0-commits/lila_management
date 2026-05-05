"""
rh_client.py — Cliente HTTP para el microservicio de RH.

Centraliza toda la comunicación entre servicio_service y rh_service.
Usa httpx (síncrono) para mantener coherencia con el patrón existente
en ventas_service.py que ya usa httpx para comunicarse con production_service.

Manejo de errores estándar:
    - 404 del rh_service → HTTPException 404
    - Empleado inactivo   → HTTPException 422
    - ConnectError        → HTTPException 503 (servicio no disponible)
    - TimeoutError        → HTTPException 504 (timeout)
"""
import httpx
from fastapi import HTTPException, status

from app.utils.config import settings

# Tiempo máximo de espera por respuesta (en segundos)
_TIMEOUT = 5.0


def _get_client() -> httpx.Client:
    """Construye un cliente httpx con la configuración estándar del servicio."""
    return httpx.Client(base_url=settings.RH_SERVICE_URL, timeout=_TIMEOUT)


def validar_empleado(id_empleado: int) -> dict:
    """
    Consulta el rh_service y valida que el empleado exista y esté activo.

    Args:
        id_empleado: ID del empleado a validar.

    Returns:
        dict con los datos del empleado si existe y está activo.

    Raises:
        HTTPException 404: Si el empleado no existe en rh_service.
        HTTPException 422: Si el empleado existe pero is_active=False.
        HTTPException 503: Si rh_service no está disponible.
        HTTPException 504: Si rh_service excede el tiempo de espera.
    """
    try:
        with _get_client() as client:
            response = client.get(f"/employees/{id_empleado}")
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"El servicio de RH no está disponible en {settings.RH_SERVICE_URL}. "
                "Verifique que rh_service esté corriendo."
            )
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=(
                f"El servicio de RH no respondió en el tiempo esperado ({_TIMEOUT}s). "
                "Intente nuevamente."
            )
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Empleado con ID {id_empleado} no encontrado en el sistema de RH."
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error inesperado del servicio de RH: {response.status_code}"
        )

    empleado = response.json()

    if not empleado.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"El empleado con ID {id_empleado} está inactivo. "
                "No puede ser asignado a mesas o pedidos."
            )
        )

    return empleado


def obtener_nombre_empleado(id_empleado: int) -> str:
    """
    Retorna el nombre completo formateado del empleado.

    Args:
        id_empleado: ID del empleado en rh_service.

    Returns:
        str con formato "Nombre Apellido".
        Retorna una cadena vacía si ocurre cualquier error (falla silenciosa
        para no bloquear lecturas de pedidos por indisponibilidad de RH).
    """
    try:
        empleado = validar_empleado(id_empleado)
        nombre = empleado.get("nombre", "")
        apellido = empleado.get("apellido", "")
        return f"{nombre} {apellido}".strip()
    except HTTPException:
        # Falla silenciosa: si RH no está disponible, retornamos string vacío
        # en lugar de bloquear la lectura de pedidos/mesas
        return ""


def obtener_nombre_empleado_safe(id_empleado: int | None) -> str | None:
    """
    Wrapper que acepta None y retorna None si el ID es None.
    Conveniente para campos opcionales como id_mesero_asignado.
    """
    if id_empleado is None:
        return None
    nombre = obtener_nombre_empleado(id_empleado)
    return nombre if nombre else None
