@echo off
echo ========================================================
echo        Iniciando Frontend AguaSabia (React + Vite)
echo ========================================================

cd Proyecto\frontend

echo Instalando dependencias (si falta alguna)...
call npm install

echo Levantando servidor de desarrollo Vite (Pagina Web)...
start "AguaSabia - Web" cmd /k "npm run dev"

echo Levantando Metro Bundler para Expo Go (Aplicacion Movil)...
start "AguaSabia - Expo Go" cmd /k "npx expo start --tunnel"

echo ========================================================
echo El Frontend esta corriendo en Web y Expo Go simultaneamente
echo ========================================================
pause
