from sqlalchemy import Column, Integer, Numeric, Enum, ForeignKey, Text, String
from sqlalchemy.orm import relationship
from app.database import Base


class DetallePedido(Base):
    """
    Modelo ORM para la tabla 'detalles_pedido'.

    Representa cada línea de producto dentro de un pedido.

    Decisión de diseño — precio_unitario:
        El precio se copia desde el catálogo del production_service
        en el momento exacto de la venta. Esto garantiza que cambios
        futuros en el precio del producto NO alteren el histórico
        de pedidos ya cerrados.

    Referencias externas (sin FK real de BD):
        - id_producto → production_service (Product)
    """

    __tablename__ = "detalles_pedido"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Vinculación con el pedido ---
    id_pedido = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False,
        index=True,
        comment="Pedido al que pertenece esta línea"
    )

    # --- Referencia externa: Producto (microservicio Production) ---
    id_producto = Column(
        Integer,
        nullable=False,
        index=True,
        comment="ID del producto en el production_service (referencia externa, sin FK)"
    )

    # --- Snapshot del nombre del producto en el momento de la venta ---
    nombre_producto = Column(
        String(255),
        nullable=False,
        default="",
        comment="Nombre del producto copiado desde production_service al momento de la venta."
    )

    # --- Cantidades y precios ---
    cantidad = Column(
        Numeric(10, 3),
        nullable=False,
        comment="Cantidad pedida (Decimal para permitir medidas fraccionadas, ej: 0.5 kg)"
    )
    precio_unitario = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Precio en el momento de la venta (snapshot). No cambia con el catálogo."
    )
    subtotal = Column(
        Numeric(10, 2),
        nullable=False,
        comment="cantidad × precio_unitario. Calculado en la capa de servicio."
    )

    # --- Notas del cliente ---
    notas = Column(
        Text,
        nullable=True,
        comment="Instrucciones especiales (ej: sin cebolla, poco hielo)"
    )

    # --- Estación de cocina para ruteo KDS ---
    estacion_cocina = Column(
        Enum("Fuegos", "Frios", "Postres", "Barra", name="estacion_cocina_enum"),
        nullable=False,
        default="Fuegos",
        comment="Estación de cocina a la que se envía este ítem. Determina en qué monitor KDS aparece."
    )

    # --- Estado de preparación en cocina ---
    estado_preparacion = Column(
        Enum("Pendiente", "Listo", "Entregado", name="estado_preparacion_enum"),
        nullable=False,
        default="Pendiente",
        comment="Ciclo de preparación visible en la pantalla de cocina"
    )

    # --- Relaciones ORM ---
    pedido = relationship(
        "Pedido",
        back_populates="detalles",
        doc="Pedido al que pertenece esta línea de producto."
    )

    def __repr__(self):
        return (
            f"<DetallePedido(id={self.id}, id_pedido={self.id_pedido}, "
            f"id_producto={self.id_producto}, cantidad={self.cantidad}, "
            f"subtotal={self.subtotal})>"
        )
