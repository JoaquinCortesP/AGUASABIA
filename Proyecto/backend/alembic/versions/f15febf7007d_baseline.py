"""Baseline Alembic revision.

This revision matches the current database state and restores the missing
revision identifier that the database still records in alembic_version.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "f15febf7007d"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No schema changes are applied here because this revision serves as
    # a baseline for an existing database schema.
    pass


def downgrade() -> None:
    pass
