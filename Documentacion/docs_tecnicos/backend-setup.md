# Guía de Configuración del Backend - AguaSabia

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración del Backend](#configuración-del-backend)
5. [Migraciones con Alembic](#migraciones-con-alembic)
6. [Arquitectura de Datos](#arquitectura-de-datos)
7. [Ejecución del Backend](#ejecución-del-backend)
8. [Configuración de Celery](#configuración-de-celery)
9. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Software Requerido

- **Python**: 3.10+ (recomendado 3.11+)
- **PostgreSQL**: 13+ (instalado y ejecutándose)
- **Redis**: 6.0+ (para Celery y caché)
- **Git**: Para clonar el repositorio

### Verificación de Instalación

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

---

## Instalación

### Paso 1: Clonar el Repositorio

```powershell
git clone <URL_DEL_REPOSITORIO> AguaSabia
cd AguaSabia/Proyecto/backend
```

### Paso 2: Crear Entorno Virtual

```powershell
# Crear entorno virtual
python -m venv .venv

# Activar (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activar (Windows CMD)
.venv\Scripts\activate.bat

# Activar (macOS/Linux)
source .venv/bin/activate
```

**Verificar**: Debes ver `(.venv)` en el prompt del terminal.

### Paso 3: Instalar Dependencias

```powershell
pip install -r requirements.txt
```

**Tiempo estimado**: 2-5 minutos según tu conexión.

**Posibles errores**:
- **psycopg2-binary falla en Windows**: Instala Visual C++ Build Tools o usa `psycopg2-binary` precompilado
- **Problemas generales**: Ejecuta `pip install --upgrade pip` primero

### Paso 4: Verificar Instalación

```powershell
# Listar paquetes
pip list | grep -E "fastapi|sqlalchemy|alembic|celery"

# Prueba de importación
python -c "from fastapi import FastAPI; from sqlalchemy import create_engine; from alembic import config; print('✓ Todas las dependencias instaladas')"
```

---

## Configuración de Base de Datos

### Paso 1: Crear Base de Datos en PostgreSQL

```powershell
# Conectarse a PostgreSQL
psql -U postgres
```

```sql
-- Dentro de psql:
CREATE DATABASE aguasabia;

-- Verificar
\l

-- Salir
\q
```

### Paso 2: Crear Usuario (Opcional)

```sql
-- Si prefieres no usar 'postgres' directamente:
CREATE USER aguasabia_admin WITH PASSWORD 'contraseña_segura';
ALTER ROLE aguasabia_admin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE aguasabia TO aguasabia_admin;
```

### Paso 3: Verificar Conexión

```powershell
# Conectar a la BD
psql -U postgres -d aguasabia

# Verificar
SELECT version();

# Salir
\q
```

---

## Configuración del Backend

### Paso 1: Crear Archivo `.env`

En el directorio `backend/`, crea un archivo `.env`:

```powershell
# Copiar desde template
cp .env.example .env

# Editar .env con tus valores locales
```

### Paso 2: Estructura de `.env`

```env
# ===== PROYECTO =====
PROJECT_NAME=AguaSabia
API_V1_STR=/api/v1

# ===== SEGURIDAD =====
# Generar con: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=tu_clave_super_secreta_cambiar_en_produccion

# ===== SESIONES JWT =====
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 días

# ===== BASE DE DATOS =====
DATABASE_URL=postgresql://postgres:kakashi2709@localhost:5432/aguasabia

# ===== REDIS =====
REDIS_URL=redis://localhost:6379/0

# ===== CELERY =====
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# ===== CORS =====
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:8000
```

### Paso 3: Generar SECRET_KEY Seguro

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copiar el resultado en SECRET_KEY del .env
```

### ⚠️ Seguridad

- **`.env` NO debe estar en Git**: Verifica que esté en `.gitignore`
- **Secretos en producción**: Cambiar todos los valores en .env para producción
- **Variables sensibles**: No loguear tokens, contraseñas, nor URLs de BD

---

## Migraciones con Alembic

### Conceptos Básicos

AguaSabia utiliza **Alembic** para gestionar migraciones de base de datos. Esto es más profesional y seguro que `Base.metadata.create_all()`.

- **Alembic**: Herramienta de migración versionada para SQLAlchemy
- **Ventajas**: Control de cambios, reversibilidad, versionamiento de BD
- **Archivos**: Están en `alembic/versions/`

### Paso 1: Inicializar Alembic (Ya configurado)

Alembic ya está configurado en `alembic.ini` y `alembic/env.py`. **No necesitas hacer esto nuevamente**.

Pero si necesitaras reinicializar:

```powershell
alembic init alembic
```

### Paso 2: Aplicar Migraciones Existentes

**Primera vez de configuración** → Aplicar migración inicial:

```powershell
python -m alembic upgrade head
```

Esto crea todas las tablas necesarias en la BD.

### Paso 3: Verificar Tablas Creadas

```powershell
# Conectar a la BD
psql -U postgres -d aguasabia

# Listar tablas
\dt

# Ver estructura de tabla
\d agricultores
\d regiones
\d comunas
\d parcelas
\d balances_hidricos

# Salir
\q
```

**Tablas esperadas**:

| Tabla | Descripción | Relaciones |
|-------|-------------|-----------|
| `regiones` | Regiones geográficas | → comunas |
| `comunas` | Comunas dentro de regiones | región_id FK |
| `agricultores` | Usuarios agricultores | comuna_id FK |
| `parcelas` | Parcelas de tierra | agricultor_id FK |
| `balances_hidricos` | Datos de balance hídrico | parcela_id FK |
| `alembic_version` | Versión de migración | (Sistema) |

### Paso 4: Crear Nueva Migración (Después de Cambios en Modelos)

Si modificas `app/models/`:

```powershell
# 1. Editar el archivo del modelo en app/models/

# 2. Generar migración automática:
python -m alembic revision --autogenerate -m "Descripción del cambio"

# 3. Revisar la migración generada en alembic/versions/

# 4. Aplicar:
python -m alembic upgrade head
```

**Ejemplo**:
```powershell
python -m alembic revision --autogenerate -m "Agregar columna fecha_verificacion en agricultores"
python -m alembic upgrade head
```

### Paso 5: Ver Historial de Migraciones

```powershell
# Ver versión actual de BD
python -m alembic current

# Ver historial completo
python -m alembic history --verbose
```

---

## Arquitectura de Datos

### Modelo de Relaciones

```
REGIONES
├── id (PK)
├── nombre (UNIQUE)
├── codigo (UNIQUE)
├── created_at
└── updated_at
    ↓
    └──→ COMUNAS
        ├── id (PK)
        ├── nombre
        ├── region_id (FK)
        ├── created_at
        └── updated_at
            ↓
            └──→ AGRICULTORES
                ├── id (PK)
                ├── nombre
                ├── email (UNIQUE)
                ├── hashed_password
                ├── comuna_id (FK)
                ├── created_at
                └── updated_at
                    ↓
                    └──→ PARCELAS
                        ├── id (PK)
                        ├── nombre
                        ├── latitud
                        ├── longitud
                        ├── area
                        ├── cultivo
                        ├── agricultor_id (FK)
                        ├── created_at
                        └── updated_at
                            ↓
                            └──→ BALANCES_HIDRICOS
                                ├── id (PK)
                                ├── fecha
                                ├── et_o
                                ├── evapotranspiracion_real
                                ├── precipitacion
                                ├── riego
                                ├── humedad_suelo
                                ├── parcela_id (FK)
                                ├── created_at
                                └── updated_at
```

### Cambios Principales (v1.0)

**Antes**: Estructura con `municipios`
**Ahora**: Estructura profesional con `regiones` y `comunas`

- ✅ Geolocalización mejorada
- ✅ Timestamps automáticos en todas las tablas
- ✅ Índices profesionales para queries rápidas
- ✅ Constraints y validaciones en BD
- ✅ Foreign Keys con cascada apropiada
- ✅ Versionamiento de BD con Alembic

---

## Ejecución del Backend

### Paso 1: Iniciar FastAPI

```powershell
# Opción 1: Con uvicorn directamente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opción 2: Crear tarea en tasks.json de VS Code (recomendado)
```

El backend estará disponible en:
- **API**: http://localhost:8000
- **Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Paso 2: Probar Endpoints

```powershell
# Prueba de healthcheck (si existe)
curl http://localhost:8000/api/v1/health

# Ver documentación interactiva
# Abre en navegador: http://localhost:8000/docs
```

### Paso 3: Logs y Debug

```powershell
# Cambiar nivel de log (modifica en config.py si necesario)
# En desarrollo: LOG_LEVEL=DEBUG
# En producción: LOG_LEVEL=INFO

# Ver logs en tiempo real
# Revisa la consola donde ejecutaste uvicorn
```

---

## Configuración de Celery

### Paso 1: Verificar Redis

```powershell
# Verificar que Redis está ejecutándose
redis-cli ping

# Debe responder: PONG
```

### Paso 2: Iniciar Worker de Celery

**En otra terminal** (con venv activado):

```powershell
# Iniciar worker
celery -A app.workers.celery_app worker --loglevel=info

# O con auto-reload (desarrollo):
watchmedo auto_restart -d app -p '*.py' -- \
    celery -A app.workers.celery_app worker --loglevel=info
```

### Paso 3: Monitorear Celery (Opcional)

```powershell
# En otra terminal:
celery -A app.workers.celery_app events

# O instalar flower:
pip install flower
flower -A app.workers.celery_app --port=5555

# Luego acceder a: http://localhost:5555
```

### Ejemplo de Tarea Celery

Ver `app/workers/tasks.py` para tareas disponibles.

```python
# Tareas típicas: procesamiento de imágenes, cálculos, emails, etc.
```

---

## Troubleshooting

### Error: `psycopg2.errors.AdminShutdownInProgress`

**Causa**: PostgreSQL no está ejecutándose

**Solución**:
```powershell
# Windows: Iniciar servicio PostgreSQL
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# macOS (si usas Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Error: `ERROR: database "aguasabia" does not exist`

**Causa**: Base de datos no fue creada

**Solución**:
```powershell
psql -U postgres
# Dentro de psql:
CREATE DATABASE aguasabia;
```

### Error: `REDIS connection refused`

**Causa**: Redis no está ejecutándose

**Solución**:
```powershell
# Windows (WSL)
wsl
redis-server

# macOS (Homebrew)
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:latest
```

### Error: `ModuleNotFoundError` después de instalar dependencias

**Causa**: Entorno virtual no está activado

**Solución**:
```powershell
# Verificar:
where python

# Debe mostrar ruta con .venv

# Si no:
.venv\Scripts\Activate.ps1
```

### Error en Alembic: `Target database is not up to date`

**Causa**: Hay migraciones pendientes

**Solución**:
```powershell
# Ver estado
python -m alembic current

# Aplicar migraciones
python -m alembic upgrade head
```

### Error: `ImportError: No module named 'app'`

**Causa**: No estás en el directorio `backend/`

**Solución**:
```powershell
cd AguaSabia/Proyecto/backend
python -m alembic upgrade head
```

---

## Checklist de Setup Completo

- [ ] Python 3.10+ instalado
- [ ] PostgreSQL 13+ instalado y ejecutándose
- [ ] Redis 6.0+ instalado y ejecutándose
- [ ] Repositorio clonado
- [ ] Entorno virtual creado y activado
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] `.env` creado con valores correctos
- [ ] Base de datos `aguasabia` creada
- [ ] Migraciones aplicadas (`alembic upgrade head`)
- [ ] Backend inicia sin errores (`uvicorn app.main:app --reload`)
- [ ] Documentación accesible (`http://localhost:8000/docs`)
- [ ] Redis ejecutándose
- [ ] Worker Celery iniciado (en otra terminal)

---

## Comandos Rápidos

```powershell
# Setup completo
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m alembic upgrade head

# Desarrollo
uvicorn app.main:app --reload

# Celery (otra terminal)
celery -A app.workers.celery_app worker --loglevel=info

# Base de datos
psql -U postgres -d aguasabia

# Ver migraciones
python -m alembic current
python -m alembic history

# Nueva migración
python -m alembic revision --autogenerate -m "Descripción"
```

---

## Documentación Adicional

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Alembic](https://alembic.sqlalchemy.org)
- [Celery](https://docs.celeryproject.io)
- [PostgreSQL](https://www.postgresql.org/docs)

---

**Última actualización**: 2026-05-25  
**Backend Version**: 1.0.0  
**Alembic**: Configurado y automatizado


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
