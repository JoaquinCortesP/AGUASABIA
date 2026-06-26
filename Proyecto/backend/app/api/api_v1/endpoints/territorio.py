import hashlib
import hmac
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
import httpx

from app.api import deps
from app.core.config import settings
from app.models.comuna import Comuna
from app.models.consulta_territorial import ConsultaTerritorial, ResultadoConsultaModulo
from app.models.region import Region
from app.models.usuario import Usuario
from app.schemas.comuna import Comuna as ComunaSchema
from app.schemas.consulta_territorial import (
    ConsultaTerritorialListItem,
    ConsultaTerritorialRequest,
    ConsultaTerritorialResponse,
)
from app.schemas.region import Region as RegionSchema
from app.services.clima_service import ClimaServiceError, ClimaServiceUnavailable
from app.services.consulta_territorial_service import (
    VisitorDailyLimitExceeded,
    analizar_consulta_territorial,
    usuario_tiene_modo_avanzado,
)

router = APIRouter()


def _map_service_error(exc: ClimaServiceError) -> HTTPException:
    if isinstance(exc, ClimaServiceUnavailable):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=502, detail=str(exc))


def _build_visitor_key(payload: ConsultaTerritorialRequest, request: Request) -> str:
    if payload.cliente_anonimo_id:
        raw_value = f"anon:{payload.cliente_anonimo_id}"
    else:
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        raw_value = f"ip:{client_host}|ua:{user_agent}"

    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        raw_value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


@router.get("/regiones", response_model=List[RegionSchema])
def read_regiones(db: Session = Depends(deps.get_db)) -> list[Region]:
    return db.query(Region).order_by(Region.nombre).all()


@router.get("/comunas", response_model=List[ComunaSchema])
def read_comunas(
    region_id: Optional[int] = None,
    db: Session = Depends(deps.get_db),
) -> list[Comuna]:
    query = db.query(Comuna)
    if region_id is not None:
        query = query.filter(Comuna.region_id == region_id)
    return query.order_by(Comuna.nombre).all()


@router.post("/consultas/analizar", response_model=ConsultaTerritorialResponse)
async def analizar_area(
    *,
    request: Request,
    payload: ConsultaTerritorialRequest,
    db: Session = Depends(deps.get_db),
    current_usuario: Usuario | None = Depends(deps.get_optional_usuario),
) -> dict[str, Any]:
    if payload.guardar and current_usuario is None:
        raise HTTPException(status_code=401, detail="Debe iniciar sesion para guardar consultas")
    if payload.modo == "avanzado":
        if current_usuario is None:
            raise HTTPException(status_code=401, detail="Debe iniciar sesion para usar el modo avanzado")
        if not usuario_tiene_modo_avanzado(current_usuario) and getattr(current_usuario, "role", None) != "admin":
            raise HTTPException(status_code=403, detail="Mejora tu plan a 'Pago' por solo $5.000 CLP mensuales para acceder a opciones avanzadas y análisis satelital.")
    try:
        return await analizar_consulta_territorial(
            db=db,
            payload=payload,
            usuario=current_usuario,
            visitor_key=_build_visitor_key(payload, request) if current_usuario is None else None,
        )
    except ClimaServiceError as exc:
        raise _map_service_error(exc)
    except VisitorDailyLimitExceeded as exc:
        raise HTTPException(status_code=429, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error interno al procesar el análisis de territorio.")


@router.get("/consultas", response_model=List[ConsultaTerritorialListItem])
def listar_consultas_guardadas(
    db: Session = Depends(deps.get_db),
    current_usuario: Usuario = Depends(deps.get_current_usuario),
    skip: int = 0,
    limit: int = 50,
) -> list[ConsultaTerritorial]:
    return (
        db.query(ConsultaTerritorial)
        .filter(
            ConsultaTerritorial.usuario_id == current_usuario.id,
            ConsultaTerritorial.guardada.is_(True),
        )
        .order_by(ConsultaTerritorial.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/consultas/{consulta_id}", response_model=ConsultaTerritorialResponse)
def leer_consulta_guardada(
    consulta_id: int,
    db: Session = Depends(deps.get_db),
    current_usuario: Usuario = Depends(deps.get_current_usuario),
) -> dict[str, Any]:
    consulta = (
        db.query(ConsultaTerritorial)
        .filter(
            ConsultaTerritorial.id == consulta_id,
            ConsultaTerritorial.usuario_id == current_usuario.id,
            ConsultaTerritorial.guardada.is_(True),
        )
        .first()
    )
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta territorial no encontrada")

    resultado = consulta.resultado_json or {}
    avanzado_habilitado = consulta.modo == "avanzado" and usuario_tiene_modo_avanzado(current_usuario)
    
    from geoalchemy2.shape import to_shape
    try:
        shape = to_shape(consulta.poligono)
        vertices = [{"latitud": lat, "longitud": lon} for lon, lat in shape.exterior.coords]
    except Exception as e:
        print(f"Error parseando poligono de base de datos: {e}")
        vertices = []

    area_data = resultado.get("area") or {}
    area_out = {
        "centroide": area_data.get("centroide") or {
            "latitud": consulta.centroide_latitud,
            "longitud": consulta.centroide_longitud,
        },
        "bbox": area_data.get("bbox") or consulta.bbox,
        "superficie_aprox_ha": area_data.get("superficie_aprox_ha") or consulta.superficie_aprox_ha,
        "poligono": vertices,
    }

    return {
        "consulta_id": consulta.id,
        "guardada": consulta.guardada,
        "modo": consulta.modo,
        "modo_avanzado_disponible": True,
        "modo_avanzado_habilitado": avanzado_habilitado,
        "requiere_plan_pago": consulta.modo == "avanzado" and not avanzado_habilitado,
        "limite_diario_visitante": None,
        "consultas_restantes_visitante": None,
        "area": area_out,
        "resumen_general": consulta.resumen_general or "",
        "modulos": resultado.get("modulos", {}),
    }


@router.delete("/consultas/{consulta_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_consulta_guardada(
    consulta_id: int,
    db: Session = Depends(deps.get_db),
    current_usuario: Usuario = Depends(deps.get_current_usuario),
) -> Response:
    consulta = (
        db.query(ConsultaTerritorial)
        .filter(
            ConsultaTerritorial.id == consulta_id,
            ConsultaTerritorial.usuario_id == current_usuario.id,
            ConsultaTerritorial.guardada.is_(True),
        )
        .first()
    )
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta territorial no encontrada")

    db.query(ResultadoConsultaModulo).filter(
        ResultadoConsultaModulo.consulta_id == consulta.id
    ).delete(synchronize_session=False)
    db.delete(consulta)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/consultas/exportar-excel")
async def exportar_excel(
    payload: dict,
    current_usuario: Usuario = Depends(deps.get_current_usuario),
) -> Any:
    # Verificar que el usuario tenga plan Pro o sea Administrador
    if not usuario_tiene_modo_avanzado(current_usuario) and getattr(current_usuario, "role", None) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La exportación a Excel con justificaciones es una característica premium de Análisis Pro."
        )

    # Inicializar libro
    wb = Workbook()
    
    # ----------------------------------------------------
    # ESTILOS COMUNES
    # ----------------------------------------------------
    font_title = Font(name="Calibri", size=16, bold=True, color="DFBA6B")
    font_subtitle = Font(name="Calibri", size=11, italic=True, color="FFFFFF")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_bold = Font(name="Calibri", size=11, bold=True, color="0C1E12")
    font_regular = Font(name="Calibri", size=11, color="000000")
    font_alert = Font(name="Calibri", size=11, bold=True, color="B91C1C")
    font_section = Font(name="Calibri", size=13, bold=True, color="0C1E12")

    fill_dark = PatternFill(start_color="0C1E12", end_color="0C1E12", fill_type="solid")
    fill_accent = PatternFill(start_color="F3EFE9", end_color="F3EFE9", fill_type="solid")
    fill_zebra = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
    
    thin_side = Side(border_style="thin", color="D1D5DB")
    border_cell = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_right = Alignment(horizontal="right", vertical="center")
    align_center = Alignment(horizontal="center", vertical="center")

    # Extraer datos de la consulta enviados por el frontend
    area_data = payload.get("area", {})
    centroid = area_data.get("centroide", {})
    surface = area_data.get("superficie_aprox_ha", 0.0)
    resumen_txt = payload.get("resumen_general", "")
    modulos = payload.get("modulos", {})

    # 1. PESTAÑA RESUMEN GENERAL
    ws1 = wb.active
    ws1.title = "Resumen General"
    ws1.views.sheetView[0].showGridLines = True

    # Banner superior
    ws1.merge_cells("A1:D2")
    ws1["A1"] = "AGUASABIA - REPORTE DE RESILIENCIA HÍDRICA"
    ws1["A1"].font = font_title
    ws1["A1"].fill = fill_dark
    ws1["A1"].alignment = align_center

    # Datos básicos del reporte
    basic_info = [
        ("Propietario / Consultor:", current_usuario.nombre),
        ("Email del Usuario:", current_usuario.email),
        ("Superficie del Terreno:", f"{surface} hectáreas"),
        ("Centroide Geográfico:", f"Lat: {centroid.get('latitud', 0.0):.5f}, Lng: {centroid.get('longitud', 0.0):.5f}"),
    ]
    
    # Agregar edificado si está disponible
    is_edificado = modulos.get("territorio", {}).get("datos", {}).get("edificado", False)
    if is_edificado:
        basic_info.append(("Construcciones / Edificios:", "Sí (Zonas edificadas detectadas - Dificulta Análisis)"))
    else:
        basic_info.append(("Construcciones / Edificios:", "No detectadas"))

    row_num = 4
    for label, val in basic_info:
        ws1.cell(row=row_num, column=1, value=label).font = font_bold
        ws1.cell(row=row_num, column=1).alignment = align_left
        ws1.cell(row=row_num, column=2, value=val).font = font_regular
        ws1.cell(row=row_num, column=2).alignment = align_left
        if "Sí" in str(val):
            ws1.cell(row=row_num, column=2).font = font_alert
        row_num += 1

    # Texto Resumen General
    row_num += 1
    ws1.cell(row=row_num, column=1, value="Resumen Diagnóstico:").font = font_section
    ws1.cell(row=row_num, column=1).alignment = align_left
    
    row_num += 1
    ws1.merge_cells(start_row=row_num, start_column=1, end_row=row_num+2, end_column=4)
    resumen_cell = ws1.cell(row=row_num, column=1, value=resumen_txt)
    resumen_cell.font = font_regular
    resumen_cell.alignment = align_left
    
    # 2. PESTAÑA DETALLE TÉCNICO
    ws2 = wb.create_sheet(title="Análisis Técnico")
    ws2.views.sheetView[0].showGridLines = True
    
    # Headers
    ws2.append(["MÓDULO", "PARÁMETRO DIAGNÓSTICO", "VALOR / ESTADO", "INTERPRETACIÓN DEL ANÁLISIS"])
    for col in range(1, 5):
        cell = ws2.cell(row=1, column=col)
        cell.font = font_header
        cell.fill = fill_dark
        cell.alignment = align_center

    technical_rows = []
    
    # Clima
    clima = modulos.get("clima", {})
    c_datos = clima.get("datos", {})
    technical_rows.append(("Clima", "Demanda Atmosférica (ET0)", f"{c_datos.get('et0_mm', 0.0)} mm/día", clima.get("explicacion", "")))
    technical_rows.append(("Clima", "Balance Hídrico (Lluvia)", f"{c_datos.get('precipitacion_mm', 0.0)} mm/día", "Cantidad de lluvia líquida caída sobre la parcela en las últimas 24 horas."))
    technical_rows.append(("Clima", "Acumulación Nival (SWE)", f"{c_datos.get('acumulacion_nival_swe_cm', 0.0)} cm", "Precipitación caída en forma sólida (Nieve)."))
    technical_rows.append(("Clima", "Profundidad de Nieve", f"{c_datos.get('profundidad_nieve_m', 0.0)} m", "Nieve superficial detectada."))
    if c_datos.get("sublimacion_eolica"):
        technical_rows.append(("Clima", "Sublimación Eólica", "Activa", "Pérdida térmica latente debida al viento sobre la capa de hielo."))

    # Agua
    agua = modulos.get("agua", {})
    a_datos = agua.get("datos", {})
    a_avanzado = agua.get("avanzado", {})
    cuencas_list = ", ".join(a_avanzado.get("cuencas_dga", [])) or "Ninguna registrada"
    decretos_list = ", ".join(a_avanzado.get("decretos_escasez_dga", [])) or "Sin decreto activo"
    rios_list = ", ".join(a_datos.get("rios_intersectados_nombres", [])) or "Ninguno cruzado"
    
    technical_rows.append(("Agua", "Cuencas Hidrográficas DGA", cuencas_list, "Cuencas oficiales de la Dirección General de Aguas que abarcan el terreno."))
    technical_rows.append(("Agua", "Decretos de Escasez Hídrica", decretos_list, "Decretos de escasez extrema vigentes según el MOP."))
    technical_rows.append(("Agua", "Ríos e Intersecciones", rios_list, "¿El polígono del terreno cruza algún río superficial de Chile?"))

    # Suelo (SoilGrids)
    suelo = modulos.get("suelo", {})
    s_datos = suelo.get("datos", {})
    s_avanzado = suelo.get("avanzado", {})
    s_comp = s_avanzado.get("composicion", {})
    s_prop = s_avanzado.get("propiedades", {})
    technical_rows.append(("Suelo", "Clase Textural USDA", s_datos.get("textura", "Franco"), suelo.get("explicacion", "")))
    technical_rows.append(("Suelo", "Composición de Suelo", f"Arena: {s_comp.get('arena_pct', 40.0)}% | Limo: {s_comp.get('limo_pct', 38.0)}% | Arcilla: {s_comp.get('arcilla_pct', 22.0)}%", "Porcentaje edafológico de las partículas minerales del suelo."))
    technical_rows.append(("Suelo", "pH de Suelo", f"{s_prop.get('ph', 6.4)} pH", "Potencial de hidrógeno del suelo (escala ácida, neutra o alcalina)."))
    technical_rows.append(("Suelo", "Nitrógeno Disponible", f"{s_prop.get('nitrogeno_g_kg', 1.8)} g/kg", "Concentración de nitrógeno total en los primeros centímetros de suelo."))

    # Vegetación
    veg = modulos.get("vegetacion", {})
    v_datos = veg.get("datos", {})
    v_avanzado = veg.get("avanzado", {})
    technical_rows.append(("Vegetación", "Salud Foliar Promedio (NDVI)", f"{v_datos.get('ndvi_promedio', 0.55)}", veg.get("explicacion", "")))

    # Riesgos
    riesgo = modulos.get("riesgos", {})
    r_datos = riesgo.get("datos", {})
    incendios_activos = r_datos.get("incendios_cercanos", 0)
    technical_rows.append(("Riesgos", "Riesgo de Sequía Extrema", riesgo.get("titulo", "Normal"), riesgo.get("explicacion", "")))
    technical_rows.append(("Riesgos", "Incendios Forestales Cercanos", f"{incendios_activos} focos activos", f"Focos de incendios forestales reportados por CONAF en las inmediaciones."))

    # Análisis Total
    total = modulos.get("analisis_total", {})
    t_datos = total.get("datos", {})
    if total:
        technical_rows.append(("Análisis Total", "Período de Análisis", f"{t_datos.get('fecha_inicio_rango') or 'N/A'} a {t_datos.get('fecha_fin_rango') or 'Hoy'}", total.get("explicacion", "")))
        technical_rows.append(("Análisis Total", "Metodología", "Cálculo Integral", total.get("avanzado", {}).get("metodologia", "")))

    for idx, (mod_name, param, val, desc) in enumerate(technical_rows):
        current_row = idx + 2
        ws2.append([mod_name, param, val, desc])
        # Zebra coloring
        fill = fill_zebra if idx % 2 == 0 else PatternFill(fill_type=None)
        for col in range(1, 5):
            cell = ws2.cell(row=current_row, column=col)
            cell.font = font_regular
            cell.border = border_cell
            cell.alignment = align_left
            if fill.fill_type:
                cell.fill = fill
            if col == 1:
                cell.font = font_bold

    # 3. PESTAÑA JUSTIFICACIÓN Y FÓRMULAS
    ws3 = wb.create_sheet(title="Justificaciones Científicas")
    ws3.views.sheetView[0].showGridLines = True

    ws3.merge_cells("A1:C2")
    ws3["A1"] = "LOGICA MATEMÁTICA Y REFERENCIAS TÉCNICAS"
    ws3["A1"].font = font_title
    ws3["A1"].fill = fill_dark
    ws3["A1"].alignment = align_center

    justifications = [
        ("Modelo Climático (Evapotranspiración FAO-56 PM)", 
         "Ecuación: ET0 = [ 0.408 * Δ * (Rn - G) + γ * (900 / (T + 273)) * u2 * (es - ea) ] / [ Δ + γ * (1 + 0.34 * u2) ]",
         "La evapotranspiración de referencia (ET0) estima la pérdida de agua del suelo a través de un cultivo de referencia. Utiliza la ecuación estándar de Penman-Monteith (FAO-56) que combina radiación solar (Rn), flujo de calor del suelo (G), temperatura media (T), velocidad del viento a 2m (u2) y déficit de presión de vapor (es - ea). Datos obtenidos mediante satélite del modelo global Open-Meteo."),
        
        ("Salud Vegetal e Índice NDVI (Sentinel-2)",
         "Fórmula: NDVI = (NIR - RED) / (NIR + RED)",
         "El Índice de Diferencia Normalizada de Vegetación (NDVI) se calcula a partir de la reflectancia del infrarrojo cercano (NIR) y rojo visible (RED) capturada por la constelación Sentinel-2 (Copernicus ESA). Fluctúa entre -1 y +1, donde valores > 0.50 indican vegetación vigorosa y fotosintéticamente activa, mientras que caídas bruscas del índice alertan sobre estrés hídrico o sequedad foliar."),
        
        ("Clasificación de Texturas de Suelo (SoilGrids)",
         "Fórmulas: USDA Triangle Rules (Clay%, Sand%, Silt%)",
         "La textura del suelo define la retención de agua y drenaje. Se extrae la proporción de arcilla, limo y arena en cg/kg de SoilGrids (ISRIC) y se evalúa mediante reglas de decisión basadas en el Triángulo de Texturas de la USDA. Los suelos arcillosos retienen más humedad pero drenan lento, mientras que los arenosos drenan de inmediato perdiendo nutrientes."),
        
        ("Cruce PostGIS e Intersección DGA / MOP",
         "Operaciones: ST_Intersects(geometria_predio, geometria_capa) y ST_DWithin(predio, embalses, 0.045)",
         "Los cruces de recursos hídricos en Chile utilizan geoprocesamiento espacial PostGIS para intersectar el polígono de la parcela con los shapes oficiales de la DGA (Cuencas hidrográficas de Chile, Acuíferos protegidos bajo restricciones de extracción, y Decretos activos de Escasez Hídrica según la DGA/MOP)."),
        
        ("Bibliografía y Referencias Oficiales",
         "Fuentes de Información y APIs Públicas utilizadas por AguaSabia:",
         "1. Ecuación Estándar FAO-56 Penman-Monteith: Food and Agriculture Organization (FAO) Irrigation and Drainage Paper No. 56.\n"
         "2. Sentinel-2 Copernicus Constellation: European Space Agency (ESA) Earth Observation Portal.\n"
         "3. Dirección General de Aguas (DGA): Ministerio de Obras Públicas (MOP), Chile. Repositorio de datos espaciales y SNIA.\n"
         "4. SoilGrids 2.0 Database: ISRIC - World Soil Information. Global predictions for soil properties.\n"
         "5. Open-Meteo: API climática de libre acceso adaptada al huso de Chile con el modelo FAO.")
    ]

    r_num = 4
    for section_title, formula_txt, justification_txt in justifications:
        ws3.cell(row=r_num, column=1, value=section_title).font = font_section
        ws3.cell(row=r_num, column=1).alignment = align_left
        
        r_num += 1
        ws3.cell(row=r_num, column=1, value="Lógica / Variables:").font = font_bold
        ws3.cell(row=r_num, column=1).alignment = align_left
        ws3.merge_cells(start_row=r_num, start_column=2, end_row=r_num, end_column=3)
        ws3.cell(row=r_num, column=2, value=formula_txt).font = font_regular
        ws3.cell(row=r_num, column=2).alignment = align_left
        
        r_num += 1
        ws3.cell(row=r_num, column=1, value="Explicación / Justificación:").font = font_bold
        ws3.cell(row=r_num, column=1).alignment = align_left
        ws3.merge_cells(start_row=r_num, start_column=2, end_row=r_num+1, end_column=3)
        ws3.cell(row=r_num, column=2, value=justification_txt).font = font_regular
        ws3.cell(row=r_num, column=2).alignment = align_left
        
        r_num += 3  # Espacio entre secciones

    # ----------------------------------------------------
    # AJUSTAR ANCHOS DE COLUMNAS PARA MEJOR VISUALIZACIÓN
    # ----------------------------------------------------
    for ws in [ws1, ws2, ws3]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            
            # Para columnas combinadas o textos muy largos, ponemos límites razonables
            for cell in col:
                val_str = str(cell.value or "")
                # Evitar que celdas combinadas de la fila 1 expandan infinitamente la columna A
                if cell.row in [1, 2]:
                    continue
                if len(val_str) > max_len:
                    max_len = len(val_str)
            
            # Ancho mínimo y máximo de columnas
            width = max(max_len + 3, 12)
            if width > 65:  # Limitar ancho de explicaciones para que no se vea deformado
                width = 65
            ws.column_dimensions[col_letter].width = width

    # Stream file to response
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    filename = f"Reporte_AguaSabia_{surface}ha.xlsx"
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/incendios-historicos")
async def get_incendios_historicos(
    userType: str,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    year: Optional[str] = None,
    current_usuario: Usuario = Depends(deps.get_optional_usuario)
) -> Any:
    """Proxy para extraer focos de incendios históricos desde IDE Minagri"""
    base_url = "https://esri.ciren.cl/server/rest/services/IDEMINAGRI/INCENDIOS/MapServer/0/query"
    
    # Se descartó el selector de años en el mapa, mostramos todos los registros (1=1)
    sql_where = "1=1"

    params = {
        "where": sql_where,
        "outFields": "comuna,temporada,superficie,fh_inicio",
        "outSR": "4326",
        "f": "geojson"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(base_url, params=params, timeout=15.0)
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=502, detail="Error consultando IDE Minagri para incendios históricos")

