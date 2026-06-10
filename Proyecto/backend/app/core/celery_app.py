from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "aguasabia_worker",
    broker=settings.CELERY_BROKER_URL or "redis://localhost:6379/0",
    backend=settings.CELERY_RESULT_BACKEND or "redis://localhost:6379/0",
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Santiago",
    enable_utc=True,
)

# Descubrir tareas automáticamente en estos módulos
celery_app.autodiscover_tasks(["app.tasks.sync_tasks"])
