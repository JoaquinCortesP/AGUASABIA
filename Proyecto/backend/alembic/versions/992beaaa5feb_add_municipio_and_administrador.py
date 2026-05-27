"""add municipio and administrador

Revision ID: 992beaaa5feb
Revises: f15febf7007d
Create Date: 2026-05-27 01:18:43.839035

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '992beaaa5feb'
down_revision: Union[str, Sequence[str], None] = 'f15febf7007d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_region'
            ) THEN
                ALTER TABLE comunas DROP CONSTRAINT fk_region;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_region'
            ) THEN
                ALTER TABLE comunas
                ADD CONSTRAINT fk_region FOREIGN KEY (region_id)
                REFERENCES regiones(id) ON DELETE CASCADE;
            END IF;
        END $$;
        """
    )
