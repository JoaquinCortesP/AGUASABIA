from fastapi import APIRouter

router = APIRouter()

@router.get("/actual")
def get_clima_actual():
    """
    Obtener datos climáticos actuales.
    """
    return {"temperatura": 20.0, "humedad": 50.0}
