# rh_service/app/services/hr_gateway_service.py

from typing import List
from datetime import date, timedelta
from app.schemas.alert import AlertaResponse
from sqlalchemy.orm import Session

# CORRECCIÓN: Importar los SERVICIOS, no los modelos
from app.services.request_service import RequestService 
from app.services.shift_service import ShiftService 
from app.services.document_service import DocumentService  # ❌ Antes: Document
from app.services.employee_service import EmployeeService  # ❌ Antes: Employee
from app.services.payroll_period_service import PayrollPeriodService  # ❌ Antes: PayrollPeriod
from app.services.training_service import TrainingService  # ❌ Antes: Training


class HRGatewayService:
    def __init__(self, db: Session):
        """
        Inicializa todos los servicios necesarios.
        NOTA: Los servicios NO reciben db en el constructor,
        se les pasa en cada método.
        """
        self.db = db
        # Instanciar servicios (sin pasar db al constructor)
        self.request_service = RequestService() 
        self.shift_service = ShiftService()
        self.document_service = DocumentService() 
        self.employee_service = EmployeeService() 
        self.payroll_period_service = PayrollPeriodService() 
        self.training_service = TrainingService()

    # --- MÉTRICAS (KPIs) ---
    async def get_resumen_stats(self, db: Session) -> dict:
        """
        Consolida las métricas clave de diferentes servicios. 
        Este método es para la ruta GET /rh/stats/resumen
        """
        # 1. Obtener total de empleados activos
        all_employees = self.employee_service.get_all_employees(db=db, skip=0, limit=10000)
        total_empleados_activos = len(all_employees)
        
        # 2. Obtener próximo cierre de nómina
        proximo_periodo = self.payroll_period_service.get_next_closure_period(db=db)
        proximo_cierre_nomina = proximo_periodo.fecha_corte_revision if proximo_periodo else None

        # 3. Obtener turnos sin cubrir hoy
        today = date.today()
        all_shifts_today = self.shift_service.get_shifts_by_date(db=db, target_date=today)
        turnos_sin_cubrir = len([s for s in all_shifts_today if not s.is_covered])
        turnos_cubiertos_hoy = len([s for s in all_shifts_today if s.is_covered])

        # 4. Obtener capacitaciones pendientes
        trainings_pendientes = self.training_service.get_pending_or_expired_trainings(
            db=db, expiration_days_threshold=60
        )
        capacitaciones_pendientes = len(trainings_pendientes)

        # 5. Calcular cumplimiento (documentos al día)
        all_docs = self.document_service.get_all_documents(db=db, skip=0, limit=10000)
        docs_aprobados = len([d for d in all_docs if d.aprobado_admin])
        cumplimiento_porcentaje = int((docs_aprobados / len(all_docs) * 100)) if all_docs else 100

        # 6. Consolidar y devolver
        return {
            "total_activos": total_empleados_activos,
            "proximo_cierre_nomina": proximo_cierre_nomina.isoformat() if proximo_cierre_nomina else None,
            "turnos_cubiertos_hoy": turnos_cubiertos_hoy,
            "turnos_sin_cubrir": turnos_sin_cubrir,
            "capacitaciones_activas": len(all_docs),  # Puedes ajustar esta lógica
            "capacitaciones_pendientes": capacitaciones_pendientes,
            "cumplimiento_porcentaje": cumplimiento_porcentaje,
        }

    # --- ALERTAS (Consolidación Unificada) ---
    async def get_pending_alerts(self, db: Session) -> List[AlertaResponse]:
        """
        Llama a la lógica de detección de alertas de cada servicio y unifica el resultado.
        Este método es para la ruta GET /rh/alertas/pendientes
        """
        todas_las_alertas: List[AlertaResponse] = []
        
        # 1. Alertas de Solicitudes (Request)
        alertas_request = await self._generate_request_alerts(db) 
        todas_las_alertas.extend(alertas_request)

        # 2. Alertas de Turnos (Shift)
        alertas_shift = await self._generate_shift_alerts(db)
        todas_las_alertas.extend(alertas_shift)
        
        # 3. Alertas de Documentos y Capacitaciones (Document, Training)
        alertas_compliance = await self._generate_compliance_alerts(db)
        todas_las_alertas.extend(alertas_compliance)

        # 4. Alertas de Nómina (PayrollPeriod)
        alertas_payroll = await self._generate_payroll_alerts(db)
        todas_las_alertas.extend(alertas_payroll)
        
        # Ordenar las alertas por prioridad (descendente) y luego por fecha (descendente)
        priority_map = {'CRITICA': 3, 'ALTA': 2, 'MEDIA': 1, 'BAJA': 0}
        todas_las_alertas.sort(key=lambda a: (priority_map[a.prioridad], a.fecha_referencia), reverse=True) 

        return todas_las_alertas

    async def _generate_request_alerts(self, db: Session) -> List[AlertaResponse]:
        """Lógica para mapear Solicitudes Pendientes a AlertaResponse."""
        pending_requests = self.request_service.get_pending_requests(db=db) 
        
        alertas: List[AlertaResponse] = []
        today = date.today()
        
        for req in pending_requests:
            if req.fecha_inicio and isinstance(req.fecha_inicio, date):
                urgencia_dias = (req.fecha_inicio - today).days
            else:
                urgencia_dias = 999 
            
            if urgencia_dias < 7:
                prioridad = 'CRITICA'
            elif urgencia_dias < 30:
                prioridad = 'ALTA'
            else:
                prioridad = 'MEDIA'
                    
            alertas.append(AlertaResponse(
                id_entidad=req.id,
                origen='REQUEST',
                descripcion=f"Solicitud de {req.tipo} (Inicia: {req.fecha_inicio}) pendiente de aprobación.",
                prioridad=prioridad,
                fecha_referencia=req.fecha_solicitud
            ))
                
        return alertas
        
    async def _generate_shift_alerts(self, db: Session) -> List[AlertaResponse]:
        """Lógica para mapear Turnos sin cubrir a AlertaResponse."""
        uncovered_shifts = self.shift_service.get_uncovered_shifts_in_future(db=db, days_ahead=7)
        
        alertas: List[AlertaResponse] = []
        today = date.today()
        
        for shift in uncovered_shifts:
            dias_hasta_turno = (shift.fecha - today).days
            
            if dias_hasta_turno <= 3:
                prioridad = 'CRITICA'
            else:
                prioridad = 'ALTA'

            alertas.append(AlertaResponse(
                id_entidad=shift.id,
                origen='SHIFT',
                descripcion=f"Turno de {shift.puesto_requerido} sin cubrir para el {shift.fecha.strftime('%d/%m')}.",
                prioridad=prioridad,
                fecha_referencia=shift.fecha
            ))
            
        return alertas
        
    async def _generate_compliance_alerts(self, db: Session) -> List[AlertaResponse]:
        """Lógica para mapear alertas de Documentos y Training."""
        todas_alertas: List[AlertaResponse] = []
        today = date.today()
        
        # A. Alertas de Documentos
        documentos_problema = self.document_service.get_compliance_alerts(db=db, expiration_days_threshold=30)
        
        for doc in documentos_problema:
            prioridad = 'MEDIA'
            descripcion = f"Documento '{doc.tipo}' requiere atención."
            fecha_ref = doc.fecha_vencimiento if doc.fecha_vencimiento else today

            if doc.aprobado_admin == False:
                prioridad = 'ALTA'
                descripcion = f"Documento '{doc.tipo}' pendiente de APROBACIÓN administrativa."
            
            if doc.fecha_vencimiento and doc.fecha_vencimiento <= today:
                prioridad = 'CRITICA'
                descripcion = f"Documento '{doc.tipo}' HA EXPIRADO el {doc.fecha_vencimiento.strftime('%d/%m/%Y')}."
                fecha_ref = doc.fecha_vencimiento

            elif doc.fecha_vencimiento and (doc.fecha_vencimiento - today).days <= 7:
                prioridad = 'ALTA'
                descripcion = f"Documento '{doc.tipo}' vence en {(doc.fecha_vencimiento - today).days} días."
                fecha_ref = doc.fecha_vencimiento

            todas_alertas.append(AlertaResponse(
                id_entidad=doc.id,
                origen='DOCUMENT',
                descripcion=descripcion,
                prioridad=prioridad,
                fecha_referencia=fecha_ref
            ))
            
        # B. Alertas de Training
        trainings_problema = self.training_service.get_pending_or_expired_trainings(db=db, expiration_days_threshold=60)
        
        for trn in trainings_problema:
            dias_restantes = (trn.fecha_limite - today).days if trn.fecha_limite else 365
            
            if dias_restantes < 0:
                prioridad = 'CRITICA'
                descripcion = f"Capacitación '{trn.nombre_capacitacion}' VENCIDA el {trn.fecha_limite.strftime('%d/%m/%Y')}."
            elif dias_restantes <= 15:
                prioridad = 'ALTA'
                descripcion = f"Capacitación '{trn.nombre_capacitacion}' vence en {dias_restantes} días."
            else:
                prioridad = 'MEDIA'
                descripcion = f"Capacitación '{trn.nombre_capacitacion}' pendiente (Límite: {trn.fecha_limite.strftime('%d/%m')})."

            todas_alertas.append(AlertaResponse(
                id_entidad=trn.id,
                origen='TRAINING',
                descripcion=descripcion,
                prioridad=prioridad,
                fecha_referencia=trn.fecha_limite if trn.fecha_limite else today
            ))
            
        return todas_alertas
        
    async def _generate_payroll_alerts(self, db: Session) -> List[AlertaResponse]:
        """Lógica para mapear alertas de Períodos de Nómina."""
        alertas: List[AlertaResponse] = []
        today = date.today()
        
        proximo_periodo = self.payroll_period_service.get_next_closure_period(db=db)

        if proximo_periodo:
            fecha_corte = proximo_periodo.fecha_corte_revision
            dias_restantes = (fecha_corte - today).days

            if dias_restantes <= 0:
                prioridad = 'CRITICA'
                descripcion = f"Corte de Nómina '{proximo_periodo.nombre_periodo}' VENCIDO. Acción urgente requerida."
            elif dias_restantes <= 5:
                prioridad = 'ALTA'
                descripcion = f"Corte de Nómina '{proximo_periodo.nombre_periodo}' en {dias_restantes} días (Fecha: {fecha_corte.strftime('%d/%m')})."
            else:
                prioridad = 'MEDIA'
                descripcion = f"Corte de Nómina '{proximo_periodo.nombre_periodo}' próximo. Revisar horas y componentes."
                
            alertas.append(AlertaResponse(
                id_entidad=proximo_periodo.id,
                origen='PAYROLL',
                descripcion=descripcion,
                prioridad=prioridad,
                fecha_referencia=fecha_corte
            ))
            
        return alertas