import sys
import types
from pathlib import Path
from unittest.mock import MagicMock
from sqlalchemy.orm import DeclarativeBase

# Permite que Python encuentre el paquete 'app'
SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

# Mock de config para evitar dependencia de pydantic-settings
config_stub = types.ModuleType("app.utils.config")
config_stub.settings = MagicMock()
sys.modules["app.utils.config"] = config_stub

# Base declarativa real de SQLAlchemy, sin conexión a BD
class Base(DeclarativeBase):
    pass

db_stub = types.ModuleType("app.database")
db_stub.Base   = Base
db_stub.get_db = MagicMock()
sys.modules["app.database"] = db_stub

# Pre-cargar todos los modelos para que SQLAlchemy resuelva sus relaciones
import app.models.role
import app.models.sucursal
import app.models.employee
import app.models.employee_schedule
import app.models.payroll_period
import app.models.payment_detail
import app.models.pay_component
import app.models.postulante
import app.models.document
import app.models.request
import app.models.shift
import app.models.training
