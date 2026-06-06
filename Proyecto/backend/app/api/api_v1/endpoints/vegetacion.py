from fastapi import APIRouter, Depends

from app.api import deps
from app.models.usuario import Usuario
from app.schemas.consulta_territorial import ConsultaTerritorialRequest
from app.schemas.modulo_analisis import ModuloAnalisis
from app.services.consulta_territorial_service import usuario_tiene_modo_avanzado
from app.services.vegetacion_service import evaluar_modulo_vegetacion

router = APIRouter()


@router.post("/poligono", response_model=ModuloAnalisis)
def analizar_vegetacion_poligono(
    payload: ConsultaTerritorialRequest,
    current_usuario: Usuario | None = Depends(deps.get_optional_usuario),
) -> dict:
    avanzado_habilitado = payload.modo == "avanzado" and usuario_tiene_modo_avanzado(current_usuario)
    return evaluar_modulo_vegetacion(avanzado_habilitado)
