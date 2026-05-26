from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "clave_secreta_para_desarrollo_cambiar_en_produccion"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 días

    # Orígenes permitidos para CORS (comunicación con frontend)
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Configuración de PostgreSQL
    DATABASE_URL: Optional[PostgresDsn] = None

    # Configuración de Celery / Redis
    REDIS_URL: Optional[str] = None
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    # Claves APIs Externas (dejamos vacías temporalmente)
    OPEN_METEO_API_KEY: Optional[str] = None
    WHATSAPP_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
