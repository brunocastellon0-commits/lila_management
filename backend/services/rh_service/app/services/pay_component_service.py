# rh_service/app/services/pay_component_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from decimal import Decimal
from sqlalchemy.exc import IntegrityError

#  y schemas
from app.models.pay_component import PayComponent
from app.models.payment_detail import PaymentDetail # Necesario para la FK 
from app.schemas.schema_pay_component import PayComponentCreate, PayComponentUpdate


class PayComponentService:
    """
    las operaciones sobre el Componente de Pago (PayComponent), que son las líneas de un pago.
    """

    def get_component_by_id(self, db: Session, component_id: int) -> PayComponent:
        """
        Obtiene un componente de pago por su ID.
        Lanza 404 si no se encuentra.
        """
        component = db.query(PayComponent).filter(PayComponent.id == component_id).first()
        if not component:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Componente de Pago con ID {component_id} no encontrado.")
        return component

    def get_components_by_detail_id(self, db: Session, detail_id: int) -> List[PayComponent]:
        """
        Obtiene todos los componentes de pago asociados a un detalle de pago específico.
        """
        return db.query(PayComponent).filter(PayComponent.payment_detail_id == detail_id).all()

    def get_all_components(self, db: Session, skip: int = 0, limit: int = 100) -> List[PayComponent]:
        """
        Obtiene una lista paginada de todos los componentes de pago.
        """
        return db.query(PayComponent).offset(skip).limit(limit).all()

    def _validate_payment_detail_id(self, db: Session, detail_id: int):
        """
        Función auxiliar para verificar si el PaymentDetail existe.
        """
        # Asumiendo que el modelo PaymentDetail existe en app.models
        detail_exists = db.query(PaymentDetail).filter(PaymentDetail.id == detail_id).first()
        if not detail_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"El detalle de pago (PaymentDetail) con ID {detail_id} no existe.")

    def create_component(self, db: Session, component_data: PayComponentCreate) -> PayComponent:
        """
        Crea un nuevo componente de pago.
        Lógica de negocio: 
        1. Verificar existencia del detalle de pago (FK).
        """
        # Verificar existencia de PaymentDetail.
        self._validate_payment_detail_id(db, component_data.payment_detail_id)

        db_component = PayComponent(
            payment_detail_id=component_data.payment_detail_id,
            tipo=component_data.tipo,
            descripcion=component_data.descripcion,
            monto=component_data.monto
        )
        
        try:
            db.add(db_component)
            db.commit()
            db.refresh(db_component)
            return db_component
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="Error de integridad. Verifique el ID del detalle de pago.")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear el componente de pago: {str(e)}")

    def update_component(self, db: Session, component_id: int, component_update: PayComponentUpdate) -> PayComponent:
        """
        Actualiza los campos de un componente de pago existente.
        """
        db_component = self.get_component_by_id(db, component_id)
        update_data = component_update.model_dump(exclude_unset=True)
        
        # Validar la FK si se intenta actualizar el payment_detail_id
        if 'payment_detail_id' in update_data:
            self._validate_payment_detail_id(db, update_data['payment_detail_id'])
            
        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_component, key, value)
            
        try:
            db.add(db_component)
            db.commit()
            db.refresh(db_component)
            return db_component
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar el componente de pago: {str(e)}")


    def delete_component(self, db: Session, component_id: int) -> dict:
        """
        Elimina un componente de pago de la base de datos.
        """
        db_component = self.get_component_by_id(db, component_id)
        
        db.delete(db_component)
        db.commit()
        return {"message": f"Componente de Pago con ID {component_id} eliminado exitosamente."}
