from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List

from app.models.caja_model import Caja
from app.schemas.caja_schema import CajaCreate, CajaUpdate


class CajaService:
    """
    Lógica de negocio para la gestión de puntos de venta (Cajas).
    Responsabilidad única: configuración y estado del punto de venta.
    La lógica de sesiones/turnos vive en SesionCajaService.
    """

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _get_or_404(self, db: Session, caja_id: int) -> Caja:
        """Obtiene una caja por ID o lanza 404."""
        caja = db.query(Caja).filter(Caja.id == caja_id).first()
        if not caja:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Caja con ID {caja_id} no encontrada."
            )
        return caja

    def _assert_activa(self, caja: Caja) -> None:
        """Lanza 409 si la caja no está en estado 'Activa'."""
        if caja.estado != "Activa":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La caja '{caja.nombre}' está inactiva y no puede operar."
            )

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def get_by_id(self, db: Session, caja_id: int) -> Caja:
        """Devuelve una caja por su ID."""
        return self._get_or_404(db, caja_id)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Caja]:
        """Lista todas las cajas registradas (paginada)."""
        return db.query(Caja).offset(skip).limit(limit).all()

    # ------------------------------------------------------------------
    # Escritura
    # ------------------------------------------------------------------

    def create(self, db: Session, data: CajaCreate) -> Caja:
        """
        Registra un nuevo punto de venta.
        Valida unicidad de nombre antes de persistir.
        """
        existente = db.query(Caja).filter(Caja.nombre == data.nombre).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una caja con el nombre '{data.nombre}'."
            )

        nueva_caja = Caja(
            nombre=data.nombre,
            estado=data.estado.value,
        )
        try:
            db.add(nueva_caja)
            db.commit()
            db.refresh(nueva_caja)
            return nueva_caja
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error de integridad al crear la caja."
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error interno al crear la caja: {e}"
            )

    def update(self, db: Session, caja_id: int, data: CajaUpdate) -> Caja:
        """
        Actualiza nombre y/o estado de una caja existente.
        No permite desactivar una caja que tenga una sesión abierta
        (esa validación la delega al llamador con SesionCajaService).
        """
        caja = self._get_or_404(db, caja_id)
        update_data = data.model_dump(exclude_unset=True)

        # Normalizar enum a string para el ORM
        if "estado" in update_data and update_data["estado"] is not None:
            update_data["estado"] = update_data["estado"].value

        for key, value in update_data.items():
            setattr(caja, key, value)

        try:
            db.commit()
            db.refresh(caja)
            return caja
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de caja ya está en uso."
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la caja: {e}"
            )

    def delete(self, db: Session, caja_id: int) -> dict:
        """
        Elimina una caja. Solo si no tiene sesiones activas.
        """
        from app.models.sesion_caja_model import SesionCaja  # evitar circular import

        caja = self._get_or_404(db, caja_id)

        sesion_abierta = db.query(SesionCaja).filter(
            SesionCaja.id_caja == caja_id,
            SesionCaja.estado == "Abierta"
        ).first()

        if sesion_abierta:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar una caja con una sesión activa. Cierre la sesión primero."
            )

        try:
            db.delete(caja)
            db.commit()
            return {"message": f"Caja '{caja.nombre}' eliminada exitosamente."}
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar la caja: {e}"
            )
