from typing import List
from datetime import date, timedelta
from app.schemas.alert import AlertaResponse
from sqlalchemy.orm import Session
# Importa tus servicios de entidad (asumo que estas clases son los servicios)
from app.services.request_service import RequestService 
from app.services.shift_service import ShiftService 
from app.services.document_service import Document
from app.services.employee_service import Employee
from app.services.payroll_period_service import PayrollPeriod
from app.services.training_service import Training


class HRGatewayService:
    def __init__(self, db: Session):
        # Inicializa tus servicios de entidad aquí.
        # CRÍTICO: Asegurarse que todos los servicios necesarios estén inicializados
        self.request_service = RequestService(db) 
        self.shift_service = ShiftService(db)
        self.document_service = Document(db) 
        self.employee_service = Employee(db) 
        self.payroll_period_service = PayrollPeriod(db) 
        self.training_service = Training(db) 
        

    # --- 2.A: Lógica para MÉTRICAS (KPIs) ---
    async def get_resumen_stats(self, db: Session) -> dict: # CR: Añadir db: Session
        """
        Consolida las métricas clave de diferentes servicios. 
        Este método es para la ruta GET /rh/stats/resumen
        """
        # 1. Obtener métricas de Empleados
        # CR: Pasar db=db a los métodos del servicio de Empleados
        total_empleados_activos = await self.employee_service.count_active(db=db)
        promedio_desempeno = await self.employee_service.get_average_performance(db=db) 
        
        # 2. Obtener métricas de Nómina
        # CR: Corregir nombre del servicio y método
        proximo_periodo = self.payroll_period_service.get_next_closure_period(db=db)
        
        proximo_cierre_nomina = proximo_periodo.fecha_corte_revision if proximo_periodo else None

        # 3. Consolidar y devolver un diccionario para QuickStats.jsx
        return {
            "total_activos": total_empleados_activos,
            "promedio_desempeño": promedio_desempeno,
            "proximo_cierre_nomina": proximo_cierre_nomina.isoformat() if proximo_cierre_nomina else "N/A",
            # ... agregar otras métricas
        }

    # --- 2.B: Lógica para ALERTAS (Consolidación Unificada) ---
    async def get_pending_alerts(self, db: Session) -> List[AlertaResponse]: # CR: Añadir db: Session
        """
        Llama a la lógica de detección de alertas de cada servicio y unifica el resultado.
        Este método es para la ruta GET /rh/alertas/pendientes
        """
        todas_las_alertas: List[AlertaResponse] = []
        
        # CR: Asegurar que se pasa 'db' en todas las llamadas internas
        
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
        """
        Lógica para mapear Solicitudes Pendientes a AlertaResponse.
        """
        pending_requests = self.request_service.get_pending_requests(db=db) 
        
        alertas: List[AlertaResponse] = []
        today = date.today()
        
        # 2. Mapear cada Solicitud Pendiente al esquema unificado AlertaResponse
        for req in pending_requests:
            
            # Cálculo simple de prioridad: si la solicitud es en el futuro cercano (ej. 7 días), es más ALTA.
            # CR: Asegurar que fecha_inicio existe y es de tipo date antes de la resta
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
        """
        Lógica para mapear Turnos sin cubrir a AlertaResponse.
        Alerta CRÍTICA si el turno es inminente.
        """
        # Definimos 7 días como el umbral para considerar un turno como 'inminente'
        uncovered_shifts = self.shift_service.get_uncovered_shifts_in_future(db=db, days_ahead=7)
        
        alertas: List[AlertaResponse] = []
        today = date.today()
        
        for shift in uncovered_shifts:
            # Calcular la diferencia de días para establecer la prioridad
            dias_hasta_turno = (shift.fecha - today).days
            
            # Si faltan 3 días o menos, es CRÍTICA
            if dias_hasta_turno <= 3:
                prioridad = 'CRITICA'
            else:
                prioridad = 'ALTA'

            alertas.append(AlertaResponse(
                id_entidad=shift.id,
                origen='SHIFT',
                descripcion=f"Turno de {shift.puesto_requerido} sin cubrir para el {shift.fecha.strftime('%d/%m')}.",
                prioridad=prioridad,
                fecha_referencia=shift.fecha # La fecha clave es la fecha del turno
            ))
            
        return alertas
        
    async def _generate_compliance_alerts(self, db: Session) -> List[AlertaResponse]:
        """
        Lógica para mapear alertas de Documentos (Vencimiento, Aprobación) y Training.
        """
        todas_alertas: List[AlertaResponse] = []
        today = date.today()
        
        # ------------------------------------------------
        # A. Alertas de Documentos
        # ------------------------------------------------
        
        # Usa un umbral de 30 días para alertas de baja/media prioridad
        documentos_problema = self.document_service.get_compliance_alerts(db=db, expiration_days_threshold=30)
        
        for doc in documentos_problema:
            prioridad = 'MEDIA' # Prioridad base
            descripcion = f"Documento '{doc.tipo}' requiere atención."
            fecha_ref = doc.fecha_vencimiento if doc.fecha_vencimiento else today

            if doc.aprobado_admin == False:
                # Alerta de aprobación pendiente
                prioridad = 'ALTA'
                descripcion = f"Documento '{doc.tipo}' pendiente de APROBACIÓN administrativa."
            
            if doc.fecha_vencimiento and doc.fecha_vencimiento <= today:
                # Alerta de vencimiento (ya expirado)
                prioridad = 'CRITICA'
                descripcion = f"Documento '{doc.tipo}' HA EXPIRADO el {doc.fecha_vencimiento.strftime('%d/%m/%Y')}."
                fecha_ref = doc.fecha_vencimiento

            elif doc.fecha_vencimiento and (doc.fecha_vencimiento - today).days <= 7:
                # Alerta de vencimiento inminente (menos de 7 días)
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
            
        # ------------------------------------------------
        # B. Alertas de Training (Lógica completa)
        # ------------------------------------------------
        
        trainings_problema = self.training_service.get_pending_or_expired_trainings(db=db, expiration_days_threshold=60)
        
        for trn in trainings_problema:
            dias_restantes = (trn.fecha_limite - today).days if trn.fecha_limite else 365 # Manejo defensivo
            
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
        """
        Lógica para mapear alertas de Períodos de Nómina próximos a corte.
        """
        alertas: List[AlertaResponse] = []
        today = date.today()
        
        # Obtener el próximo período de corte pendiente
        proximo_periodo = self.payroll_period_service.get_next_closure_period(db=db)

        if proximo_periodo:
            fecha_corte = proximo_periodo.fecha_corte_revision
            dias_restantes = (fecha_corte - today).days

            if dias_restantes <= 0:
                # El corte es hoy o ya pasó: CRÍTICA
                prioridad = 'CRITICA'
                descripcion = f"Corte de Nómina '{proximo_periodo.nombre_periodo}' VENCIDO. Acción urgente requerida."
            elif dias_restantes <= 5:
                # Menos de 5 días: ALTA
                prioridad = 'ALTA'
                descripcion = f"Corte de Nómina '{proximo_periodo.nombre_periodo}' en {dias_restantes} días (Fecha: {fecha_corte.strftime('%d/%m')})."
            else:
                # Más de 5 días: MEDIA
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
