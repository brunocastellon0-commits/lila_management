# rh_service/app/services/employee_schedule_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import time
from sqlalchemy.exc import IntegrityError

# Importa modelos y schemas
from app.models.employee_schedule import EmployeeSchedule
from app.schemas.schema_employee_schedule import EmployeeScheduleCreate, EmployeeScheduleUpdate
from app.models.employee import Employee # Necesario para verificar la FK

class EmployeeScheduleService:
    """
    Contiene la lógica de negocio para las operaciones CRUD sobre el 
    patrón de horario semanal recurrente (EmployeeSchedule).
    """

    def get_schedule_by_id(self, db: Session, schedule_id: int) -> EmployeeSchedule:
        """
        Obtiene un segmento de horario semanal por su ID.
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

    def get_all_schedules(self, db: Session, skip: int = 0, limit: int = 100) -> List[EmployeeSchedule]:
        """
        Obtiene una lista paginada de todos los patrones de horario.
        """
        return db.query(EmployeeSchedule).offset(skip).limit(limit).all()

    def create_schedule(self, db: Session, schedule_data: EmployeeScheduleCreate) -> EmployeeSchedule:
        """
        Crea un nuevo patrón de horario semanal para un empleado.
        """
        # Verificar que el employee_id exista (FK)
        employee_exists = db.query(Employee).filter(Employee.id == schedule_data.employee_id).first()
        if not employee_exists:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                 detail=f"El empleado con ID {schedule_data.employee_id} no existe.")

        # Validar horas
        if schedule_data.hora_inicio_patron >= schedule_data.hora_fin_patron:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="La hora de inicio debe ser estrictamente anterior a la hora de fin del patrón.")

        db_schedule = EmployeeSchedule(
            employee_id=schedule_data.employee_id,
            nombre_horario=schedule_data.nombre_horario,
            dia_semana=schedule_data.dia_semana,
            hora_inicio_patron=schedule_data.hora_inicio_patron,
            hora_fin_patron=schedule_data.hora_fin_patron,
            es_actual=schedule_data.es_actual
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
        # Exclude_unset=True asegura que solo se procesen los campos que el usuario realmente envió.
        update_data = schedule_update.model_dump(exclude_unset=True)
        
        # Validar la FK si se intenta actualizar el employee_id
        if 'employee_id' in update_data:
            employee_exists = db.query(Employee).filter(Employee.id == update_data['employee_id']).first()
            if not employee_exists:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                     detail=f"El nuevo ID de empleado {update_data['employee_id']} no existe.")
            
        # Validar horas si se están actualizando
        if 'hora_inicio_patron' in update_data or 'hora_fin_patron' in update_data:
            # Usa el valor del ORM si no se proporciona en el update
            inicio = update_data.get('hora_inicio_patron', db_schedule.hora_inicio_patron)
            fin = update_data.get('hora_fin_patron', db_schedule.hora_fin_patron)
            
            if inicio >= fin:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="La hora de inicio debe ser anterior a la hora de fin tras la actualización.")

        # Copia los datos actualizados al objeto ORM
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
