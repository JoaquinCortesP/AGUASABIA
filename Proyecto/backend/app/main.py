from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.services.gee import init_earth_engine, router as gee_router

app = FastAPI(
    title="AguaSabia API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.cors_origins],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(gee_router)

@app.on_event("startup")
async def startup_event():
    # Inicializa la API de Earth Engine con Google Cloud al encender el servidor
    init_earth_engine()


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Bienvenido a la API de AguaSabia.",
        "vision": "Consulta territorial geoespacial para agua, clima, vegetacion, territorio y riesgos.",
        "docs": "/docs",
    }
