from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.inventario_schema import (
    InventarioLocalCreate,
    InventarioLocalUpdate,
    InventarioLocalResponse,
    RecepcionStockCreate,
    RecepcionStockResponse,
)
from app.services.inventario_service import InventarioService

router = APIRouter(redirect_slashes=False)


# ─── Listar insumos ────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[InventarioLocalResponse],
    summary="Listar insumos del inventario local",
    description=(
        "Retorna todos los insumos del inventario del área de servicio. "
        "Acepta filtro por categoría y modo 'solo_criticos' para alertas de stock."
    ),
)
def read_inventario(
    categoria: Optional[str] = Query(
        None,
        description="Filtrar por categoría (Carnes/Vegetales/Lacteos/Bebidas/Especias)"
    ),
    solo_criticos: bool = Query(
        False,
        description="Si es true, retorna solo los insumos con stock crítico (cantidad < mínimo)."
    ),
    db: Session = Depends(get_db),
):
    return InventarioService().get_all(db, categoria=categoria, solo_criticos=solo_criticos)


# ─── Crear insumo ──────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=InventarioLocalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo insumo en inventario",
    description="Crea un nuevo ítem en el inventario local del área de servicio.",
)
def crear_insumo(payload: InventarioLocalCreate, db: Session = Depends(get_db)):
    return InventarioService().crear_item(db, payload)


# ─── Obtener insumo por ID ─────────────────────────────────────────────────────

@router.get(
    "/criticos",
    response_model=List[InventarioLocalResponse],
    summary="Insumos con stock crítico",
    description="Retorna los insumos donde la cantidad actual es menor al umbral mínimo.",
)
def read_criticos(db: Session = Depends(get_db)):
    return InventarioService().get_criticos(db)


@router.get(
    "/{item_id}",
    response_model=InventarioLocalResponse,
    summary="Obtener insumo por ID",
)
def read_insumo(item_id: int, db: Session = Depends(get_db)):
    return InventarioService().get_by_id(db, item_id)


# ─── Actualizar umbrales ───────────────────────────────────────────────────────

@router.patch(
    "/{item_id}",
    response_model=InventarioLocalResponse,
    summary="Actualizar umbrales de insumo",
    description="Permite actualizar los umbrales de stock mínimo/máximo y el costo unitario.",
)
def update_insumo(
    item_id: int, payload: InventarioLocalUpdate, db: Session = Depends(get_db)
):
    return InventarioService().update(db, item_id, payload)


# ─── Recepción de stock ────────────────────────────────────────────────────────

@router.post(
    "/recepcion",
    response_model=RecepcionStockResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar recepción de stock",
    description=(
        "Registra la recepción de un despacho de Producción. "
        "Suma la cantidad recibida al stock actual del insumo y crea un "
        "registro inmutable de la recepción para trazabilidad."
    ),
)
def recibir_stock(payload: RecepcionStockCreate, db: Session = Depends(get_db)):
    return InventarioService().recibir_stock(db, payload)
