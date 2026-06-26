@echo off
echo ========================================================
echo        Iniciando Workers (Celery) y Cache (Redis)
echo ========================================================

echo 1. Intentando levantar Redis usando Docker...
start "Redis Server" cmd /c "docker run --rm -p 6379:6379 redis"

echo 2. Esperando 5 segundos para que Redis inicie...
timeout /t 5 /nobreak

cd Proyecto\backend

echo 3. Activando entorno virtual de Python...
call .\.venv\Scripts\activate

echo 4. Levantando Celery Worker (Modo 'solo' obligatorio para Windows)...
start "Celery Worker" cmd /k "celery -A app.core.celery_app worker --pool=solo --loglevel=info"

echo ========================================================
echo Celery y Redis estan corriendo en ventanas separadas.
echo ========================================================
pause
