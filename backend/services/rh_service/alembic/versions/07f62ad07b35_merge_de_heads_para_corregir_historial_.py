"""Merge de heads para corregir historial roto

Revision ID: 07f62ad07b35
Revises: b5e31a93d13c, ba6b72b391b2
Create Date: 2025-10-21 06:28:53.077286

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '07f62ad07b35'
down_revision: Union[str, Sequence[str], None] = ('b5e31a93d13c', 'ba6b72b391b2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
