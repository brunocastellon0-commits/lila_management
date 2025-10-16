from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy import create_engine 

from alembic import context

# Esto es necesario para que Python encuentre los módulos de tu aplicación (app/)
import os
import sys
# Asegura que el directorio raíz del proyecto esté en el path (rh_service/)
sys.path.insert(0, os.getcwd()) 

# IMPORTACIONES CLAVE DE TU APP
from app.utils.config import settings
from app.database import Base 

# --------------------------------------------------------------------------
# PASO CRÍTICO: Asegurarse de que todos los modelos ORM sean importados.
# Si no se importan aquí, Alembic no los verá en Base.metadata.
# --------------------------------------------------------------------------
from app.models import employee 
from app.models import payment_detail 
from app.models import payroll_period 
from app.models import document
from app.models import employee_schedule
from app.models import pay_component
from app.models import request
from app.models import shift
from app.models import training
# NOTA: Ajusta estas líneas si tus modelos están en otro lugar.
# --------------------------------------------------------------------------

# Carga la configuración del .ini
config = context.config

# Configuración de logs
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata apunta a la Base de SQLAlchemy para que Alembic
# sepa qué modelos debe rastrear (incluyendo Employee, PaymentDetail, etc.).
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo 'offline'.
    
    Esto genera sentencias SQL sin conectarse a la base de datos.
    """
    
    # Obtenemos la URL de la base de datos directamente de tu configuración
    url = settings.DATABASE_URL
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True, # Necesario SÓLO para el modo offline/generación de SQL
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecuta migraciones en modo 'online'.

    Se conecta a la DB para ejecutar los comandos (upgrade/downgrade).
    """
    
    # 1. Obtenemos la URL de tu configuración de FastAPI
    alembic_url = settings.DATABASE_URL
    
    # 2. Creamos el motor de forma manual usando la URL y el dialecto MySQL
    connectable = create_engine(
        alembic_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
            # NOTA: En el modo online no se usan literal_binds=True
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
