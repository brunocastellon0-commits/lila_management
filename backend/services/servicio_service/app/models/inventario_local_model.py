from sqlalchemy import Column, Integer, String, Numeric, Enum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class InventarioLocal(Base):
    """
    Modelo ORM para la tabla 'inventario_local'.

    Representa los insumos disponibles en el área de servicio del restaurante.
    Cada ítem es un snapshot de un producto del production_service enriquecido
    con umbrales de stock y categorías propias del servicio.

    Referencias externas (sin FK real de BD):
        - id_producto_origen → production_service (Product)
    """

    __tablename__ = "inventario_local"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Referencia al producto en production_service ---
    id_producto_origen = Column(
        Integer,
        nullable=False,
        index=True,
        comment="ID del producto en el production_service (referencia externa, sin FK de BD)."
    )

    # --- Snapshot del nombre al momento de la recepción ---
    nombre_producto = Column(
        String(255),
        nullable=False,
        comment="Nombre del producto copiado desde production_service al momento de su recepción."
    )

    # --- Categoría para filtros en el panel de inventario ---
    categoria = Column(
        Enum("Carnes", "Vegetales", "Lacteos", "Bebidas", "Especias", name="categoria_inventario_enum"),
        nullable=False,
        default="Bebidas",
        comment="Categoría del insumo para agrupar en la vista de inventario del salón."
    )

    # --- Stock y umbrales ---
    cantidad_actual = Column(
        Numeric(10, 3),
        nullable=False,
        default=0.000,
        comment="Cantidad disponible actualmente. Se incrementa con recepciones y decrementa con ventas."
    )
    unidad = Column(
        String(20),
        nullable=False,
        default="unidad",
        comment="Unidad de medida (kg, L, unidad, etc.)."
    )
    min_stock = Column(
        Numeric(10, 3),
        nullable=False,
        default=0.000,
        comment="Umbral mínimo. Si cantidad_actual < min_stock, se considera stock crítico."
    )
    max_stock = Column(
        Numeric(10, 3),
        nullable=False,
        default=0.000,
        comment="Umbral máximo de almacenamiento."
    )

    # --- Costo para análisis financiero ---
    costo_unitario = Column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
        comment="Costo por unidad. Snapshot del último precio recibido."
    )

    # --- Auditoría ---
    updated_at = Column(
        DateTime,
        default=func.now(),
        onupdate=func.now(),
        comment="Última actualización del registro (por recepción o ajuste)."
    )

    # --- Relación con recepciones ---
    recepciones = relationship(
        "RecepcionStock",
        back_populates="inventario_local",
        cascade="all, delete-orphan",
        doc="Historial de recepciones de stock para este ítem."
    )

    def __repr__(self):
        return (
            f"<InventarioLocal(id={self.id}, nombre='{self.nombre_producto}', "
            f"cantidad={self.cantidad_actual}, unidad='{self.unidad}')>"
        )
