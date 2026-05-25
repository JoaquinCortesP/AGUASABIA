from typing import List, Union
from pydantic import field_validator, ConfigDict, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        extra="ignore",
    )
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AguaSabia"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    DATABASE_URL: str
    REDIS_URL: str

    BACKEND_CORS_ORIGINS: Union[str, List[str]] = Field(default="")

    @field_validator("BACKEND_CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()