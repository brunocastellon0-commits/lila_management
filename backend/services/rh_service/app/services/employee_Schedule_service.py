# rh_service/app/services/employee_schedule_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import time, date, timedelta
from sqlalchemy.exc import IntegrityError

# Importa modelos y schemas
from app.models.employee_schedule import EmployeeSchedule
from app.schemas.schema_employee_schedule import EmployeeScheduleCreate, EmployeeScheduleUpdate, BulkScheduleCreate
from app.models.employee import Employee
from app.models.sucursal import Sucursal  # ← NUEVO: Para validar sucursal

class EmployeeScheduleService:
    """
    Contiene la lógica de negocio para las operaciones CRUD sobre el 
    patrón de horario semanal recurrente (EmployeeSchedule).
    """

    def get_schedule_by_id(self, db: Session, schedule_id: int) -> EmployeeSchedule:
        """
        Obtiene un patrón de horario por su ID.
        Lanza 404 si no se encuentra.
        """
        schedule = db.query(EmployeeSchedule).filter(EmployeeSchedule.id == schedule_id).first()
        if not schedule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Patrón de Horario con ID {schedule_id} no encontrado.")
        return schedule

    def get_schedules_by_employee(self, db: Session, employee_id: int) -> List[EmployeeSchedule]:
        """
        Obtiene todos los patrones de horario asociados a un empleado específico.
        """
        return db.query(EmployeeSchedule).filter(EmployeeSchedule.employee_id == employee_id).all()

    def get_schedules_by_sucursal(self, db: Session, sucursal_id: int) -> List[EmployeeSchedule]:
        """
        Obtiene todos los patrones de horario de una sucursal específica.
        """
        return db.query(EmployeeSchedule).filter(EmployeeSchedule.sucursal_id == sucursal_id).all()

    def get_all_schedules(self, db: Session, skip: int = 0, limit: int = 100) -> List[EmployeeSchedule]:
        """
        Obtiene una lista paginada de todos los patrones de horario.
        """
        return db.query(EmployeeSchedule).offset(skip).limit(limit).all()

    def create_schedule(self, db: Session, schedule_data: EmployeeScheduleCreate) -> EmployeeSchedule:
        """
        Crea un nuevo patrón de horario recurrente para un empleado.
        """
        # Verificar que el employee_id exista
        employee_exists = db.query(Employee).filter(Employee.id == schedule_data.employee_id).first()
        if not employee_exists:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                 detail=f"El empleado con ID {schedule_data.employee_id} no existe.")

        # Verificar que la sucursal exista
        sucursal_exists = db.query(Sucursal).filter(Sucursal.id == schedule_data.sucursal_id).first()
        if not sucursal_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"La sucursal con ID {schedule_data.sucursal_id} no existe.")

        # Validar que el empleado pertenezca a la sucursal
        if employee_exists.sucursal_id != schedule_data.sucursal_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="El empleado no pertenece a la sucursal seleccionada.")

        # Validar horas
        if schedule_data.hora_inicio_patron >= schedule_data.hora_fin_patron:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="La hora de inicio debe ser anterior a la hora de fin.")

        # Convertir lista de días a string para almacenar
        dias_semana_str = ','.join(map(str, schedule_data.dias_semana))

        # Verificar si ya existe un patrón similar para evitar duplicados
        existing_schedule = db.query(EmployeeSchedule).filter(
            EmployeeSchedule.employee_id == schedule_data.employee_id,
            EmployeeSchedule.dias_semana == dias_semana_str,
            EmployeeSchedule.es_actual == True
        ).first()

        if existing_schedule:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Ya existe un patrón de horario para estos días.")

        db_schedule = EmployeeSchedule(
            employee_id=schedule_data.employee_id,
            sucursal_id=schedule_data.sucursal_id,  # ← NUEVO
            nombre_horario=schedule_data.nombre_horario,
            dias_semana=dias_semana_str,  # ← CAMBIO: Ahora es string
            hora_inicio_patron=schedule_data.hora_inicio_patron,
            hora_fin_patron=schedule_data.hora_fin_patron,
            es_actual=schedule_data.es_actual,
            descripcion=schedule_data.descripcion  # ← NUEVO
        )
        
        try:
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)
            return db_schedule
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="Error de integridad. Verifique los datos ingresados.")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear el patrón de horario: {str(e)}")

    def update_schedule(self, db: Session, schedule_id: int, schedule_update: EmployeeScheduleUpdate) -> EmployeeSchedule:
        """
        Actualiza los campos de un patrón de horario existente.
        """
        db_schedule = self.get_schedule_by_id(db, schedule_id)
        update_data = schedule_update.model_dump(exclude_unset=True)
        
        # Validar FK si se intenta actualizar employee_id
        if 'employee_id' in update_data:
            employee_exists = db.query(Employee).filter(Employee.id == update_data['employee_id']).first()
            if not employee_exists:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                     detail=f"El nuevo ID de empleado {update_data['employee_id']} no existe.")
        
        # Validar FK si se intenta actualizar sucursal_id
        if 'sucursal_id' in update_data:
            sucursal_exists = db.query(Sucursal).filter(Sucursal.id == update_data['sucursal_id']).first()
            if not sucursal_exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail=f"La nueva sucursal con ID {update_data['sucursal_id']} no existe.")
            
        # Convertir dias_semana a string si se está actualizando
        if 'dias_semana' in update_data:
            update_data['dias_semana'] = ','.join(map(str, update_data['dias_semana']))
            
        # Validar horas si se están actualizando
        if 'hora_inicio_patron' in update_data or 'hora_fin_patron' in update_data:
            inicio = update_data.get('hora_inicio_patron', db_schedule.hora_inicio_patron)
            fin = update_data.get('hora_fin_patron', db_schedule.hora_fin_patron)
            
            if inicio >= fin:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="La hora de inicio debe ser anterior a la hora de fin.")

        # Copiar los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_schedule, key, value)
            
        try:
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)
            return db_schedule
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar patrón de horario: {str(e)}")

    def delete_schedule(self, db: Session, schedule_id: int) -> dict:
        """
        Elimina un patrón de horario de la base de datos.
        """
        db_schedule = self.get_schedule_by_id(db, schedule_id)
        
        db.delete(db_schedule)
        db.commit()
        return {"message": f"Patrón de Horario con ID {schedule_id} eliminado exitosamente."}

    # ============================================
    # NUEVOS MÉTODOS PARA HORARIOS RECURRENTES
    # ============================================

    def get_monthly_schedule(self, db: Session, employee_id: int, year: int, month: int) -> List[dict]:
        """
        Genera el horario mensual completo basado en los patrones recurrentes del empleado.
        """
        # Verificar que el empleado existe
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")

        # Obtener todos los patrones activos del empleado
        patterns = db.query(EmployeeSchedule).filter(
            EmployeeSchedule.employee_id == employee_id,
            EmployeeSchedule.es_actual == True
        ).all()

        monthly_schedule = []
        start_date = date(year, month, 1)
        
        # Calcular último día del mes
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        current_date = start_date
        while current_date <= end_date:
            # Día de la semana (1=Lunes, 7=Domingo)
            day_of_week = current_date.isoweekday()
            
            # Buscar patrón que aplique para este día
            for pattern in patterns:
                pattern_days = list(map(int, pattern.dias_semana.split(',')))
                if day_of_week in pattern_days:
                    monthly_schedule.append({
                        'date': current_date.isoformat(),
                        'day_name': current_date.strftime('%A'),
                        'start_time': pattern.hora_inicio_patron,
                        'end_time': pattern.hora_fin_patron,
                        'schedule_name': pattern.nombre_horario,
                        'sucursal_id': pattern.sucursal_id,
                        'employee_name': f"{employee.nombre} {employee.apellido}"
                    })
                    break
            
            current_date += timedelta(days=1)
        
        return monthly_schedule

    def create_bulk_schedules(self, db: Session, bulk_data: BulkScheduleCreate) -> dict:
        """
        Crea patrones de horario para múltiples empleados a la vez.
        """
        results = {
            'successful': [],
            'failed': [],
            'total_created': 0,
            'total_failed': 0
        }

        for employee_id in bulk_data.employee_ids:
            try:
                # Verificar que el empleado existe y pertenece a la sucursal
                employee = db.query(Employee).filter(Employee.id == employee_id).first()
                if not employee:
                    results['failed'].append({
                        'employee_id': employee_id,
                        'error': 'Empleado no encontrado'
                    })
                    continue

                if employee.sucursal_id != bulk_data.sucursal_id:
                    results['failed'].append({
                        'employee_id': employee_id,
                        'error': 'El empleado no pertenece a la sucursal seleccionada'
                    })
                    continue

                # Crear el patrón de horario
                schedule_data = EmployeeScheduleCreate(
                    employee_id=employee_id,
                    sucursal_id=bulk_data.sucursal_id,
                    nombre_horario=f"{bulk_data.nombre_base} - {employee.nombre}",
                    dias_semana=bulk_data.dias_semana,
                    hora_inicio_patron=bulk_data.hora_inicio_patron,
                    hora_fin_patron=bulk_data.hora_fin_patron,
                    descripcion=bulk_data.descripcion
                )

                schedule = self.create_schedule(db, schedule_data)
                results['successful'].append({
                    'employee_id': employee_id,
                    'schedule_id': schedule.id,
                    'employee_name': f"{employee.nombre} {employee.apellido}"
                })

            except Exception as e:
                results['failed'].append({
                    'employee_id': employee_id,
                    'error': str(e)
                })

        results['total_created'] = len(results['successful'])
        results['total_failed'] = len(results['failed'])
        
        return results

    def get_employee_schedules_by_sucursal(self, db: Session, sucursal_id: int, employee_id: int = None) -> List[EmployeeSchedule]:
        """
        Obtiene patrones de horario por sucursal, opcionalmente filtrado por empleado.
        """
        query = db.query(EmployeeSchedule).filter(EmployeeSchedule.sucursal_id == sucursal_id)
        
        if employee_id:
            query = query.filter(EmployeeSchedule.employee_id == employee_id)
            
        return query.all()