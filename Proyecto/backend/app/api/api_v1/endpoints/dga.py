import json
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import deps
from app.models.capas_ambientales import AcuiferoProtegido

router = APIRouter()

@router.get("/acuiferos")
def get_acuiferos(db: Session = Depends(deps.get_db)) -> Any:
    # Obtener acuiferos con ST_AsGeoJSON para máxima eficiencia
    results = db.query(
        AcuiferoProtegido.objectid,
        AcuiferoProtegido.nombre,
        AcuiferoProtegido.region,
        func.ST_AsGeoJSON(AcuiferoProtegido.geom)
    ).all()
    
    features = []
    for row in results:
        objectid, nombre, region, geom_str = row
        geom_json = json.loads(geom_str) if geom_str else None
        
        features.append({
            "type": "Feature",
            "geometry": geom_json,
            "properties": {
                "id": objectid,
                "nombre": nombre,
                "region": region
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }
