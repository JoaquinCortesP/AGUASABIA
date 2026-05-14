from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

# Punto de entrada principal de la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuración de CORS (Cross-Origin Resource Sharing)
# Permite que el frontend (ej. React/Vue) se comunique con esta API si están en dominios o puertos diferentes.
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"], # Permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"], # Permite todos los headers
    )

# Se incluye el enrutador principal que contiene todas las rutas de la versión 1 (v1) de la API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    """
    Ruta raíz de prueba para verificar que la API está funcionando.
    """
    return {"mensaje": "Bienvenido a la API de AguaSabia"}
