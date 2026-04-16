class AgronomicoService:
    @staticmethod
    def calcular_et_o(datos_climaticos: dict) -> float:
        """
        Calcular la Evapotranspiración de Referencia (ET_o) basada en FAO-56.
        """
        # Lógica simplificada de prueba
        return 5.5

    @staticmethod
    def calcular_balance_hidrico(et_o: float, cultivo: str) -> float:
        """
        Calcular balance hídrico actual.
        """
        return et_o * 0.8
