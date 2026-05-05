from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.pedido_schema import PedidoCreate, PedidoUpdate, PedidoResponse
from app.services.pedido_service import PedidoService

router = APIRouter(redirect_slashes=False)


# ─── Creación ─────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=PedidoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo pedido",
    description=(
        "Crea el pedido y todas sus líneas de detalle en una única transacción. "
        "Valida que la sesión de caja esté activa y consulta el precio actual "
        "de cada producto al production_service para congelarlo en el histórico."
    ),
)
def crear_pedido(payload: PedidoCreate, db: Session = Depends(get_db)):
    return PedidoService().crear_pedido(db, payload)


# ─── KDS (Monitor de Cocina) ──────────────────────────────────────────────────

@router.get(
    "/kds",
    response_model=List[PedidoResponse],
    summary="Pedidos activos para el KDS",
    description=(
        "Retorna pedidos activos (Pendiente, En Preparacion, Servido) para el monitor de cocina. "
        "Filtrable por estación con ?estacion=Fuegos|Frios|Postres|Barra. "
        "Los pedidos se ordenan por fecha de creación (más antiguo primero)."
    ),
)
def read_pedidos_kds(
    estacion: Optional[str] = Query(
        None,
        description="Filtrar por estación de cocina (Fuegos/Frios/Postres/Barra)."
    ),
    db: Session = Depends(get_db),
):
    return PedidoService().get_activos_kds(db, estacion=estacion)


# ─── Historial de pedidos ─────────────────────────────────────────────────────

@router.get(
    "/historial",
    response_model=List[PedidoResponse],
    summary="Historial de pedidos con filtros",
    description=(
        "Retorna el historial de pedidos paginado con filtros opcionales. "
        "Soporta filtros por estado, mesero y fecha (YYYY-MM-DD)."
    ),
)
def read_historial(
    skip: int = Query(0, ge=0, description="Offset para paginación."),
    limit: int = Query(50, ge=1, le=200, description="Máximo de registros."),
    estado: Optional[str] = Query(None, description="Estado del pedido (Pendiente/Pagado/Anulado/etc)."),
    id_mesero: Optional[int] = Query(None, description="Filtrar por ID de mesero."),
    fecha: Optional[str] = Query(None, description="Filtrar por fecha en formato YYYY-MM-DD."),
    db: Session = Depends(get_db),
):
    return PedidoService().get_historial(
        db, skip=skip, limit=limit, estado=estado, id_mesero=id_mesero, fecha=fecha
    )


# ─── Lectura ──────────────────────────────────────────────────────────────────

@router.get(
    "/{pedido_id}",
    response_model=PedidoResponse,
    summary="Obtener pedido por ID"
)
def read_pedido(pedido_id: int, db: Session = Depends(get_db)):
    return PedidoService().get_by_id(db, pedido_id)


@router.get(
    "/sesion/{sesion_id}",
    response_model=List[PedidoResponse],
    summary="Listar pedidos de una sesión",
    description="Devuelve todos los pedidos registrados en un turno de caja específico."
)
def read_pedidos_por_sesion(
    sesion_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return PedidoService().get_by_sesion(db, sesion_id, skip=skip, limit=limit)


# ─── Actualización de estado ──────────────────────────────────────────────────

@router.patch(
    "/{pedido_id}",
    response_model=PedidoResponse,
    summary="Actualizar pedido",
    description=(
        "Permite cambiar el estado, mesero o mesa de un pedido activo. "
        "No aplica a pedidos en estado 'Pagado' o 'Anulado'."
    ),
)
def update_pedido(pedido_id: int, payload: PedidoUpdate, db: Session = Depends(get_db)):
    return PedidoService().update(db, pedido_id, payload)


# ─── Cobro ────────────────────────────────────────────────────────────────────

@router.post(
    "/{pedido_id}/pagar",
    response_model=PedidoResponse,
    summary="Registrar pago de pedido",
    description=(
        "Cobra el pedido. Acepta pagos fraccionados enviando una lista de "
        "{metodo_pago, monto}. La suma de los montos debe ser exactamente "
        "igual al total del pedido. Genera un MovimientoCaja por cada fracción."
    ),
)
def pagar_pedido(pedido_id: int, pagos: List[dict], db: Session = Depends(get_db)):
    return PedidoService().registrar_pago(db, pedido_id, pagos)


# ─── Anulación ────────────────────────────────────────────────────────────────

@router.post(
    "/{pedido_id}/anular",
    response_model=PedidoResponse,
    summary="Anular pedido",
    description="Cancela un pedido activo. No puede anularse si ya fue pagado."
)
def anular_pedido(pedido_id: int, db: Session = Depends(get_db)):
    return PedidoService().anular_pedido(db, pedido_id)
