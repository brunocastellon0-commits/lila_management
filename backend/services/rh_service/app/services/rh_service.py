from typing import List
from datetime import date, timedelta
from app.schemas.alert import AlertaResponse, ResumenStatsResponse 
from sqlalchemy.orm import Session

# Importar los servicios (asumiendo que estos paths son correctos)
from app.services.request_service import RequestService 
from app.services.shift_service import ShiftService 
from app.services.document_service import DocumentService 
from app.services.employee_service import EmployeeService 
from app.services.payroll_period_service import PayrollPeriodService 
from app.services.training_service import TrainingService 


class HRGatewayService:
    def __init__(self, db: Session):
        """
        Inicializa todos los servicios necesarios.
        """
        self.db = db
        self.request_service = RequestService() 
        self.shift_service = ShiftService()
        self.document_service = DocumentService() 
        self.employee_service = EmployeeService() 
        self.payroll_period_service = PayrollPeriodService() 
        self.training_service = TrainingService()

    # --- FUNCIÓN CORREGIDA ---
    async def get_resumen_stats(self) -> ResumenStatsResponse:
        """
        Consolida las métricas clave para el dashboard principal (8 métricas esperadas por React).
        """
        db = self.db 
        
        # 1. Empleados
        all_employees = self.employee_service.get_all_employees(db=db, skip=0, limit=10000)
        total_employees = len(all_employees)
        
        # Calcular empleados añadidos este mes (asumiendo que el servicio tiene un método para esto)
        # Mocking for illustration:
        employees_added_month = 3 
        
        # 2. Turnos
        today = date.today()
        all_shifts_today = self.shift_service.get_shifts_by_date(db=db, target_date=today)
        pending_shifts = len([s for s in all_shifts_today if not s.is_covered])
        shifts_today = len([s for s in all_shifts_today if s.is_covered])

        # 3. Capacitaciones
        # Necesitamos el total de capacitaciones activas
        all_trainings = self.training_service.get_all_trainings(db=db, skip=0, limit=1000)
        active_trainings = len(all_trainings)
        
        # Necesitamos las capacitaciones por vencer (ya calculado como 'pendientes' en el original)
        expiring_trainings_list = self.training_service.get_pending_or_expired_trainings(
            db=db, expiration_days_threshold=60
        )
        expiring_trainings = len(expiring_trainings_list)

        # 4. Cumplimiento
        all_docs = self.document_service.get_all_documents(db=db, skip=0, limit=10000)
        
        # Cálculo de cumplimiento actual
        compliance_rate = 100 
        if all_docs:
            docs_aprobados = len([d for d in all_docs if d.aprobado_admin])
            compliance_rate = int((docs_aprobados / len(all_docs) * 100))
            
        # Cálculo de cambio de cumplimiento vs mes anterior (Mocking, ya que requiere DB)
        # Esto debería venir de una tabla histórica, pero lo simulamos para que el Front-end funcione.
        compliance_change = 2 # Simulando +2%

        # 5. Consolidar, INSTANCIAR el modelo Pydantic y devolver
        # NOTA: Los nombres de los campos aquí deben coincidir con la definición de ResumenStatsResponse
        # que a su vez DEBE COINCIDIR con los nombres en camelCase que usa el front-end (total_employees, etc.)
        return ResumenStatsResponse(
            # CAMPOS VITALES PARA EL FRONT-END DE REACT
            total_employees=total_employees, # Mapea a total_employees en React
            employees_added_month=employees_added_month, # Mapea a employees_added_month en React
            shifts_today=shifts_today, # Mapea a shifts_today en React
            pending_shifts=pending_shifts, # Mapea a pending_shifts en React
            active_trainings=active_trainings, # Mapea a active_trainings en React
            expiring_trainings=expiring_trainings, # Mapea a expiring_trainings en React
            compliance_rate=compliance_rate, # Mapea a compliance_rate en React
            compliance_change=compliance_change, # Mapea a compliance_change en React
            
            # Puedes incluir otros campos si los necesitas, como el próximo cierre de nómina
            proximo_cierre_nomina=self.payroll_period_service.get_next_closure_period(db=db).fecha_corte_revision if self.payroll_period_service.get_next_closure_period(db=db) else None,
        )


    # --- ALERTAS (Consolidación Unificada) ---
    async def get_pending_alerts(self) -> List[AlertaResponse]:
        """
        Llama a la lógica de detección de alertas de cada servicio y unifica el resultado.
        """
        db = self.db 
        
        todas_las_alertas: List[AlertaResponse] = []
        
        alertas_request = await self._generate_request_alerts(db) 
        todas_las_alertas.extend(alertas_request)

        alertas_shift = await self._generate_shift_alerts(db)
        todas_las_alertas.extend(alertas_shift)
        
        alertas_compliance = await self._generate_compliance_alerts(db)
        todas_las_alertas.extend(alertas_compliance)

        alertas_payroll = await self._generate_payroll_alerts(db)
        todas_las_alertas.extend(alertas_payroll)
        
        priority_map = {'CRITICA': 3, 'ALTA': 2, 'MEDIA': 1, 'BAJA': 0}
        todas_las_alertas.sort(key=lambda a: (priority_map[a.prioridad], a.fecha_referencia), reverse=True) 

        return todas_las_alertas

    # --- MÉTODOS PRIVADOS (sin cambios significativos) ---
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
