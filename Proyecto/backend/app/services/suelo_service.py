class SueloService:
    @staticmethod
    def obtener_propiedades_suelo(lat: float, lon: float) -> dict:
        """
        Obtener propiedades del suelo (Capacidad de campo, Punto de marchitez).
        """
        return {"capacidad_campo": 0.30, "punto_marchitez": 0.15}
