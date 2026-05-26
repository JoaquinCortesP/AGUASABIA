from celery import Celery
from app.core.config import settings

# Configuración básica de Celery para tareas en segundo plano
celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.task_routes = {
    "app.worker.test_celery": "main-queue"
}

@celery_app.task(acks_late=True)
def test_celery(word: str) -> str:
    # Tarea de prueba para verificar que Celery funciona
    return f"Test task return {word}"
