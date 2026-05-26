from fastapi import APIRouter

router = APIRouter()


@router.get("/clima")
def get_public_clima():
    return {
        "estado": "publico",
        "mensaje": "Clima público disponible sin autenticación",
        "datos": {
            "temperatura": 22.5,
            "humedad": 55,
            "condiciones": "Cielo despejado",
        },
    }


@router.get("/dashboard")
def get_public_dashboard():
    return {
        "estado": "publico",
        "mensaje": "Datos de dashboard público",
        "resumen": {
            "parcelas_registradas": 0,
            "municipios_cubiertos": 0,
            "alertas": [],
        },
    }
