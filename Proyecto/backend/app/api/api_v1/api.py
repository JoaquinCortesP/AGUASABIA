from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    admin,
    agricultores,
    auth,
    balances,
    catalogos,
    clima,
    municipios,
    parcelas,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(catalogos.router, prefix="/catalogos", tags=["catalogos"])
api_router.include_router(municipios.router, prefix="/municipios", tags=["municipios"])
api_router.include_router(agricultores.router, prefix="/agricultores", tags=["agricultores"])
api_router.include_router(parcelas.router, prefix="/parcelas", tags=["parcelas"])
api_router.include_router(balances.router, prefix="/balances", tags=["balances"])
api_router.include_router(clima.router, prefix="/clima", tags=["clima"])
