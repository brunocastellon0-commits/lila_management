# rh_service/app/services/request_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from sqlalchemy.exc import IntegrityError
from datetime import date

# Importa modelos y schemas
from app.models.request import Request
from app.schemas.request import RequestCreate, RequestUpdate
from app.models.employee import Employee # Necesario para verificar la FK

class RequestService:
    """
    Contiene la lógica de negocio para las operaciones CRUD 
    sobre el modelo Request (vacaciones, permisos).
    """

    def get_request_by_id(self, db: Session, request_id: int) -> Request:
        """
        Obtiene una solicitud por su ID.
        Lanza 404 si no se encuentra.
        """
        request = db.query(Request).filter(Request.id == request_id).first()
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Solicitud con ID {request_id} no encontrada.")
        return request

    def get_requests_by_employee(self, db: Session, employee_id: int) -> List[Request]:
        """
        Obtiene todas las solicitudes asociadas a un empleado específico.
        """
        return db.query(Request).filter(Request.employee_id == employee_id).all()

    def get_all_requests(self, db: Session, skip: int = 0, limit: int = 100) -> List[Request]:
        """
        Obtiene una lista paginada de todas las solicitudes, ordenadas por fecha.
        """
        return db.query(Request).order_by(Request.fecha_solicitud.desc()).offset(skip).limit(limit).all()

    def create_request(self, db: Session, request: RequestCreate) -> Request:
        """
        Crea un nuevo registro de solicitud, estableciendo el estado inicial como 'Pendiente'.
        Implementa lógica de negocio:
        1. Verificar existencia del empleado.
        2. Validar que la fecha de inicio sea anterior a la de fin.
        """
        # Lógica de negocio 1: Verificar que el employee_id exista (FK)
        employee_exists = db.query(Employee).filter(Employee.id == request.employee_id).first()
        if not employee_exists:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                 detail=f"El empleado con ID {request.employee_id} no existe.")

        # Lógica de negocio 2: Validar fechas
        if request.fecha_inicio > request.fecha_fin:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="La fecha de inicio no puede ser posterior a la fecha de fin de la solicitud.")

        # La columna 'estado' se inicializa en el modelo ORM (asumimos el valor por defecto 'Pendiente')
        db_request = Request(
            employee_id=request.employee_id,
            tipo=request.tipo,
            motivo=request.motivo,
            fecha_solicitud=request.fecha_solicitud,
            fecha_inicio=request.fecha_inicio,
            fecha_fin=request.fecha_fin,
            # El estado por defecto se establece en el modelo ORM
        )
        
        try:
            db.add(db_request)
            db.commit()
            db.refresh(db_request)
            return db_request
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear solicitud: {str(e)}")


    def update_request_status(self, db: Session, request_id: int, request_update: RequestUpdate) -> Request:
        """
        Actualiza el estado de la solicitud (usado por el administrador).
        """
        db_request = self.get_request_by_id(db, request_id)

        update_data = request_update.model_dump(exclude_unset=True)
        
        ####shift

        # Copia el dato actualizado (solo 'estado') al objeto ORM
        for key, value in update_data.items():
            setattr(db_request, key, value)
            
        try:
            db.add(db_request)
            db.commit()
            db.refresh(db_request)
            return db_request
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar estado de solicitud: {str(e)}")


    def delete_request(self, db: Session, request_id: int) -> dict:
        """
        Elimina una solicitud de la base de datos.
        """
        db_request = self.get_request_by_id(db, request_id)
        
        # Lógica de negocio 4: Impedir eliminar solicitudes 'Aprobadas' que ya generaron cambios en turnos.
        if db_request.estado == "Aprobado":
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="No se puede eliminar una solicitud ya APROBADA. Debe ser revertida primero.")


        db.delete(db_request)
        db.commit()
        return {"message": f"Solicitud con ID {request_id} eliminada exitosamente."}



    def get_pending_requests(self, db: Session) -> List[Request]:
        """
        OBTIENE TODAS LAS SOLICITUDES QUE TIENEN EL ESTADO 'Pendiente'.
        Este método es clave para la lógica de alertas del API Gateway.
        """
        # Asumiendo que el campo 'estado' se llama 'estado' en el modelo Request
        return db.query(Request).filter(Request.estado == "Pendiente").all()
        