"""reset

Revision ID: 9c19daebcc28
Revises: 87025cb9bc80
Create Date: 2025-11-24 01:56:56.719303

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c19daebcc28'
down_revision: Union[str, Sequence[str], None] = '87025cb9bc80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
