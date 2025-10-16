# Este archivo actúa como el router principal que agrupa todas las rutas de la API.
from fastapi import APIRouter

# Importa los routers de los diferentes módulos (Rutas Directas en app/api/)
from app.api import employee_router
from app.api import document_router # Importamos el router de documentos
from app.api import employee_schedule_router # Importamos el router de horarios
from app.api import pay_component_router #pay components
from app.api import payment_detail_router #pay detail
from app.api import payroll_period_router #pay period
from app.api import request_router #request
from app.api import shift_router #shift
from app.api import training_router #training
# El router principal
api_router = APIRouter()

# ---------------------------------------------------
# Inclusión de las rutas
# ---------------------------------------------------

# 1. Rutas de Empleados
api_router.include_router(employee_router.router, tags=["employees"], prefix="/employees")

# 2. Rutas de Documentos
api_router.include_router(document_router.router, tags=["documents"], prefix="/documents")

# 3. Rutas de Horarios de Empleados
api_router.include_router(employee_schedule_router.router, tags=["schedules"], prefix="/schedules")

#4. Rutas de componentes de pagos
api_router.include_router(pay_component_router.router, tags=["pay_component"], prefix="/components")

#4. Rutas de detalles de pagos
api_router.include_router(payment_detail_router.router, tags=["pay_details"], prefix="/details")

#5. Rutas de periodos de pago
api_router.include_router(payroll_period_router.router, tags=("pay_period"), prefix="/periods")

#6.request de employee

api_router.include_router(request_router.router, tags=("request"), prefix="/request")

#6. shifts empleados
api_router.include_router(shift_router.router, tags=("shift"), prefix="/shift")
#7. capacitaciones
api_router.include_router(shift_router.router, tags=("training"), prefix="/training")