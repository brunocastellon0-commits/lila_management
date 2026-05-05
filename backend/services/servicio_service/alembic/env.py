from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy import create_engine

from alembic import context

# Agregar la ruta del microservicio al sys.path
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.utils.config import settings
from app.database import Base

# Importar TODOS los modelos para que Alembic detecte los cambios
from app.models import caja_model
from app.models import sesion_caja_model
from app.models import movimiento_caja
from app.models import pedido_model
from app.models import ventas_model
from app.models import mesa_model
from app.models import inventario_local_model
from app.models import recepcion_stock_model

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
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
    alembic_url = settings.DATABASE_URL
    
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
