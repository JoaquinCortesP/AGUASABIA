from fastapi import APIRouter, BackgroundTasks, Depends
from app.api.deps import get_db
from sqlalchemy.orm import Session
from app.services.geo_ingestion import run_dga_pipeline
from app.models.capas_ambientales import EstacionHidrometrica
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ingest",
    tags=["Ingesta DGA"]
)

@router.post("/red-hidrometrica", status_code=202)
async def trigger_ingestion(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Endpoint para disparar el pipeline de ingesta de la Red Hidrométrica Nacional
    desde el servidor ArcGIS de la DGA.
    """
    # Usamos db.get_bind() u otra lógica si no podemos pasar el iterador completo,
    # pero background_tasks ejecutará run_dga_pipeline(db) de forma asíncrona.
    # Dado que db es un iterador dependiente del request, podría cerrarse antes
    # de que termine la tarea en background. En un escenario real asíncrono,
    # deberíamos inyectar un nuevo SessionMaker dentro de la tarea.
    # Para asegurar robustez:
    from app.db.session import SessionLocal
    def background_task():
        db_session = SessionLocal()
        try:
            # Dado que run_dga_pipeline es async, necesitamos correrlo en un bucle de eventos
            import asyncio
            asyncio.run(run_dga_pipeline(db_session))
        finally:
            db_session.close()

    background_tasks.add_task(background_task)
    return {"status": "Proceso de ingesta iniciado en segundo plano."}

@router.get("/estaciones", status_code=200)
def get_estaciones(limit: int = 10, db: Session = Depends(get_db)):
    """
    Endpoint rápido para que el Frontend o Postman puedan ver las estaciones recién descargadas.
    Retorna GeoJSON.
    """
    # Usamos ST_AsGeoJSON para convertir directamente la geometría en PostGIS a JSON usable por Leaflet
    resultados = db.query(
        EstacionHidrometrica.objectid,
        EstacionHidrometrica.cod_estacion,
        EstacionHidrometrica.nombre,
        EstacionHidrometrica.tipo_estacion,
        func.ST_AsGeoJSON(EstacionHidrometrica.geom).label("geojson")
    ).limit(limit).all()

    import json
    features = []
    for r in resultados:
        features.append({
            "type": "Feature",
            "properties": {
                "objectid": r.objectid,
                "cod_estacion": r.cod_estacion,
                "nombre": r.nombre,
                "tipo_estacion": r.tipo_estacion
            },
            "geometry": json.loads(r.geojson) if r.geojson else None
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }
