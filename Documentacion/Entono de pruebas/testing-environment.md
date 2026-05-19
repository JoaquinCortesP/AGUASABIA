# Documentación de Testing Environment - AguaSabia

## 1. Descripción General

Este documento describe cómo replicar el entorno completo del backend de AguaSabia **SIN USAR DOCKER**. Se utiliza instalación nativa de servicios en Windows, macOS o Linux.

---

## 2. Requisitos del Sistema

### 2.1 Hardware Mínimo

- **CPU**: Dual-core o superior
- **RAM**: 4 GB mínimo (8 GB recomendado)
- **Disco**: 2 GB espacio libre
- **Red**: Conexión a internet para descargas iniciales

### 2.2 Software Requerido

| Software | Versión | Propósito |
|----------|---------|----------|
| Python | 3.8+ | Runtime |
| PostgreSQL | 12+ | Base de datos |
| Redis | 6.0+ | Message broker |
| Git | 2.0+ | Control de versiones |

---

## 3. Instalación de Python

### 3.1 Windows

**Descargar desde**: https://www.python.org/downloads/

**Pasos**:
1. Descargar Python 3.11 (recomendado)
2. Ejecutar instalador
3. ✅ Marcar "Add Python to PATH"
4. Seleccionar "Install Now"
5. Completar instalación

**Verificación**:
```powershell
python --version
python -m pip --version
```

### 3.2 macOS

```bash
# Usando Homebrew
brew install python3

# Verificar
python3 --version
pip3 --version
```

### 3.3 Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install python3 python3-venv python3-pip

# Verificar
python3 --version
pip3 --version
```

---

## 4. Instalación de PostgreSQL

### 4.1 Windows

**Descargar desde**: https://www.postgresql.org/download/windows/

**Pasos**:
1. Descargar PostgreSQL 15 (recomendado)
2. Ejecutar instalador (.exe)
3. Seleccionar componentes (marcar: PostgreSQL Server, pgAdmin 4)
4. Definir data directory (ej: `C:\Program Files\PostgreSQL\15\data`)
5. Definir contraseña de usuario `postgres` (importante: guardar)
6. Completar instalación
7. Verificar que servicio inicia automáticamente

**Verificación**:
```powershell
psql --version

# Conectar como postgres
psql -U postgres
# Debe pedir contraseña
```

### 4.2 macOS

```bash
# Usando Homebrew
brew install postgresql@15

# Iniciar servicio
brew services start postgresql@15

# Verificar
psql --version
psql -U postgres -l
```

### 4.3 Linux (Ubuntu/Debian)

```bash
sudo apt-get install postgresql postgresql-contrib

sudo service postgresql start
sudo service postgresql status

# Verificar
psql --version
psql -U postgres -l
```

---

## 5. Instalación de Redis

### 5.1 Windows

**Opción A**: Usando WSL (Windows Subsystem for Linux)

```powershell
# Abrir PowerShell como Admin
wsl

# En WSL:
sudo apt-get update
sudo apt-get install redis-server
redis-server

# En otra terminal WSL, verificar:
redis-cli PING
```

**Opción B**: Usando Redis from Windows

Descargar desde: https://github.com/microsoftarchive/redis/releases

```powershell
# Extraer y ejecutar
redis-server.exe

# Verificar en otra terminal
redis-cli PING
```

**Opción C**: Usando Windows Terminal + Ubuntu

Igual que WSL pero con mayor integración.

### 5.2 macOS

```bash
brew install redis

brew services start redis

# Verificar
redis-cli PING
```

### 5.3 Linux (Ubuntu/Debian)

```bash
sudo apt-get install redis-server

sudo service redis-server start

# Verificar
redis-cli PING
```

---

## 6. Clonar y Preparar el Proyecto

### 6.1 Clonar Repositorio

```powershell
git clone <URL_REPOSITORIO>
cd AguaSabia/Proyecto/backend
```

### 6.2 Crear Entorno Virtual

```powershell
# Windows
python -m venv venv
venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Verificación**: Debe aparecer `(venv)` al inicio de la línea de comandos.

### 6.3 Instalar Dependencias

```powershell
pip install -r requirements.txt
```

**Tiempo**: 3-5 minutos

---

## 7. Configuración de Variables de Entorno

### 7.1 Crear Archivo .env

En `backend/.env`:

```env
# Proyecto
PROJECT_NAME=AguaSabia
API_V1_STR=/api/v1

# Seguridad
SECRET_KEY=desarrollo_clave_secreta_cambiar_en_produccion_$(python -c 'import secrets; print(secrets.token_urlsafe(32))')
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# PostgreSQL Local
DATABASE_URL=postgresql://postgres:tu_contraseña_aqui@localhost:5432/aguasabia

# Redis Local
REDIS_URL=redis://localhost:6379/0

# CORS - Localhost para desarrollo
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 7.2 Valores Específicos por Entorno

**Para Windows (con contraseña 'password' en postgres)**:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aguasabia
REDIS_URL=redis://localhost:6379/0
```

**Para macOS (usuario default)**:
```env
DATABASE_URL=postgresql://postgres@localhost:5432/aguasabia
REDIS_URL=redis://localhost:6379/0
```

**Para Linux (con contraseña)**:
```env
DATABASE_URL=postgresql://postgres:contraseña@localhost:5432/aguasabia
REDIS_URL=redis://localhost:6379/0
```

---

## 8. Inicializar Base de Datos

### 8.1 Crear Base de Datos

```powershell
# Conectar a PostgreSQL
psql -U postgres

# En psql:
CREATE DATABASE aguasabia;
\q
```

### 8.2 Crear Tablas

**Opción A**: Script Python (Recomendado)

```powershell
python

# En Python:
from app.db.base import Base
from app.db.session import engine
from app.models.agricultor import Agricultor
from app.models.municipio import Municipio
from app.models.parcela import Parcela
from app.models.balance import BalanceHidrico

Base.metadata.create_all(bind=engine)
print("✓ Tablas creadas exitosamente")

exit()
```

**Opción B**: Manualmente desde psql

```sql
psql -U postgres -d aguasabia

-- Crear tablas
CREATE TABLE municipios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    region VARCHAR
);

CREATE TABLE agricultores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    municipio_id INTEGER REFERENCES municipios(id)
);

CREATE TABLE parcelas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    latitud FLOAT,
    longitud FLOAT,
    area FLOAT,
    cultivo VARCHAR,
    agricultor_id INTEGER REFERENCES agricultores(id)
);

CREATE TABLE balances_hidricos (
    id SERIAL PRIMARY KEY,
    fecha DATE,
    et_o FLOAT,
    evapotranspiracion_real FLOAT,
    precipitacion FLOAT,
    riego FLOAT,
    humedad_suelo FLOAT,
    parcela_id INTEGER REFERENCES parcelas(id)
);

\q
```

### 8.3 Insertar Datos de Prueba

```powershell
psql -U postgres -d aguasabia

-- Insert municipios
INSERT INTO municipios (nombre, region) VALUES
('San Salvador', 'Cuscatlán'),
('Soyapango', 'San Salvador'),
('Santa Tecla', 'La Libertad');

-- Insert agricultor de prueba
-- Primero generar hash en Python:
-- from app.core.security import get_password_hash
-- get_password_hash("password123")

INSERT INTO agricultores (nombre, email, hashed_password, municipio_id) VALUES
('Juan Pérez', 'juan@example.com', '$2b$12$...hash...', 1);

-- Insert parcela de prueba
INSERT INTO parcelas (nombre, latitud, longitud, area, cultivo, agricultor_id) VALUES
('Parcela Norte', 13.6929, -89.2182, 2.5, 'Maíz', 1);

\q
```

---

## 9. Verificación de Configuración

### 9.1 Test de Conexión a PostgreSQL

```powershell
python test_db.py
```

**Output esperado**:
```
DATABASE_URL: postgresql://postgres:...@localhost:5432/aguasabia
Conexión OK a PostgreSQL
```

### 9.2 Test de Conexión a Redis

```powershell
redis-cli PING
```

**Output**:
```
PONG
```

---

## 10. Levantar Servicios en Orden

### Paso 1: PostgreSQL

```powershell
# Windows: Debe estar corriendo como servicio

# macOS:
brew services start postgresql@15

# Linux:
sudo service postgresql start
```

**Verificación**:
```powershell
psql -U postgres -l
```

### Paso 2: Redis

```powershell
# Windows (terminal 1):
redis-server

# macOS/Linux (background):
redis-server &
```

**Verificación**:
```powershell
redis-cli PING
# Debe retornar: PONG
```

### Paso 3: FastAPI Backend

```powershell
# Terminal 2 (nueva):
cd AguaSabia/Proyecto/backend
venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Paso 4: Celery Worker

```powershell
# Terminal 3 (nueva):
cd AguaSabia/Proyecto/backend
venv\Scripts\Activate.ps1
celery -A app.workers.celery_app worker --loglevel=info
```

**Output**:
```
[...] Connected to redis://localhost:6379/0
[...] celery@HOSTNAME ready.
```

---

## 11. Verificar Que Todo Funciona

### 11.1 Backend Activo

```
Accede a: http://localhost:8000
Debe retornar: {"mensaje": "Bienvenido a la API de AguaSabia"}
```

### 11.2 Documentación Swagger

```
Accede a: http://localhost:8000/docs
Debe cargar interfaz interactiva
```

### 11.3 Test de Endpoint (sin autenticación)

```bash
curl http://localhost:8000/
# {"mensaje": "Bienvenido a la API de AguaSabia"}
```

### 11.4 Test de Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=juan@example.com&password=password123"
```

---

## 12. Puertos Utilizados

| Servicio | Puerto | Host | URL |
|----------|--------|------|-----|
| FastAPI | 8000 | localhost | http://localhost:8000 |
| PostgreSQL | 5432 | localhost | postgresql://localhost:5432 |
| Redis | 6379 | localhost | redis://localhost:6379 |
| Swagger UI | 8000 | localhost | http://localhost:8000/docs |

---

## 13. Monitoreo de Servicios

### 13.1 Ver Conexiones PostgreSQL

```sql
psql -U postgres

SELECT datname, usename, application_name, state 
FROM pg_stat_activity;

\q
```

### 13.2 Ver Cola de Tareas Celery

```powershell
celery -A app.workers.celery_app inspect active
celery -A app.workers.celery_app inspect scheduled
```

### 13.3 Logs de Redis

```powershell
redis-cli
MONITOR
# Ver todas las operaciones en tiempo real
```

---

## 14. Problemas Comunes y Soluciones

### 14.1 "Port 8000 already in use"

```powershell
# Encontrar qué usa el puerto
lsof -i :8000          # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Matar proceso (Windows)
taskkill /PID <PID> /F

# O usar puerto diferente
uvicorn app.main:app --port 8001
```

### 14.2 "Connection refused: PostgreSQL"

```powershell
# Verificar si está corriendo
psql -U postgres -l

# O reiniciar el servicio
# Windows: Services > PostgreSQL > Restart
# macOS: brew services restart postgresql@15
# Linux: sudo service postgresql restart
```

### 14.3 "Redis connection refused"

```powershell
# Verificar si está corriendo
redis-cli PING

# Si no retorna PONG, iniciar Redis
redis-server

# Verificar puerto
redis-cli --port 6379 PING
```

### 14.4 "No module named app"

```powershell
# Asegurar estar en directorio correcto
cd AguaSabia/Proyecto/backend

# Activar venv
venv\Scripts\Activate.ps1

# Intenta de nuevo
uvicorn app.main:app --reload
```

---

## 15. Checklist de Inicialización

```
[ ] Python 3.8+ instalado
[ ] PostgreSQL 12+ instalado y ejecutándose
[ ] Redis 6.0+ instalado y ejecutándose
[ ] Repositorio clonado
[ ] Entorno virtual creado
[ ] Dependencias instaladas (pip install -r requirements.txt)
[ ] Archivo .env creado con valores correctos
[ ] Base de datos "aguasabia" creada
[ ] Tablas creadas exitosamente
[ ] Test de conexión a BD pasado (python test_db.py)
[ ] Redis respondiendo (redis-cli PING)
[ ] Backend levantado (uvicorn ... --reload)
[ ] Swagger UI accesible (http://localhost:8000/docs)
[ ] Endpoint raíz respondiendo (curl http://localhost:8000)
[ ] Celery worker ejecutándose
[ ] Tests de endpoints pasando
```

---

## 16. Script de Inicialización Automática

**Archivo**: `startup.sh` (macOS/Linux) o `startup.ps1` (Windows)

```powershell
# startup.ps1
Write-Host "=== Iniciando servicios AguaSabia ==="

# 1. PostgreSQL
Write-Host "✓ PostgreSQL debe estar corriendo como servicio..."

# 2. Redis
Write-Host "✓ Iniciando Redis..."
Start-Process redis-server

# 3. Backend
Write-Host "✓ Iniciando Backend..."
cd AguaSabia/Proyecto/backend
venv\Scripts\Activate.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command uvicorn app.main:app --reload"

# 4. Celery
Write-Host "✓ Iniciando Celery Worker..."
Start-Process powershell -ArgumentList "-NoExit", "-Command celery -A app.workers.celery_app worker --loglevel=info"

Write-Host "=== Servicios iniciados ==="
Write-Host "Backend: http://localhost:8000"
Write-Host "Docs: http://localhost:8000/docs"
```

---

## 17. Resumen del Entorno de Testing

**Infraestructura Real (Sin Docker)**:
- PostgreSQL: Base de datos relacional nativa
- Redis: Cache y message broker nativos
- Python venv: Aislamiento de dependencias
- FastAPI + Uvicorn: Web server nativo

**Tiempo de Setup**: 15-30 minutos

**Requisitos**: ~2 GB disco, 4 GB RAM mínimo

**Coste**: $0 (todo software open-source)

Este entorno es completo y listo para desarrollo y testing local.
