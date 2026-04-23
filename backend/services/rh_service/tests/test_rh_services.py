from datetime import datetime
from decimal import Decimal

class TestRoleCreation:
    """Verifica que el objeto Role almacena sus atributos correctamente."""

    def _make_role(self, **kwargs):
        from app.models.role import Role
        r = Role()
        r.id          = kwargs.get("id", 1)
        r.rol         = kwargs.get("rol", "Barista")
        r.descripcion = kwargs.get("descripcion", "Prepara bebidas de cafe")
        return r

    def test_role_stores_fields_correctly(self):
        print("\n[ARRANGE] Creando objeto Role con id=3, rol='Gerente'")
        role = self._make_role(id=3, rol="Gerente", descripcion="Responsable del local")
        print(f"[ACT]     Objeto creado -> {repr(role)}")

        print("[ASSERT]  Verificando role.id == 3")
        assert role.id == 3
        print("[ASSERT]  Verificando role.rol == 'Gerente'")
        assert role.rol == "Gerente"
        print("[ASSERT]  Verificando role.descripcion")
        assert role.descripcion == "Responsable del local"
        print("[OK]      Todos los campos coinciden")

    def test_role_repr_contains_id_and_name(self):
        print("\n[ARRANGE] Creando Role con id=5, rol='Cajero'")
        role = self._make_role(id=5, rol="Cajero")
        text = repr(role)
        print(f"[ACT]     repr(role) -> '{text}'")

        print("[ASSERT]  Verificando que '5' esta en el repr")
        assert "5" in text
        print("[ASSERT]  Verificando que 'Cajero' esta en el repr")
        assert "Cajero" in text
        print("[OK]      repr contiene id y nombre")


class TestPostulanteCreation:
    """Verifica que el objeto postulante almacena sus datos correctamente."""

    def _make_postulante(self, **kwargs):
        from app.models.postulante import postulante
        p = postulante()
        p.id                   = kwargs.get("id", 1)
        p.nombre               = kwargs.get("nombre", "Sofia Martinez")
        p.telefono             = kwargs.get("telefono", "+502 5555-1234")
        p.correo               = kwargs.get("correo", "sofia@email.com")
        p.ruta_cv              = kwargs.get("ruta_cv", "/cvs/sofia.pdf")
        p.rol_id               = kwargs.get("rol_id", 2)
        p.match_score          = kwargs.get("match_score", None)
        p.analisis_ia          = kwargs.get("analisis_ia", None)
        p.es_apto              = kwargs.get("es_apto", False)
        p.fecha_postulacion    = kwargs.get("fecha_postulacion", datetime(2026, 4, 20))
        p.estado_entrevista    = kwargs.get("estado_entrevista", "pendiente")
        p.fecha_entrevista     = kwargs.get("fecha_entrevista", None)
        p.modalidad_entrevista = kwargs.get("modalidad_entrevista", None)
        p.notas_entrevista     = kwargs.get("notas_entrevista", None)
        return p

    def test_postulante_stores_contact_fields_correctly(self):
        print("\n[ARRANGE] Creando postulante Luis Herrera para rol_id=1")
        p = self._make_postulante(
            nombre   = "Luis Herrera",
            correo   = "luis.h@email.com",
            telefono = "+502 5999-4321",
            rol_id   = 1,
        )
        print(f"[ACT]     Objeto creado -> nombre='{p.nombre}', correo='{p.correo}'")

        print("[ASSERT]  Verificando campos de contacto")
        assert p.nombre   == "Luis Herrera"
        assert p.correo   == "luis.h@email.com"
        assert p.telefono == "+502 5999-4321"
        assert p.rol_id   == 1
        print("[OK]      Datos de contacto correctos")

    def test_postulante_default_status_on_creation(self):
        print("\n[ARRANGE] Creando postulante con valores por defecto")
        p = self._make_postulante()
        print(f"[ACT]     es_apto={p.es_apto}, estado='{p.estado_entrevista}', match_score={p.match_score}")

        print("[ASSERT]  es_apto debe ser False")
        assert p.es_apto is False
        print("[ASSERT]  estado_entrevista debe ser 'pendiente'")
        assert p.estado_entrevista == "pendiente"
        print("[ASSERT]  match_score debe ser None")
        assert p.match_score is None
        print("[OK]      Estado inicial correcto")


class TestPayComponentCreation:
    """Verifica que el objeto PayComponent almacena su tipo y monto correctamente."""

    def _make_pay_component(self, **kwargs):
        from app.models.pay_component import PayComponent
        pc = PayComponent()
        pc.id                = kwargs.get("id", 1)
        pc.payment_detail_id = kwargs.get("payment_detail_id", 10)
        pc.tipo              = kwargs.get("tipo", "Salario Base")
        pc.descripcion       = kwargs.get("descripcion", "Pago fijo mensual")
        pc.monto             = kwargs.get("monto", Decimal("3500.00"))
        return pc

    def test_pay_component_stores_fields_correctly(self):
        print("\n[ARRANGE] Creando PayComponent tipo='Bono', monto=500.00")
        pc = self._make_pay_component(
            tipo        = "Bono",
            descripcion = "Bono por desempeno Q1",
            monto       = Decimal("500.00"),
        )
        print(f"[ACT]     Objeto creado -> tipo='{pc.tipo}', monto={pc.monto}")

        print("[ASSERT]  Verificando tipo, descripcion y monto")
        assert pc.tipo        == "Bono"
        assert pc.descripcion == "Bono por desempeno Q1"
        assert pc.monto       == Decimal("500.00")
        print("[OK]      Campos de componente de pago correctos")

    def test_pay_component_negative_monto_represents_discount(self):
        print("\n[ARRANGE] Creando PayComponent tipo='Descuento', monto=-150.00")
        pc = self._make_pay_component(tipo="Descuento", monto=Decimal("-150.00"))
        print(f"[ACT]     monto={pc.monto} - esperamos valor negativo")

        print("[ASSERT]  monto debe ser -150.00 y menor a 0")
        assert pc.tipo  == "Descuento"
        assert pc.monto == Decimal("-150.00")
        assert pc.monto  < Decimal("0")
        print("[OK]      Descuento representado con monto negativo")

    def test_pay_component_repr_contains_key_info(self):
        print("\n[ARRANGE] Creando PayComponent id=99, tipo='Horas Extra', monto=200.00")
        pc = self._make_pay_component(id=99, tipo="Horas Extra", monto=Decimal("200.00"))
        text = repr(pc)
        print(f"[ACT]     repr(pc) -> '{text}'")

        print("[ASSERT]  Verificando que repr contiene '99', 'Horas Extra' y '200'")
        assert "99"          in text
        assert "Horas Extra" in text
        assert "200"         in text
        print("[OK]      repr contiene informacion clave")
