"""frontend leaflet contract

Revision ID: b7f3a2d1c9e4
Revises: 992beaaa5feb
Create Date: 2026-05-27 02:10:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "b7f3a2d1c9e4"
down_revision: Union[str, Sequence[str], None] = "992beaaa5feb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS municipios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR NOT NULL,
            region_id INTEGER NOT NULL REFERENCES regiones(id),
            comuna_id INTEGER NOT NULL REFERENCES comunas(id)
        );
        """
    )
    op.execute("ALTER TABLE municipios ADD COLUMN IF NOT EXISTS nombre VARCHAR;")
    op.execute("ALTER TABLE municipios ADD COLUMN IF NOT EXISTS region_id INTEGER;")
    op.execute("ALTER TABLE municipios ADD COLUMN IF NOT EXISTS comuna_id INTEGER;")
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_municipios_region_id'
            ) THEN
                ALTER TABLE municipios
                ADD CONSTRAINT fk_municipios_region_id
                FOREIGN KEY (region_id) REFERENCES regiones(id);
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_municipios_comuna_id'
            ) THEN
                ALTER TABLE municipios
                ADD CONSTRAINT fk_municipios_comuna_id
                FOREIGN KEY (comuna_id) REFERENCES comunas(id);
            END IF;
        END $$;
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_municipios_id ON municipios (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_municipios_nombre ON municipios (nombre);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS administradores (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR NOT NULL,
            email VARCHAR NOT NULL UNIQUE,
            hashed_password VARCHAR NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            municipio_id INTEGER NOT NULL REFERENCES municipios(id)
        );
        """
    )
    op.execute("ALTER TABLE administradores ADD COLUMN IF NOT EXISTS nombre VARCHAR;")
    op.execute("ALTER TABLE administradores ADD COLUMN IF NOT EXISTS email VARCHAR;")
    op.execute("ALTER TABLE administradores ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;")
    op.execute("ALTER TABLE administradores ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;")
    op.execute("ALTER TABLE administradores ADD COLUMN IF NOT EXISTS municipio_id INTEGER;")
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_administradores_municipio_id'
            ) THEN
                ALTER TABLE administradores
                ADD CONSTRAINT fk_administradores_municipio_id
                FOREIGN KEY (municipio_id) REFERENCES municipios(id);
            END IF;
        END $$;
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_administradores_id ON administradores (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_administradores_nombre ON administradores (nombre);")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_administradores_email ON administradores (email);")

    op.execute("ALTER TABLE agricultores ADD COLUMN IF NOT EXISTS municipio_id INTEGER;")
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_agricultores_municipio_id'
            ) THEN
                ALTER TABLE agricultores
                ADD CONSTRAINT fk_agricultores_municipio_id
                FOREIGN KEY (municipio_id) REFERENCES municipios(id);
            END IF;
        END $$;
        """
    )

    op.execute("ALTER TABLE parcelas ADD COLUMN IF NOT EXISTS poligono_vertices JSONB;")

    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS et0 DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS etc DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS riego_sugerido_mm DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS litros_recomendados DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS deficit_hidrico DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS raw DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS taw DOUBLE PRECISION;")
    op.execute("ALTER TABLE balances_hidricos ADD COLUMN IF NOT EXISTS estado_hidrico VARCHAR;")


def downgrade() -> None:
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS estado_hidrico;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS taw;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS raw;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS deficit_hidrico;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS litros_recomendados;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS riego_sugerido_mm;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS etc;")
    op.execute("ALTER TABLE balances_hidricos DROP COLUMN IF EXISTS et0;")
    op.execute("ALTER TABLE parcelas DROP COLUMN IF EXISTS poligono_vertices;")
    op.execute("ALTER TABLE agricultores DROP CONSTRAINT IF EXISTS fk_agricultores_municipio_id;")
    op.execute("ALTER TABLE agricultores DROP COLUMN IF EXISTS municipio_id;")
    op.execute("DROP TABLE IF EXISTS administradores;")
    op.execute("DROP TABLE IF EXISTS municipios;")
