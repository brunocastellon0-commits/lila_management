from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from decimal import Decimal
from typing import List

from app.models.movimiento_caja import MovimientoCaja
from app.models.sesion_caja_model import SesionCaja
from app.schemas.movimiento_caja_schema import MovimientoCajaCreate, MovimientoCajaUpdate


class MovimientoCajaService:
    """
    Lógica de negocio para los movimientos de caja.

    Responsabilidades:
        1. Registrar ingresos (ventas, propinas).
        2. Registrar egresos (retiros para caja menor, proveedores).
        3. Listar y consultar movimientos de una sesión.

    La validación de cuadre de caja al cierre la hace SesionCajaService,
    que llama a _calcular_saldo_efectivo internamente.
    """

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _get_or_404(self, db: Session, movimiento_id: int) -> MovimientoCaja:
        mov = db.query(MovimientoCaja).filter(MovimientoCaja.id == movimiento_id).first()
        if not mov:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movimiento de caja con ID {movimiento_id} no encontrado."
            )
        return mov

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
                detail=f"La sesión {id_sesion} no está abierta. "
                       "No se pueden registrar movimientos en sesiones cerradas."
            )
        return sesion

    def _calcular_saldo_efectivo_actual(self, db: Session, sesion: SesionCaja) -> Decimal:
        """
        Calcula el saldo actual en efectivo de la sesión:
            saldo = monto_inicial
                  + Σ ingresos en efectivo
                  − Σ egresos en efectivo
        """
        movimientos = db.query(MovimientoCaja).filter(
            MovimientoCaja.id_sesion == sesion.id,
            MovimientoCaja.metodo_pago == "Efectivo"
        ).all()

        ingresos = sum(m.monto for m in movimientos if m.tipo_movimiento == "Ingreso")
        egresos = sum(m.monto for m in movimientos if m.tipo_movimiento == "Egreso")

        return sesion.monto_inicial + ingresos - egresos

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def get_by_id(self, db: Session, movimiento_id: int) -> MovimientoCaja:
        return self._get_or_404(db, movimiento_id)

    def get_by_sesion(
        self, db: Session, id_sesion: int, skip: int = 0, limit: int = 200
    ) -> List[MovimientoCaja]:
        """Lista todos los movimientos de una sesión, más recientes primero."""
        return db.query(MovimientoCaja).filter(
            MovimientoCaja.id_sesion == id_sesion
        ).order_by(MovimientoCaja.fecha_movimiento.desc()).offset(skip).limit(limit).all()

    def get_resumen_sesion(self, db: Session, id_sesion: int) -> dict:
        """
        Devuelve un resumen financiero de la sesión agrupado por método de pago.
        Útil para el reporte de cierre de turno en el frontend.
        """
        movimientos = self.get_by_sesion(db, id_sesion, limit=10000)

        resumen: dict = {
            "total_ingresos": Decimal("0.00"),
            "total_egresos": Decimal("0.00"),
            "por_metodo": {},
        }

        for m in movimientos:
            metodo = m.metodo_pago
            if metodo not in resumen["por_metodo"]:
                resumen["por_metodo"][metodo] = {"ingresos": Decimal("0.00"), "egresos": Decimal("0.00")}

            if m.tipo_movimiento == "Ingreso":
                resumen["total_ingresos"] += m.monto
                resumen["por_metodo"][metodo]["ingresos"] += m.monto
            else:
                resumen["total_egresos"] += m.monto
                resumen["por_metodo"][metodo]["egresos"] += m.monto

        return resumen

    # ------------------------------------------------------------------
    # Creación de movimiento (ingreso o egreso genérico)
    # ------------------------------------------------------------------

    def crear_movimiento(self, db: Session, data: MovimientoCajaCreate) -> MovimientoCaja:
        """
        Registra un movimiento de caja (ingreso o egreso).

        Validaciones:
        1. La sesión debe estar 'Abierta'.
        2. El monto debe ser mayor a cero (validado en el schema, pero reforzado aquí).

        Nota: este método NO hace db.commit(). El llamador (PedidoService
        o el endpoint directo) es responsable del commit, lo que permite
        agrupar múltiples movimientos fraccionados en una sola transacción.
        """
        sesion = self._get_sesion_abierta(db, data.id_sesion)

        if data.monto <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El monto del movimiento debe ser mayor a cero."
            )

        movimiento = MovimientoCaja(
            id_sesion=data.id_sesion,
            id_pedido=data.id_pedido,
            tipo_movimiento=data.tipo_movimiento.value,
            concepto=data.concepto.value,
            metodo_pago=data.metodo_pago.value,
            monto=data.monto,
        )
        db.add(movimiento)
        db.flush()  # El commit lo hace el llamador
        return movimiento

    # ------------------------------------------------------------------
    # Retiro de caja menor (egreso en efectivo sin pedido)
    # ------------------------------------------------------------------

    def registrar_retiro(
        self,
        db: Session,
        id_sesion: int,
        monto: Decimal,
        concepto: str,
    ) -> MovimientoCaja:
        """
        Registra un retiro de efectivo de la caja (caja menor o proveedores).

        Validaciones específicas de retiro:
        1. La sesión debe estar 'Abierta'.
        2. El monto > 0.
        3. El saldo de efectivo disponible en la caja debe ser suficiente
           para cubrir el retiro (evita saldos negativos en caja física).
        """
        from app.schemas.movimiento_caja_schema import ConceptoMovimiento, MetodoPago, TipoMovimiento

        sesion = self._get_sesion_abierta(db, id_sesion)

        # Validación de monto
        if monto <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El monto del retiro debe ser mayor a cero."
            )

        # Validación de saldo suficiente
        saldo_actual = self._calcular_saldo_efectivo_actual(db, sesion)
        if monto > saldo_actual:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Saldo insuficiente en caja. Saldo actual en efectivo: {saldo_actual:.2f}. "
                       f"Retiro solicitado: {monto:.2f}."
            )

        # Determinar concepto (normalizar texto a enum válido)
        concepto_enum = ConceptoMovimiento.retiro_caja_menor
        if "proveedor" in concepto.lower():
            concepto_enum = ConceptoMovimiento.retiro_proveedores

        movimiento_data = MovimientoCajaCreate(
            id_sesion=id_sesion,
            id_pedido=None,
            tipo_movimiento=TipoMovimiento.egreso,
            concepto=concepto_enum,
            metodo_pago=MetodoPago.efectivo,
            monto=monto,
        )

        movimiento = self.crear_movimiento(db, movimiento_data)

        try:
            db.commit()
            db.refresh(movimiento)
            return movimiento
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al registrar el retiro: {e}"
            )

    # ------------------------------------------------------------------
    # Actualización (uso administrativo / corrección)
    # ------------------------------------------------------------------

    def update(
        self, db: Session, movimiento_id: int, data: MovimientoCajaUpdate
    ) -> MovimientoCaja:
        """Corrección administrativa de un movimiento existente."""
        movimiento = self._get_or_404(db, movimiento_id)
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if hasattr(value, "value"):  # Es un enum
                value = value.value
            setattr(movimiento, key, value)

        try:
            db.commit()
            db.refresh(movimiento)
            return movimiento
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar el movimiento: {e}"
            )
