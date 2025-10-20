from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List
from app.models.sucursal import Sucursal
from app.schemas.schema_sucursal import SucursalCreate, SucursalResponse, SucursalUpdate

class SucursalService:
    # Lógica para sucursales

    def get_sucursales_by_id(self, db: Session, sucursales_id: int) -> Sucursal:
        # Obtener sucursal por id 
        sucursal = db.query(Sucursal).filter(Sucursal.id == sucursales_id).first()
        if not sucursal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Sucursal con ID {sucursales_id} no encontrado."
            )
        return sucursal

    def get_all_sucursales(self, db: Session, skip: int = 0, limit: int = 100) -> List[Sucursal]:
        # Obtiene una lista de las sucursales
        return db.query(Sucursal).offset(skip).limit(limit).all()

    def create_sucursal(self, db: Session, sucursal: SucursalCreate) -> Sucursal:
        # Crear una sucursal
        db_sucursal = Sucursal(
            nombre_sucursal=sucursal.nombre_sucursal,
            fecha_inauguracion=sucursal.fecha_inauguracion,
            ubicacion=sucursal.ubicacion,
            telefono=sucursal.telefono,
        )

        try:
            db.add(db_sucursal)
            db.commit()
            db.refresh(db_sucursal)
            return db_sucursal
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Sucursal ya registrada."
            )
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Error desconocido al crear sucursal."
            )

    def update_sucursal(self, db: Session, sucursales_id: int, sucursal_update: SucursalUpdate) -> Sucursal:
        # Actualiza sucursal
        db_sucursal = self.get_sucursales_by_id(db, sucursales_id)

        update_data = sucursal_update.model_dump(exclude_unset=True)

        # Copia de datos actualizados
        for key, value in update_data.items():
            setattr(db_sucursal, key, value)

        try:
            db.commit()
            db.refresh(db_sucursal)
            return db_sucursal
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error de integridad al actualizar la sucursal."
            )
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error desconocido al actualizar sucursal."
            )

    def delete_sucursal(self, db: Session, sucursales_id: int) -> dict:
        # Elimina sucursal
        db_sucursal = self.get_sucursales_by_id(db, sucursales_id)
        try:
            db.delete(db_sucursal)
            db.commit()
            return {"detail": f"Sucursal con ID {sucursales_id} eliminada correctamente."}
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error desconocido al eliminar sucursal."
            )
