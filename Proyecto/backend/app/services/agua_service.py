from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.capas_ambientales import Cuenca, DecretoEscasez

def evaluar_modulo_agua(clima: dict[str, Any], db: Session = None, wkt_polygon: str = None, avanzado_habilitado: bool = False) -> dict[str, Any]:
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
    cuencas_intersectadas = []
    decretos_intersectados = []
    
    if db and wkt_polygon and avanzado_habilitado:
        try:
            # Consulta de Cuencas intersectadas
            cuencas = db.query(Cuenca.nombre).filter(
                func.ST_Intersects(Cuenca.geometria, func.ST_GeometryFromText(f"SRID=4326;{wkt_polygon}"))
            ).all()
            cuencas_intersectadas = [c[0] for c in cuencas]
        except Exception as e:
            print(f"Error PostGIS en ST_Intersects (Cuencas): {e}")
            cuencas_intersectadas = []
            
        try:
            # Consulta de Decretos de Escasez intersectados
            decretos = db.query(DecretoEscasez.numero_decreto).filter(
                func.ST_Intersects(DecretoEscasez.geometria, func.ST_GeometryFromText(f"SRID=4326;{wkt_polygon}"))
            ).all()
            decretos_intersectados = [d[0] for d in decretos]
        except Exception as e:
            print(f"Error PostGIS en ST_Intersects (Decretos): {e}")
            decretos_intersectados = []

        avanzado = {
            "et0_mm": et0,
            "precipitacion_mm": precipitacion,
            "cuencas_dga": cuencas_intersectadas,
            "decretos_escasez_dga": decretos_intersectados,
            "interpretacion_tecnica": (
                "Se ha realizado un cruce espacial con las capas de la DGA. "
                "Los resultados muestran las cuencas y decretos que intersectan con el polígono consultado."
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
            },
            {
                "nombre": "DGA (Dirección General de Aguas)",
                "tipo": "territorial",
                "descripcion": "Cruce espacial con Cuencas y Decretos de Escasez Hídrica.",
                "url": "https://dga.mop.gob.cl/",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
