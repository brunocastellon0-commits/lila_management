from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import cast, Date
from fastapi import HTTPException, status
from decimal import Decimal
from typing import List, Optional
from datetime import date

from app.models.pedido_model import Pedido
from app.models.sesion_caja_model import SesionCaja
from app.models.ventas_model import DetallePedido
from app.schemas.pedido_schema import PedidoCreate, PedidoUpdate
from app.utils.rh_client import obtener_nombre_empleado_safe
import importlib
_ventas_mod = importlib.import_module("app.services.ventas_service")
DetallePedidoService = _ventas_mod.DetallePedidoService

detalle_service = DetallePedidoService()

# Tasa de impuesto configurable (10.5%)
TASA_IMPUESTO = Decimal("0.105")


class PedidoService:
    """
    Lógica de negocio para la gestión de pedidos.

    Orquesta:
        1. Validación de sesión activa.
        2. Creación de líneas de detalle (delegada a DetallePedidoService).
        3. Cálculo y actualización del total del pedido.
        4. Registro de pagos (delegado a MovimientoCajaService).
        5. Cambios de estado del pedido.
    """

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _get_or_404(self, db: Session, pedido_id: int) -> Pedido:
        """Obtiene un pedido por ID o lanza 404."""
        pedido = db.query(Pedido).options(
            joinedload(Pedido.detalles)
        ).filter(Pedido.id == pedido_id).first()

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado."
            )
        return pedido

    def _get_sesion_abierta(self, db: Session, id_sesion: int) -> SesionCaja:
        """Valida que la sesión exista y esté 'Abierta'."""
        sesion = db.query(SesionCaja).filter(SesionCaja.id == id_sesion).first()
        if not sesion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sesión de caja con ID {id_sesion} no encontrada."
            )
        if sesion.estado != "Abierta":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La sesión {id_sesion} no está abierta (estado: '{sesion.estado}'). "
                       "No se pueden registrar pedidos en sesiones cerradas."
            )
        return sesion

    def _recalcular_totales(self, pedido: Pedido) -> None:
        """
        Recalcula subtotal, impuestos y total del pedido.

        Fórmula:
            subtotal = Σ detalles.subtotal
            impuestos = subtotal * TASA_IMPUESTO (10.5%)
            total = subtotal + impuestos - descuentos

        Modifica el objeto Pedido en memoria (sin commit).
        """
        subtotal = sum((d.subtotal for d in pedido.detalles), Decimal("0.00"))
        impuestos = (subtotal * TASA_IMPUESTO).quantize(Decimal("0.01"))
        descuentos = pedido.descuentos or Decimal("0.00")

        pedido.subtotal = subtotal
        pedido.impuestos = impuestos
        pedido.total = subtotal + impuestos - descuentos

    # Alias de compatibilidad hacia atrás
    def _recalcular_total(self, pedido: Pedido) -> Decimal:
        """Compatibilidad: retorna el total calculado sin modificar el pedido."""
        subtotal = sum((d.subtotal for d in pedido.detalles), Decimal("0.00"))
        impuestos = (subtotal * TASA_IMPUESTO).quantize(Decimal("0.01"))
        descuentos = pedido.descuentos or Decimal("0.00")
        return subtotal + impuestos - descuentos

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def get_by_id(self, db: Session, pedido_id: int) -> Pedido:
        return self._get_or_404(db, pedido_id)

    def get_by_sesion(self, db: Session, id_sesion: int, skip: int = 0, limit: int = 100) -> List[Pedido]:
        """Lista todos los pedidos de una sesión de caja."""
        return db.query(Pedido).filter(
            Pedido.id_sesion == id_sesion
        ).offset(skip).limit(limit).all()

    def get_activos_kds(self, db: Session, estacion: Optional[str] = None) -> List[Pedido]:
        """
        Retorna pedidos activos para el monitor KDS de cocina.

        Un pedido es "activo" si está en estado Pendiente, En Preparacion o Servido.
        Si se pasa 'estacion', filtra solo los detalles de esa estación de cocina.

        Args:
            estacion: Nombre de la estación ("Fuegos", "Frios", "Postres", "Barra").
                      None retorna todos los pedidos activos con todos sus detalles.
        """
        ESTADOS_ACTIVOS = ("Pendiente", "En Preparacion", "Servido")

        query = db.query(Pedido).options(
            joinedload(Pedido.detalles)
        ).filter(
            Pedido.estado_pedido.in_(ESTADOS_ACTIVOS)
        ).order_by(Pedido.fecha_creacion.asc())

        pedidos = query.all()

        # Filtrar detalles por estación si se especifica
        if estacion:
            pedidos_filtrados = []
            for pedido in pedidos:
                detalles_estacion = [
                    d for d in pedido.detalles
                    if d.estacion_cocina == estacion
                ]
                if detalles_estacion:
                    # Solo incluir el pedido si tiene ítems para esta estación
                    pedido.detalles = detalles_estacion
                    pedidos_filtrados.append(pedido)
            return pedidos_filtrados

        return pedidos

    def get_historial(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        estado: Optional[str] = None,
        id_mesero: Optional[int] = None,
        fecha: Optional[str] = None,
    ) -> List[Pedido]:
        """
        Retorna el historial de pedidos con paginación y filtros.

        Args:
            skip: Offset para paginación.
            limit: Máximo de registros retornados.
            estado: Filtro por estado_pedido (ej: "Pagado").
            id_mesero: Filtro por mesero asignado.
            fecha: Filtro por fecha en formato 'YYYY-MM-DD'.
        """
        query = db.query(Pedido).options(
            joinedload(Pedido.detalles)
        )

        if estado:
            query = query.filter(Pedido.estado_pedido == estado)
        if id_mesero:
            query = query.filter(Pedido.id_mesero == id_mesero)
        if fecha:
            try:
                fecha_dt = date.fromisoformat(fecha)
                query = query.filter(cast(Pedido.fecha_creacion, Date) == fecha_dt)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Formato de fecha inválido: '{fecha}'. Use 'YYYY-MM-DD'."
                )

        return query.order_by(Pedido.fecha_creacion.desc()).offset(skip).limit(limit).all()

    # ------------------------------------------------------------------
    # Creación de pedido (transacción completa)
    # ------------------------------------------------------------------

    def crear_pedido(self, db: Session, data: PedidoCreate) -> Pedido:
        """
        Crea un pedido con todos sus detalles en una transacción única.

        Flujo:
        1. Valida que la sesión de caja esté abierta.
        2. Crea el registro de Pedido (estado: Pendiente).
        3. Por cada ítem, llama a DetallePedidoService que:
           a. Valida el producto contra el production_service.
           b. Congela el precio unitario (snapshot).
           c. Calcula el subtotal.
           d. Hace db.flush() para obtener IDs sin commit.
        4. Recalcula el total del pedido.
        5. Commit único de toda la transacción.
        """
        # Validación: sesión activa
        self._get_sesion_abierta(db, data.id_sesion)

        # Crear cabecera del pedido
        nuevo_pedido = Pedido(
            id_sesion=data.id_sesion,
            id_mesero=data.id_mesero,
            id_mesa=data.id_mesa,
            cubiertos=data.cubiertos,
            estado_pedido="Pendiente",
            subtotal=Decimal("0.00"),
            impuestos=Decimal("0.00"),
            descuentos=Decimal("0.00"),
            total=Decimal("0.00"),
        )
        db.add(nuevo_pedido)
        db.flush()  # Necesario para obtener nuevo_pedido.id antes del commit

        # Crear detalles (cada uno hace flush internamente)
        for item in data.detalles:
            detalle = detalle_service.crear_detalle(db, nuevo_pedido.id, item)
            nuevo_pedido.detalles.append(detalle)

        # Recalcular totales con los detalles ya en memoria
        self._recalcular_totales(nuevo_pedido)

        try:
            db.commit()
            db.refresh(nuevo_pedido)
            return nuevo_pedido
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear el pedido: {e}"
            )

    # ------------------------------------------------------------------
    # Actualización de estado / datos del pedido
    # ------------------------------------------------------------------

    def update(self, db: Session, pedido_id: int, data: PedidoUpdate) -> Pedido:
        """
        Actualiza estado, mesero o mesa de un pedido.
        No permite modificar pedidos ya 'Pagado' o 'Anulado'.
        """
        pedido = self._get_or_404(db, pedido_id)

        if pedido.estado_pedido in ("Pagado", "Anulado"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"No se puede modificar un pedido en estado '{pedido.estado_pedido}'."
            )

        update_data = data.model_dump(exclude_unset=True)
        if "estado_pedido" in update_data and update_data["estado_pedido"] is not None:
            update_data["estado_pedido"] = update_data["estado_pedido"].value

        for key, value in update_data.items():
            setattr(pedido, key, value)

        try:
            db.commit()
            db.refresh(pedido)
            return pedido
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar el pedido: {e}"
            )

    # ------------------------------------------------------------------
    # Registro de pagos (cobro del pedido)
    # ------------------------------------------------------------------

    def registrar_pago(self, db: Session, pedido_id: int, pagos: List[dict]) -> Pedido:
        """
        Cobra un pedido registrando uno o más métodos de pago.

        Parámetros:
            pagos: lista de dicts con {metodo_pago, monto}.
                   Ejemplo pagos fraccionados:
                   [{"metodo_pago": "Efectivo", "monto": 50},
                    {"metodo_pago": "QR",       "monto": 30}]

        Validaciones:
        1. El pedido debe estar en estado 'Pendiente' o 'Servido'.
        2. La suma de los montos de pago debe cubrir exactamente el total del pedido.

        Ejecución:
        - Genera un MovimientoCaja (Ingreso / Venta) por cada método de pago.
        - Marca el pedido como 'Pagado'.
        """
        from app.services.movimiento_caja_service import MovimientoCajaService
        from app.schemas.movimiento_caja_schema import MovimientoCajaCreate

        pedido = self._get_or_404(db, pedido_id)

        # Validación 1: estado válido para cobro
        ESTADOS_COBRABLES = ("Pendiente", "Servido")
        if pedido.estado_pedido not in ESTADOS_COBRABLES:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El pedido está en estado '{pedido.estado_pedido}' y no puede cobrarse. "
                       f"Solo se permiten pedidos en estados: {ESTADOS_COBRABLES}."
            )

        # Validación 2: la suma de pagos debe cubrir el total
        total_pagado = sum(Decimal(str(p["monto"])) for p in pagos)
        if total_pagado != pedido.total:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"La suma de los pagos ({total_pagado}) no coincide con el total "
                       f"del pedido ({pedido.total}). Ajuste los montos antes de confirmar."
            )

        # Obtener la sesión activa del pedido para vincular los movimientos
        mov_service = MovimientoCajaService()

        for pago in pagos:
            movimiento_data = MovimientoCajaCreate(
                id_sesion=pedido.id_sesion,
                id_pedido=pedido.id,
                tipo_movimiento="Ingreso",
                concepto="Venta",
                metodo_pago=pago["metodo_pago"],
                monto=Decimal(str(pago["monto"])),
            )
            mov_service.crear_movimiento(db, movimiento_data)

        # Marcar pedido como pagado
        pedido.estado_pedido = "Pagado"

        try:
            db.commit()
            db.refresh(pedido)
            return pedido
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al registrar el pago: {e}"
            )

    # ------------------------------------------------------------------
    # Anulación de pedido
    # ------------------------------------------------------------------

    def anular_pedido(self, db: Session, pedido_id: int) -> Pedido:
        """
        Anula un pedido. No se pueden anular pedidos ya 'Pagado'.
        """
        pedido = self._get_or_404(db, pedido_id)

        if pedido.estado_pedido == "Pagado":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede anular un pedido que ya fue pagado. "
                       "Contacte a un administrador para gestionarlo como devolución."
            )
        if pedido.estado_pedido == "Anulado":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El pedido ya está anulado."
            )

        pedido.estado_pedido = "Anulado"
        try:
            db.commit()
            db.refresh(pedido)
            return pedido
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al anular el pedido: {e}"
            )
