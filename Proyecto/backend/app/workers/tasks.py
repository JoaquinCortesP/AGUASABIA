from app.workers.celery_app import celery_app

@celery_app.task(name="test_task")
def test_task(nombre: str):
    """
    Tarea de prueba para verificar funcionamiento de Celery.
    """
    return f"Hola {nombre}, la tarea se ejecutó correctamente"

@celery_app.task(name="sincronizar_clima")
def sincronizar_clima():
    """
    Sincronizar datos climáticos de forma periódica.
    """
    return "Sincronización completada"
