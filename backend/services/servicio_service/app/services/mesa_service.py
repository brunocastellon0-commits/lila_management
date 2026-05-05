from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime

from app.models.mesa_model import Mesa
from app.schemas.mesa_schema import MesaCreate, MesaUpdate, MesaEstadoUpdate, MesaResponse
from app.utils.rh_client import obtener_nombre_empleado_safe, validar_empleado


class MesaService:
    """
    Lógica de negocio para la gestión del salón y las mesas.

    Responsabilidades:
        - CRUD de mesas.
        - Control de cambios de estado con timestamp automático.
        - Validación de mesero asignado contra rh_service.
        - Enriquecimiento de respuestas con nombre_mesero.
    """

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _get_or_404(self, db: Session, mesa_id: int) -> Mesa:
        """Obtiene una mesa por ID o lanza 404."""
        mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
        if not mesa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mesa con ID {mesa_id} no encontrada."
            )
        return mesa

    def _enriquecer_respuesta(self, mesa: Mesa) -> MesaResponse:
        """
        Construye un MesaResponse enriqueciendo el nombre del mesero desde rh_service.
        La falla en rh_service se maneja de forma silenciosa (nombre_mesero = None).
        """
        nombre_mesero = obtener_nombre_empleado_safe(mesa.id_mesero_asignado)
        data = MesaResponse.model_validate(mesa)
        data.nombre_mesero = nombre_mesero
        return data

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def get_all(
        self,
        db: Session,
        zona: Optional[str] = None,
        estado: Optional[str] = None,
    ) -> List[MesaResponse]:
        """Lista todas las mesas con filtros opcionales."""
        query = db.query(Mesa)
        if zona:
            query = query.filter(Mesa.zona == zona)
        if estado:
            query = query.filter(Mesa.estado_actual == estado)
        mesas = query.order_by(Mesa.numero).all()
        return [self._enriquecer_respuesta(m) for m in mesas]

    def get_by_id(self, db: Session, mesa_id: int) -> MesaResponse:
        """Obtiene una mesa por ID enriquecida con el nombre del mesero."""
        mesa = self._get_or_404(db, mesa_id)
        return self._enriquecer_respuesta(mesa)

    # ------------------------------------------------------------------
    # Creación
    # ------------------------------------------------------------------

    def crear_mesa(self, db: Session, data: MesaCreate) -> MesaResponse:
        """
        Crea una nueva mesa.
        Valida que el número de mesa sea único antes de insertar.
        """
        # Validar unicidad del número
        existente = db.query(Mesa).filter(Mesa.numero == data.numero).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una mesa con el número {data.numero}."
            )

        nueva_mesa = Mesa(
            numero=data.numero,
            capacidad=data.capacidad,
            forma=data.forma.value,
            zona=data.zona.value,
            estado_actual="Libre",
        )
        db.add(nueva_mesa)
        try:
            db.commit()
            db.refresh(nueva_mesa)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear la mesa: {e}"
            )
        return self._enriquecer_respuesta(nueva_mesa)

    # ------------------------------------------------------------------
    # Actualización de datos
    # ------------------------------------------------------------------

    def update(self, db: Session, mesa_id: int, data: MesaUpdate) -> MesaResponse:
        """Actualiza los datos de una mesa (excepto cambios de estado que usan cambiar_estado)."""
        mesa = self._get_or_404(db, mesa_id)

        update_data = data.model_dump(exclude_unset=True)

        # Convertir enums a sus valores string
        for key in ("forma", "zona", "estado_actual"):
            if key in update_data and update_data[key] is not None:
                update_data[key] = update_data[key].value

        for key, value in update_data.items():
            setattr(mesa, key, value)

        try:
            db.commit()
            db.refresh(mesa)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la mesa: {e}"
            )
        return self._enriquecer_respuesta(mesa)

    # ------------------------------------------------------------------
    # Cambio de estado
    # ------------------------------------------------------------------

    def cambiar_estado(
        self, db: Session, mesa_id: int, data: MesaEstadoUpdate
    ) -> MesaResponse:
        """
        Cambia el estado de una mesa y gestiona el timestamp de ocupación.

        Lógica:
            - Al pasar a 'Ocupado': setea timestamp_ocupacion = ahora.
            - Al pasar a 'Libre': limpia timestamp_ocupacion e id_mesero_asignado.
            - Si se incluye id_mesero_asignado: valida con rh_service.
        """
        mesa = self._get_or_404(db, mesa_id)
        nuevo_estado = data.estado_actual.value

        # Validar mesero si se reasigna
        if data.id_mesero_asignado is not None:
            validar_empleado(data.id_mesero_asignado)
            mesa.id_mesero_asignado = data.id_mesero_asignado

        mesa.estado_actual = nuevo_estado

        if nuevo_estado == "Ocupado":
            mesa.timestamp_ocupacion = datetime.utcnow()
        elif nuevo_estado == "Libre":
            mesa.timestamp_ocupacion = None
            mesa.id_mesero_asignado = None

        try:
            db.commit()
            db.refresh(mesa)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al cambiar el estado de la mesa: {e}"
            )
        return self._enriquecer_respuesta(mesa)

    # ------------------------------------------------------------------
    # Asignación de mesero (acción independiente)
    # ------------------------------------------------------------------

    def asignar_mesero(
        self, db: Session, mesa_id: int, id_mesero: int
    ) -> MesaResponse:
        """
        Asigna un mesero a una mesa previa validación con rh_service.
        """
        mesa = self._get_or_404(db, mesa_id)
        validar_empleado(id_mesero)
        mesa.id_mesero_asignado = id_mesero

        try:
            db.commit()
            db.refresh(mesa)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al asignar mesero: {e}"
            )
        return self._enriquecer_respuesta(mesa)
