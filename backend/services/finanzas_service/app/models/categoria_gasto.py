from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class CategoriaGasto(Base):
    """
    Modelo ORM para la tabla 'categorias_gasto'.

    Clasifica los gastos operativos que el administrador registra
    manualmente: aquellos que no pertenecen a ningún otro módulo.

    Ejemplos de uso:
        - Alquiler del local
        - Servicios Básicos (luz, agua, gas, internet)
        - Impuestos y tasas municipales
        - Mantenimiento de equipos
        - Marketing y publicidad
        - Seguros
        - Gastos varios / imprevistos

    Esta tabla la gestiona directamente el administrador.
    NO incluir aquí: nómina (→ rh_service), insumos (→ production_service).
    """

    __tablename__ = "categorias_gasto"

    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(
        String(100),
        nullable=False,
        unique=True,
        comment="Nombre de la categoría (ej: Alquiler, Servicios Básicos, Impuestos)"
    )

    descripcion = Column(
        String(255),
        nullable=True,
        comment="Descripción opcional para orientar al usuario al clasificar un gasto"
    )

    # --- Relaciones ORM ---
    gastos = relationship(
        "GastoOperativo",
        back_populates="categoria",
        doc="Gastos operativos clasificados bajo esta categoría."
    )

    def __repr__(self):
        return f"<CategoriaGasto(id={self.id}, nombre='{self.nombre}')>"
