from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_balance():
    """
    Obtener balance hídrico.
    """
    return {"et_o": 0.0, "balance": 0.0}
