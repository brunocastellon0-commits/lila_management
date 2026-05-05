from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics_schema import IngresosPorHora, IngresosPorDia, ResumenDashboard
from app.services.analytics_service import AnalyticsService

router = APIRouter(redirect_slashes=False)


# ─── Resumen del Dashboard ─────────────────────────────────────────────────────

@router.get(
    "/resumen",
    response_model=ResumenDashboard,
    summary="KPIs del Dashboard",
    description=(
        "Retorna los indicadores clave del Dashboard: ingresos del día, "
        "pedidos activos, estado de mesas y tiempo promedio de servicio."
    ),
)
def resumen_dashboard(db: Session = Depends(get_db)):
    return AnalyticsService().resumen_dashboard(db)


# ─── Ingresos por hora (hoy) ───────────────────────────────────────────────────

@router.get(
    "/ingresos-hoy",
    response_model=List[IngresosPorHora],
    summary="Ingresos por hora del día actual",
    description=(
        "Retorna un array de 24 elementos (una por hora del día) con el "
        "total de ingresos por ventas de ese intervalo. Horas sin ventas retornan total=0."
    ),
)
def ingresos_hoy(db: Session = Depends(get_db)):
    return AnalyticsService().ingresos_hoy(db)


# ─── Ingresos por día (semana) ─────────────────────────────────────────────────

@router.get(
    "/ingresos-semana",
    response_model=List[IngresosPorDia],
    summary="Ingresos por día (últimos 7 días)",
    description=(
        "Retorna un array de 7 elementos con el total de ventas por día, "
        "ordenados del más antiguo al más reciente. Días sin ventas retornan total=0."
    ),
)
def ingresos_semana(db: Session = Depends(get_db)):
    return AnalyticsService().ingresos_semana(db)
