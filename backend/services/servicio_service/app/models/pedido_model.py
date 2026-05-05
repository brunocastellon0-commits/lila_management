from sqlalchemy import Column, Integer, Numeric, DateTime, Enum, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Pedido(Base):
    """
    Modelo ORM para la tabla 'pedidos'.

    Núcleo de la transacción del restaurante. Cada pedido queda
    atado a la sesión de caja activa en el momento de su creación,
    garantizando que el cuadre de caja al cierre sea exacto.

    Referencias externas (sin FK real de BD):
        - id_mesero → rh_service (Employee)
    """

    __tablename__ = "pedidos"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Vinculación con la sesión de caja activa ---
    id_sesion = Column(
        Integer,
        ForeignKey("sesiones_caja.id"),
        nullable=False,
        index=True,
        comment="Sesión de caja activa al momento de crear el pedido"
    )

    # --- Referencia externa: Mesero (microservicio RH) ---
    id_mesero = Column(
        Integer,
        nullable=True,
        index=True,
        comment="ID del empleado-mesero asignado (referencia al rh_service)"
    )

    # --- Vinculación con la mesa (FK real desde Fase 1) ---
    id_mesa = Column(
        Integer,
        ForeignKey("mesas.id"),
        nullable=True,
        index=True,
        comment="Mesa asignada al pedido. FK a la tabla mesas (puede ser null para pedidos para llevar/barra)."
    )

    # --- Comensales ---
    cubiertos = Column(
        Integer,
        nullable=True,
        comment="Número de comensales en la mesa. Informativo para cocina."
    )

    # --- Tiempos ---
    fecha_creacion = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        comment="Timestamp de creación del pedido"
    )

    # --- Estado del pedido ---
    estado_pedido = Column(
        Enum(
            "Pendiente",
            "En Preparacion",
            "Servido",
            "Pagado",
            "Anulado",
            name="estado_pedido_enum"
        ),
        nullable=False,
        default="Pendiente",
        comment="Ciclo de vida del pedido desde su creación hasta el cobro"
    )

    # --- Totales desglosados ---
    subtotal = Column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
        comment="Suma de los subtotales de las líneas antes de impuestos y descuentos."
    )
    impuestos = Column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
        comment="Monto de impuestos aplicados (ej: IVA 10.5%). Calculado sobre el subtotal."
    )
    descuentos = Column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
        comment="Descuentos aplicados al pedido (cupones, promociones, etc.)."
    )
    total = Column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
        comment="Total final = subtotal + impuestos - descuentos. Se recalcula al agregar/quitar ítems."
    )

    # --- Auditoría ---
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # --- Relaciones ORM ---
    sesion = relationship(
        "SesionCaja",
        back_populates="pedidos",
        doc="Sesión de caja a la que pertenece este pedido."
    )
    mesa = relationship(
        "Mesa",
        back_populates="pedidos",
        doc="Mesa asociada a este pedido."
    )
    detalles = relationship(
        "DetallePedido",
        back_populates="pedido",
        cascade="all, delete-orphan",
        doc="Líneas de productos incluidas en este pedido."
    )
    movimientos = relationship(
        "MovimientoCaja",
        back_populates="pedido",
        doc="Registros de pago o propina asociados a este pedido."
    )

    def __repr__(self):
        return (
            f"<Pedido(id={self.id}, id_mesa={self.id_mesa}, "
            f"estado='{self.estado_pedido}', total={self.total})>"
        )
