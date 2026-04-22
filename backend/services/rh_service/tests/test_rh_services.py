"""
Unit Tests — Área de Recursos Humanos (RH Service)
====================================================
Framework : pytest + unittest.mock
Servicios : EmployeeService, PayrollPeriodService, EmployeeScheduleService

Ejecutar con:
    pytest tests/test_rh_services.py -v
"""

import pytest
from datetime import date, time
from decimal import Decimal
from unittest.mock import MagicMock, patch, call
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError


# ---------------------------------------------------------------------------
# Helpers de fábrica — crean objetos fake sin tocar la BD
# ---------------------------------------------------------------------------

def make_employee(**kwargs):
    """Crea un mock de Employee con valores por defecto sensatos."""
    emp = MagicMock()
    emp.id            = kwargs.get("id", 1)
    emp.nombre        = kwargs.get("nombre", "Ana")
    emp.apellido      = kwargs.get("apellido", "López")
    emp.email         = kwargs.get("email", "ana.lopez@empresa.com")
    emp.puesto        = kwargs.get("puesto", "Barista")
    emp.fecha_ingreso = kwargs.get("fecha_ingreso", date(2024, 1, 15))
    emp.tarifa_hora   = kwargs.get("tarifa_hora", Decimal("15.00"))
    emp.es_salario_fijo = kwargs.get("es_salario_fijo", False)
    emp.rol_id        = kwargs.get("rol_id", 2)
    emp.sucursal_id   = kwargs.get("sucursal_id", 1)
    emp.is_active     = kwargs.get("is_active", True)
    emp.desempeño_score = kwargs.get("desempeño_score", 50)
    return emp


def make_period(**kwargs):
    """Crea un mock de PayrollPeriod con valores por defecto sensatos."""
    p = MagicMock()
    p.id                   = kwargs.get("id", 10)
    p.nombre_periodo       = kwargs.get("nombre_periodo", "Nómina Abril 2026")
    p.fecha_inicio         = kwargs.get("fecha_inicio", date(2026, 4, 1))
    p.fecha_fin            = kwargs.get("fecha_fin", date(2026, 4, 30))
    p.fecha_corte_revision = kwargs.get("fecha_corte_revision", date(2026, 5, 5))
    p.estado               = kwargs.get("estado", "Pendiente de Revisión")
    p.finalizado           = kwargs.get("finalizado", False)
    p.details              = kwargs.get("details", [])
    return p


# ===========================================================================
# TEST 1 — EmployeeService: Crear empleado y manejar email duplicado
# ===========================================================================

class TestEmployeeService:
    """
    Tests para EmployeeService.create_employee.

    Cubre:
      - Caso feliz: empleado creado correctamente.
      - Caso borde: email duplicado → IntegrityError → HTTP 400.
      - Caso borde: error inesperado de BD → HTTP 500 con detalle.
    """

    # Importamos aquí para aislar errores de importación de la lógica de test
    @pytest.fixture(autouse=True)
    def _import_service(self):
        from app.services.employee_service import EmployeeService
        self.service = EmployeeService()

    # ------------------------------------------------------------------
    # 1-A  Caso feliz: el empleado se persiste y se retorna correctamente
    # ------------------------------------------------------------------
    def test_create_employee_success(self):
        """
        DADO   un payload válido de EmployeeCreate,
        CUANDO se llama a create_employee,
        ENTONCES agrega el objeto a la sesión, hace commit, refresca y lo retorna.
        """
        # Arrange
        mock_db = MagicMock()
        new_emp = make_employee()
        mock_db.refresh.side_effect = lambda obj: None   # simula refresh in-place

        from app.schemas.schema_employee import EmployeeCreate
        payload = EmployeeCreate(
            nombre        = "Ana",
            apellido      = "López",
            email         = "ana.lopez@empresa.com",
            puesto        = "Barista",
            fecha_ingreso = date(2024, 1, 15),
            tarifa_hora   = Decimal("15.00"),
            es_salario_fijo = False,
            rol_id        = 2,
            sucursal_id   = 1,
        )

        # Patcheamos el constructor de Employee para devolver nuestro mock
        with patch("app.services.employee_service.Employee", return_value=new_emp):
            # Act
            result = self.service.create_employee(mock_db, payload)

        # Assert
        mock_db.add.assert_called_once_with(new_emp)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(new_emp)
        assert result is new_emp

    # ------------------------------------------------------------------
    # 1-B  Caso borde: email ya registrado → IntegrityError → HTTP 400
    # ------------------------------------------------------------------
    def test_create_employee_duplicate_email_raises_400(self):
        """
        DADO   que la BD lanza IntegrityError (email único violado),
        CUANDO se llama a create_employee,
        ENTONCES hace rollback y lanza HTTPException 400 con mensaje descriptivo.
        """
        # Arrange
        mock_db = MagicMock()
        mock_db.commit.side_effect = IntegrityError(
            statement="INSERT ...", params={}, orig=Exception("Duplicate entry")
        )

        from app.schemas.schema_employee import EmployeeCreate
        payload = EmployeeCreate(
            nombre        = "Carlos",
            apellido      = "Ruiz",
            email         = "duplicado@empresa.com",
            puesto        = "Mesero",
            fecha_ingreso = date(2025, 3, 1),
            rol_id        = 1,
            sucursal_id   = 1,
        )

        # Act & Assert
        with patch("app.services.employee_service.Employee", return_value=MagicMock()):
            with pytest.raises(HTTPException) as exc_info:
                self.service.create_employee(mock_db, payload)

        mock_db.rollback.assert_called_once()
        assert exc_info.value.status_code == 400
        assert "correo electrónico" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # 1-C  Caso borde: error genérico de BD → HTTP 500
    # ------------------------------------------------------------------
    def test_create_employee_generic_db_error_raises_500(self):
        """
        DADO   que la BD lanza un error desconocido,
        CUANDO se llama a create_employee,
        ENTONCES hace rollback y lanza HTTPException 500 con el mensaje de error.
        """
        # Arrange
        mock_db = MagicMock()
        db_error = RuntimeError("Connection pool exhausted")
        mock_db.commit.side_effect = db_error

        from app.schemas.schema_employee import EmployeeCreate
        payload = EmployeeCreate(
            nombre        = "Luisa",
            apellido      = "Mendoza",
            email         = "luisa@empresa.com",
            puesto        = "Cajera",
            fecha_ingreso = date(2025, 6, 1),
            rol_id        = 3,
            sucursal_id   = 2,
        )

        # Act & Assert
        with patch("app.services.employee_service.Employee", return_value=MagicMock()):
            with pytest.raises(HTTPException) as exc_info:
                self.service.create_employee(mock_db, payload)

        mock_db.rollback.assert_called_once()
        assert exc_info.value.status_code == 500
        assert "Connection pool exhausted" in exc_info.value.detail


# ===========================================================================
# TEST 2 — PayrollPeriodService: Validación de fechas y restricción de borrado
# ===========================================================================

class TestPayrollPeriodService:
    """
    Tests para PayrollPeriodService.create_period y delete_period.

    Cubre:
      - Caso feliz: período con fechas válidas se crea y retorna.
      - Caso borde: fecha_inicio >= fecha_fin → HTTP 400 (sin llegar a la BD).
      - Caso de negocio: borrar período con detalles de pago → HTTP 400.
    """

    @pytest.fixture(autouse=True)
    def _import_service(self):
        from app.services.payroll_period_service import PayrollPeriodService
        self.service = PayrollPeriodService()

    # ------------------------------------------------------------------
    # 2-A  Caso feliz: periodo creado exitosamente
    # ------------------------------------------------------------------
    def test_create_period_valid_dates_success(self):
        """
        DADO   un PayrollPeriodCreate con fecha_inicio < fecha_fin,
        CUANDO se llama a create_period,
        ENTONCES persiste el objeto y lo retorna sin lanzar excepciones.
        """
        # Arrange
        mock_db    = MagicMock()
        new_period = make_period()
        mock_db.refresh.side_effect = lambda obj: None

        from app.schemas.payroll_period import PayrollPeriodCreate
        payload = PayrollPeriodCreate(
            nombre_periodo       = "Nómina Abril 2026",
            fecha_inicio         = date(2026, 4, 1),
            fecha_fin            = date(2026, 4, 30),
            fecha_corte_revision = date(2026, 5, 5),
        )

        with patch("app.services.payroll_period_service.PayrollPeriod", return_value=new_period):
            # Act
            result = self.service.create_period(mock_db, payload)

        # Assert
        mock_db.add.assert_called_once_with(new_period)
        mock_db.commit.assert_called_once()
        assert result is new_period

    # ------------------------------------------------------------------
    # 2-B  Caso borde: fecha_inicio >= fecha_fin → HTTP 400 inmediato
    # ------------------------------------------------------------------
    def test_create_period_invalid_dates_raises_400(self):
        """
        DADO   un período donde fecha_inicio es igual o posterior a fecha_fin,
        CUANDO se llama a create_period,
        ENTONCES lanza HTTPException 400 ANTES de tocar la BD.
        """
        # Arrange
        mock_db = MagicMock()

        from app.schemas.payroll_period import PayrollPeriodCreate

        # Sub-caso A: fechas iguales
        payload_equal = PayrollPeriodCreate(
            nombre_periodo       = "Período Inválido",
            fecha_inicio         = date(2026, 5, 1),
            fecha_fin            = date(2026, 5, 1),   # ← igual → inválido
            fecha_corte_revision = date(2026, 5, 10),
        )

        # Sub-caso B: inicio posterior al fin
        payload_inverted = PayrollPeriodCreate(
            nombre_periodo       = "Período Invertido",
            fecha_inicio         = date(2026, 5, 31),
            fecha_fin            = date(2026, 5, 1),   # ← anterior → inválido
            fecha_corte_revision = date(2026, 6, 5),
        )

        for payload in (payload_equal, payload_inverted):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                self.service.create_period(mock_db, payload)

            assert exc_info.value.status_code == 400
            assert "fecha de inicio" in exc_info.value.detail.lower()

        # La BD no fue contactada en ningún sub-caso
        mock_db.add.assert_not_called()
        mock_db.commit.assert_not_called()

    # ------------------------------------------------------------------
    # 2-C  Regla de negocio: no eliminar período con detalles asociados
    # ------------------------------------------------------------------
    def test_delete_period_with_payment_details_raises_400(self):
        """
        DADO   un período de nómina que ya tiene detalles de pago asociados,
        CUANDO se llama a delete_period,
        ENTONCES lanza HTTPException 400 y NO elimina ni hace commit.
        """
        # Arrange
        mock_db = MagicMock()
        # El período tiene detalles de pago (lista no vacía)
        period_with_details = make_period(details=[MagicMock(), MagicMock()])

        # Mockeamos get_period_by_id para que retorne el período sin ir a la BD
        self.service.get_period_by_id = MagicMock(return_value=period_with_details)

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            self.service.delete_period(mock_db, period_id=10)

        assert exc_info.value.status_code == 400
        assert "detalles de pago" in exc_info.value.detail.lower()
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()


# ===========================================================================
# TEST 3 — EmployeeScheduleService: Validaciones de negocio al crear horario
# ===========================================================================

class TestEmployeeScheduleService:
    """
    Tests para EmployeeScheduleService.create_schedule.

    Cubre:
      - Caso feliz: horario creado cuando empleado, sucursal y horas son válidos.
      - Caso borde: empleado no pertenece a la sucursal → HTTP 400.
      - Caso borde: hora_inicio >= hora_fin → HTTP 400.
      - Caso borde: patrón duplicado para los mismos días → HTTP 409.
    """

    @pytest.fixture(autouse=True)
    def _import_service(self):
        from app.services.employee_Schedule_service import EmployeeScheduleService
        self.service = EmployeeScheduleService()

    def _make_schedule_payload(self, **overrides):
        """Construye un EmployeeScheduleCreate con valores válidos por defecto."""
        from app.schemas.schema_employee_schedule import EmployeeScheduleCreate
        defaults = dict(
            employee_id       = 1,
            sucursal_id       = 1,
            nombre_horario    = "Turno Mañana",
            dias_semana       = [1, 2, 3, 4, 5],   # Lunes-Viernes
            hora_inicio_patron= time(8, 0),
            hora_fin_patron   = time(17, 0),
            es_actual         = True,
            descripcion       = "Turno estándar",
        )
        defaults.update(overrides)
        return EmployeeScheduleCreate(**defaults)

    def _setup_db_queries(self, mock_db, employee=None, sucursal=None, existing_schedule=None):
        """
        Configura el mock de db.query() para que los filtros devuelvan
        los objetos indicados en la secuencia de llamadas que hace create_schedule.
        """
        # create_schedule hace 3 consultas en orden:
        # 1. Employee  2. Sucursal  3. EmployeeSchedule (duplicado)
        def query_side_effect(model):
            q = MagicMock()
            from app.models.employee import Employee
            from app.models.sucursal import Sucursal
            from app.models.employee_schedule import EmployeeSchedule

            if model is Employee:
                q.filter.return_value.first.return_value = employee
            elif model is Sucursal:
                q.filter.return_value.first.return_value = sucursal
            elif model is EmployeeSchedule:
                q.filter.return_value.first.return_value = existing_schedule
            return q

        mock_db.query.side_effect = query_side_effect

    # ------------------------------------------------------------------
    # 3-A  Caso feliz: horario creado exitosamente
    # ------------------------------------------------------------------
    def test_create_schedule_success(self):
        """
        DADO   un empleado que pertenece a la sucursal y un rango de horas válido,
        CUANDO se llama a create_schedule,
        ENTONCES persiste el horario y lo retorna.
        """
        # Arrange
        mock_db  = MagicMock()
        employee = make_employee(id=1, sucursal_id=1)
        sucursal = MagicMock(id=1)
        new_schedule = MagicMock(id=50)
        mock_db.refresh.side_effect = lambda obj: None

        self._setup_db_queries(mock_db, employee=employee, sucursal=sucursal, existing_schedule=None)

        payload = self._make_schedule_payload()

        with patch("app.services.employee_Schedule_service.EmployeeSchedule", return_value=new_schedule):
            # Act
            result = self.service.create_schedule(mock_db, payload)

        # Assert
        mock_db.add.assert_called_once_with(new_schedule)
        mock_db.commit.assert_called_once()
        assert result is new_schedule

    # ------------------------------------------------------------------
    # 3-B  Caso borde: empleado en sucursal diferente → HTTP 400
    # ------------------------------------------------------------------
    def test_create_schedule_employee_wrong_sucursal_raises_400(self):
        """
        DADO   un empleado que pertenece a sucursal_id=2 pero el payload indica sucursal_id=1,
        CUANDO se llama a create_schedule,
        ENTONCES lanza HTTPException 400 indicando que no pertenece a la sucursal.
        """
        # Arrange
        mock_db  = MagicMock()
        employee = make_employee(id=1, sucursal_id=2)   # ← sucursal DIFERENTE
        sucursal = MagicMock(id=1)

        self._setup_db_queries(mock_db, employee=employee, sucursal=sucursal)

        payload = self._make_schedule_payload(employee_id=1, sucursal_id=1)

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            self.service.create_schedule(mock_db, payload)

        assert exc_info.value.status_code == 400
        assert "no pertenece" in exc_info.value.detail.lower()
        mock_db.add.assert_not_called()

    # ------------------------------------------------------------------
    # 3-C  Caso borde: hora_inicio >= hora_fin → HTTP 400
    # ------------------------------------------------------------------
    def test_create_schedule_invalid_hours_raises_400(self):
        """
        DADO   que hora_inicio_patron es igual o posterior a hora_fin_patron,
        CUANDO se llama a create_schedule con un empleado y sucursal válidos,
        ENTONCES lanza HTTPException 400 antes de persistir el objeto.
        """
        # Arrange
        mock_db  = MagicMock()
        employee = make_employee(id=1, sucursal_id=1)
        sucursal = MagicMock(id=1)

        self._setup_db_queries(mock_db, employee=employee, sucursal=sucursal)

        # Sub-caso A: horas iguales
        payload_equal = self._make_schedule_payload(
            hora_inicio_patron=time(9, 0),
            hora_fin_patron   =time(9, 0),   # igual → inválido
        )
        # Sub-caso B: inicio posterior al fin
        payload_inverted = self._make_schedule_payload(
            hora_inicio_patron=time(18, 0),
            hora_fin_patron   =time(8, 0),   # invertido → inválido
        )

        for bad_payload in (payload_equal, payload_inverted):
            with pytest.raises(HTTPException) as exc_info:
                self.service.create_schedule(mock_db, bad_payload)

            assert exc_info.value.status_code == 400
            assert "hora de inicio" in exc_info.value.detail.lower()

        mock_db.add.assert_not_called()

    # ------------------------------------------------------------------
    # 3-D  Caso borde: patrón duplicado (mismos días) → HTTP 409
    # ------------------------------------------------------------------
    def test_create_schedule_duplicate_pattern_raises_409(self):
        """
        DADO   que ya existe un patrón activo para el mismo empleado y los mismos días,
        CUANDO se llama a create_schedule,
        ENTONCES lanza HTTPException 409 Conflict.
        """
        # Arrange
        mock_db           = MagicMock()
        employee          = make_employee(id=1, sucursal_id=1)
        sucursal          = MagicMock(id=1)
        existing_schedule = MagicMock(id=99)   # ← Patrón duplicado

        self._setup_db_queries(
            mock_db,
            employee=employee,
            sucursal=sucursal,
            existing_schedule=existing_schedule,
        )

        payload = self._make_schedule_payload()   # dias_semana=[1,2,3,4,5]

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            self.service.create_schedule(mock_db, payload)

        assert exc_info.value.status_code == 409
        assert "ya existe" in exc_info.value.detail.lower()
        mock_db.add.assert_not_called()
