@echo off
echo ========================================================
echo        Iniciando Backend AguaSabia (FastAPI + PostGIS)
echo ========================================================

cd Proyecto\backend

echo Activando entorno virtual...
call .\.venv\Scripts\activate

echo Ejecutando migraciones pendientes de base de datos...
alembic upgrade head

echo Sincronizando capas oficiales (DGA/MOP)...
python scripts\sync_capas_oficiales.py

echo Levantando servidor FastAPI...
start "Servidor AguaSabia Backend" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo ========================================================
echo El Backend esta corriendo en http://localhost:8000
echo ========================================================
pause
