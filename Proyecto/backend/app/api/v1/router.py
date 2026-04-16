from fastapi import APIRouter

from app.api.v1.endpoints import auth, parcela, balance, clima

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(parcela.router, prefix="/parcelas", tags=["parcelas"])
api_router.include_router(balance.router, prefix="/balances", tags=["balances"])
api_router.include_router(clima.router, prefix="/clima", tags=["clima"])
