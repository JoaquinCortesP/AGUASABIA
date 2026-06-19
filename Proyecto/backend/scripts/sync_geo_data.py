import sys
import os
import asyncio
import logging

# Add the root project directory to the path so that app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.services.geo_ingestion import run_dga_pipeline

logging.basicConfig(level=logging.INFO)

def main():
    print("Iniciando la Sincronización de Datos MOP (DGA)...")
    db_session = SessionLocal()
    try:
        asyncio.run(run_dga_pipeline(db_session))
    except Exception as e:
        print(f"Error crítico en el script: {e}")
    finally:
        db_session.close()
        print("Sincronización finalizada.")

if __name__ == "__main__":
    main()
