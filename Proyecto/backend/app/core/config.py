from typing import List, Optional

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "clave_secreta_para_desarrollo_cambiar_en_produccion"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # Se guarda como string para evitar que pydantic-settings intente
    # parsear el valor como JSON antes del validador.
    # Usa la property `cors_origins` para obtener la lista.
    BACKEND_CORS_ORIGINS: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: object) -> str:
        if isinstance(v, list):
            return ",".join(str(i) for i in v)
        return str(v) if v is not None else ""

    @property
    def cors_origins(self) -> List[str]:
        """Lista de orígenes CORS parseada desde BACKEND_CORS_ORIGINS."""
        return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",") if i.strip()]

    DATABASE_URL: Optional[PostgresDsn] = None

    REDIS_URL: Optional[str] = None
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    OPEN_METEO_API_KEY: Optional[str] = None


settings = Settings()
