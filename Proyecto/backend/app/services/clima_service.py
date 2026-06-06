from datetime import date
from typing import Any

import httpx


OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


class ClimaServiceError(Exception):
    pass


class ClimaServiceUnavailable(ClimaServiceError):
    pass


async def obtener_clima_diario(latitud: float, longitud: float) -> dict[str, Any]:
    params = {
        "latitude": latitud,
        "longitude": longitud,
        "daily": "et0_fao_evapotranspiration,precipitation_sum",
        "timezone": "America/Santiago",
        "forecast_days": 1,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OPEN_METEO_FORECAST_URL, params=params)
    except (httpx.TimeoutException, httpx.TransportError) as exc:
        raise ClimaServiceUnavailable("No se pudo conectar con Open-Meteo") from exc

    if response.status_code >= 500:
        raise ClimaServiceUnavailable("Open-Meteo no esta disponible temporalmente")

    if response.status_code != 200:
        raise ClimaServiceError("Open-Meteo rechazo la solicitud")

    payload = response.json()
    daily = payload.get("daily") or {}
    fechas = daily.get("time") or []
    et0_values = daily.get("et0_fao_evapotranspiration") or []
    precipitation_values = daily.get("precipitation_sum") or []

    if not fechas or not et0_values or not precipitation_values:
        raise ClimaServiceError("Open-Meteo devolvio una respuesta incompleta")

    return {
        "fecha": date.fromisoformat(fechas[0]),
        "latitud": latitud,
        "longitud": longitud,
        "et0_mm": float(et0_values[0] or 0),
        "precipitacion_mm": float(precipitation_values[0] or 0),
        "fuente": "Open-Meteo",
    }
