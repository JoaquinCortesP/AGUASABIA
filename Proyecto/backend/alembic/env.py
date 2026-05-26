from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Importar settings para leer DATABASE_URL desde el .env
from app.core.config import settings

# Importar todos los modelos para que Alembic los detecte
from app.db.base import Base
import app.models  # noqa: F401 - este import hace que los modelos se registren

# Objeto de configuración de Alembic
config = context.config

# Leer la DATABASE_URL desde el settings de la app
config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL))

# Configurar logging desde alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata de los modelos para autogeneración de migraciones
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    # Modo offline: genera SQL sin conectarse a la BD
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Modo online: se conecta a la BD y aplica los cambios
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
