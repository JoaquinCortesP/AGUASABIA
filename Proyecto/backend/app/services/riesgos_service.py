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
            estado = "critico"
            titulo = "Riesgo de sequía: Alto"
            explicacion = "El índice de vegetación (NDVI) es muy bajo (< 0.2), lo que indica escasa vegetación verde o suelo desnudo, un síntoma común de sequía severa en zonas no desérticas."
            riesgo_sequia = "Alto"
        elif precipitacion < 5 and ndvi_promedio < 0.4:
            estado = "moderado"
            titulo = "Estrés hídrico severo"
            explicacion = "La vegetación muestra signos de estrés (NDVI < 0.4) combinado con escasez de lluvia reciente (< 5mm). Esto advierte sobre un déficit hídrico en el terreno."
            estres_hidrico = "Severo"
            riesgo_sequia = "Moderado"
        elif ndvi_promedio >= 0.4:
            estado = "normal"
            titulo = "Vegetación saludable"
            explicacion = "El índice NDVI indica presencia de vegetación fotosintéticamente activa, lo que sugiere un bajo riesgo de sequía inminente."

    # Fallback si no hay NDVI pero el clima es extremo
    elif precipitacion == 0 and et0 >= 5:
        estado = "moderado"
        titulo = "Señal climática de atención"
        explicacion = "La combinación de precipitación nula y alta demanda atmosférica (ET0) sugiere revisar posibles síntomas de sequía o estrés en el terreno."

    avanzado = {}
    if avanzado_habilitado:
        avanzado = {
            "criterio_temporal": "Evaluación basada en NDVI reciente y clima diario.",
            "capas_futuras": ["incendios históricos", "exposición ambiental"],
            "interpretacion_tecnica": f"El NDVI fue {ndvi_promedio if ndvi_promedio is not None else 'N/A'}. Un NDVI < 0.2 indica alto riesgo, y < 0.4 con baja lluvia indica estrés."
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
                "descripcion": "Análisis cruzado de datos satelitales (Sentinel-2) y meteorológicos.",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
