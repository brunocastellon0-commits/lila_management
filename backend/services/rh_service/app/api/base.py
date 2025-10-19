from fastapi import APIRouter

# Importa los routers de los diferentes módulos (Rutas Directas en app/api/)
from app.api import employee_router
from app.api import document_router 
from app.api import employee_schedule_router 
from app.api import pay_component_router 
from app.api import payment_detail_router 
from app.api import payroll_period_router 
from app.api import request_router 
from app.api import shift_router 
from app.api import training_router 
# NUEVO: Importamos el router de HR Gateway para estadísticas y alertas
from app.api import alert_router

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

# 4. Rutas de componentes de pagos
api_router.include_router(pay_component_router.router, tags=["pay_component"], prefix="/components")

# 5. Rutas de detalles de pagos
api_router.include_router(payment_detail_router.router, tags=["pay_details"], prefix="/details")

# 6. Rutas de periodos de pago
api_router.include_router(payroll_period_router.router, tags=["pay_period"], prefix="/periods")

# 7. Solicitudes de empleado
api_router.include_router(request_router.router, tags=["request"], prefix="/request")

# 8. Turnos de empleados
api_router.include_router(shift_router.router, tags=["shift"], prefix="/shift")

# 9. Capacitaciones
api_router.include_router(training_router.router, tags=["training"], prefix="/training")

# 10. RUTAS CONSOLIDADAS: HR Gateway (Estadísticas y Alertas)

api_router.include_router(
    alert_router.router,
    prefix="/alert", 
    tags=["Alertas"]
)