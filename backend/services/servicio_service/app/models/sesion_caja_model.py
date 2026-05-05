from sqlalchemy import Column, Integer, Numeric, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class SesionCaja(Base):
    """
    Modelo ORM para la tabla 'sesiones_caja'.

    Representa un turno de trabajo sobre una caja específica.
    Contiene la referencia al usuario (empleado/cajero) como un
    entero plano (id_usuario) ya que el microservicio de RH es
    externo — no existe FK real a nivel de BD entre servicios.

    Regla de negocio crítica:
        Solo puede haber UNA sesión con estado 'Abierta'
        por caja en un momento dado. Esta restricción se
        valida en la capa de servicio (no con constraint de BD).
    """

    __tablename__ = "sesiones_caja"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Relación interna: Caja ---
    id_caja = Column(
        Integer,
        ForeignKey("cajas.id"),
        nullable=False,
        index=True,
        comment="Caja física/lógica sobre la que opera este turno"
    )

    # --- Referencia externa: Empleado/Cajero (microservicio RH) ---
    id_usuario = Column(
        Integer,
        nullable=False,
        index=True,
        comment="ID del empleado que abrió la sesión (referencia al rh_service)"
    )

    # --- Tiempos del turno ---
    fecha_apertura = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        comment="Timestamp exacto en que se abrió la caja"
    )
    fecha_cierre = Column(
        DateTime,
        nullable=True,
        comment="Timestamp de cierre. NULL mientras la sesión esté abierta"
    )

    # --- Montos de control ---
    monto_inicial = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Dinero en efectivo con el que inicia el turno (fondo de cambio)"
    )
    monto_declarado_cierre = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Monto que el cajero declara tener al cerrar"
    )
    monto_calculado_cierre = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Monto que el sistema calcula: inicial + ingresos − egresos"
    )

    # --- Estado de la sesión ---
    estado = Column(
        Enum("Abierta", "Cerrada", "Descuadrada", name="estado_sesion"),
        nullable=False,
        default="Abierta",
        comment="Descuadrada cuando declarado != calculado al cierre"
    )

    # --- Auditoría ---
    created_at = Column(DateTime, default=func.now())

    # --- Relaciones ORM ---
    caja = relationship(
        "Caja",
        back_populates="sesiones",
        doc="Caja física/lógica a la que pertenece este turno."
    )
    pedidos = relationship(
        "Pedido",
        back_populates="sesion",
        doc="Pedidos registrados durante este turno."
    )
    movimientos = relationship(
        "MovimientoCaja",
        back_populates="sesion",
        doc="Todos los movimientos de efectivo vinculados a este turno."
    )

    def __repr__(self):
        return (
            f"<SesionCaja(id={self.id}, id_caja={self.id_caja}, "
            f"id_usuario={self.id_usuario}, estado='{self.estado}')>"
        )
