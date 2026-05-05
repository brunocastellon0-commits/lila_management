from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from decimal import Decimal
from typing import List, Optional

from app.models.inventario_local_model import InventarioLocal
from app.models.recepcion_stock_model import RecepcionStock
from app.schemas.inventario_schema import (
    InventarioLocalCreate,
    InventarioLocalUpdate,
    InventarioLocalResponse,
    RecepcionStockCreate,
    RecepcionStockResponse,
)


class InventarioService:
    """
    Lógica de negocio para el inventario local del área de servicio.

    Responsabilidades:
        - CRUD de insumos (InventarioLocal).
        - Recepción de stock desde production_service.
        - Filtrado de ítems en stock crítico.
        - Descuento automático al completar pedidos.
    """

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _get_or_404(self, db: Session, item_id: int) -> InventarioLocal:
        item = db.query(InventarioLocal).filter(InventarioLocal.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Insumo con ID {item_id} no encontrado en el inventario local."
            )
        return item

    def _to_response(self, item: InventarioLocal) -> InventarioLocalResponse:
        """Agrega el campo calculado 'es_critico'."""
        data = InventarioLocalResponse.model_validate(item)
        data.es_critico = item.cantidad_actual < item.min_stock
        return data

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def get_all(
        self,
        db: Session,
        categoria: Optional[str] = None,
        solo_criticos: bool = False,
    ) -> List[InventarioLocalResponse]:
        """Lista todos los insumos con filtros opcionales."""
        query = db.query(InventarioLocal)
        if categoria:
            query = query.filter(InventarioLocal.categoria == categoria)
        if solo_criticos:
            query = query.filter(
                InventarioLocal.cantidad_actual < InventarioLocal.min_stock
            )
        items = query.order_by(InventarioLocal.nombre_producto).all()
        return [self._to_response(i) for i in items]

    def get_by_id(self, db: Session, item_id: int) -> InventarioLocalResponse:
        return self._to_response(self._get_or_404(db, item_id))

    def get_criticos(self, db: Session) -> List[InventarioLocalResponse]:
        """Retorna insumos donde cantidad_actual < min_stock."""
        return self.get_all(db, solo_criticos=True)

    # ------------------------------------------------------------------
    # Creación
    # ------------------------------------------------------------------

    def crear_item(
        self, db: Session, data: InventarioLocalCreate
    ) -> InventarioLocalResponse:
        """Crea un nuevo ítem en el inventario local."""
        nuevo = InventarioLocal(
            id_producto_origen=data.id_producto_origen,
            nombre_producto=data.nombre_producto,
            categoria=data.categoria.value,
            cantidad_actual=data.cantidad_actual,
            unidad=data.unidad,
            min_stock=data.min_stock,
            max_stock=data.max_stock,
            costo_unitario=data.costo_unitario,
        )
        db.add(nuevo)
        try:
            db.commit()
            db.refresh(nuevo)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear el insumo: {e}"
            )
        return self._to_response(nuevo)

    # ------------------------------------------------------------------
    # Actualización de umbrales
    # ------------------------------------------------------------------

    def update(
        self, db: Session, item_id: int, data: InventarioLocalUpdate
    ) -> InventarioLocalResponse:
        """Actualiza umbrales de stock y/o costo de un insumo."""
        item = self._get_or_404(db, item_id)
        update_data = data.model_dump(exclude_unset=True)

        if "categoria" in update_data and update_data["categoria"] is not None:
            update_data["categoria"] = update_data["categoria"].value

        for key, value in update_data.items():
            setattr(item, key, value)

        try:
            db.commit()
            db.refresh(item)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar el insumo: {e}"
            )
        return self._to_response(item)

    # ------------------------------------------------------------------
    # Recepción de stock (despacho desde Producción)
    # ------------------------------------------------------------------

    def recibir_stock(
        self, db: Session, data: RecepcionStockCreate
    ) -> RecepcionStockResponse:
        """
        Registra la recepción de un despacho de producción.

        Flujo:
            1. Valida que el ítem de inventario exista.
            2. Valida que cantidad_recibida + cantidad_actual no exceda max_stock.
            3. Suma la cantidad al inventario local.
            4. Crea un registro inmutable en RecepcionStock.
            5. Commit único de la transacción completa.
        """
        item = self._get_or_404(db, data.id_inventario_local)

        nueva_cantidad = item.cantidad_actual + data.cantidad_recibida

        # Advertencia si se supera el máximo (no bloquea, solo alerta)
        if item.max_stock > 0 and nueva_cantidad > item.max_stock:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"La recepción de {data.cantidad_recibida} {item.unidad} superaría "
                    f"el máximo de stock ({item.max_stock} {item.unidad}). "
                    f"Stock actual: {item.cantidad_actual} {item.unidad}."
                )
            )

        # Actualizar stock
        item.cantidad_actual = nueva_cantidad

        # Crear registro de recepción
        recepcion = RecepcionStock(
            id_inventario_local=data.id_inventario_local,
            cantidad_recibida=data.cantidad_recibida,
            id_produccion_origen=data.id_produccion_origen,
            recibido_por=data.recibido_por,
            notas=data.notas,
        )
        db.add(recepcion)

        try:
            db.commit()
            db.refresh(recepcion)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al registrar la recepción: {e}"
            )
        return RecepcionStockResponse.model_validate(recepcion)

    # ------------------------------------------------------------------
    # Descuento automático al completar pedido
    # ------------------------------------------------------------------

    def descontar_por_pedido(self, db: Session, id_pedido: int) -> None:
        """
        Descuenta ingredientes del inventario al completar un pedido.
        Se llama internamente desde PedidoService.

        Implementación simplificada: reservado para futura integración
        con recetas del production_service.
        """
        # TODO: Implementar cuando esté disponible el endpoint de recetas
        # en production_service. Por ahora es un placeholder.
        pass
