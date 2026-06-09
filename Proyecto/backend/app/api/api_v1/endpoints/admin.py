from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.security import get_password_hash
from app.models.administrador import Administrador
from app.models.consulta_territorial import ConsultaTerritorial
from app.models.municipio import Municipio
from app.models.usuario import Usuario
from app.schemas.administrador import (
    AdminMetricas,
    Administrador as AdministradorSchema,
    AdministradorCreate,
)

router = APIRouter()


@router.post("/register", response_model=AdministradorSchema, status_code=status.HTTP_201_CREATED)
def register_admin(
    *,
    db: Session = Depends(deps.get_db),
    admin_in: AdministradorCreate,
) -> Administrador:
    municipio = db.query(Municipio).filter(Municipio.id == admin_in.municipio_id).first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    existing = db.query(Administrador).filter(Administrador.email == admin_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un administrador con ese email")

    admin = Administrador(
        nombre=admin_in.nombre,
        email=admin_in.email,
        hashed_password=get_password_hash(admin_in.password),
        municipio_id=admin_in.municipio_id,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@router.get("/me", response_model=AdministradorSchema)
def get_current_admin_info(
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Administrador:
    return current_admin


def _chile_bounds() -> tuple[datetime, datetime, datetime]:
    zona_chile = ZoneInfo("America/Santiago")
    ahora_chile = datetime.now(zona_chile)
    inicio_dia = ahora_chile.replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_mes = inicio_dia.replace(day=1)
    fin_dia = inicio_dia + timedelta(days=1)
    return (
        inicio_dia.astimezone(timezone.utc),
        fin_dia.astimezone(timezone.utc),
        inicio_mes.astimezone(timezone.utc),
    )


@router.get("/metricas", response_model=AdminMetricas)
def read_admin_metricas(
    db: Session = Depends(deps.get_db),
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> dict[str, int]:
    del current_admin
    inicio_dia_utc, fin_dia_utc, inicio_mes_utc = _chile_bounds()

    return {
        "usuarios_registrados": db.query(Usuario).count(),
        "consultas_realizadas": db.query(ConsultaTerritorial).count(),
        "consultas_hoy": db.query(ConsultaTerritorial)
        .filter(
            ConsultaTerritorial.created_at >= inicio_dia_utc,
            ConsultaTerritorial.created_at < fin_dia_utc,
        )
        .count(),
        "consultas_mes": db.query(ConsultaTerritorial)
        .filter(ConsultaTerritorial.created_at >= inicio_mes_utc)
        .count(),
    }
