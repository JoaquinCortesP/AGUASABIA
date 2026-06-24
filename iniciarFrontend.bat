@echo off
echo ========================================================
echo        Iniciando Frontend AguaSabia (React + Vite)
echo ========================================================

cd Proyecto\frontend

echo Instalando dependencias (si falta alguna)...
call npm install

echo Levantando servidor de desarrollo Vite...
call npm run dev

pause
