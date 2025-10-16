# rh_service/app/services/training_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import date,timedelta
from sqlalchemy.exc import IntegrityError

# Importa modelos y schemas
from app.models.training import Training
from app.models.employee import Employee 
from app.schemas.schema_training import TrainingCreate, TrainingUpdate


class TrainingService:
    """
    Contiene la lógica de negocio para las operaciones CRUD sobre el 
    registro de capacitaciones (Training).
    """

    def get_training_by_id(self, db: Session, training_id: int) -> Training:
        """
        Obtiene un registro de capacitación por su ID.
        Lanza 404 si no se encuentra.
        """
        training = db.query(Training).filter(Training.id == training_id).first()
        if not training:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Capacitación con ID {training_id} no encontrada.")
        return training

    def get_trainings_by_employee(self, db: Session, employee_id: int) -> List[Training]:
        """
        Obtiene todos los registros de capacitación asociados a un empleado específico.
        """
        return db.query(Training).filter(Training.employee_id == employee_id).all()

    def get_all_trainings(self, db: Session, skip: int = 0, limit: int = 100) -> List[Training]:
        """
        Obtiene una lista paginada de todos los registros de capacitación.
        """
        return db.query(Training).offset(skip).limit(limit).all()

    def _validate_employee_id(self, db: Session, employee_id: int):
        """
        Función auxiliar para verificar si el empleado existe.
        """
        employee_exists = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"El empleado con ID {employee_id} no existe.")
    
    def _validate_dates(self, assignment_date: date, limit_date: date | None):
        """
        Función auxiliar para validar que la fecha de asignación no sea posterior a la fecha límite.
        """
        if limit_date and assignment_date > limit_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="La fecha de asignación no puede ser posterior a la fecha límite para la capacitación.")

    def create_training(self, db: Session, training_data: TrainingCreate) -> Training:
        """
        Crea un nuevo registro de capacitación para un empleado.
        """
        # Verificar existencia del empleado.
        self._validate_employee_id(db, training_data.employee_id)

        #  Validar la coherencia de las fechas.
        self._validate_dates(training_data.fecha_asignacion, training_data.fecha_limite)

        db_training = Training(
            employee_id=training_data.employee_id,
            nombre_capacitacion=training_data.nombre_capacitacion,
            fecha_asignacion=training_data.fecha_asignacion,
            fecha_limite=training_data.fecha_limite,
            certificado_url=training_data.certificado_url,
            completado=training_data.completado
        )
        
        try:
            db.add(db_training)
            db.commit()
            db.refresh(db_training)
            return db_training
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="Error de integridad. Verifique los datos ingresados.")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear el registro de capacitación: {str(e)}")

    def update_training(self, db: Session, training_id: int, training_update: TrainingUpdate) -> Training:
        """
        Actualiza los campos de un registro de capacitación existente.
        """
        db_training = self.get_training_by_id(db, training_id)
        update_data = training_update.model_dump(exclude_unset=True)
        
        # Validar la FK si se intenta actualizar el employee_id
        if 'employee_id' in update_data:
            self._validate_employee_id(db, update_data['employee_id'])
            
        # Validar la coherencia de las fechas si se están actualizando
        if 'fecha_asignacion' in update_data or 'fecha_limite' in update_data:
            asignacion = update_data.get('fecha_asignacion', db_training.fecha_asignacion)
            limite = update_data.get('fecha_limite', db_training.fecha_limite)
            self._validate_dates(asignacion, limite)

        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_training, key, value)
            
        try:
            db.add(db_training)
            db.commit()
            db.refresh(db_training)
            return db_training
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar la capacitación: {str(e)}")


    def delete_training(self, db: Session, training_id: int) -> dict:
        """
        Elimina un registro de capacitación de la base de datos.
        """
        db_training = self.get_training_by_id(db, training_id)
        
        db.delete(db_training)
        db.commit()
        return {"message": f"Registro de Capacitación con ID {training_id} eliminado exitosamente."}
    def get_pending_or_expired_trainings(self, db: Session, expiration_days_threshold: int = 60) -> List[Training]:
        """
        OBTIENE capacitaciones NO completadas que tienen fecha límite 
        vencida o próxima a vencer (dentro de 'expiration_days_threshold' días).
        """
        today = date.today()
        # Límite futuro (ej. 60 días) para alertar proactivamente.
        future_limit = today + timedelta(days=expiration_days_threshold)
        
        # Filtra:
        # 1. completado == False (No finalizado)
        # 2. fecha_limite IS NOT NULL (Solo aplica a capacitaciones con un plazo)
        # 3. fecha_limite <= future_limit (Ya expiró o está a punto de expirar)
        return db.query(Training).filter(
            Training.completado == False,
            Training.fecha_limite.isnot(None),
            Training.fecha_limite <= future_limit
        ).order_by(Training.fecha_limite.asc()).all()