from fastapi import APIRouter, Depends

from app.api import deps
from app.models.administrador import Administrador
from app.models.municipio import Municipio
from app.schemas.municipio import Municipio as MunicipioSchema

router = APIRouter()


@router.get("/me", response_model=MunicipioSchema)
def read_mi_municipio(
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Municipio:
    return current_admin.municipio
