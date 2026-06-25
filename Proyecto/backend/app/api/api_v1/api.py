from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    admin,
    agricultores,
    agua,
    balances,
    catalogos,
    clima,
    login,
    municipios,
    parcelas,
    riesgos,
    territorio,
    usuarios,
    vegetacion,
    dga_ingest,
    dga,
)

api_router = APIRouter()

api_router.include_router(login.router, tags=["login"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(catalogos.router, prefix="/catalogos", tags=["catalogos"])
api_router.include_router(municipios.router, prefix="/municipios", tags=["municipios"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["usuarios"])
api_router.include_router(territorio.router, prefix="/territorio", tags=["territorio"])
api_router.include_router(clima.router, prefix="/clima", tags=["clima"])
api_router.include_router(agua.router, prefix="/agua", tags=["agua"])
api_router.include_router(vegetacion.router, prefix="/vegetacion", tags=["vegetacion"])
api_router.include_router(riesgos.router, prefix="/riesgos", tags=["riesgos"])
api_router.include_router(dga_ingest.router, prefix="/dga-ingest", tags=["dga-ingest"])
api_router.include_router(dga.router, prefix="/dga", tags=["dga"])

# LEGACY: estos endpoints quedan aislados para compatibilidad interna temporal.
api_router.include_router(parcelas.router, prefix="/legacy/parcelas", tags=["legacy-parcelas"])
api_router.include_router(balances.router, prefix="/legacy/balances", tags=["legacy-balances"])
api_router.include_router(agricultores.router, prefix="/legacy/agricultores", tags=["legacy-agricultores"])
