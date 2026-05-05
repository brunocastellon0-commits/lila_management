from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class RecepcionStock(Base):
    """
    Modelo ORM para la tabla 'recepciones_stock'.

    Registro inmutable de cada despacho recibido desde production_service.
    Proporciona trazabilidad completa del flujo de inventario.

    Referencias externas (sin FK real de BD):
        - id_produccion_origen → production_service (ProductionOrder / lote)
        - recibido_por → rh_service (Employee)
    """

    __tablename__ = "recepciones_stock"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Relación con el insumo local ---
    id_inventario_local = Column(
        Integer,
        ForeignKey("inventario_local.id"),
        nullable=False,
        index=True,
        comment="Insumo del inventario local al que se suma la recepción."
    )

    # --- Cantidad recibida ---
    cantidad_recibida = Column(
        Numeric(10, 3),
        nullable=False,
        comment="Cantidad recibida en esta recepción. Se suma a inventario_local.cantidad_actual."
    )

    # --- Referencia al origen en producción ---
    id_produccion_origen = Column(
        Integer,
        nullable=True,
        comment="ID del despacho o lote en production_service (referencia externa, nullable si es ajuste manual)."
    )

    # --- Quién recibió el despacho ---
    recibido_por = Column(
        Integer,
        nullable=False,
        comment="ID del empleado que firmó la recepción (referencia externa al rh_service)."
    )

    # --- Timestamp de recepción ---
    fecha_recepcion = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        comment="Fecha y hora exacta en que se registró la recepción."
    )

    # --- Notas opcionales ---
    notas = Column(
        Text,
        nullable=True,
        comment="Observaciones sobre el despacho (ej: 'producto con leve magulladura', 'faltó 0.5 kg')."
    )

    # --- Relación ORM ---
    inventario_local = relationship(
        "InventarioLocal",
        back_populates="recepciones",
        doc="Ítem de inventario al que pertenece esta recepción."
    )

    def __repr__(self):
        return (
            f"<RecepcionStock(id={self.id}, id_inventario={self.id_inventario_local}, "
            f"cantidad={self.cantidad_recibida}, fecha={self.fecha_recepcion})>"
        )
