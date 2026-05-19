from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Clase central para manejar las variables de entorno y configuración general de la aplicación.
    Utiliza pydantic_settings para validar automáticamente los tipos de datos desde el archivo .env.
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AguaSabia"

    SECRET_KEY: str # Clave secreta para firmar los tokens JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int # Tiempo de expiración de sesión

    DATABASE_URL: str # URL de conexión a la base de datos PostgreSQL
    REDIS_URL: str # URL de conexión a Redis (usado para Celery o caché)

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]):
        """
        Validador para procesar correctamente las URLs de orígenes permitidos (CORS)
        incluso si vienen como un string separado por comas desde las variables de entorno.
        """
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"


# Instancia global de las configuraciones que se importará en el resto de la app
settings = Settings()