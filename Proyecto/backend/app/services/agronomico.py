from datetime import date


class AgronomicoService:
    @staticmethod
    def calcular_riego_sugerido(superficie_ha: float, et_o: float = 5.0, eficiencia: float = 0.7) -> float:
        """Calcula un valor inicial de riego sugerido en litros."""
        if superficie_ha is None or superficie_ha <= 0:
            return 0.0

        mm_deficit = et_o * 0.5
        litros = mm_deficit * superficie_ha * 10000 / eficiencia
        return round(litros, 2)

    @staticmethod
    def crear_balance_inicial(parcela: object, fecha: date) -> dict:
        return {
            "fecha": fecha,
            "evapotranspiracion": 5.0,
            "precipitacion": 0.0,
            "riego_sugerido": AgronomicoService.calcular_riego_sugerido(parcela.superficie or 0.0),
            "humedad_suelo": 0.0,
        }
