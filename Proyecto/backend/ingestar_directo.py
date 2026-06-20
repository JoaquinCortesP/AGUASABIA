import sys
import asyncio
from pathlib import Path

# Agregar el directorio raíz al path para que reconozca los módulos
sys.path.append(str(Path(__file__).resolve().parent))

from app.db.session import SessionLocal
from app.services.geo_ingestion import run_dga_pipeline

async def main():
    db = SessionLocal()
    try:
        print("Iniciando la ingesta directa de estaciones desde el servidor MOP...")
        await run_dga_pipeline(db)
        print("Ingesta finalizada con éxito en la base de datos local.")
    except Exception as e:
        print("Error durante la ingesta directa:", e)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
