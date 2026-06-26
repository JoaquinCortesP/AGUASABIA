@echo off
echo Iniciando Servidor Backend de AguaSabia para Expo Go...
echo ========================================================
echo Abriendo puerto 8000 en la red local (0.0.0.0) para que 
echo la aplicacion movil Expo Go pueda conectarse...
echo.
call .venv\Scripts\activate.bat
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
