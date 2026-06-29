from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.models.consulta_territorial import ConsultaTerritorial, ResultadoConsultaModulo
from app.models.usuario import Usuario
from app.schemas.consulta_territorial import ConsultaTerritorialRequest
from app.services.agua_service import evaluar_modulo_agua
from app.services.clima_service import obtener_clima_diario
from app.services.geometry import (
    calcular_bbox,
    calcular_centroide,
    calcular_superficie_aprox_ha,
    normalizar_vertices,
    convertir_vertices_a_wkt,
)
from geoalchemy2.elements import WKTElement
from app.services.riesgos_service import evaluar_modulo_riesgos
from app.services.territorio_service import (
    evaluar_modulo_territorio,
    obtener_comuna_por_coordenadas,
    es_territorio_chileno,
)
from app.services.vegetacion_service import evaluar_modulo_vegetacion
from app.services.suelo_service import evaluar_modulo_suelo


PLANES_CON_MODO_AVANZADO = {"pago", "premium", "profesional", "institucional", "avanzado", "pro", "municipal"}
VISITOR_DAILY_LIMIT = 10


class VisitorDailyLimitExceeded(Exception):
    def __init__(self, limit: int) -> None:
        self.limit = limit
        super().__init__(f"Limite diario de {limit} consultas para visitantes alcanzado")


def usuario_tiene_modo_avanzado(usuario: Usuario | None) -> bool:
    # Habilitar el modo avanzado para todos los usuarios registrados
    return usuario is not None


def _chile_day_bounds_utc() -> tuple[datetime, datetime]:
    zona_chile = ZoneInfo("America/Santiago")
    ahora_chile = datetime.now(zona_chile)
    inicio_chile = ahora_chile.replace(hour=0, minute=0, second=0, microsecond=0)
    fin_chile = inicio_chile + timedelta(days=1)
    return inicio_chile.astimezone(timezone.utc), fin_chile.astimezone(timezone.utc)


def contar_consultas_visitante_hoy(db: Session, visitor_key: str | None) -> int:
    if not visitor_key:
        return 0

    inicio_utc, fin_utc = _chile_day_bounds_utc()
    return (
        db.query(ConsultaTerritorial)
        .filter(
            ConsultaTerritorial.usuario_id.is_(None),
            ConsultaTerritorial.visitor_key == visitor_key,
            ConsultaTerritorial.created_at >= inicio_utc,
            ConsultaTerritorial.created_at < fin_utc,
        )
        .count()
    )


def validar_limite_visitante(db: Session, visitor_key: str | None) -> int | None:
    if not visitor_key:
        return None

    consultas_hoy = contar_consultas_visitante_hoy(db, visitor_key)
    if consultas_hoy >= VISITOR_DAILY_LIMIT:
        raise VisitorDailyLimitExceeded(VISITOR_DAILY_LIMIT)
    return VISITOR_DAILY_LIMIT - consultas_hoy - 1


def construir_resumen_general(modulos: dict[str, dict[str, Any]], comuna: str = "la zona") -> str:
    return (
        f"La zona seleccionada en el sector de {comuna} fue analizada como consulta territorial. "
        "El resumen integra clima, agua, territorio, vegetación y riesgos en una lectura inicial ágil, "
        "respaldada por cruces geoespaciales reales y vigentes."
    )


def _serializar_modulo(modulo: dict[str, Any], avanzado_habilitado: bool) -> dict[str, Any]:
    if not avanzado_habilitado:
        modulo = {**modulo, "avanzado": {}, "avanzado_restringido": True}
    return modulo


async def analizar_consulta_territorial(
    *,
    db: Session,
    payload: ConsultaTerritorialRequest,
    usuario: Usuario | None = None,
    visitor_key: str | None = None,
) -> dict[str, Any]:
    consultas_restantes_visitante = None
    if usuario is None:
        consultas_restantes_visitante = validar_limite_visitante(db, visitor_key)

    poligono = normalizar_vertices(payload.poligono or [])
    centroide = calcular_centroide(poligono)
    bbox = calcular_bbox(poligono)
    
    # Validacion geografica basica (Territorio Continental de Chile)
    lat_c = centroide["latitud"]
    lon_c = centroide["longitud"]
    fuera_de_chile_bbox = not (-56.0 <= lat_c <= -17.0 and -76.0 <= lon_c <= -66.0)

    # Validacion exacta de pais
    es_chile = await es_territorio_chileno(lat_c, lon_c)

    if fuera_de_chile_bbox or not es_chile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="No se puede analizar el territorio: El área seleccionada se encuentra en el mar o fuera de las fronteras de Chile continental."
        )
        
    fuera_de_chile = False

    avanzado_habilitado = payload.modo == "avanzado" and usuario_tiene_modo_avanzado(usuario)
    requiere_plan_pago = payload.modo == "avanzado" and not avanzado_habilitado
    requiere_plan_pago = payload.modo == "avanzado" and not avanzado_habilitado

    wkt_polygon = convertir_vertices_a_wkt(poligono)
    
    # Calcular superficie real usando PostGIS ST_Area(geography)
    try:
        from sqlalchemy import func
        superficie_m2 = db.scalar(func.ST_Area(func.ST_GeographyFromText(f"SRID=4326;{wkt_polygon}")))
        superficie_aprox_ha = round(float(superficie_m2) / 10000, 4) if superficie_m2 else calcular_superficie_aprox_ha(poligono)
    except Exception as e:
        print(f"Error PostGIS en ST_Area: {e}. Usando calculo plano de fallback.")
        superficie_aprox_ha = calcular_superficie_aprox_ha(poligono)

    fecha_analisis = payload.fecha_fin or payload.fecha_historica
    
    try:
        clima = await obtener_clima_diario(
            centroide["latitud"], 
            centroide["longitud"], 
            fecha_historica=fecha_analisis
        )
    except Exception as e:
        print(f"Error obteniendo clima (Open-Meteo): {e}")
        from datetime import datetime
        # Fallback dummy si falla Open-Meteo para no botar todo el análisis
        clima = {
            "fecha": datetime.fromisoformat(fecha_analisis or datetime.now().isoformat()[:10]),
            "latitud": centroide["latitud"],
            "longitud": centroide["longitud"],
            "et0_mm": 0,
            "precipitacion_mm": 0,
            "acumulacion_nival_swe_cm": 0,
            "profundidad_nieve_m": 0,
            "sublimacion_eolica": False,
            "hay_nieve_suelo": False,
            "fuente": "Fallback Local",
            "historico": bool(fecha_analisis),
            "error_api": str(e)
        }

    modulos: dict[str, dict[str, Any]] = {}
    if "clima" in payload.modulos:
        fecha_val = clima.get("fecha_recoleccion", clima.get("fecha"))
        avanzado = {
            "fecha": fecha_val.isoformat() if hasattr(fecha_val, "isoformat") else str(fecha_val),
            "et0_mm": clima["et0_mm"],
            "precipitacion_mm": clima["precipitacion_mm"],
            "latitud": clima["latitud"],
            "longitud": clima["longitud"],
        } if avanzado_habilitado else {}
        modulos["clima"] = {
            "estado": "informativo",
            "titulo": "Clima diario consultado",
            "explicacion": (
                "La informacion climatica se consulta para el centroide del area seleccionada. "
                "Sirve como lectura inicial del comportamiento reciente."
            ),
            "datos": {
                "fecha": fecha_val.isoformat() if hasattr(fecha_val, "isoformat") else str(fecha_val),
                "precipitacion_mm": clima["precipitacion_mm"],
                "et0_mm": clima["et0_mm"],
            },
            "fuentes": [
                {
                    "nombre": "Open-Meteo (o Fallback)",
                    "tipo": "climatica",
                    "descripcion": f"Forecast diario consultado desde backend. {clima.get('error_api', '')}",
                    "url": "https://open-meteo.com/",
                }
            ],
            "avanzado": avanzado,
            "avanzado_restringido": not avanzado_habilitado,
        }
    modulo_bloqueado_extranjero = {
        "estado": "no_disponible",
        "titulo": "Ubicación Fuera de Rango",
        "explicacion": "Nuestro análisis y capas oficiales no están diseñados para zonas marítimas o países extranjeros.",
        "datos": {},
        "fuentes": [],
        "avanzado": {}
    }

    if "agua" in payload.modulos:
        modulos["agua"] = modulo_bloqueado_extranjero if fuera_de_chile else evaluar_modulo_agua(clima, db, wkt_polygon, avanzado_habilitado)
    if "territorio" in payload.modulos:
        modulos["territorio"] = modulo_bloqueado_extranjero if fuera_de_chile else await evaluar_modulo_territorio(
            centroide=centroide,
            bbox=bbox,
            superficie_aprox_ha=superficie_aprox_ha,
            wkt_polygon=wkt_polygon,
            avanzado_habilitado=avanzado_habilitado,
        )
    ndvi_promedio = None
    if "vegetacion" in payload.modulos:
        modulos["vegetacion"] = modulo_bloqueado_extranjero if fuera_de_chile else evaluar_modulo_vegetacion(
            latitud=centroide["latitud"], 
            longitud=centroide["longitud"], 
            wkt_polygon=wkt_polygon, 
            avanzado_habilitado=avanzado_habilitado,
            fecha_fin=fecha_analisis
        )
        if not fuera_de_chile and modulos["vegetacion"].get("datos"):
            ndvi_promedio = modulos["vegetacion"]["datos"].get("ndvi_promedio")
            
    if "riesgos" in payload.modulos:
        modulos["riesgos"] = modulo_bloqueado_extranjero if fuera_de_chile else evaluar_modulo_riesgos(clima, ndvi_promedio, avanzado_habilitado)

    if "suelo" in payload.modulos:
        modulos["suelo"] = modulo_bloqueado_extranjero if fuera_de_chile else await evaluar_modulo_suelo(centroide["latitud"], centroide["longitud"], avanzado_habilitado)

    modulos = {
        nombre: _serializar_modulo(modulo, avanzado_habilitado)
        for nombre, modulo in modulos.items()
    }
    
    comuna_nombre = await obtener_comuna_por_coordenadas(lat_c, lon_c)
    resumen_general = construir_resumen_general(modulos, comuna=comuna_nombre)

    resultado_json = {
        "area": {
            "centroide": centroide,
            "bbox": bbox,
            "superficie_aprox_ha": superficie_aprox_ha,
            "poligono": poligono,
        },
        "modulos": modulos,
    }
    guardada = bool(payload.guardar and usuario)
    consulta = ConsultaTerritorial(
        usuario_id=usuario.id if usuario else None,
        visitor_key=visitor_key if usuario is None else None,
        nombre=payload.nombre,
        poligono=WKTElement(wkt_polygon, srid=4326),
        centroide_latitud=centroide["latitud"],
        centroide_longitud=centroide["longitud"],
        bbox=bbox,
        superficie_aprox_ha=superficie_aprox_ha,
        modo=payload.modo,
        guardada=guardada,
        resumen_general=resumen_general,
        resultado_json=resultado_json,
    )
    db.add(consulta)
    db.flush()
    for nombre, modulo in modulos.items():
        db.add(
            ResultadoConsultaModulo(
                consulta_id=consulta.id,
                tipo_modulo=nombre,
                estado=modulo["estado"],
                titulo=modulo["titulo"],
                explicacion=modulo["explicacion"],
                datos=modulo.get("datos"),
                fuentes=modulo.get("fuentes"),
                avanzado=modulo.get("avanzado"),
            )
        )
    db.commit()
    db.refresh(consulta)
    consulta_id = consulta.id if guardada else None

    return {
        "consulta_id": consulta_id,
        "guardada": guardada,
        "modo": payload.modo,
        "modo_avanzado_disponible": True,
        "modo_avanzado_habilitado": avanzado_habilitado,
        "requiere_plan_pago": requiere_plan_pago,
        "limite_diario_visitante": VISITOR_DAILY_LIMIT if usuario is None else None,
        "consultas_restantes_visitante": consultas_restantes_visitante,
        "area": {
            "centroide": centroide,
            "bbox": bbox,
            "superficie_aprox_ha": superficie_aprox_ha,
            "poligono": poligono,
        },
        "resumen_general": resumen_general,
        "modulos": modulos,
    }
