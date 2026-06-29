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
        "daily": "et0_fao_evapotranspiration,precipitation_sum,snowfall_sum",
        "timezone": "America/Santiago",
    }
    
    if fecha_historica:
        url = OPEN_METEO_ARCHIVE_URL
        params["start_date"] = fecha_historica
        params["end_date"] = fecha_historica
    else:
        params["forecast_days"] = 1
        params["past_days"] = 7

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

    # Si pedimos past_days=7 y forecast_days=1, el array tiene 8 elementos.
    # El elemento de HOY o de la fecha_historica es el ultimo (index -1).
    et0 = float(et0_values[-1] or 0)
    precipitacion = float(precipitation_values[-1] or 0)
    snowfall = float(snowfall_values[-1] or 0) if snowfall_values else 0.0
    snow_depth = float(snow_depth_values[-1] or 0) if snow_depth_values else 0.0
    
    # Calculamos el acumulado de precipitacion de los dias anteriores a hoy (hasta 7 dias)
    # Excluimos el dia actual (-1)
    precip_7d = sum(float(p or 0) for p in precipitation_values[:-1]) if len(precipitation_values) > 1 else 0.0

    # Sublimación eólica: Si hay nieve en el suelo (snow_depth > 0) y hay ET0, gran parte es sublimación
    sublimacion = False
    if snow_depth > 0 and et0 > 0:
        sublimacion = True

    return {
        "fecha_recoleccion": date.fromisoformat(fechas[-1]),
        "latitud": latitud,
        "longitud": longitud,
        "et0_mm": et0,
        "precipitacion_mm": precipitacion,
        "precipitacion_7d_mm": precip_7d,
        "acumulacion_nival_swe_cm": snowfall,
        "profundidad_nieve_m": snow_depth,
        "sublimacion_eolica": sublimacion,
        "hay_nieve_suelo": snow_depth > 0 or snowfall > 0,
        "fuente": "Open-Meteo Archive" if fecha_historica else "Open-Meteo Forecast",
        "historico": bool(fecha_historica),
        "metadatos_informe": {
            "explicacion_extraccion": "Datos atmosféricos extraídos del modelo reanálisis ERA5 de Open-Meteo. La precipitación sólida (nieve) se separa del balance líquido para reflejar fielmente la Acumulación Nival (SWE).",
            "explicacion_calculo": "Evapotranspiración calculada mediante Penman-Monteith. Si hay nieve superficial, la pérdida térmica se identifica como sublimación eólica."
        }
    }


async def obtener_clima_rango(
    latitud: float,
    longitud: float,
    fecha_inicio: str,
    fecha_fin: str
) -> list[dict[str, Any]]:
    """Obtiene series de tiempo de precipitación y ET0 para un rango de fechas"""
    archive_url = OPEN_METEO_ARCHIVE_URL
    forecast_url = OPEN_METEO_FORECAST_URL
    
    import datetime
    today = datetime.date.today()
    fin_date = datetime.date.fromisoformat(fecha_fin)
    inicio_date = datetime.date.fromisoformat(fecha_inicio)
    
    # Si todo el rango es en el futuro (o hoy), usamos forecast
    use_forecast = inicio_date >= today
    
    url = forecast_url if use_forecast else archive_url
    params = {
        "latitude": latitud,
        "longitude": longitud,
        "daily": "et0_fao_evapotranspiration,precipitation_sum",
        "timezone": "America/Santiago",
    }
    
    if use_forecast:
        delta = fin_date - today
        days = max(1, min(16, delta.days + 1))
        params["forecast_days"] = days
    else:
        yesterday = today - datetime.timedelta(days=1)
        actual_fin = min(fin_date, yesterday)
        params["start_date"] = fecha_inicio
        params["end_date"] = actual_fin.isoformat()
        
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        print(f"Error consultando rango Open-Meteo: {exc}")
        # Fallback usando forecast con los últimos 92 días si archive falla
        try:
            params_fc = {
                "latitude": latitud,
                "longitude": longitud,
                "daily": "et0_fao_evapotranspiration,precipitation_sum",
                "timezone": "America/Santiago",
                "past_days": 92
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(forecast_url, params=params_fc)
                response.raise_for_status()
                payload = response.json()
        except Exception as fc_exc:
            raise ClimaServiceError("No se pudo obtener información climática histórica") from fc_exc

    daily = payload.get("daily") or {}
    times = daily.get("time") or []
    et0_values = daily.get("et0_fao_evapotranspiration") or []
    precipitation_values = daily.get("precipitation_sum") or []
    
    registros = []
    # Filtrar por rango de fechas si usamos el fallback de past_days
    for i in range(len(times)):
        t_date = datetime.date.fromisoformat(times[i])
        if inicio_date <= t_date <= fin_date:
            et0 = float(et0_values[i] or 0) if i < len(et0_values) else 0.0
            prec = float(precipitation_values[i] or 0) if i < len(precipitation_values) else 0.0
            registros.append({
                "fecha": times[i],
                "precipitacion": prec,
                "et0": et0,
                "balance": round(prec - et0, 2)
            })
        
    return registros

