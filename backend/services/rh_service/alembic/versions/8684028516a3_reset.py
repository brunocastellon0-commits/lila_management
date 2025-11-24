"""reset

Revision ID: 8684028516a3
Revises: 9c19daebcc28
Create Date: 2025-11-24 01:59:24.737251

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8684028516a3'
down_revision: Union[str, Sequence[str], None] = '9c19daebcc28'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
