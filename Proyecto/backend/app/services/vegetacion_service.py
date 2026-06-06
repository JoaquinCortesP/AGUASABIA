from typing import Any


def evaluar_modulo_vegetacion(avanzado_habilitado: bool = False) -> dict[str, Any]:
    avanzado = {}
    if avanzado_habilitado:
        avanzado = {
            "indices_preparados": ["NDVI", "EVI"],
            "fuentes_futuras": ["Sentinel-2", "Landsat", "servicios satelitales compatibles"],
            "estado_integracion": "Contrato estable creado; falta conectar proveedor satelital real.",
        }

    return {
        "estado": "pendiente",
        "titulo": "Vegetacion satelital preparada",
        "explicacion": (
            "El modulo queda listo para incorporar NDVI y cobertura vegetal. "
            "Por ahora la API devuelve una lectura preparada sin inventar datos satelitales."
        ),
        "datos": {
            "ndvi_promedio": None,
            "cobertura_vegetal": None,
        },
        "fuentes": [
            {
                "nombre": "Sentinel-2 / Landsat",
                "tipo": "satelital",
                "descripcion": "Fuentes candidatas para indices de vegetacion.",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
