# rh_service/app/routers/hr_gateway_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.rh_service import HRGatewayService
from app.schemas.alert import AlertaResponse

router = APIRouter(
    prefix="/api/rh",
    tags=["HR Gateway"]
)

@router.get("/stats/resumen")
async def get_resumen_stats(db: Session = Depends(get_db)):
    """
    Endpoint para obtener el resumen de estadísticas consolidadas.
    Usado por QuickStats.jsx en el frontend.
    """
    gateway_service = HRGatewayService(db)
    stats = await gateway_service.get_resumen_stats(db)
    return stats

@router.get("/alertas/pendientes", response_model=List[AlertaResponse])
async def get_pending_alerts(db: Session = Depends(get_db)):
    """
    Endpoint para obtener todas las alertas pendientes consolidadas.
    Usado por AlertsPanel.jsx en el frontend.
    """
    gateway_service = HRGatewayService(db)
    alertas = await gateway_service.get_pending_alerts(db)
    return alertas