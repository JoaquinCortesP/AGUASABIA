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
)
from app.services.riesgos_service import evaluar_modulo_riesgos
from app.services.territorio_service import evaluar_modulo_territorio
from app.services.vegetacion_service import evaluar_modulo_vegetacion


PLANES_CON_MODO_AVANZADO = {"pago", "premium", "profesional", "institucional", "avanzado"}
VISITOR_DAILY_LIMIT = 3


class VisitorDailyLimitExceeded(Exception):
    def __init__(self, limit: int) -> None:
        self.limit = limit
        super().__init__(f"Limite diario de {limit} consultas para visitantes alcanzado")


def usuario_tiene_modo_avanzado(usuario: Usuario | None) -> bool:
    return bool(usuario and usuario.plan in PLANES_CON_MODO_AVANZADO)


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


def construir_resumen_general(modulos: dict[str, dict[str, Any]]) -> str:
    agua = modulos.get("agua", {})
    riesgos = modulos.get("riesgos", {})

    if agua.get("estado") == "moderado" or riesgos.get("estado") == "moderado":
        return (
            "La zona seleccionada muestra senales ambientales que conviene revisar con mas detalle, "
            "especialmente en agua y riesgos asociados al contexto climatico reciente."
        )

    return (
        "La zona seleccionada fue analizada como consulta territorial. "
        "El resumen integra clima, agua, territorio, vegetacion y riesgos en una lectura inicial simple."
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
    superficie_aprox_ha = calcular_superficie_aprox_ha(poligono)

    avanzado_habilitado = payload.modo == "avanzado" and usuario_tiene_modo_avanzado(usuario)
    requiere_plan_pago = payload.modo == "avanzado" and not avanzado_habilitado

    clima = await obtener_clima_diario(centroide["latitud"], centroide["longitud"])

    modulos: dict[str, dict[str, Any]] = {}
    if "clima" in payload.modulos:
        avanzado = {
            "fecha": clima["fecha"].isoformat(),
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
                "fecha": clima["fecha"].isoformat(),
                "precipitacion_mm": clima["precipitacion_mm"],
                "et0_mm": clima["et0_mm"],
            },
            "fuentes": [
                {
                    "nombre": "Open-Meteo",
                    "tipo": "climatica",
                    "descripcion": "Forecast diario consultado desde backend.",
                    "url": "https://open-meteo.com/",
                }
            ],
            "avanzado": avanzado,
            "avanzado_restringido": not avanzado_habilitado,
        }
    if "agua" in payload.modulos:
        modulos["agua"] = evaluar_modulo_agua(clima, avanzado_habilitado)
    if "territorio" in payload.modulos:
        modulos["territorio"] = evaluar_modulo_territorio(
            centroide=centroide,
            bbox=bbox,
            superficie_aprox_ha=superficie_aprox_ha,
            avanzado_habilitado=avanzado_habilitado,
        )
    if "vegetacion" in payload.modulos:
        modulos["vegetacion"] = evaluar_modulo_vegetacion(avanzado_habilitado)
    if "riesgos" in payload.modulos:
        modulos["riesgos"] = evaluar_modulo_riesgos(clima, avanzado_habilitado)

    modulos = {
        nombre: _serializar_modulo(modulo, avanzado_habilitado)
        for nombre, modulo in modulos.items()
    }
    resumen_general = construir_resumen_general(modulos)

    resultado_json = {
        "area": {
            "centroide": centroide,
            "bbox": bbox,
            "superficie_aprox_ha": superficie_aprox_ha,
        },
        "modulos": modulos,
    }

    guardada = bool(payload.guardar and usuario)
    consulta = ConsultaTerritorial(
        usuario_id=usuario.id if usuario else None,
        visitor_key=visitor_key if usuario is None else None,
        nombre=payload.nombre,
        poligono=poligono,
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
        },
        "resumen_general": resumen_general,
        "modulos": modulos,
    }
