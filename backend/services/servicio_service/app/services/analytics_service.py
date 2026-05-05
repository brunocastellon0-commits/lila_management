"""
analytics_service.py — Servicio de analítica para el Dashboard.

Consulta agregaciones sobre MovimientoCaja, Pedido y Mesa
para producir los KPIs que consume el Dashboard.jsx del frontend.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, extract
from decimal import Decimal
from datetime import datetime, date, timedelta
from typing import List

from app.models.movimiento_caja import MovimientoCaja
from app.models.pedido_model import Pedido
from app.models.mesa_model import Mesa
from app.schemas.analytics_schema import (
    IngresosPorHora,
    IngresosPorDia,
    ResumenDashboard,
)


class AnalyticsService:
    """
    Servicio de analítica y KPIs del Dashboard de servicio.

    Todas las consultas son de solo lectura (no modifican estado).
    Se basan en MovimientoCaja (concepto=Venta) para los ingresos,
    ya que es la fuente autoritativa de flujos de dinero.
    """

    # Estados de pedido considerados "activos"
    ESTADOS_ACTIVOS = ("Pendiente", "En Preparacion", "Servido")

    # ------------------------------------------------------------------
    # Ingresos por hora (hoy)
    # ------------------------------------------------------------------

    def ingresos_hoy(self, db: Session) -> List[IngresosPorHora]:
        """
        Retorna el total de ingresos agrupados por hora del día actual.
        Solo considera movimientos de tipo 'Ingreso' con concepto 'Venta'.

        Returns:
            Lista de {hora: int, total: Decimal} con las 24 horas.
            Las horas sin movimientos retornan total=0.
        """
        hoy = date.today()

        # Agrupar ventas por hora
        resultados = (
            db.query(
                extract("hour", MovimientoCaja.fecha_movimiento).label("hora"),
                func.coalesce(func.sum(MovimientoCaja.monto), 0).label("total"),
            )
            .filter(
                cast(MovimientoCaja.fecha_movimiento, Date) == hoy,
                MovimientoCaja.tipo_movimiento == "Ingreso",
                MovimientoCaja.concepto == "Venta",
            )
            .group_by("hora")
            .order_by("hora")
            .all()
        )

        # Construir respuesta completa con las 24 horas
        mapa = {int(r.hora): Decimal(str(r.total)) for r in resultados}
        return [
            IngresosPorHora(hora=h, total=mapa.get(h, Decimal("0.00")))
            for h in range(24)
        ]

    # ------------------------------------------------------------------
    # Ingresos por día (últimos 7 días)
    # ------------------------------------------------------------------

    def ingresos_semana(self, db: Session) -> List[IngresosPorDia]:
        """
        Retorna el total de ingresos agrupados por día para los últimos 7 días.

        Returns:
            Lista de 7 elementos {dia: 'YYYY-MM-DD', total: Decimal},
            ordenados del más antiguo al más reciente.
        """
        hoy = date.today()
        hace_7_dias = hoy - timedelta(days=6)

        resultados = (
            db.query(
                cast(MovimientoCaja.fecha_movimiento, Date).label("dia"),
                func.coalesce(func.sum(MovimientoCaja.monto), 0).label("total"),
            )
            .filter(
                cast(MovimientoCaja.fecha_movimiento, Date) >= hace_7_dias,
                cast(MovimientoCaja.fecha_movimiento, Date) <= hoy,
                MovimientoCaja.tipo_movimiento == "Ingreso",
                MovimientoCaja.concepto == "Venta",
            )
            .group_by("dia")
            .order_by("dia")
            .all()
        )

        # Construir mapa por fecha y rellenar días sin ventas con 0
        mapa = {str(r.dia): Decimal(str(r.total)) for r in resultados}
        dias = []
        for i in range(7):
            dia = hace_7_dias + timedelta(days=i)
            dias.append(
                IngresosPorDia(dia=str(dia), total=mapa.get(str(dia), Decimal("0.00")))
            )
        return dias

    # ------------------------------------------------------------------
    # Resumen del Dashboard
    # ------------------------------------------------------------------

    def resumen_dashboard(self, db: Session) -> ResumenDashboard:
        """
        Calcula los KPIs consolidados del Dashboard.

        Incluye:
            - ingresos_dia: suma de ventas de hoy
            - pedidos_total: count de pedidos creados hoy
            - pedidos_activos: count de pedidos activos en este momento
            - mesas_ocupadas: count de mesas con estado Ocupado
            - mesas_total: total de mesas en el sistema
            - tiempo_promedio_min: promedio de duración de pedidos activos
        """
        hoy = date.today()

        # 1. Ingresos del día
        ingresos_hoy_result = (
            db.query(func.coalesce(func.sum(MovimientoCaja.monto), 0))
            .filter(
                cast(MovimientoCaja.fecha_movimiento, Date) == hoy,
                MovimientoCaja.tipo_movimiento == "Ingreso",
                MovimientoCaja.concepto == "Venta",
            )
            .scalar()
        )
        ingresos_dia = Decimal(str(ingresos_hoy_result))

        # 2. Pedidos de hoy (total)
        pedidos_total = (
            db.query(func.count(Pedido.id))
            .filter(cast(Pedido.fecha_creacion, Date) == hoy)
            .scalar()
        ) or 0

        # 3. Pedidos activos
        pedidos_activos = (
            db.query(func.count(Pedido.id))
            .filter(Pedido.estado_pedido.in_(self.ESTADOS_ACTIVOS))
            .scalar()
        ) or 0

        # 4. Mesas ocupadas y total
        mesas_ocupadas = (
            db.query(func.count(Mesa.id))
            .filter(Mesa.estado_actual == "Ocupado")
            .scalar()
        ) or 0

        mesas_total = db.query(func.count(Mesa.id)).scalar() or 0

        # 5. Tiempo promedio de pedidos activos (en minutos)
        ahora = datetime.utcnow()
        pedidos_activos_lista = (
            db.query(Pedido.fecha_creacion)
            .filter(Pedido.estado_pedido.in_(self.ESTADOS_ACTIVOS))
            .all()
        )

        tiempo_promedio_min = None
        if pedidos_activos_lista:
            duraciones = [
                (ahora - p.fecha_creacion).total_seconds() / 60
                for p in pedidos_activos_lista
                if p.fecha_creacion is not None
            ]
            if duraciones:
                tiempo_promedio_min = round(sum(duraciones) / len(duraciones), 1)

        return ResumenDashboard(
            ingresos_dia=ingresos_dia,
            pedidos_total=pedidos_total,
            pedidos_activos=pedidos_activos,
            mesas_ocupadas=mesas_ocupadas,
            mesas_total=mesas_total,
            tiempo_promedio_min=tiempo_promedio_min,
        )
