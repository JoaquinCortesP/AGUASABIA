from celery import Celery
from app.core.config import settings

celery_app = Celery("workers", broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0")

celery_app.conf.task_routes = {"app.workers.tasks.*": "main-queue"}
