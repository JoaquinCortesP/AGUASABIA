from typing import Any


def evaluar_modulo_territorio(
    *,
    centroide: dict[str, float],
    bbox: dict[str, float],
    superficie_aprox_ha: float | None,
    avanzado_habilitado: bool = False,
) -> dict[str, Any]:
    avanzado = {}
    if avanzado_habilitado:
        avanzado = {
            "centroide": centroide,
            "bbox": bbox,
            "superficie_aprox_ha": superficie_aprox_ha,
            "postgis_plan": "Preparado para interseccion futura con cuencas, rios, humedales y limites administrativos.",
        }

    return {
        "estado": "informativo",
        "titulo": "Contexto territorial preparado",
        "explicacion": (
            "El area seleccionada ya cuenta con centroide, caja envolvente y superficie aproximada. "
            "Con PostGIS se podra cruzar esta geometria con cuencas, fuentes hidricas, humedales y capas oficiales."
        ),
        "datos": {
            "superficie_aprox_ha": superficie_aprox_ha,
            "centroide": centroide,
        },
        "fuentes": [
            {
                "nombre": "Geometria enviada por el usuario",
                "tipo": "territorial",
                "descripcion": "Poligono dibujado en el mapa y procesado por el backend.",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
