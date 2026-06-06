from typing import Any


def evaluar_modulo_riesgos(clima: dict[str, Any] | None = None, avanzado_habilitado: bool = False) -> dict[str, Any]:
    clima = clima or {}
    precipitacion = float(clima.get("precipitacion_mm") or 0)
    et0 = float(clima.get("et0_mm") or 0)

    estado = "pendiente"
    titulo = "Riesgos ambientales preparados"
    explicacion = (
        "El modulo queda preparado para integrar incendios cercanos, sequia e indicadores de deficit hidrico. "
        "Aun no se consultan capas externas de riesgo."
    )

    if precipitacion == 0 and et0 >= 5:
        estado = "moderado"
        titulo = "Senal climatica de atencion"
        explicacion = (
            "La combinacion de precipitacion nula y alta demanda atmosferica sugiere revisar sequia, incendios "
            "y deficit hidrico cuando esas capas esten conectadas."
        )

    avanzado = {}
    if avanzado_habilitado:
        avanzado = {
            "criterio_temporal": "Lectura diaria inicial; falta integrar series historicas y capas de eventos.",
            "capas_futuras": ["incendios", "sequia", "deficit_hidrico", "exposicion ambiental"],
        }

    return {
        "estado": estado,
        "titulo": titulo,
        "explicacion": explicacion,
        "datos": {
            "incendios_cercanos": None,
            "indice_sequia": None,
            "deficit_hidrico": None,
        },
        "fuentes": [
            {
                "nombre": "Capas de riesgo pendientes",
                "tipo": "riesgo",
                "descripcion": "Contrato preparado para datos de incendios, sequia y deficit hidrico.",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
