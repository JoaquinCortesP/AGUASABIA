from typing import Any
import unicodedata


DEFAULT_THETA_FC = 0.30
DEFAULT_THETA_WP = 0.15
DEFAULT_ALPHA_REPOSICION = 0.5

KC_POR_CULTIVO = {
    "maiz": 0.80,
    "frijol": 0.75,
    "sorgo": 0.70,
    "palto": 0.72,
    "paltos": 0.72,
    "vid": 0.65,
    "tomate": 1.05,
}

PROFUNDIDAD_RADICULAR_M = {
    "maiz": 1.00,
    "frijol": 0.60,
    "sorgo": 1.00,
    "palto": 0.80,
    "paltos": 0.80,
    "vid": 1.00,
    "tomate": 0.70,
}

P_AGOTAMIENTO = {
    "maiz": 0.55,
    "frijol": 0.45,
    "sorgo": 0.55,
    "palto": 0.50,
    "paltos": 0.50,
    "vid": 0.45,
    "tomate": 0.40,
}

EFICIENCIA_RIEGO = {
    "goteo": 0.90,
    "aspersion": 0.70,
    "surco": 0.60,
}


def _normalizar(texto: str | None) -> str:
    if not texto:
        return ""
    texto_normalizado = unicodedata.normalize("NFKD", texto.lower())
    return "".join(char for char in texto_normalizado if not unicodedata.combining(char)).strip()


def obtener_kc(tipo_cultivo: str | None) -> float:
    return KC_POR_CULTIVO.get(_normalizar(tipo_cultivo), 0.80)


def obtener_zr(tipo_cultivo: str | None) -> float:
    return PROFUNDIDAD_RADICULAR_M.get(_normalizar(tipo_cultivo), 0.80)


def obtener_p_base(tipo_cultivo: str | None) -> float:
    return P_AGOTAMIENTO.get(_normalizar(tipo_cultivo), 0.50)


def calcular_etc(et0_mm: float, kc: float) -> float:
    return et0_mm * kc


def calcular_taw(theta_fc: float, theta_wp: float, zr_m: float) -> float:
    return 1000 * (theta_fc - theta_wp) * zr_m


def calcular_p_ajustado(p_base: float, etc_mm: float) -> float:
    return max(0.10, min(0.80, p_base + 0.04 * (5 - etc_mm)))


def calcular_raw(taw_mm: float, p_ajustado: float) -> float:
    return taw_mm * p_ajustado


def calcular_deficit_hidrico(dr_ayer_mm: float, lluvia_mm: float, etc_mm: float, taw_mm: float) -> float:
    lluvia_efectiva = lluvia_mm * 0.70
    dr_hoy = dr_ayer_mm - lluvia_efectiva + etc_mm
    return max(0, min(dr_hoy, taw_mm))


def clasificar_estado_hidrico(deficit_hidrico_mm: float, raw_mm: float) -> str:
    if deficit_hidrico_mm < 0.5 * raw_mm:
        return "optimo"
    if deficit_hidrico_mm < raw_mm:
        return "preventivo"
    return "deficit"


def calcular_recomendacion_riego(
    *,
    et0_mm: float,
    precipitacion_mm: float,
    tipo_cultivo: str | None,
    superficie_ha: float | None,
    dr_ayer_mm: float = 0,
    theta_fc: float = DEFAULT_THETA_FC,
    theta_wp: float = DEFAULT_THETA_WP,
    metodo_riego: str = "goteo",
    alpha_reposicion: float = DEFAULT_ALPHA_REPOSICION,
) -> dict[str, Any]:
    kc = obtener_kc(tipo_cultivo)
    zr_m = obtener_zr(tipo_cultivo)
    etc_mm = calcular_etc(et0_mm, kc)
    taw_mm = calcular_taw(theta_fc, theta_wp, zr_m)
    p_ajustado = calcular_p_ajustado(obtener_p_base(tipo_cultivo), etc_mm)
    raw_mm = calcular_raw(taw_mm, p_ajustado)
    deficit_hidrico_mm = calcular_deficit_hidrico(dr_ayer_mm, precipitacion_mm, etc_mm, taw_mm)

    lluvia_efectiva = precipitacion_mm * 0.70
    agua_objetivo_mm = max(0, deficit_hidrico_mm - alpha_reposicion * raw_mm)
    riego_sugerido_mm = 0 if lluvia_efectiva >= etc_mm else agua_objetivo_mm
    riego_sugerido_mm = min(riego_sugerido_mm, max(0, taw_mm - deficit_hidrico_mm))

    superficie_m2 = (superficie_ha or 1.0) * 10000
    eficiencia = EFICIENCIA_RIEGO.get(_normalizar(metodo_riego), 0.90)
    litros_recomendados = (riego_sugerido_mm * superficie_m2) / eficiencia

    return {
        "kc": kc,
        "zr_m": zr_m,
        "etc_mm": round(etc_mm, 3),
        "taw_mm": round(taw_mm, 3),
        "raw_mm": round(raw_mm, 3),
        "deficit_hidrico_mm": round(deficit_hidrico_mm, 3),
        "riego_sugerido_mm": round(riego_sugerido_mm, 3),
        "litros_recomendados": round(litros_recomendados, 2),
        "estado_hidrico": clasificar_estado_hidrico(deficit_hidrico_mm, raw_mm),
    }
