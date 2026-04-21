import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_dir, ".env")

load_dotenv(env_path)

database_url = os.getenv("DATABASE_URL")

print("DATABASE_URL:", database_url)

engine = create_engine(database_url)

try:
    with engine.connect() as conn:
        print("Conexión OK a PostgreSQL")
except Exception as e:
    print("Error:", e)