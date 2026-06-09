"""consulta territorial domain

Revision ID: d4e8f9a1b2c3
Revises: b7f3a2d1c9e4
Create Date: 2026-06-06 04:30:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "d4e8f9a1b2c3"
down_revision: Union[str, Sequence[str], None] = "b7f3a2d1c9e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR NULL,
            email VARCHAR NOT NULL UNIQUE,
            hashed_password VARCHAR NOT NULL,
            plan VARCHAR NOT NULL DEFAULT 'gratis',
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR;")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR;")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS plan VARCHAR NOT NULL DEFAULT 'gratis';")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_usuarios_email ON usuarios (email);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_usuarios_id ON usuarios (id);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS consultas_territoriales (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NULL REFERENCES usuarios(id),
            visitor_key VARCHAR NULL,
            nombre VARCHAR NULL,
            poligono JSONB NOT NULL,
            centroide_latitud DOUBLE PRECISION NOT NULL,
            centroide_longitud DOUBLE PRECISION NOT NULL,
            bbox JSONB NOT NULL,
            superficie_aprox_ha DOUBLE PRECISION NULL,
            modo VARCHAR NOT NULL DEFAULT 'resumen',
            guardada BOOLEAN NOT NULL DEFAULT FALSE,
            resumen_general TEXT NULL,
            resultado_json JSONB NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS usuario_id INTEGER;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS visitor_key VARCHAR;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS nombre VARCHAR;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS poligono JSONB;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS centroide_latitud DOUBLE PRECISION;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS centroide_longitud DOUBLE PRECISION;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS bbox JSONB;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS superficie_aprox_ha DOUBLE PRECISION;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS modo VARCHAR NOT NULL DEFAULT 'resumen';")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS guardada BOOLEAN NOT NULL DEFAULT FALSE;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS resumen_general TEXT;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS resultado_json JSONB;")
    op.execute("ALTER TABLE consultas_territoriales ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();")
    op.execute("CREATE INDEX IF NOT EXISTS ix_consultas_territoriales_id ON consultas_territoriales (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_consultas_territoriales_usuario_id ON consultas_territoriales (usuario_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_consultas_territoriales_visitor_key ON consultas_territoriales (visitor_key);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_consultas_territoriales_created_at ON consultas_territoriales (created_at);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS resultados_consulta_modulos (
            id SERIAL PRIMARY KEY,
            consulta_id INTEGER NOT NULL REFERENCES consultas_territoriales(id) ON DELETE CASCADE,
            tipo_modulo VARCHAR NOT NULL,
            estado VARCHAR NOT NULL,
            titulo VARCHAR NOT NULL,
            explicacion TEXT NOT NULL,
            datos JSONB NULL,
            fuentes JSONB NULL,
            avanzado JSONB NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_resultados_consulta_modulos_id ON resultados_consulta_modulos (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_resultados_consulta_modulos_consulta_id ON resultados_consulta_modulos (consulta_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_resultados_consulta_modulos_tipo_modulo ON resultados_consulta_modulos (tipo_modulo);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS cuencas (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR NOT NULL,
            codigo VARCHAR NULL,
            region_id INTEGER NULL REFERENCES regiones(id),
            geometria JSONB NULL,
            fuente VARCHAR NULL
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_cuencas_id ON cuencas (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_cuencas_nombre ON cuencas (nombre);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_cuencas_codigo ON cuencas (codigo);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_cuencas_region_id ON cuencas (region_id);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS fuentes_hidricas (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR NOT NULL,
            tipo VARCHAR NOT NULL,
            latitud DOUBLE PRECISION NULL,
            longitud DOUBLE PRECISION NULL,
            geometria JSONB NULL,
            fuente VARCHAR NULL
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_fuentes_hidricas_id ON fuentes_hidricas (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_fuentes_hidricas_nombre ON fuentes_hidricas (nombre);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_fuentes_hidricas_tipo ON fuentes_hidricas (tipo);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS indicadores_climaticos (
            id SERIAL PRIMARY KEY,
            consulta_id INTEGER NULL REFERENCES consultas_territoriales(id),
            fecha DATE NOT NULL,
            latitud DOUBLE PRECISION NOT NULL,
            longitud DOUBLE PRECISION NOT NULL,
            et0_mm DOUBLE PRECISION NULL,
            precipitacion_mm DOUBLE PRECISION NULL,
            temperatura_media_c DOUBLE PRECISION NULL,
            fuente VARCHAR NOT NULL,
            datos_json JSONB NULL
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_indicadores_climaticos_id ON indicadores_climaticos (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_indicadores_climaticos_consulta_id ON indicadores_climaticos (consulta_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_indicadores_climaticos_fecha ON indicadores_climaticos (fecha);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS indicadores_vegetacion (
            id SERIAL PRIMARY KEY,
            consulta_id INTEGER NULL REFERENCES consultas_territoriales(id),
            fecha DATE NULL,
            ndvi_promedio DOUBLE PRECISION NULL,
            cobertura_vegetal VARCHAR NULL,
            fuente VARCHAR NULL,
            datos_json JSONB NULL
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_indicadores_vegetacion_id ON indicadores_vegetacion (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_indicadores_vegetacion_consulta_id ON indicadores_vegetacion (consulta_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_indicadores_vegetacion_fecha ON indicadores_vegetacion (fecha);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS eventos_incendio (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR NULL,
            fecha DATE NULL,
            latitud DOUBLE PRECISION NULL,
            longitud DOUBLE PRECISION NULL,
            severidad VARCHAR NULL,
            geometria JSONB NULL,
            fuente VARCHAR NULL,
            descripcion TEXT NULL
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_eventos_incendio_id ON eventos_incendio (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_eventos_incendio_fecha ON eventos_incendio (fecha);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS indices_sequia (
            id SERIAL PRIMARY KEY,
            consulta_id INTEGER NULL REFERENCES consultas_territoriales(id),
            fecha DATE NULL,
            escala_temporal VARCHAR NULL,
            valor DOUBLE PRECISION NULL,
            categoria VARCHAR NULL,
            fuente VARCHAR NULL,
            datos_json JSONB NULL
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_indices_sequia_id ON indices_sequia (id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_indices_sequia_consulta_id ON indices_sequia (consulta_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_indices_sequia_fecha ON indices_sequia (fecha);")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS indices_sequia;")
    op.execute("DROP TABLE IF EXISTS eventos_incendio;")
    op.execute("DROP TABLE IF EXISTS indicadores_vegetacion;")
    op.execute("DROP TABLE IF EXISTS indicadores_climaticos;")
    op.execute("DROP TABLE IF EXISTS fuentes_hidricas;")
    op.execute("DROP TABLE IF EXISTS cuencas;")
    op.execute("DROP TABLE IF EXISTS resultados_consulta_modulos;")
    op.execute("DROP TABLE IF EXISTS consultas_territoriales;")
    op.execute("DROP TABLE IF EXISTS usuarios;")
