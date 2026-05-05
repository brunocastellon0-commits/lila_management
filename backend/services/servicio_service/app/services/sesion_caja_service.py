from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import datetime, timezone
from decimal import Decimal
from typing import List

from app.models.sesion_caja_model import SesionCaja
from app.models.caja_model import Caja
from app.schemas.sesion_caja_schema import SesionCajaCreate, SesionCajaCierre, SesionCajaUpdate


class SesionCajaService:
    """
    Lógica de negocio para la gestión de turnos de caja.

    Casos de uso principales:
        - Apertura de turno (con todas sus validaciones previas).
        - Cierre de turno (con cálculo automático y detección de descuadre).
        - Retiros de efectivo menores (delega a MovimientoCajaService).
    """

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _get_or_404(self, db: Session, sesion_id: int) -> SesionCaja:
        """Obtiene una sesión por ID o lanza 404."""
        sesion = db.query(SesionCaja).filter(SesionCaja.id == sesion_id).first()
        if not sesion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sesión de caja con ID {sesion_id} no encontrada."
            )
        return sesion

    def _get_sesion_abierta_por_caja(self, db: Session, id_caja: int) -> SesionCaja | None:
        """Retorna la sesión abierta de una caja, o None si no existe."""
        return db.query(SesionCaja).filter(
            SesionCaja.id_caja == id_caja,
            SesionCaja.estado == "Abierta"
        ).first()

    def _get_sesion_abierta_por_usuario(self, db: Session, id_usuario: int) -> SesionCaja | None:
        """Retorna la sesión abierta de un usuario en cualquier caja, o None."""
        return db.query(SesionCaja).filter(
            SesionCaja.id_usuario == id_usuario,
            SesionCaja.estado == "Abierta"
        ).first()

    def _calcular_saldo_efectivo(self, db: Session, sesion: SesionCaja) -> Decimal:
        """
        Calcula el saldo actual en efectivo de la sesión:
            saldo = monto_inicial
                  + Σ ingresos en efectivo
                  − Σ egresos en efectivo
        Solo considera movimientos en metodo_pago='Efectivo'.
        """
        from app.models.movimiento_caja import MovimientoCaja

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

    def get_by_id(self, db: Session, sesion_id: int) -> SesionCaja:
        return self._get_or_404(db, sesion_id)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[SesionCaja]:
        return db.query(SesionCaja).offset(skip).limit(limit).all()

    def get_sesion_activa_por_caja(self, db: Session, id_caja: int) -> SesionCaja:
        """Devuelve la sesión activa de una caja o lanza 404."""
        sesion = self._get_sesion_abierta_por_caja(db, id_caja)
        if not sesion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"La caja {id_caja} no tiene ninguna sesión abierta."
            )
        return sesion

    # ------------------------------------------------------------------
    # Apertura de caja
    # ------------------------------------------------------------------

    def abrir_sesion(self, db: Session, data: SesionCajaCreate) -> SesionCaja:
        """
        Apertura de turno de caja.

        Validaciones previas (en orden):
        1. La caja debe existir y estar en estado 'Activa'.
        2. La caja no debe tener ya una sesión 'Abierta'.
        3. El usuario no debe tener otra sesión abierta en ninguna otra caja.
        """
        # Validación 1: existencia y estado de la caja
        caja = db.query(Caja).filter(Caja.id == data.id_caja).first()
        if not caja:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Caja con ID {data.id_caja} no encontrada."
            )
        if caja.estado != "Activa":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La caja '{caja.nombre}' está inactiva y no puede abrirse."
            )

        # Validación 2: sesión ya abierta en esa caja
        if self._get_sesion_abierta_por_caja(db, data.id_caja):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La caja '{caja.nombre}' ya tiene una sesión abierta. "
                       "Debe cerrarse antes de iniciar un nuevo turno."
            )

        # Validación 3: usuario ya tiene sesión abierta en otra caja
        sesion_usuario = self._get_sesion_abierta_por_usuario(db, data.id_usuario)
        if sesion_usuario:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El usuario {data.id_usuario} ya tiene una sesión activa "
                       f"(ID: {sesion_usuario.id}) en la caja {sesion_usuario.id_caja}. "
                       "Debe cerrarla antes de abrir una nueva."
            )

        # Ejecución: crear la sesión
        nueva_sesion = SesionCaja(
            id_caja=data.id_caja,
            id_usuario=data.id_usuario,
            monto_inicial=data.monto_inicial,
            fecha_apertura=datetime.now(timezone.utc),
            estado="Abierta",
        )
        try:
            db.add(nueva_sesion)
            db.commit()
            db.refresh(nueva_sesion)
            return nueva_sesion
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al abrir la sesión de caja: {e}"
            )

    # ------------------------------------------------------------------
    # Cierre de caja
    # ------------------------------------------------------------------

    def cerrar_sesion(self, db: Session, sesion_id: int, data: SesionCajaCierre) -> SesionCaja:
        """
        Cierre de turno de caja.

        Validaciones previas:
        1. La sesión debe existir y estar 'Abierta'.
        2. No deben existir pedidos en curso (Pendiente / En Preparacion / Servido).

        Lógica de cierre:
        - Calcula monto_calculado_cierre = monto_inicial + ingresos efectivo − egresos efectivo.
        - Compara con monto_declarado_cierre del cajero.
        - Estado final: 'Cerrada' si coinciden, 'Descuadrada' si hay diferencia.
        """
        from app.models.pedido_model import Pedido

        sesion = self._get_or_404(db, sesion_id)

        # Validación 1: debe estar abierta
        if sesion.estado != "Abierta":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La sesión {sesion_id} no está abierta (estado actual: '{sesion.estado}')."
            )

        # Validación 2: no debe haber pedidos en curso
        ESTADOS_EN_CURSO = ["Pendiente", "En Preparacion", "Servido"]
        pedidos_en_curso = db.query(Pedido).filter(
            Pedido.id_sesion == sesion_id,
            Pedido.estado_pedido.in_(ESTADOS_EN_CURSO)
        ).count()

        if pedidos_en_curso > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Existen {pedidos_en_curso} pedido(s) en curso. "
                       "Debe pagar, anular o transferir todos los pedidos antes de cerrar la caja."
            )

        # Cálculo del monto del sistema
        monto_calculado = self._calcular_saldo_efectivo(db, sesion)
        monto_declarado = data.monto_declarado_cierre

        # Determinar estado final
        estado_cierre = "Cerrada" if monto_calculado == monto_declarado else "Descuadrada"

        # Persistir cierre
        sesion.monto_declarado_cierre = monto_declarado
        sesion.monto_calculado_cierre = monto_calculado
        sesion.fecha_cierre = datetime.now(timezone.utc)
        sesion.estado = estado_cierre

        try:
            db.commit()
            db.refresh(sesion)
            return sesion
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al cerrar la sesión de caja: {e}"
            )

    # ------------------------------------------------------------------
    # Actualización parcial (uso administrativo)
    # ------------------------------------------------------------------

    def update(self, db: Session, sesion_id: int, data: SesionCajaUpdate) -> SesionCaja:
        """Actualización administrativa de campos de una sesión."""
        sesion = self._get_or_404(db, sesion_id)
        update_data = data.model_dump(exclude_unset=True)

        if "estado" in update_data and update_data["estado"] is not None:
            update_data["estado"] = update_data["estado"].value

        for key, value in update_data.items():
            setattr(sesion, key, value)

        try:
            db.commit()
            db.refresh(sesion)
            return sesion
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la sesión: {e}"
            )
