# Guía de Configuración del Backend - AguaSabia

## 1. Requisitos Previos

### 1.1 Requisitos del Sistema

- **Sistema Operativo**: Windows 10+, macOS 10.14+, o Linux
- **Python**: 3.8 o superior
- **PostgreSQL**: 12 o superior (instalado y ejecutándose)
- **Redis**: 6.0 o superior (para Celery)
- **Git**: Para clonar el repositorio

### 1.2 Verificación de Requisitos

```powershell
# Verificar Python
python --version

# Verificar pip
pip --version

# Verificar PostgreSQL
psql --version

# Verificar Redis
redis-cli --version
```

## 2. Instalación del Backend

### 2.1 Clonar el Repositorio

```powershell
# Clonar desde el repositorio remoto
git clone <URL_DEL_REPOSITORIO> AguaSabia
cd AguaSabia/Proyecto/backend
```

### 2.2 Crear Entorno Virtual

```powershell
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
.venv\Scripts\Activate.ps1

# O en cmd.exe:
venv\Scripts\activate.bat

# Activar entorno virtual (macOS/Linux)
source venv/bin/activate
```

**Nota**: Debes ver `(venv)` en el inicio de tu línea de comandos cuando el entorno esté activado.

### 2.3 Instalar Dependencias

```powershell
# Asegúrate de estar en el directorio backend con venv activado
pip install -r requirements.txt
```

**Tiempo esperado**: 2-5 minutos según tu conexión a internet.

**Problemas comunes**:
- Si `psycopg2-binary` falla en Windows: Necesitas tener Visual C++ build tools instalado
- Si algún paquete falla: Intenta `pip install --upgrade pip` primero

### 2.4 Verificar Instalación de Dependencias

```powershell
# Listar paquetes instalados
pip list

# Verificar que FastAPI está instalado
python -c "import fastapi; print(f'FastAPI {fastapi.__version__}')"

# Verificar que SQLAlchemy está instalado
python -c "import sqlalchemy; print(f'SQLAlchemy {sqlalchemy.__version__}')"
```

## 3. Configuración de PostgreSQL

### 3.1 Conectar a PostgreSQL

```powershell
# Conectar con usuario por defecto
psql -U postgres

# O si PostgreSQL está en otra ubicación:
C:\Program Files\PostgreSQL\15\bin\psql.exe -U postgres
```

### 3.2 Crear Base de Datos

```sql
-- Dentro de psql:
CREATE DATABASE aguasabia;

-- Verificar que se creó
\l

-- Salir de psql
\q
```

### 3.3 Crear Usuario (Opcional)

Si deseas usar un usuario diferente a `postgres`:

```sql
-- Crear usuario
CREATE USER aguasabia_user WITH PASSWORD 'tu_contraseña_segura';

-- Dar permisos
ALTER ROLE aguasabia_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE aguasabia TO aguasabia_user;

-- Conectar como el nuevo usuario
psql -U aguasabia_user -d aguasabia
```

## 4. Configuración de Variables de Entorno

### 4.1 Crear Archivo .env

En el directorio `backend/`, crea un archivo llamado `.env`:

```env
# Configuración del Proyecto
PROJECT_NAME=AguaSabia
API_V1_STR=/api/v1

# Seguridad
SECRET_KEY=tu_clave_secreta_super_segura_aqui_cambiar_en_produccion
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://postgres:kakashi2709@localhost:5432/aguasabia

# Redis (Para Celery)
REDIS_URL=redis://localhost:6379/0

# CORS (Orígenes permitidos - separados por coma)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 4.2 Explicación de Variables

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PROJECT_NAME` | Nombre de la aplicación | `AguaSabia` |
| `API_V1_STR` | Prefijo de endpoints | `/api/v1` |
| `SECRET_KEY` | Clave para firmar JWT tokens | Generar con `secrets.token_urlsafe(32)` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos antes de expirar sesión | `11520` (8 días) |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://usuario:contraseña@host:puerto/base_datos` |
| `REDIS_URL` | Conexión a Redis | `redis://localhost:6379/0` |
| `BACKEND_CORS_ORIGINS` | URLs permitidas de frontend | `http://localhost:3000` |

### 4.3 Generar SECRET_KEY Seguro

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 5. Inicialización de la Base de Datos

### 5.1 Crear Tablas Automáticamente

FastAPI + SQLAlchemy puede crear las tablas automáticamente al levantar la aplicación, pero lo recomendado es hacerlo manualmente:

```powershell
# Desde el directorio backend, con venv activado
python

# En la consola Python:
from app.db.base import Base
from app.db.session import engine
from app.models.agricultor import Agricultor
from app.models.municipio import Municipio
from app.models.parcela import Parcela
from app.models.balance import BalanceHidrico

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

# Salir
exit()
```

### 5.2 Verificar Tablas Creadas

```powershell
# Conectar a la base de datos
psql -U postgres -d aguasabia

# Listar tablas
\dt

# Ver estructura de tabla específica
\d agricultores
\d municipios
\d parcelas
\d balances_hidricos

# Salir
\q
```

**Tablas esperadas**:
- `agricultores` - Usuarios agricultores
- `municipios` - Municipios
- `parcelas` - Parcelas de tierra
- `balances_hidricos` - Registros de balance hídrico

### 5.3 Insertar Datos de Prueba (Opcional)

```sql
-- Conectar a la base de datos
psql -U postgres -d aguasabia

-- Insertar municipios de prueba
INSERT INTO municipios (nombre, region) VALUES 
('San Salvador', 'Cuscatlán'),
('Soyapango', 'San Salvador'),
('Santa Tecla', 'La Libertad');

-- Verificar datos
SELECT * FROM municipios;
```

## 6. Configuración de Redis

### 6.1 Instalar Redis (Windows)

**Opción 1**: Usando Windows Subsystem for Linux (WSL)
```powershell
# En WSL:
wsl
sudo apt-get install redis-server
redis-server
```

**Opción 2**: Usando Docker (si tienes Docker instalado)
```powershell
docker run -d -p 6379:6379 redis:latest
```

**Opción 3**: Descargar Redis para Windows
```powershell
# Descargar desde: https://github.com/microsoftarchive/redis/releases
# Ejecutar: redis-server.exe
```

### 6.2 Instalar Redis (macOS)

```bash
brew install redis
brew services start redis
```

### 6.3 Instalar Redis (Linux)

```bash
sudo apt-get install redis-server
sudo service redis-server start
```

### 6.4 Verificar Conexión a Redis

```powershell
# Abrir otra terminal y ejecutar:
redis-cli

# Si aparece > entonces está conectado
PING
# Debe retornar: PONG

# Salir:
exit
```

## 7. Ejecutar el Backend

### 7.1 Iniciar el Servidor de Desarrollo

```powershell
# Asegúrate de estar en el directorio backend con venv activado
uvicorn app.main:app --reload
```

**Output esperado**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [1234]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 7.2 Acceder a la Aplicación

```
URL Local:
http://localhost:8000

OpenAPI Documentation (Swagger UI):
http://localhost:8000/docs

Alternative API Documentation (ReDoc):
http://localhost:8000/redoc

Root endpoint:
http://localhost:8000
```

### 7.3 Ejecutar Celery Worker (En otra terminal)

```powershell
# Activar venv en otra terminal

# Windows
celery -A app.workers.celery_app worker --loglevel=info

# macOS/Linux
celery -A app.workers.celery_app worker --loglevel=info
```

**Output esperado**:
```
[2024-05-13 10:30:00,000: INFO/MainProcess] Connected to redis://localhost:6379/0
[2024-05-13 10:30:00,123: INFO/MainProcess] mingle: searching for executable celery script in /path...
[2024-05-13 10:30:00,456: INFO/MainProcess] celery@HOSTNAME ready.
```

## 8. Puertos y URLs Utilizados

### 8.1 Puertos por Defecto

| Servicio | Puerto | URL |
|----------|--------|-----|
| FastAPI (Backend) | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | redis://localhost:6379 |
| Swagger UI | 8000 | http://localhost:8000/docs |

### 8.2 Variables en .env

```env
# FastAPI
API_V1_STR=/api/v1

# Base URLs (localhost:8000 + prefijo)
BASE_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000/api/v1
```

## 9. Errores Comunes y Soluciones

### 9.1 "ModuleNotFoundError: No module named 'app'"

**Causa**: Estás en el directorio incorrecto o venv no está activado.

**Solución**:
```powershell
# Asegúrate de estar en /AguaSabia/Proyecto/backend
cd AguaSabia/Proyecto/backend

# Activa el venv
venv\Scripts\Activate.ps1

# Intenta de nuevo
uvicorn app.main:app --reload
```

### 9.2 "could not connect to server: Connection refused"

**Causa**: PostgreSQL no está ejecutándose.

**Solución**:
```powershell
# Verificar PostgreSQL está ejecutándose
# En Windows: Services > PostgreSQL

# O reiniciar:
# Windows: net start postgresql-x64-15
# macOS: brew services restart postgresql
# Linux: sudo service postgresql restart

# Verificar conexión
psql -U postgres -d postgres
```

### 9.3 "ERROR [Errno 111] Connection refused" (Redis)

**Causa**: Redis no está ejecutándose.

**Solución**:
```powershell
# Iniciar Redis
redis-server

# O verificar que está corriendo
redis-cli PING
```

### 9.4 "psycopg2.OperationalError: FATAL: password authentication failed"

**Causa**: Contraseña incorrecta en DATABASE_URL.

**Solución**:
```env
# Verificar DATABASE_URL en .env
DATABASE_URL=postgresql://postgres:CONTRASEÑA_CORRECTA@localhost:5432/aguasabia

# Verificar que la contraseña es correcta
psql -U postgres -d aguasabia
```

### 9.5 "Pydantic v2 expected but v1 found"

**Causa**: Versión incorrecta de Pydantic.

**Solución**:
```powershell
pip uninstall pydantic -y
pip install pydantic==2.13.3
pip install -r requirements.txt
```

## 10. Detener Servicios

```powershell
# Detener Backend (Ctrl+C en terminal uvicorn)
CTRL+C

# Detener Celery Worker (Ctrl+C en terminal celery)
CTRL+C

# Detener PostgreSQL (Windows)
net stop postgresql-x64-15

# O desde el backend:
# Desactivar venv
deactivate
```

## 11. Script de Instalación Rápida

Para automatizar todo el proceso:

```powershell
# setup.ps1
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "
from app.db.base import Base
from app.db.session import engine
from app.models.agricultor import Agricultor
from app.models.municipio import Municipio
from app.models.parcela import Parcela
from app.models.balance import BalanceHidrico
Base.metadata.create_all(bind=engine)
print('Base de datos creada exitosamente')
"
echo "Instalación completada. Ejecuta: uvicorn app.main:app --reload"
```

Ejecución:
```powershell
.\setup.ps1
```

## 12. Resumen de Configuración

**Estado de prueba**:
- ✅ Backend ejecutándose en `http://localhost:8000`
- ✅ PostgreSQL conectado en `localhost:5432`
- ✅ Redis conectado en `localhost:6379`
- ✅ Celery worker escuchando tareas
- ✅ CORS configurado para orígenes locales
- ✅ JWT tokens con expiración de 8 días

**Próximos pasos**:
- Conectar frontend a `http://localhost:8000/api/v1`
- Ejecutar tests de endpoints
- Configurar más datos de prueba en PostgreSQL
