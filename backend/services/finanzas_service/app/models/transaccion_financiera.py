from sqlalchemy import Column, Integer, String, Numeric, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class TransaccionFinanciera(Base):
    """
    Modelo ORM para la tabla 'transacciones_financieras'.

    *** Núcleo del módulo financiero — Libro Mayor ***

    Cada centavo que entra o sale del negocio genera un registro
    INMUTABLE aquí. Este es el único lugar donde el sistema tiene
    la verdad económica completa.

    Principios de diseño:
        1. INMUTABILIDAD: las transacciones no se editan ni eliminan.
           Los errores se corrigen con transacciones compensatorias (contra-asientos).
        2. TRAZABILIDAD: id_referencia_origen + modulo_origen permiten
           rastrear cualquier transacción hasta su evento de negocio original.
        3. INTEGRACIÓN SIN FK CRUZADO: modulo_origen e id_referencia_origen
           son strings/integers planos — no existen FK reales hacia las BDs
           de otros microservicios.

    Flujos de origen:
        - modulo_origen = "Servicio"    → id_referencia_origen = id_sesion de Caja
        - modulo_origen = "Produccion"  → id_referencia_origen = id_orden_compra
        - modulo_origen = "RH"          → id_referencia_origen = id_planilla_sueldos
        - modulo_origen = "Manual"      → id_referencia_origen = NULL (operación interna)
    """

    __tablename__ = "transacciones_financieras"

    # --- Identificación ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Cuenta afectada (FK interna) ---
    id_cuenta = Column(
        Integer,
        ForeignKey("cuentas_financieras.id"),
        nullable=False,
        index=True,
        comment="Cuenta financiera cuyo saldo se modifica con esta transacción"
    )

    # --- Categoría contable (FK interna) ---
    id_categoria = Column(
        Integer,
        ForeignKey("categorias_contables.id"),
        nullable=False,
        index=True,
        comment="Clasificación contable (Ventas, Nómina, Proveedores, etc.)"
    )

    # --- Trazabilidad hacia microservicios externos ---
    modulo_origen = Column(
        Enum("Servicio", "Produccion", "RH", "Manual", name="modulo_origen_enum"),
        nullable=False,
        comment="Microservicio que originó el evento económico"
    )
    id_referencia_origen = Column(
        Integer,
        nullable=True,
        index=True,
        comment=(
            "ID del objeto en el módulo de origen. "
            "Ej: id_sesion para Servicio, id_planilla para RH. "
            "NULL para transacciones manuales internas."
        )
    )

    # --- Tipo de movimiento ---
    tipo_movimiento = Column(
        Enum("Ingreso", "Egreso", name="tipo_movimiento_financiero_enum"),
        nullable=False,
        comment="Ingreso suma al saldo de la cuenta; Egreso resta"
    )

    # --- Valor económico ---
    monto = Column(
        Numeric(14, 2),
        nullable=False,
        comment="Monto absoluto de la transacción (siempre positivo)"
    )

    # --- Descripción libre ---
    concepto = Column(
        Text,
        nullable=False,
        comment="Descripción legible del movimiento (ej: Cierre turno 2026-04-27, Nómina abril)"
    )

    # --- Timestamp de registro ---
    fecha_transaccion = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        index=True,
        comment="Momento exacto en que se registró la transacción en el sistema"
    )

    # --- Auditoría de creación (no se actualiza — registro inmutable) ---
    created_at = Column(DateTime, default=func.now())

    # --- Relaciones ORM ---
    cuenta = relationship(
        "CuentaFinanciera",
        back_populates="transacciones",
        doc="Cuenta financiera afectada por esta transacción."
    )
    categoria = relationship(
        "CategoriaContable",
        back_populates="transacciones",
        doc="Categoría contable que clasifica esta transacción."
    )

    def __repr__(self):
        return (
            f"<TransaccionFinanciera(id={self.id}, tipo='{self.tipo_movimiento}', "
            f"monto={self.monto}, origen='{self.modulo_origen}', "
            f"ref={self.id_referencia_origen})>"
        )
