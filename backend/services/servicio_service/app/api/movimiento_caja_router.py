from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.movimiento_caja_schema import (
    MovimientoCajaCreate,
    MovimientoCajaUpdate,
    MovimientoCajaResponse,
)
from app.services.movimiento_caja_service import MovimientoCajaService

router = APIRouter(redirect_slashes=False)


# ─── Lectura ──────────────────────────────────────────────────────────────────

@router.get(
    "/sesion/{sesion_id}",
    response_model=List[MovimientoCajaResponse],
    summary="Listar movimientos de una sesión",
    description="Devuelve todos los movimientos de efectivo/pago de un turno, "
                "ordenados por fecha descendente."
)
def read_movimientos_por_sesion(
    sesion_id: int,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db)
):
    return MovimientoCajaService().get_by_sesion(db, sesion_id, skip=skip, limit=limit)


@router.get(
    "/sesion/{sesion_id}/resumen",
    summary="Resumen financiero de una sesión",
    description=(
        "Devuelve el total de ingresos y egresos agrupados por método de pago. "
        "Usado para renderizar el reporte de cierre de turno."
    ),
)
def read_resumen_sesion(sesion_id: int, db: Session = Depends(get_db)):
    return MovimientoCajaService().get_resumen_sesion(db, sesion_id)


@router.get(
    "/{movimiento_id}",
    response_model=MovimientoCajaResponse,
    summary="Obtener movimiento por ID"
)
def read_movimiento(movimiento_id: int, db: Session = Depends(get_db)):
    return MovimientoCajaService().get_by_id(db, movimiento_id)


# ─── Retiro de caja menor ────────────────────────────────────────────────────

@router.post(
    "/retiro",
    response_model=MovimientoCajaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar retiro de efectivo",
    description=(
        "Registra un egreso de efectivo sin pedido asociado (caja menor, "
        "pago a proveedor, etc.). Valida que el saldo de efectivo sea suficiente "
        "antes de permitir el retiro."
    ),
)
def registrar_retiro(
    id_sesion: int = Body(..., description="ID de la sesión de caja activa."),
    monto: Decimal = Body(..., gt=0, description="Monto a retirar (mayor a 0)."),
    concepto: str = Body(..., min_length=5, max_length=200,
                         description="Descripción obligatoria del retiro "
                                     "(ej: compra de suministros urgentes)."),
    db: Session = Depends(get_db)
):
    return MovimientoCajaService().registrar_retiro(db, id_sesion, monto, concepto)


# ─── Creación manual (uso administrativo) ────────────────────────────────────

@router.post(
    "",
    response_model=MovimientoCajaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar movimiento manual (admin)",
    description=(
        "Crea un movimiento de forma directa. Uso restringido a administradores. "
        "Para pagos de pedidos use el endpoint /pedidos/{id}/pagar."
    ),
)
def crear_movimiento(payload: MovimientoCajaCreate, db: Session = Depends(get_db)):
    service = MovimientoCajaService()
    movimiento = service.crear_movimiento(db, payload)
    db.commit()
    db.refresh(movimiento)
    return movimiento


# ─── Corrección administrativa ────────────────────────────────────────────────

@router.patch(
    "/{movimiento_id}",
    response_model=MovimientoCajaResponse,
    summary="Corregir movimiento (admin)",
    description="Actualización administrativa de concepto, método de pago o monto."
)
def update_movimiento(
    movimiento_id: int,
    payload: MovimientoCajaUpdate,
    db: Session = Depends(get_db)
):
    return MovimientoCajaService().update(db, movimiento_id, payload)
