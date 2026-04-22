"""
Tests Unitarios — Área de Recursos Humanos (RH Service)
========================================================
Tests simples sobre los objetos del dominio: Employee, PayrollPeriod
y la lógica de conversión de días del EmployeeSchedule.

Ejecutar con:
    pytest tests/test_rh_services.py -v
"""

import pytest
from datetime import date, time
from decimal import Decimal


# ===========================================================================
# TEST 1 — Objeto Employee: atributos y valores por defecto
# ===========================================================================

class TestEmployeeObject:
    """
    Verifica que el objeto Employee almacena correctamente sus
    atributos básicos al ser instanciado sin base de datos.
    """

    def _make_employee(self, **kwargs):
        """Crea un Employee simple sin pasar por SQLAlchemy."""
        # Importamos aquí para tener el error de importación cerca del test
        from app.models.employee import Employee

        emp = Employee()
        emp.id              = kwargs.get("id", 1)
        emp.nombre          = kwargs.get("nombre", "Ana")
        emp.apellido        = kwargs.get("apellido", "López")
        emp.email           = kwargs.get("email", "ana@empresa.com")
        emp.puesto          = kwargs.get("puesto", "Barista")
        emp.fecha_ingreso   = kwargs.get("fecha_ingreso", date(2024, 1, 15))
        emp.tarifa_hora     = kwargs.get("tarifa_hora", Decimal("15.00"))
        emp.es_salario_fijo = kwargs.get("es_salario_fijo", False)
        emp.rol_id          = kwargs.get("rol_id", 2)
        emp.sucursal_id     = kwargs.get("sucursal_id", 1)
        emp.is_active       = kwargs.get("is_active", True)
        emp.desempeño_score = kwargs.get("desempeño_score", 50)
        return emp

    # ------------------------------------------------------------------
    # 1-A  Caso feliz: los campos se guardan tal cual se asignan
    # ------------------------------------------------------------------
    def test_employee_stores_basic_fields_correctly(self):
        """
        DADO   un Employee al que le asignamos nombre, email y puesto,
        CUANDO accedemos a esos atributos,
        ENTONCES devuelven exactamente los valores asignados.
        """
        # Arrange & Act
        emp = self._make_employee(
            nombre   = "Carlos",
            apellido = "Ruiz",
            email    = "carlos.ruiz@empresa.com",
            puesto   = "Mesero",
        )

        # Assert
        assert emp.nombre   == "Carlos"
        assert emp.apellido == "Ruiz"
        assert emp.email    == "carlos.ruiz@empresa.com"
        assert emp.puesto   == "Mesero"

    # ------------------------------------------------------------------
    # 1-B  Caso borde: empleado inactivo tiene is_active = False
    # ------------------------------------------------------------------
    def test_employee_inactive_flag(self):
        """
        DADO   un Employee creado con is_active=False,
        CUANDO revisamos su estado,
        ENTONCES is_active es False y los demás campos siguen intactos.
        """
        # Arrange & Act
        emp = self._make_employee(nombre="Pedro", is_active=False)

        # Assert
        assert emp.is_active is False
        assert emp.nombre == "Pedro"     # otros campos no se alteran

    # ------------------------------------------------------------------
    # 1-C  Representación __repr__ incluye id y nombre completo
    # ------------------------------------------------------------------
    def test_employee_repr_contains_id_and_name(self):
        """
        DADO   un Employee con id=7 y nombre "Laura Gómez",
        CUANDO se llama a repr(),
        ENTONCES el string incluye el id y el nombre.
        """
        # Arrange & Act
        emp = self._make_employee(id=7, nombre="Laura", apellido="Gómez")

        # Assert
        text = repr(emp)
        assert "7"     in text
        assert "Laura" in text


# ===========================================================================
# TEST 2 — Objeto PayrollPeriod: atributos y comparación de fechas
# ===========================================================================

class TestPayrollPeriodObject:
    """
    Verifica que el objeto PayrollPeriod almacena sus fechas y estado
    correctamente, y que podemos comparar fechas con lógica propia.
    """

    def _make_period(self, **kwargs):
        from app.models.payroll_period import PayrollPeriod

        p = PayrollPeriod()
        p.id                   = kwargs.get("id", 1)
        p.nombre_periodo       = kwargs.get("nombre_periodo", "Nómina Abril 2026")
        p.fecha_inicio         = kwargs.get("fecha_inicio", date(2026, 4, 1))
        p.fecha_fin            = kwargs.get("fecha_fin", date(2026, 4, 30))
        p.fecha_corte_revision = kwargs.get("fecha_corte_revision", date(2026, 5, 5))
        p.estado               = kwargs.get("estado", "Pendiente de Revisión")
        p.finalizado           = kwargs.get("finalizado", False)
        return p

    # ------------------------------------------------------------------
    # 2-A  Caso feliz: las fechas se almacenan y se pueden comparar
    # ------------------------------------------------------------------
    def test_payroll_period_stores_dates_correctly(self):
        """
        DADO   un PayrollPeriod con fechas de inicio y fin definidas,
        CUANDO accedemos a sus fechas,
        ENTONCES fecha_inicio es anterior a fecha_fin (período válido).
        """
        # Arrange & Act
        period = self._make_period(
            fecha_inicio = date(2026, 4, 1),
            fecha_fin    = date(2026, 4, 30),
        )

        # Assert
        assert period.fecha_inicio < period.fecha_fin

    # ------------------------------------------------------------------
    # 2-B  Caso borde: período finalizado tiene flag True
    # ------------------------------------------------------------------
    def test_payroll_period_finalizado_flag(self):
        """
        DADO   un PayrollPeriod marcado como finalizado,
        CUANDO revisamos su estado,
        ENTONCES finalizado es True y el nombre del período se conserva.
        """
        # Arrange & Act
        period = self._make_period(
            nombre_periodo = "Nómina Marzo 2026",
            finalizado     = True,
        )

        # Assert
        assert period.finalizado is True
        assert period.nombre_periodo == "Nómina Marzo 2026"

    # ------------------------------------------------------------------
    # 2-C  Caso borde: fecha_corte_revision posterior a fecha_fin
    # ------------------------------------------------------------------
    def test_payroll_period_corte_is_after_end_date(self):
        """
        DADO   un período donde la fecha de corte de revisión es posterior a la fecha de fin,
        CUANDO comparamos las fechas,
        ENTONCES fecha_corte_revision > fecha_fin (comportamiento esperado del negocio).
        """
        # Arrange & Act
        period = self._make_period(
            fecha_fin            = date(2026, 4, 30),
            fecha_corte_revision = date(2026, 5, 5),
        )

        # Assert
        assert period.fecha_corte_revision > period.fecha_fin


# ===========================================================================
# TEST 3 — EmployeeSchedule: lógica de días de la semana
# ===========================================================================

class TestEmployeeScheduleObject:
    """
    Verifica la conversión y lectura de días_semana en EmployeeSchedule.
    El campo dias_semana se almacena como string "1,2,3,4,5".
    Testeamos la lógica de conversión directamente sobre el objeto.
    """

    def _make_schedule(self, **kwargs):
        from app.models.employee_schedule import EmployeeSchedule

        s = EmployeeSchedule()
        s.id                = kwargs.get("id", 1)
        s.employee_id       = kwargs.get("employee_id", 1)
        s.sucursal_id       = kwargs.get("sucursal_id", 1)
        s.nombre_horario    = kwargs.get("nombre_horario", "Turno Mañana")
        s.dias_semana       = kwargs.get("dias_semana", "1,2,3,4,5")
        s.hora_inicio_patron= kwargs.get("hora_inicio_patron", time(8, 0))
        s.hora_fin_patron   = kwargs.get("hora_fin_patron", time(17, 0))
        s.es_actual         = kwargs.get("es_actual", True)
        s.descripcion       = kwargs.get("descripcion", "")
        return s

    # ------------------------------------------------------------------
    # 3-A  Caso feliz: string de días se convierte a lista de enteros
    # ------------------------------------------------------------------
    def test_dias_semana_string_converts_to_list(self):
        """
        DADO   un EmployeeSchedule con dias_semana = "1,2,3,4,5",
        CUANDO convertimos el string usando la lógica del servicio (split + map),
        ENTONCES obtenemos la lista [1, 2, 3, 4, 5].
        """
        # Arrange
        schedule = self._make_schedule(dias_semana="1,2,3,4,5")

        # Act — misma lógica que usa create_schedule internamente
        dias_list = list(map(int, schedule.dias_semana.split(',')))

        # Assert
        assert dias_list == [1, 2, 3, 4, 5]
        assert len(dias_list) == 5

    # ------------------------------------------------------------------
    # 3-B  Caso borde: un solo día (solo domingo = 7)
    # ------------------------------------------------------------------
    def test_dias_semana_single_day(self):
        """
        DADO   un horario asignado solo los domingos (día 7),
        CUANDO convertimos dias_semana,
        ENTONCES la lista tiene exactamente un elemento: [7].
        """
        # Arrange
        schedule = self._make_schedule(dias_semana="7")

        # Act
        dias_list = list(map(int, schedule.dias_semana.split(',')))

        # Assert
        assert dias_list == [7]
        assert 7 in dias_list

    # ------------------------------------------------------------------
    # 3-C  Caso borde: hora_inicio debe ser menor a hora_fin
    # ------------------------------------------------------------------
    def test_schedule_start_time_before_end_time(self):
        """
        DADO   un horario con hora_inicio = 08:00 y hora_fin = 17:00,
        CUANDO comparamos las horas,
        ENTONCES hora_inicio_patron < hora_fin_patron (turno válido).
        """
        # Arrange & Act
        schedule = self._make_schedule(
            hora_inicio_patron = time(8, 0),
            hora_fin_patron    = time(17, 0),
        )

        # Assert
        assert schedule.hora_inicio_patron < schedule.hora_fin_patron
