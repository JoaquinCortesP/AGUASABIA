import hashlib
import hmac
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

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
        if current_usuario.plan != "pago" and getattr(current_usuario, "role", None) != "admin":
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
