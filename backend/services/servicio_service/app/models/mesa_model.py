from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Mesa(Base):
    """
    Modelo ORM para la tabla 'mesas'.

    Representa una mesa física del restaurante con su estado en tiempo real.
    El campo id_mesero_asignado es una referencia externa al rh_service;
    no existe FK real en BD para mantener la independencia entre microservicios.
    """

    __tablename__ = "mesas"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Número de mesa (identificador visible para el staff) ---
    numero = Column(
        Integer,
        unique=True,
        nullable=False,
        index=True,
        comment="Número visible de mesa. Único por restaurante."
    )

    # --- Capacidad ---
    capacidad = Column(
        Integer,
        nullable=False,
        default=4,
        comment="Cantidad máxima de comensales que admite la mesa."
    )

    # --- Forma para renderizado en el mapa visual del salón ---
    forma = Column(
        Enum("square", "circle", name="forma_mesa_enum"),
        nullable=False,
        default="square",
        comment="Forma geométrica de la mesa para el mapa visual del salón."
    )

    # --- Zona del restaurante ---
    zona = Column(
        Enum("Interior", "Terraza", "VIP", "Barra", name="zona_mesa_enum"),
        nullable=False,
        default="Interior",
        comment="Área del restaurante donde está ubicada la mesa."
    )

    # --- Estado actual (tiempo real) ---
    estado_actual = Column(
        Enum("Libre", "Ocupado", "Reservado", "Atencion", name="estado_mesa_enum"),
        nullable=False,
        default="Libre",
        comment="Estado en tiempo real de la mesa. Se actualiza con cada acción del staff."
    )

    # --- Mesero asignado (referencia externa a rh_service) ---
    id_mesero_asignado = Column(
        Integer,
        nullable=True,
        index=True,
        comment="ID del empleado-mesero asignado (referencia externa al rh_service, sin FK de BD)."
    )

    # --- Timestamp de ocupación (para calcular tiempo de servicio) ---
    timestamp_ocupacion = Column(
        DateTime,
        nullable=True,
        comment="Momento en que la mesa pasó a estado 'Ocupado'. Usado para calcular duración del servicio."
    )

    # --- Auditoría ---
    created_at = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        comment="Fecha de alta de la mesa en el sistema."
    )
    updated_at = Column(
        DateTime,
        default=func.now(),
        onupdate=func.now(),
        comment="Última modificación del registro."
    )

    # --- Relación inversa con pedidos ---
    pedidos = relationship(
        "Pedido",
        back_populates="mesa",
        doc="Historial de pedidos asociados a esta mesa."
    )

    def __repr__(self):
        return (
            f"<Mesa(id={self.id}, numero={self.numero}, zona='{self.zona}', "
            f"estado='{self.estado_actual}')>"
        )
