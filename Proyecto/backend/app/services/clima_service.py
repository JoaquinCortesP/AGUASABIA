import httpx

class ClimaService:
    @staticmethod
    async def obtener_pronostico(lat: float, lon: float) -> dict:
        """
        Obtener datos meteorológicos desde Open-Meteo.
        """
        # url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=et0_fao_evapotranspiration"
        return {"mensaje": "Datos meteorológicos simulados"}
