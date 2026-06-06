from typing import Any


def evaluar_modulo_agua(clima: dict[str, Any], avanzado_habilitado: bool = False) -> dict[str, Any]:
    precipitacion = float(clima.get("precipitacion_mm") or 0)
    et0 = float(clima.get("et0_mm") or 0)

    if precipitacion == 0 and et0 >= 4:
        estado = "moderado"
        titulo = "Presion hidrica atmosferica moderada"
        explicacion = (
            "La zona seleccionada no presenta precipitacion diaria y la demanda atmosferica es relevante. "
            "Esto no implica una recomendacion de uso de agua, pero si ayuda a entender el contexto hidrico reciente."
        )
    elif precipitacion > 0:
        estado = "normal"
        titulo = "Precipitacion reciente registrada"
        explicacion = (
            "Open-Meteo reporta precipitacion para el area analizada. Este dato sirve como primera lectura "
            "del comportamiento hidrico reciente y debe complementarse con series historicas y capas DGA."
        )
    else:
        estado = "informativo"
        titulo = "Lectura hidrica inicial"
        explicacion = (
            "La consulta entrega una lectura inicial basada en precipitacion y evapotranspiracion de referencia. "
            "Las estaciones cercanas, sequia y disponibilidad hidrica se integraran como capas territoriales."
        )

    avanzado = {}
    if avanzado_habilitado:
        avanzado = {
            "et0_mm": et0,
            "precipitacion_mm": precipitacion,
            "interpretacion_tecnica": (
                "ET0 describe la demanda atmosferica de agua de una superficie de referencia. "
                "No se calcula riego ni litros recomendados en la nueva vision de AguaSabia."
            ),
        }

    return {
        "estado": estado,
        "titulo": titulo,
        "explicacion": explicacion,
        "datos": {
            "precipitacion_diaria_mm": precipitacion,
            "demanda_atmosferica_et0_mm": et0,
        },
        "fuentes": [
            {
                "nombre": "Open-Meteo",
                "tipo": "climatica",
                "descripcion": "Datos climaticos diarios consultados por centroide del area seleccionada.",
                "url": "https://open-meteo.com/",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
