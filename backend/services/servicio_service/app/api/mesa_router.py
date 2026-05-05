from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.mesa_schema import MesaCreate, MesaUpdate, MesaEstadoUpdate, MesaResponse
from app.services.mesa_service import MesaService

router = APIRouter(redirect_slashes=False)


# ─── Listar mesas ──────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[MesaResponse],
    summary="Listar mesas del salón",
    description=(
        "Retorna todas las mesas con su estado actual, zona, forma y nombre del mesero asignado. "
        "Acepta filtros opcionales de zona y estado para el mapa visual del salón."
    ),
)
def read_mesas(
    zona: Optional[str] = Query(None, description="Filtrar por zona (Interior/Terraza/VIP/Barra)"),
    estado: Optional[str] = Query(None, description="Filtrar por estado (Libre/Ocupado/Reservado/Atencion)"),
    db: Session = Depends(get_db),
):
    return MesaService().get_all(db, zona=zona, estado=estado)


# ─── Crear mesa ────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=MesaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nueva mesa",
    description="Crea una nueva mesa en el sistema. El número de mesa debe ser único.",
)
def crear_mesa(payload: MesaCreate, db: Session = Depends(get_db)):
    return MesaService().crear_mesa(db, payload)


# ─── Obtener mesa por ID ───────────────────────────────────────────────────────

@router.get(
    "/{mesa_id}",
    response_model=MesaResponse,
    summary="Obtener mesa por ID",
)
def read_mesa(mesa_id: int, db: Session = Depends(get_db)):
    return MesaService().get_by_id(db, mesa_id)


# ─── Actualizar datos de mesa ──────────────────────────────────────────────────

@router.patch(
    "/{mesa_id}",
    response_model=MesaResponse,
    summary="Actualizar datos de mesa",
    description="Permite cambiar capacidad, forma, zona o reasignar mesero.",
)
def update_mesa(mesa_id: int, payload: MesaUpdate, db: Session = Depends(get_db)):
    return MesaService().update(db, mesa_id, payload)


# ─── Cambiar estado ────────────────────────────────────────────────────────────

@router.patch(
    "/{mesa_id}/estado",
    response_model=MesaResponse,
    summary="Cambiar estado de mesa",
    description=(
        "Actualiza el estado de la mesa (Libre/Ocupado/Reservado/Atencion). "
        "Al pasar a 'Ocupado' se registra el timestamp automáticamente. "
        "Al pasar a 'Libre' se limpia el mesero asignado y el timestamp."
    ),
)
def cambiar_estado_mesa(
    mesa_id: int,
    payload: MesaEstadoUpdate,
    db: Session = Depends(get_db),
):
    return MesaService().cambiar_estado(db, mesa_id, payload)
