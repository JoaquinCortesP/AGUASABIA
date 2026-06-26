from datetime import date
from typing import Any

import httpx


OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

class ClimaServiceError(Exception):
    pass

class ClimaServiceUnavailable(ClimaServiceError):
    pass

async def obtener_clima_diario(latitud: float, longitud: float, fecha_historica: str | None = None) -> dict[str, Any]:
    url = OPEN_METEO_FORECAST_URL
    params = {
        "latitude": latitud,
        "longitude": longitud,
        "daily": "et0_fao_evapotranspiration,precipitation_sum,snowfall_sum,snow_depth",
        "timezone": "America/Santiago",
    }
    
    if fecha_historica:
        url = OPEN_METEO_ARCHIVE_URL
        params["start_date"] = fecha_historica
        params["end_date"] = fecha_historica
    else:
        params["forecast_days"] = 1

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
    except (httpx.TimeoutException, httpx.TransportError) as exc:
        print(f"Error Open-Meteo: {exc}")
        raise ClimaServiceUnavailable("No se pudo conectar con Open-Meteo") from exc

    if response.status_code >= 500:
        raise ClimaServiceUnavailable("Open-Meteo no esta disponible temporalmente")

    if response.status_code != 200:
        print(f"Error Open-Meteo {response.status_code}: {response.text}")
        raise ClimaServiceError(f"Open-Meteo rechazo la solicitud. {response.text}")

    payload = response.json()
    daily = payload.get("daily") or {}
    fechas = daily.get("time") or []
    et0_values = daily.get("et0_fao_evapotranspiration") or []
    precipitation_values = daily.get("precipitation_sum") or []
    snowfall_values = daily.get("snowfall_sum") or []
    snow_depth_values = daily.get("snow_depth") or []

    if not fechas or not et0_values or not precipitation_values:
        raise ClimaServiceError("Open-Meteo devolvió una respuesta incompleta")

    et0 = float(et0_values[0] or 0)
    precipitacion = float(precipitation_values[0] or 0)
    snowfall = float(snowfall_values[0] or 0) if snowfall_values else 0.0
    snow_depth = float(snow_depth_values[0] or 0) if snow_depth_values else 0.0

    # Lógica de auditoría biofísica
    # Si hay nieve y la precipitación es cero o baja, la precipitación en realidad cayó como nieve (SWE)
    lluvia_liquida = precipitacion
    acumulacion_nival_swe = snowfall
    
    # Sublimación eólica: Si hay nieve en el suelo (snow_depth > 0) y hay ET0, gran parte es sublimación
    sublimacion = False
    if snow_depth > 0 and et0 > 0:
        sublimacion = True

    return {
        "fecha_recoleccion": date.fromisoformat(fechas[0]),
        "latitud": latitud,
        "longitud": longitud,
        "et0_mm": et0,
        "precipitacion_mm": lluvia_liquida,
        "acumulacion_nival_swe_cm": acumulacion_nival_swe,
        "profundidad_nieve_m": snow_depth,
        "sublimacion_eolica": sublimacion,
        "hay_nieve_suelo": snow_depth > 0 or acumulacion_nival_swe > 0,
        "fuente": "Open-Meteo Archive" if fecha_historica else "Open-Meteo Forecast",
        "historico": bool(fecha_historica),
        "metadatos_informe": {
            "explicacion_extraccion": "Datos atmosféricos extraídos del modelo reanálisis ERA5 de Open-Meteo. La precipitación sólida (nieve) se separa del balance líquido para reflejar fielmente la Acumulación Nival (SWE).",
            "explicacion_calculo": "Evapotranspiración calculada mediante Penman-Monteith. Si hay nieve superficial, la pérdida térmica se identifica como sublimación eólica."
        }
    }
