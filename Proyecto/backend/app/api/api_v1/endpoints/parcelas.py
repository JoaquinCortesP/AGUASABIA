"""LEGACY: parcelas y recomendacion de riego antigua, aisladas bajo /api/v1/legacy."""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.administrador import Administrador
from app.models.agricultor import Agricultor
from app.models.balance_hidrico import BalanceHidrico
from app.models.comuna import Comuna
from app.models.parcela import Parcela
from app.schemas.clima import RecomendacionRiego
from app.schemas.parcela import Parcela as ParcelaSchema, ParcelaCreate
from app.services.agronomy import calcular_recomendacion_riego
from app.services.clima_service import (
    ClimaServiceError,
    ClimaServiceUnavailable,
    obtener_clima_diario,
)
from app.services.geometry import calcular_centroide

router = APIRouter()


def _get_agricultor_municipal(db: Session, agricultor_id: int, admin: Administrador) -> Agricultor:
    agricultor = (
        db.query(Agricultor)
        .filter(
            Agricultor.id == agricultor_id,
            Agricultor.municipio_id == admin.municipio_id,
        )
        .first()
    )
    if not agricultor:
        raise HTTPException(status_code=404, detail="Agricultor no encontrado en este municipio")
    return agricultor


def _get_parcela_municipal(db: Session, parcela_id: int, admin: Administrador) -> Parcela:
    parcela = (
        db.query(Parcela)
        .join(Agricultor, Parcela.agricultor_id == Agricultor.id)
        .filter(
            Parcela.id == parcela_id,
            Agricultor.municipio_id == admin.municipio_id,
        )
        .first()
    )
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada en este municipio")
    return parcela


def _validar_comuna_municipal(db: Session, comuna_id: int, admin: Administrador) -> None:
    comuna = db.query(Comuna).filter(Comuna.id == comuna_id).first()
    if not comuna:
        raise HTTPException(status_code=404, detail="Comuna no encontrada")
    if admin.municipio and comuna_id != admin.municipio.comuna_id:
        raise HTTPException(status_code=403, detail="La comuna no pertenece al municipio del administrador")


def _map_clima_error(exc: ClimaServiceError) -> HTTPException:
    if isinstance(exc, ClimaServiceUnavailable):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=502, detail=str(exc))


@router.get("/", response_model=List[ParcelaSchema])
def read_parcelas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    return (
        db.query(Parcela)
        .join(Agricultor, Parcela.agricultor_id == Agricultor.id)
        .filter(Agricultor.municipio_id == current_admin.municipio_id)
        .order_by(Parcela.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

@router.post("/", response_model=ParcelaSchema, status_code=201)
def create_parcela(
    *,
    db: Session = Depends(deps.get_db),
    parcela_in: ParcelaCreate,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    _get_agricultor_municipal(db, parcela_in.agricultor_id, current_admin)
    _validar_comuna_municipal(db, parcela_in.comuna_id, current_admin)

    payload = parcela_in.model_dump()
    if payload.get("poligono_vertices") and (payload.get("latitud") is None or payload.get("longitud") is None):
        centroide = calcular_centroide(payload["poligono_vertices"])
        payload["latitud"] = centroide["latitud"]
        payload["longitud"] = centroide["longitud"]

    parcela = Parcela(**payload)
    db.add(parcela)
    db.commit()
    db.refresh(parcela)
    return parcela


@router.get("/{parcela_id}", response_model=ParcelaSchema)
def read_parcela(
    parcela_id: int,
    db: Session = Depends(deps.get_db),
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    return _get_parcela_municipal(db, parcela_id, current_admin)


@router.post("/{parcela_id}/recomendacion-riego", response_model=RecomendacionRiego)
async def create_recomendacion_riego(
    parcela_id: int,
    db: Session = Depends(deps.get_db),
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    parcela = _get_parcela_municipal(db, parcela_id, current_admin)
    if parcela.latitud is None or parcela.longitud is None:
        raise HTTPException(status_code=422, detail="La parcela no tiene centroide definido")

    try:
        clima = await obtener_clima_diario(parcela.latitud, parcela.longitud)
    except ClimaServiceError as exc:
        raise _map_clima_error(exc)

    balance_anterior = (
        db.query(BalanceHidrico)
        .filter(
            BalanceHidrico.parcela_id == parcela.id,
            BalanceHidrico.fecha < clima["fecha"],
        )
        .order_by(BalanceHidrico.fecha.desc())
        .first()
    )
    dr_ayer = balance_anterior.deficit_hidrico if balance_anterior and balance_anterior.deficit_hidrico else 0

    recomendacion = calcular_recomendacion_riego(
        et0_mm=clima["et0_mm"],
        precipitacion_mm=clima["precipitacion_mm"],
        tipo_cultivo=parcela.tipo_cultivo,
        superficie_ha=parcela.superficie,
        dr_ayer_mm=dr_ayer,
    )

    balance = (
        db.query(BalanceHidrico)
        .filter(BalanceHidrico.parcela_id == parcela.id, BalanceHidrico.fecha == clima["fecha"])
        .first()
    )
    if not balance:
        balance = BalanceHidrico(parcela_id=parcela.id, fecha=clima["fecha"])
        db.add(balance)

    balance.et0 = clima["et0_mm"]
    balance.etc = recomendacion["etc_mm"]
    balance.evapotranspiracion = recomendacion["etc_mm"]
    balance.precipitacion = clima["precipitacion_mm"]
    balance.riego_sugerido = recomendacion["riego_sugerido_mm"]
    balance.riego_sugerido_mm = recomendacion["riego_sugerido_mm"]
    balance.litros_recomendados = recomendacion["litros_recomendados"]
    balance.deficit_hidrico = recomendacion["deficit_hidrico_mm"]
    balance.raw = recomendacion["raw_mm"]
    balance.taw = recomendacion["taw_mm"]
    balance.estado_hidrico = recomendacion["estado_hidrico"]

    db.commit()
    db.refresh(balance)

    return {
        "parcela_id": parcela.id,
        "fecha": clima["fecha"],
        "latitud": parcela.latitud,
        "longitud": parcela.longitud,
        "et0_mm": clima["et0_mm"],
        "precipitacion_mm": clima["precipitacion_mm"],
        **recomendacion,
        "balance_id": balance.id,
    }
