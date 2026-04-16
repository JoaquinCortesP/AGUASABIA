from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_parcelas():
    """
    Obtener lista de parcelas.
    """
    return []

@router.post("/")
def create_parcela():
    """
    Crear una nueva parcela.
    """
    return {"mensaje": "Parcela creada"}
