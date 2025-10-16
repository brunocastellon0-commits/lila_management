# rh_service/app/services/payroll_period_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List,Optional
from datetime import date,timedelta

# Importa el modelo ORM (tabla) y los schemas Pydantic
from app.models.payroll_period import PayrollPeriod
from app.schemas.payroll_period import PayrollPeriodCreate, PayrollPeriodUpdate

class PayrollPeriodService:
    """
    Contiene la lógica de negocio para las operaciones CRUD sobre el modelo PayrollPeriod.
    Maneja la creación y gestión de los ciclos de pago.
    """

    def get_period_by_id(self, db: Session, period_id: int) -> PayrollPeriod:
        """
        Obtiene un período de nómina por su ID.
        Lanza 404 si no se encuentra.
        """
        period = db.query(PayrollPeriod).filter(PayrollPeriod.id == period_id).first()
        if not period:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Período de nómina con ID {period_id} no encontrado.")
        return period

    def get_all_periods(self, db: Session, skip: int = 0, limit: int = 100) -> List[PayrollPeriod]:
        """
        Obtiene una lista paginada de todos los períodos de nómina, ordenados por fecha de inicio.
        """
        # Se asume que el ORM de PayrollPeriod tiene un campo 'fecha_inicio' para ordenar
        return db.query(PayrollPeriod).order_by(PayrollPeriod.fecha_inicio.desc()).offset(skip).limit(limit).all()

    def create_period(self, db: Session, period: PayrollPeriodCreate) -> PayrollPeriod:
        """
        Crea un nuevo período de nómina, asegurando que las fechas sean válidas.
        """
        if period.fecha_inicio >= period.fecha_fin:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="La fecha de inicio debe ser anterior a la fecha de fin.")
        
        #  Validar que no haya solapamiento de fechas con períodos existentes
        
        db_period = PayrollPeriod(
            nombre_periodo=period.nombre_periodo,
            fecha_inicio=period.fecha_inicio,
            fecha_fin=period.fecha_fin,
            fecha_corte_revision=period.fecha_corte_revision,
            # 'estado' y 'finalizado' usan los defaults definidos en el modelo ORM
        )
        
        try:
            db.add(db_period)
            db.commit()
            db.refresh(db_period)
            return db_period
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Error desconocido al crear período de nómina.")


    def update_period(self, db: Session, period_id: int, period_update: PayrollPeriodUpdate) -> PayrollPeriod:
        """
        Actualiza los campos de un período de nómina existente.
        """
        db_period = self.get_period_by_id(db, period_id)

        update_data = period_update.model_dump(exclude_unset=True)
        
        # Validación de fechas antes de aplicar la actualización
        if 'fecha_inicio' in update_data and 'fecha_fin' in update_data:
            start_date = update_data['fecha_inicio']
            end_date = update_data['fecha_fin']
            if start_date >= end_date:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                    detail="La fecha de inicio debe ser anterior a la fecha de fin.")

        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_period, key, value)
            
        try:
            db.add(db_period)
            db.commit()
            db.refresh(db_period)
            return db_period
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Error desconocido al actualizar período de nómina.")

    def delete_period(self, db: Session, period_id: int) -> dict:
        """
        Elimina un período de nómina de la base de datos.
        """
        db_period = self.get_period_by_id(db, period_id)
        
        # Lógica de negocio: Verificar si existen PaymentDetails asociados antes de eliminar
        if db_period.details:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="No se puede eliminar el período: tiene detalles de pago asociados.")

        db.delete(db_period)
        db.commit()
        return {"message": f"Período de nómina con ID {period_id} eliminado exitosamente."}
    def get_next_closure_period(self, db: Session) -> Optional[PayrollPeriod]:
        """
        Obtiene el próximo período de nómina activo (no finalizado) 
        que tiene la fecha de corte de revisión más cercana o en el futuro.
        
        Este es el período clave para métricas y alertas.
        """
        today = date.today()
        
        # Filtra por:
        # 1. finalizado == False (Período activo)
        # 2. fecha_corte_revision >= hoy (Corte pendiente/futuro)
        # Ordena por la fecha de corte de revisión ascendente (el más cercano primero)
        return db.query(PayrollPeriod).filter(
            PayrollPeriod.finalizado == False,
            PayrollPeriod.fecha_corte_revision >= today
        ).order_by(PayrollPeriod.fecha_corte_revision.asc()).first()