from datetime import date
from pydantic import BaseModel, EmailStr, Field
from decimal import Decimal

# -------------------------------------------------------------------- 
# 1. PayComponentCreate (Esquema de Entrada: POST/Creación)
# --------------------------------------------------------------------
class PayComponentCreate(BaseModel):
    """
    Schema para crear una nueva línea de componente de pago.
    Requiere el ID del PaymentDetail al que pertenece.
    """
    # Clave foránea obligatoria
    payment_detail_id: int = Field(..., description="ID del detalle de pago (PaymentDetail) al que pertenece.")
    
    tipo: str = Field(..., max_length=50, description="Tipo de movimiento (Ej: Bono, Descuento, Horas Extra).")
    descripcion: str = Field(..., max_length=150, description="Motivo del movimiento económico.")
    
    # Decimal con 2 decimales para precisión monetaria
    monto: Decimal = Field(..., decimal_places=2, description="Monto del movimiento (positivo o negativo).") 

# --------------------------------------------------------------------
# 2. PayComponentUpdate (Esquema de Entrada: PATCH/Actualización)
# --------------------------------------------------------------------
class PayComponentUpdate(BaseModel):
    """
    Schema para actualizar componentes de pago. Todos los campos son opcionales.
    """
    payment_detail_id: int | None = None
    tipo: str | None = Field(None, max_length=50)
    descripcion: str | None = Field(None, max_length=150)
    monto: Decimal | None = Field(None, decimal_places=2)


# -------------------------------------------------------------------- 
# 3. PayComponentResponse (Esquema de Salida: GET/Lectura)
# --------------------------------------------------------------------
class PayComponentResponse(BaseModel):
    """
    Schema de respuesta que incluye el ID generado por la base de datos.
    """
    id: int
    payment_detail_id: int
    tipo: str
    descripcion: str
    monto: Decimal 
    
    model_config = {
        "from_attributes": True  # Permite mapear el objeto SQLAlchemy
    }
