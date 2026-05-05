from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Caja(Base):
    """
    Modelo ORM para la tabla 'cajas'.

    Representa un punto de venta físico o lógico del restaurante
    (ej: Caja Principal, Caja Barra). Cada caja puede tener
    múltiples sesiones de trabajo a lo largo del tiempo, pero
    solo una puede estar abierta simultáneamente.
    """

    __tablename__ = "cajas"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True,
                    comment="Nombre descriptivo del punto de venta (ej: Caja Principal)")

    # --- Estado operativo ---
    estado = Column(
        Enum("Activa", "Inactiva", name="estado_caja"),
        nullable=False,
        default="Activa",
        comment="Indica si el punto de venta está habilitado para operar"
    )

    # --- Auditoría ---
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # --- Relaciones ORM ---
    sesiones = relationship(
        "SesionCaja",
        back_populates="caja",
        doc="Historial completo de sesiones/turnos de esta caja."
    )

    def __repr__(self):
        return f"<Caja(id={self.id}, nombre='{self.nombre}', estado='{self.estado}')>"
