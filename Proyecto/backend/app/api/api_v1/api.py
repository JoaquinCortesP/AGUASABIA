from fastapi import APIRouter
from app.api.api_v1.endpoints import login, parcelas, balances, admin, clima

api_router = APIRouter()

api_router.include_router(login.router, tags=["login"])
api_router.include_router(parcelas.router, prefix="/parcelas", tags=["parcelas"])
api_router.include_router(balances.router, prefix="/balances", tags=["balances"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(clima.router, prefix="/clima", tags=["clima"])