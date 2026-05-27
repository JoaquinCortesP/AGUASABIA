from fastapi import APIRouter, Depends

from app.api import deps
from app.models.administrador import Administrador
from app.schemas.administrador import Administrador as AdministradorSchema

router = APIRouter()


@router.get("/me", response_model=AdministradorSchema)
def read_admin_me(current_admin: Administrador = Depends(deps.get_current_admin)) -> Administrador:
    return current_admin
