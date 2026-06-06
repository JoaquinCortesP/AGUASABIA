from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.comuna import Comuna
from app.models.consulta_territorial import ConsultaTerritorial
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
from app.services.consulta_territorial_service import analizar_consulta_territorial

router = APIRouter()


def _map_service_error(exc: ClimaServiceError) -> HTTPException:
    if isinstance(exc, ClimaServiceUnavailable):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=502, detail=str(exc))


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
    payload: ConsultaTerritorialRequest,
    db: Session = Depends(deps.get_db),
    current_usuario: Usuario | None = Depends(deps.get_optional_usuario),
) -> dict[str, Any]:
    if payload.guardar and current_usuario is None:
        raise HTTPException(status_code=401, detail="Debe iniciar sesion para guardar consultas")
    try:
        return await analizar_consulta_territorial(
            db=db,
            payload=payload,
            usuario=current_usuario,
        )
    except ClimaServiceError as exc:
        raise _map_service_error(exc)


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
        )
        .first()
    )
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta territorial no encontrada")

    resultado = consulta.resultado_json or {}
    return {
        "consulta_id": consulta.id,
        "guardada": consulta.guardada,
        "modo": consulta.modo,
        "modo_avanzado_disponible": True,
        "modo_avanzado_habilitado": consulta.modo == "avanzado" and current_usuario.plan != "gratis",
        "requiere_plan_pago": consulta.modo == "avanzado" and current_usuario.plan == "gratis",
        "area": resultado.get(
            "area",
            {
                "centroide": {
                    "latitud": consulta.centroide_latitud,
                    "longitud": consulta.centroide_longitud,
                },
                "bbox": consulta.bbox,
                "superficie_aprox_ha": consulta.superficie_aprox_ha,
            },
        ),
        "resumen_general": consulta.resumen_general or "",
        "modulos": resultado.get("modulos", {}),
    }
