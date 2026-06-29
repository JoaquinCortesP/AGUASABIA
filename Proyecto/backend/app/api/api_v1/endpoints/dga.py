import json
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import deps
from app.models.capas_ambientales import AcuiferoProtegido, Cuenca, DecretoEscasez

router = APIRouter()

@router.get("/acuiferos")
def get_acuiferos(db: Session = Depends(deps.get_db)) -> Any:
    # Obtener acuiferos con ST_AsGeoJSON para máxima eficiencia
    results = db.query(
        AcuiferoProtegido.objectid,
        AcuiferoProtegido.nombre,
        AcuiferoProtegido.region,
        func.ST_AsGeoJSON(func.ST_Simplify(AcuiferoProtegido.geom, 0.005))
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

@router.get("/cuencas")
def get_cuencas(db: Session = Depends(deps.get_db)) -> Any:
    # Obtener cuencas con ST_AsGeoJSON
    results = db.query(
        Cuenca.id,
        Cuenca.nombre,
        Cuenca.codigo,
        func.ST_AsGeoJSON(func.ST_Simplify(Cuenca.geometria, 0.005))
    ).all()
    
    features = []
    for row in results:
        id_, nombre, codigo, geom_str = row
        geom_json = json.loads(geom_str) if geom_str else None
        
        features.append({
            "type": "Feature",
            "geometry": geom_json,
            "properties": {
                "id": id_,
                "nombre": nombre,
                "codigo": codigo
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/decretos-escasez")
def get_decretos_escasez(db: Session = Depends(deps.get_db)) -> Any:
    # Obtener decretos de escasez con ST_AsGeoJSON
    results = db.query(
        DecretoEscasez.id,
        DecretoEscasez.numero_decreto,
        DecretoEscasez.region,
        func.ST_AsGeoJSON(func.ST_Simplify(DecretoEscasez.geometria, 0.005))
    ).all()
    
    features = []
    for row in results:
        id_, numero_decreto, region, geom_str = row
        geom_json = json.loads(geom_str) if geom_str else None
        
        features.append({
            "type": "Feature",
            "geometry": geom_json,
            "properties": {
                "id": id_,
                "numero_decreto": numero_decreto,
                "region": region
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

