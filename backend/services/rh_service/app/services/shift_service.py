# rh_service/app/services/shift_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import time, date, timedelta
from sqlalchemy.exc import IntegrityError

# Importa modelos y schemas
from app.models.shift import Shift
from app.models.employee import Employee
from app.schemas.schema_shift import ShiftCreate, ShiftUpdate, ShiftAssign


class ShiftService:
    """
    Contiene la lógica de negocio para las operaciones CRUD sobre los 
    Turnos de Trabajo (Shift), incluyendo la asignación de empleados.
    """

    def get_shift_by_id(self, db: Session, shift_id: int) -> Shift:
        """
        Obtiene un turno por su ID.
        Lanza 404 si no se encuentra.
        """
        shift = db.query(Shift).filter(Shift.id == shift_id).first()
        if not shift:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Turno con ID {shift_id} no encontrado.")
        return shift

    def get_shifts_by_employee(self, db: Session, employee_id: int) -> List[Shift]:
        """
        Obtiene todos los turnos asignados a un empleado específico.
        """
        return db.query(Shift).filter(Shift.assigned_employee_id == employee_id).all()

    def get_shifts_by_date(self, db: Session, target_date: date) -> List[Shift]:
        """
        Obtiene todos los turnos programados para una fecha específica.
        """
        return db.query(Shift).filter(Shift.fecha == target_date).all()

    def get_all_shifts(self, db: Session, skip: int = 0, limit: int = 100) -> List[Shift]:
        """
        Obtiene una lista paginada de todos los turnos.
        """
        return db.query(Shift).offset(skip).limit(limit).all()

    def _validate_shift_times(self, start_time: time, end_time: time):
        """
        Función auxiliar para validar que la hora de inicio sea anterior a la de fin.
        """
        if start_time >= end_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="La hora de inicio debe ser estrictamente anterior a la hora de fin del turno.")

    def _validate_employee_id(self, db: Session, employee_id: int):
        """
        Función auxiliar para verificar si el empleado existe.
        """
        if employee_id is not None:
            employee_exists = db.query(Employee).filter(Employee.id == employee_id).first()
            if not employee_exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                    detail=f"El empleado con ID {employee_id} no existe.")

    def create_shift(self, db: Session, shift_data: ShiftCreate) -> Shift:
        """
        Crea o planifica un nuevo turno.
        """
        #  Validar horas
        self._validate_shift_times(shift_data.hora_inicio_real, shift_data.hora_fin_real)

        #  Verificar la FK (si está asignado inicialmente)
        self._validate_employee_id(db, shift_data.assigned_employee_id)
        
        # Determinar el estado de cobertura (is_covered)
        is_covered = shift_data.assigned_employee_id is not None
        
        db_shift = Shift(
            fecha=shift_data.fecha,
            hora_inicio_real=shift_data.hora_inicio_real,
            hora_fin_real=shift_data.hora_fin_real,
            puesto_requerido=shift_data.puesto_requerido,
            assigned_employee_id=shift_data.assigned_employee_id,
            is_covered=is_covered,
            es_alteracion=shift_data.es_alteracion,
            notas=shift_data.notas
        )
        
        try:
            db.add(db_shift)
            db.commit()
            db.refresh(db_shift)
            return db_shift
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear el turno: {str(e)}")


    def assign_employee_to_shift(self, db: Session, shift_id: int, assignment_data: ShiftAssign) -> Shift:
        """
        Asigna un empleado a un turno existente y actualiza el estado de cobertura.
        """
        db_shift = self.get_shift_by_id(db, shift_id)
        
        # Verificar que el empleado exista
        self._validate_employee_id(db, assignment_data.assigned_employee_id)
        
        db_shift.assigned_employee_id = assignment_data.assigned_employee_id
        db_shift.is_covered = True # Siempre True al asignar
        
        try:
            db.add(db_shift)
            db.commit()
            db.refresh(db_shift)
            return db_shift
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al asignar empleado al turno: {str(e)}")


    def update_shift(self, db: Session, shift_id: int, shift_update: ShiftUpdate) -> Shift:
        """
        Actualiza campos generales de un turno existente.
        """
        db_shift = self.get_shift_by_id(db, shift_id)
        update_data = shift_update.model_dump(exclude_unset=True)
        
        # Validar la FK si se intenta actualizar el assigned_employee_id
        if 'assigned_employee_id' in update_data:
            self._validate_employee_id(db, update_data['assigned_employee_id'])
            # Si se actualiza la asignación a NULL, is_covered debe ser False
            if update_data['assigned_employee_id'] is None:
                 update_data['is_covered'] = False
            
        # Validar horas si se están actualizando
        if 'hora_inicio_real' in update_data or 'hora_fin_real' in update_data:
            inicio = update_data.get('hora_inicio_real', db_shift.hora_inicio_real)
            fin = update_data.get('hora_fin_real', db_shift.hora_fin_real)
            self._validate_shift_times(inicio, fin)

        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_shift, key, value)
            
        try:
            db.add(db_shift)
            db.commit()
            db.refresh(db_shift)
            return db_shift
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar turno: {str(e)}")


    def delete_shift(self, db: Session, shift_id: int) -> dict:
        """
        Elimina un turno de la base de datos.
        """
        db_shift = self.get_shift_by_id(db, shift_id)
        
        # Lógica de negocio: Se podría añadir una restricción si el turno ya fue pagado
        # Por ahora, solo se elimina.
        
        db.delete(db_shift)
        db.commit()
        return {"message": f"Turno con ID {shift_id} eliminado exitosamente."}

    # ✅ CORRECCIÓN: Este método debe estar DENTRO de la clase
    def get_uncovered_shifts_in_future(self, db: Session, days_ahead: int = 7) -> List[Shift]:
        """
        OBTIENE LOS TURNOS FUTUROS (dentro de 'days_ahead') que NO están cubiertos.
        Es la fuente de la alerta CRÍTICA de turnos sin asignar.
        """
        today = date.today()
        future_limit = today + timedelta(days=days_ahead)
        
        # Filtra por: is_covered == False AND fecha >= hoy AND fecha <= límite futuro
        return db.query(Shift).filter(
            Shift.is_covered == False,
            Shift.fecha >= today,
            Shift.fecha <= future_limit
        ).order_by(Shift.fecha.asc()).all()