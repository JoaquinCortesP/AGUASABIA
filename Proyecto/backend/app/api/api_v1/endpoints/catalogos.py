from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.comuna import Comuna
from app.models.region import Region
from app.schemas.comuna import Comuna as ComunaSchema
from app.schemas.region import Region as RegionSchema

router = APIRouter()


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
