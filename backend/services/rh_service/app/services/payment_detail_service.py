# rh_service/app/services/payment_detail_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from decimal import Decimal
from sqlalchemy.exc import IntegrityError

# Importa modelos y schemas necesarios
from app.models.payment_detail import PaymentDetail # Asumido
from app.models.employee import Employee # Necesario para la FK de empleado
from app.models.payroll_period import PayrollPeriod # Necesario para la FK de período
from app.schemas.schema_payment_detail import PaymentDetailCreate, PaymentDetailUpdate


class PaymentDetailService:
    """
    Contiene la lógica de negocio para las operaciones CRUD y el cálculo del 
    monto neto sobre el Detalle de Pago (PaymentDetail).
    """

    def _calculate_monto_neto(self, base: Decimal, bonuses: Decimal, deductions: Decimal) -> Decimal:
        """ Calcula el monto neto: Base + Bonificaciones - Descuentos. """
        return base + bonuses - deductions

    def _validate_foreign_keys(self, db: Session, employee_id: int, period_id: int):
        """ Función auxiliar para verificar la existencia de Empleado y Período de Nómina. """
        
        # 1. Validar Empleado
        employee_exists = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"El empleado con ID {employee_id} no existe.")
        
        # 2. Validar Período de Nómina
        period_exists = db.query(PayrollPeriod).filter(PayrollPeriod.id == period_id).first()
        if not period_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"El período de nómina con ID {period_id} no existe.")


    def get_detail_by_id(self, db: Session, detail_id: int) -> PaymentDetail:
        """ Obtiene un detalle de pago por su ID. Lanza 404 si no se encuentra. """
        detail = db.query(PaymentDetail).filter(PaymentDetail.id == detail_id).first()
        if not detail:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Detalle de Pago con ID {detail_id} no encontrado.")
        return detail

    def get_details_by_employee(self, db: Session, employee_id: int) -> List[PaymentDetail]:
        """ Obtiene todos los detalles de pago asociados a un empleado. """
        return db.query(PaymentDetail).filter(PaymentDetail.employee_id == employee_id).all()

    def get_all_details(self, db: Session, skip: int = 0, limit: int = 100) -> List[PaymentDetail]:
        """ Obtiene una lista paginada de todos los detalles de pago. """
        return db.query(PaymentDetail).offset(skip).limit(limit).all()

    def create_detail(self, db: Session, detail_data: PaymentDetailCreate) -> PaymentDetail:
        """ 
        Crea un nuevo detalle de pago.
        Realiza la validación de FK y calcula el monto_neto inicial.
        """
        # 1. Validar Claves Foráneas
        self._validate_foreign_keys(db, detail_data.employee_id, detail_data.period_id)

        # 2. Calcular el monto neto (Base + Bonificaciones - Descuentos)
        monto_neto_calculated = self._calculate_monto_neto(
            detail_data.monto_base_calculado,
            detail_data.total_bonificaciones,
            detail_data.total_descuentos
        )

        db_detail = PaymentDetail(
            employee_id=detail_data.employee_id,
            period_id=detail_data.period_id,
            horas_totales_trabajadas=detail_data.horas_totales_trabajadas,
            monto_base_calculado=detail_data.monto_base_calculado,
            total_descuentos=detail_data.total_descuentos,
            total_bonificaciones=detail_data.total_bonificaciones,
            monto_neto=monto_neto_calculated
        )
        
        try:
            db.add(db_detail)
            db.commit()
            db.refresh(db_detail)
            return db_detail
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="Error de integridad. Verifique que el empleado y el período sean únicos.")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al crear el detalle de pago: {str(e)}")

    def update_detail(self, db: Session, detail_id: int, detail_update: PaymentDetailUpdate) -> PaymentDetail:
        """
        Actualiza los campos de un detalle de pago existente. 
        Recalcula el monto neto si se modifican los componentes base.
        """
        db_detail = self.get_detail_by_id(db, detail_id)
        update_data = detail_update.model_dump(exclude_unset=True)
        
        # 1. Validar FKs si se modifican
        if 'employee_id' in update_data and update_data['employee_id'] != db_detail.employee_id:
            self._validate_foreign_keys(db, update_data['employee_id'], db_detail.period_id)
        if 'period_id' in update_data and update_data['period_id'] != db_detail.period_id:
            self._validate_foreign_keys(db, db_detail.employee_id, update_data['period_id'])
            
        # 2. Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_detail, key, value)
            
        # 3. Recalcular el monto neto si se modificó algún componente base
        recalculate = any(key in update_data for key in [
            'monto_base_calculado', 'total_descuentos', 'total_bonificaciones'
        ])
        
        if recalculate:
            db_detail.monto_neto = self._calculate_monto_neto(
                db_detail.monto_base_calculado,
                db_detail.total_bonificaciones,
                db_detail.total_descuentos
            )
        # Permite anular monto_neto si se envió explícitamente como None en el update.
        elif 'monto_neto' in update_data:
             db_detail.monto_neto = update_data['monto_neto']

        try:
            db.add(db_detail)
            db.commit()
            db.refresh(db_detail)
            return db_detail
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail=f"Error al actualizar el detalle de pago: {str(e)}")


    def delete_detail(self, db: Session, detail_id: int) -> dict:
        """ Elimina un detalle de pago de la base de datos. """
        db_detail = self.get_detail_by_id(db, detail_id)
        
        db.delete(db_detail)
        db.commit()
        return {"message": f"Detalle de Pago con ID {detail_id} eliminado exitosamente."}
