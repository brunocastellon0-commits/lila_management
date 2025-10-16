from pydantic import BaseModel, Field
from decimal import Decimal

# --------------------------------------------------------------------
# 1. PaymentDetailCreate (Esquema de Entrada: POST/Creación/Cálculo)
# --------------------------------------------------------------------
class PaymentDetailCreate(BaseModel):
    """
    Schema para registrar el resumen de pago de un empleado en un período de nómina.
    Utiliza los campos del cálculo de nómina adaptados para horas o salario fijo.
    """
    # Claves Foráneas
    employee_id: int = Field(..., description="ID del empleado receptor del pago.")
    period_id: int = Field(..., description="ID del período de nómina asociado.")
    
    # --- Componentes Base del Pago  ---
    
    horas_totales_trabajadas: Decimal | None = Field(None, decimal_places=2, description="Total de horas trabajadas para el cálculo.")
    
    # Monto base calculado (requerido para ambos tipos de pago).
    monto_base_calculado: Decimal = Field(..., decimal_places=2, description="Monto base (salario fijo o horas*tarifa) antes de ajustes.")
    
    # --- Ajustes y Totales ---
    
    total_descuentos: Decimal = Field(default=Decimal(0.00), decimal_places=2, description="Suma total de deducciones aplicadas.")
    total_bonificaciones: Decimal = Field(default=Decimal(0.00), decimal_places=2, description="Suma total de bonos y pagos extra.")
    
    # Monto final, es opcional/None al crear ya que se calcula en el servicio.
    monto_neto: Decimal | None = Field(None, decimal_places=2, description="Monto final (neto) a pagar al empleado.")
    
# --------------------------------------------------------------------
# 2. PaymentDetailUpdate (Esquema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------
class PaymentDetailUpdate(BaseModel):
    """
    Schema para actualizar el detalle de pago. Todos los campos son opcionales.
    """
    employee_id: int | None = None
    period_id: int | None = None
    horas_totales_trabajadas: Decimal | None = Field(None, decimal_places=2)
    monto_base_calculado: Decimal | None = Field(None, decimal_places=2)
    total_descuentos: Decimal | None = Field(None, decimal_places=2)
    total_bonificaciones: Decimal | None = Field(None, decimal_places=2)
    monto_neto: Decimal | None = Field(None, decimal_places=2) # Se puede anular o se recalcula

# --------------------------------------------------------------------
# 3. PaymentDetailResponse (Esquema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class PaymentDetailResponse(BaseModel):
    """
    Schema de respuesta que incluye los campos generados por la base de datos (ID) 
    y el estado final del pago.
    """
    id: int
    employee_id: int
    period_id: int
    
    # Campos de nómina actualizados
    horas_totales_trabajadas: Decimal | None
    monto_base_calculado: Decimal
    
    total_descuentos: Decimal
    total_bonificaciones: Decimal
    monto_neto: Decimal | None # Puede ser None si el pago no ha finalizado
    
    model_config = {
        "from_attributes": True # Permite el mapeo desde el objeto ORM
    }
