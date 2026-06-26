from typing import Any


def evaluar_modulo_riesgos(clima: dict[str, Any] | None = None, ndvi_promedio: float | None = None, avanzado_habilitado: bool = False) -> dict[str, Any]:
    clima = clima or {}
    precipitacion = float(clima.get("precipitacion_mm") or 0)
    et0 = float(clima.get("et0_mm") or 0)

    estado = "informativo"
    titulo = "Evaluación de riesgos"
    explicacion = "No se detectan niveles críticos inmediatos según los índices actuales."

    # Lógica de interpretación educativa basada en NDVI y Clima
    riesgo_sequia = "Bajo"
    estres_hidrico = "Normal"

    if ndvi_promedio is not None:
        if ndvi_promedio < 0.2:
            estado = "alto"
            titulo = "Riesgo de Sequía: Alto"
            explicacion = "El análisis geoespacial arroja un índice de vegetación (NDVI) excepcionalmente bajo (< 0.2). Esto indica escasa cobertura verde o suelo desnudo, un patrón compatible con condiciones de sequía severa en zonas no desérticas."
            riesgo_sequia = "Alto"
        elif precipitacion < 5 and ndvi_promedio < 0.4:
            estado = "moderado"
            titulo = "Alerta de Estrés Hídrico"
            explicacion = "El cruce de variables evidencia estrés vegetal (NDVI < 0.4) y un déficit hídrico reciente (precipitación < 5mm). Este escenario amerita monitoreo para prever impactos en el territorio."
            estres_hidrico = "Severo"
            riesgo_sequia = "Moderado"
        elif ndvi_promedio >= 0.4:
            estado = "normal"
            titulo = "Cobertura Vegetal Saludable"
            explicacion = "El territorio presenta una actividad fotosintética vigorosa y niveles adecuados de biomasa, lo que descarta riesgos inminentes de sequía severa."

    # Fallback si no hay NDVI pero el clima es extremo
    elif precipitacion == 0 and et0 >= 5:
        estado = "moderado"
        titulo = "Condiciones Climáticas Extremas"
        explicacion = "La conjunción de precipitación nula y alta demanda atmosférica (ET0) configura un escenario propicio para el estrés hídrico. Se sugiere mantener vigilancia sobre la respuesta del terreno."

    avanzado = {}
    if avanzado_habilitado:
        avanzado = {
            "criterio_temporal": "Evaluación multiparamétrica basada en NDVI reciente (Sentinel-3) y evapotranspiración de referencia.",
            "capas_futuras": ["incendios históricos", "exposición ambiental"],
            "interpretacion_tecnica": f"Algoritmo de inferencia: El NDVI calculado fue {ndvi_promedio if ndvi_promedio is not None else 'N/A'}. Valores < 0.2 activan alerta de sequía, mientras que valores < 0.4 concurrentes con déficit pluviométrico detonan alerta de estrés hídrico."
        }

    return {
        "estado": estado,
        "titulo": titulo,
        "explicacion": explicacion,
        "datos": {
            "riesgo_sequia": riesgo_sequia,
            "estres_hidrico": estres_hidrico,
            "incendios_cercanos": None,
        },
        "fuentes": [
            {
                "nombre": "Motor de Inferencia AguaSabia",
                "tipo": "interpretacion",
                "descripcion": "Algoritmo analítico que integra teleobservación espacial y variables meteorológicas.",
                "url": None,
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
