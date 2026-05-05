from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.sesion_caja_schema import (
    SesionCajaCreate,
    SesionCajaCierre,
    SesionCajaUpdate,
    SesionCajaResponse,
)
from app.services.sesion_caja_service import SesionCajaService

router = APIRouter(redirect_slashes=False)


# ─── Apertura ─────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=SesionCajaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Abrir turno de caja",
    description=(
        "Abre un nuevo turno sobre la caja indicada. "
        "Valida que la caja esté activa, que no tenga otra sesión abierta, "
        "y que el usuario no opere otra caja simultáneamente."
    ),
)
def abrir_sesion(payload: SesionCajaCreate, db: Session = Depends(get_db)):
    return SesionCajaService().abrir_sesion(db, payload)


# ─── Lectura ──────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[SesionCajaResponse],
    summary="Listar sesiones de caja"
)
def read_all_sesiones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return SesionCajaService().get_all(db, skip=skip, limit=limit)


@router.get(
    "/{sesion_id}",
    response_model=SesionCajaResponse,
    summary="Obtener sesión por ID"
)
def read_sesion(sesion_id: int, db: Session = Depends(get_db)):
    return SesionCajaService().get_by_id(db, sesion_id)


@router.get(
    "/caja/{caja_id}/activa",
    response_model=SesionCajaResponse,
    summary="Obtener sesión activa de una caja",
    description="Devuelve la sesión actualmente abierta de la caja indicada. "
                "Lanza 404 si la caja no tiene ningún turno activo."
)
def read_sesion_activa(caja_id: int, db: Session = Depends(get_db)):
    return SesionCajaService().get_sesion_activa_por_caja(db, caja_id)


# ─── Cierre ───────────────────────────────────────────────────────────────────

@router.post(
    "/{sesion_id}/cerrar",
    response_model=SesionCajaResponse,
    summary="Cerrar turno de caja",
    description=(
        "Recibe el monto declarado por el cajero, calcula el monto del sistema "
        "y cierra el turno. Si existe diferencia, el estado queda como 'Descuadrada'. "
        "Bloquea el cierre si hay pedidos en curso."
    ),
)
def cerrar_sesion(sesion_id: int, payload: SesionCajaCierre, db: Session = Depends(get_db)):
    return SesionCajaService().cerrar_sesion(db, sesion_id, payload)


# ─── Actualización administrativa ─────────────────────────────────────────────

@router.patch(
    "/{sesion_id}",
    response_model=SesionCajaResponse,
    summary="Actualizar sesión (uso administrativo)",
    description="Permite a un administrador corregir campos de una sesión."
)
def update_sesion(sesion_id: int, payload: SesionCajaUpdate, db: Session = Depends(get_db)):
    return SesionCajaService().update(db, sesion_id, payload)
