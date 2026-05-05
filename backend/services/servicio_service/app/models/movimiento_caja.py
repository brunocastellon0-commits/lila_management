from sqlalchemy import Column, Integer, Numeric, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import relationship
from app.database import Base


class MovimientoCaja(Base):
    """
    Modelo ORM para la tabla 'movimientos_caja'.

    Registra TODOS los flujos de dinero asociados a una sesión:
    pagos de pedidos, propinas, retiros para compras menores, etc.

    Es la fuente de verdad para calcular el 'monto_calculado_cierre'
    de una sesión:
        monto_calculado = monto_inicial
                        + Σ Ingresos (efectivo)
                        − Σ Egresos

    Pagos fraccionados (ej: 50% efectivo + 50% QR) generan DOS
    registros distintos en esta tabla, ambos con el mismo id_pedido.
    """

    __tablename__ = "movimientos_caja"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Sesión a la que pertenece el movimiento ---
    id_sesion = Column(
        Integer,
        ForeignKey("sesiones_caja.id"),
        nullable=False,
        index=True,
        comment="Sesión de caja durante la que ocurrió este movimiento"
    )

    # --- Pedido relacionado (opcional) ---
    id_pedido = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=True,
        index=True,
        comment="Pedido que origina el movimiento. NULL para retiros/egresos sin pedido asociado."
    )

    # --- Tipo y concepto ---
    tipo_movimiento = Column(
        Enum("Ingreso", "Egreso", name="tipo_movimiento_enum"),
        nullable=False,
        comment="Ingreso suma al balance; Egreso resta"
    )
    concepto = Column(
        Enum(
            "Venta",
            "Propina",
            "Retiro para proveedores",
            "Retiro caja menor",
            "Ajuste",
            name="concepto_movimiento_enum"
        ),
        nullable=False,
        comment="Categoría descriptiva del movimiento para reportes"
    )

    # --- Método de pago ---
    metodo_pago = Column(
        Enum(
            "Efectivo",
            "Tarjeta",
            "QR",
            "Transferencia",
            name="metodo_pago_enum"
        ),
        nullable=False,
        comment="Canal de pago utilizado. Solo 'Efectivo' afecta el cuadre físico de la caja."
    )

    # --- Monto ---
    monto = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Valor del movimiento (siempre positivo; tipo_movimiento indica si suma o resta)"
    )

    # --- Timestamp ---
    fecha_movimiento = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        comment="Momento exacto en que se registró el movimiento"
    )

    # --- Relaciones ORM ---
    sesion = relationship(
        "SesionCaja",
        back_populates="movimientos",
        doc="Sesión de caja a la que pertenece este movimiento."
    )
    pedido = relationship(
        "Pedido",
        back_populates="movimientos",
        doc="Pedido que originó el movimiento (puede ser None para egresos libres)."
    )

    def __repr__(self):
        return (
            f"<MovimientoCaja(id={self.id}, tipo='{self.tipo_movimiento}', "
            f"concepto='{self.concepto}', metodo='{self.metodo_pago}', monto={self.monto})>"
        )
