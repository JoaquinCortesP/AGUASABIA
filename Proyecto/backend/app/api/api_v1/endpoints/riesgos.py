from fastapi import APIRouter, Depends, HTTPException

from app.api import deps
from app.models.usuario import Usuario
from app.schemas.consulta_territorial import ConsultaTerritorialRequest
from app.schemas.modulo_analisis import ModuloAnalisis
from app.services.clima_service import ClimaServiceError, ClimaServiceUnavailable, obtener_clima_diario
from app.services.consulta_territorial_service import usuario_tiene_modo_avanzado
from app.services.geometry import calcular_centroide, normalizar_vertices
from app.services.riesgos_service import evaluar_modulo_riesgos

router = APIRouter()


def _map_clima_error(exc: ClimaServiceError) -> HTTPException:
    if isinstance(exc, ClimaServiceUnavailable):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=502, detail=str(exc))


@router.post("/poligono", response_model=ModuloAnalisis)
async def analizar_riesgos_poligono(
    payload: ConsultaTerritorialRequest,
    current_usuario: Usuario | None = Depends(deps.get_optional_usuario),
) -> dict:
    poligono = normalizar_vertices(payload.poligono or [])
    centroide = calcular_centroide(poligono)
    avanzado_habilitado = payload.modo == "avanzado" and usuario_tiene_modo_avanzado(current_usuario)
    try:
        clima = await obtener_clima_diario(centroide["latitud"], centroide["longitud"])
    except ClimaServiceError as exc:
        raise _map_clima_error(exc)
    return evaluar_modulo_riesgos(clima, avanzado_habilitado)
