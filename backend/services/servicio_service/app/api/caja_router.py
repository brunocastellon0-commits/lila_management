from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.caja_schema import CajaCreate, CajaUpdate, CajaResponse
from app.services.caja_service import CajaService

router = APIRouter(redirect_slashes=False)


@router.post(
    "",
    response_model=CajaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo punto de venta",
    description="Crea una caja física o lógica (ej: Caja Principal, Caja Barra)."
)
def create_caja(payload: CajaCreate, db: Session = Depends(get_db)):
    return CajaService().create(db, payload)


@router.get(
    "",
    response_model=List[CajaResponse],
    summary="Listar puntos de venta",
    description="Devuelve todas las cajas registradas (activas e inactivas)."
)
def read_all_cajas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return CajaService().get_all(db, skip=skip, limit=limit)


@router.get(
    "/{caja_id}",
    response_model=CajaResponse,
    summary="Obtener caja por ID"
)
def read_caja(caja_id: int, db: Session = Depends(get_db)):
    return CajaService().get_by_id(db, caja_id)


@router.put(
    "/{caja_id}",
    response_model=CajaResponse,
    summary="Actualizar caja",
    description="Modifica el nombre o estado de una caja existente."
)
def update_caja(caja_id: int, payload: CajaUpdate, db: Session = Depends(get_db)):
    return CajaService().update(db, caja_id, payload)


@router.delete(
    "/{caja_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar caja",
    description="Elimina una caja. Falla con 409 si tiene una sesión activa."
)
def delete_caja(caja_id: int, db: Session = Depends(get_db)):
    CajaService().delete(db, caja_id)
    return None
