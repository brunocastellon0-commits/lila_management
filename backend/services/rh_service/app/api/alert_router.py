from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.rh_service import HRGatewayService
from app.schemas.alert import AlertaResponse, ResumenStatsResponse 

# ✅ CORRECCIÓN: Usar prefijo vacío porque se agrega en base.py
router = APIRouter(
    tags=["Alertas y Dashboard"]
)

# --------------------------------------------------------------------
# DEPENDENCIA: Inyección de HRGatewayService
# --------------------------------------------------------------------
def get_gateway_service(db: Session = Depends(get_db)) -> HRGatewayService:
    """Proporciona la instancia de HRGatewayService con la DB inyectada."""
    return HRGatewayService(db)

# --------------------------------------------------------------------
# RUTA 1: ESTADÍSTICAS DE RESUMEN
# Ruta completa: /alert/stats/resumen
# A través del gateway: http://localhost:7000/rh/stats/resumen
# --------------------------------------------------------------------
@router.get(
    "/stats/resumen", 
    response_model=ResumenStatsResponse, 
    summary="Obtiene el resumen de estadísticas consolidadas para el dashboard"
)
async def get_resumen_stats(
    gateway_service: HRGatewayService = Depends(get_gateway_service) 
):
    """
    Endpoint para obtener el resumen de estadísticas consolidadas.
    
    Retorna 8 métricas clave:
    - total_employees: Total de empleados activos
    - employees_added_month: Empleados agregados este mes
    - shifts_today: Turnos cubiertos hoy
    - pending_shifts: Turnos sin cubrir
    - active_trainings: Capacitaciones activas
    - expiring_trainings: Capacitaciones por vencer
    - compliance_rate: Porcentaje de cumplimiento
    - compliance_change: Cambio de cumplimiento vs mes anterior
    """
    try:
        stats = await gateway_service.get_resumen_stats() 
        return stats
    except Exception as e:
        # ✅ Log del error completo
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

# --------------------------------------------------------------------
# RUTA 2: ALERTAS PENDIENTES
# Ruta completa: /alert/alertas/pendientes
# A través del gateway: http://localhost:7000/rh/alertas/pendientes
# --------------------------------------------------------------------
@router.get(
    "/alertas/pendientes", 
    response_model=List[AlertaResponse],
    summary="Obtiene todas las alertas pendientes consolidadas"
)
async def get_pending_alerts(
    gateway_service: HRGatewayService = Depends(get_gateway_service)
):
    """
    Endpoint para obtener todas las alertas pendientes consolidadas.
    
    Consolida alertas de:
    - REQUEST: Solicitudes pendientes de aprobación
    - SHIFT: Turnos sin cubrir
    - DOCUMENT: Documentos pendientes o por vencer
    - TRAINING: Capacitaciones pendientes
    - PAYROLL: Cierres de nómina próximos
    """
    try:
        alertas = await gateway_service.get_pending_alerts()
        return alertas
    except Exception as e:
        # ✅ Log del error completo
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener alertas: {str(e)}"
        )