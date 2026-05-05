from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy import create_engine

from alembic import context

# Necesario para que Python encuentre los módulos de tu aplicación (app/)
import os
import sys
# Asegura que el directorio raíz del servicio esté en el path (production_service/)
sys.path.insert(0, os.getcwd())

# ── Importaciones clave de la app ────────────────────────────
from app.config import settings
from app.db import Base

# ── CRÍTICO: Importar TODOS los modelos ORM ──────────────────
# Si un modelo no se importa aquí, Alembic no lo detectará
# en Base.metadata y no generará su migración.
from app.models import products_model
from app.models import recipes
from app.models import recipe_ingredients
from app.models import production_order
from app.models import production_waste_logs
# ─────────────────────────────────────────────────────────────

# Carga la configuración del .ini
config = context.config

# Configuración de logs desde el alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata apunta a la Base de SQLAlchemy para que Alembic
# sepa qué modelos debe rastrear y genere las migraciones correctamente.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo 'offline'.

    Genera sentencias SQL sin conectarse a la base de datos.
    Útil para revisar el SQL antes de ejecutarlo.
    """
    # Tomamos la URL directamente desde tu configuración (lee el .env)
    url = settings.DATABASE_URL

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecuta migraciones en modo 'online'.

    Se conecta a MySQL y aplica los cambios directamente.
    """
    # Tomamos la URL desde tu configuración (lee el .env)
    alembic_url = settings.DATABASE_URL

    # Creamos el motor de conexión
    connectable = create_engine(
        alembic_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
