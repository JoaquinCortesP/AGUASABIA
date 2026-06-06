from fastapi import APIRouter, HTTPException, Query

from app.schemas.clima import ClimaDiario, ClimaPoligonoRequest, ClimaPoligonoResponse
from app.services.clima_service import (
    ClimaServiceError,
    ClimaServiceUnavailable,
    obtener_clima_diario,
)
from app.services.geometry import calcular_centroide

router = APIRouter()


def _map_clima_error(exc: ClimaServiceError) -> HTTPException:
    if isinstance(exc, ClimaServiceUnavailable):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=502, detail=str(exc))


@router.get("/diario", response_model=ClimaDiario)
async def read_clima_diario(
    latitud: float = Query(..., ge=-90, le=90),
    longitud: float = Query(..., ge=-180, le=180),
) -> dict:
    try:
        return await obtener_clima_diario(latitud, longitud)
    except ClimaServiceError as exc:
        raise _map_clima_error(exc)


@router.post("/diario/poligono", response_model=ClimaPoligonoResponse)
async def read_clima_diario_poligono(payload: ClimaPoligonoRequest) -> dict:
    centroide = calcular_centroide(payload.poligono or [])
    try:
        clima = await obtener_clima_diario(centroide["latitud"], centroide["longitud"])
    except ClimaServiceError as exc:
        raise _map_clima_error(exc)
    return {**clima, "centroide": centroide}


@router.post("/poligono", response_model=ClimaPoligonoResponse)
async def read_clima_poligono(payload: ClimaPoligonoRequest) -> dict:
    return await read_clima_diario_poligono(payload)
