"""Corrupt link temp"""
from alembic import op
import sqlalchemy as sa

# El ID que la base de datos tiene pero el código no
revision = 'ba6b72b391b2'

# El ID que es el PADRE del head que SÍ tienes.
down_revision = '392eaea70125' 

branch_labels = None
depends_on = None

def upgrade():
    # No hace nada, solo sirve como marcador de posición
    pass

def downgrade():
    # No hace nada
    pass