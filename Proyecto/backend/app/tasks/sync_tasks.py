import logging
from celery import shared_task
from celery.schedules import crontab
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.consulta_territorial import ConsultaTerritorial

logger = logging.getLogger(__name__)

@shared_task
def test_task():
    """Tarea de prueba básica para verificar que Celery funciona."""
    logger.info("Celery test task ejecutada correctamente.")
    return "OK"

@shared_task
def sync_openmeteo_para_consultas_guardadas():
    """
    Ejemplo de tarea periódica que actualizaría el clima para las consultas guardadas.
    Planeada para ejecutarse a las 2:00 AM (configurado en Celery Beat).
    """
    logger.info("Iniciando sincronización de Open-Meteo para consultas territoriales...")
    db = SessionLocal()
    try:
        # Aquí iría la lógica para buscar consultas guardadas (guardada=True)
        # y volver a llamar a obtener_clima_diario() para mantenerlas vigentes.
        # Por ahora solo listamos cuántas consultas guardadas hay.
        count = db.query(ConsultaTerritorial).filter(ConsultaTerritorial.guardada == True).count()
        logger.info(f"Sincronización simulada para {count} consultas guardadas.")
    except Exception as e:
        logger.error(f"Error sincronizando clima: {e}")
    finally:
        db.close()

# Configuración de Celery Beat
celery_app.conf.beat_schedule = {
    # Tarea nocturna (2:00 AM)
    "sync-openmeteo-nocturno": {
        "task": "app.tasks.sync_tasks.sync_openmeteo_para_consultas_guardadas",
        "schedule": crontab(hour=2, minute=0),
    },
    # Tarea semanal (Domingos)
    "sync-sentinel-semanal": {
        "task": "app.tasks.sync_tasks.test_task", # Placeholder para sincronizar NDVI
        "schedule": crontab(day_of_week=0, hour=3, minute=0),
    },
}
