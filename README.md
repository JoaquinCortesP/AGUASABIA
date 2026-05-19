# AguaSabia - Sistema de Gestión Hídrica para Municipios

![AguaSabia Logo](image.png)

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints Principales](#endpoints-principales)
- [Configuración](#configuración)
- [Documentación Técnica](#documentación-técnica)
- [Integrantes](#integrantes)

---

## 📖 Descripción del Proyecto

**AguaSabia** es un sistema web de gestión hídrica diseñado para municipios, enfocado en el cálculo de balance hídrico y evapotranspiración basado en la metodología **FAO-56** (Food and Agriculture Organization). 

El sistema permite a agricultores registrar sus parcelas, monitorear condiciones climáticas y recibir análisis agrícola para optimizar el uso del agua en riego.

### Objetivo Académico
Sistema de taller de programación para demostrar principios de ingeniería de software: arquitectura de capas, separación de responsabilidades, persistencia de datos, integración de APIs externas y gestión de tareas asincrónicas.

### Ámbito de Aplicación
- **Usuarios**: Agricultores de municipios
- **Región**: El Salvador
- **Cultivos Soportados**: Maíz, Frijol, Sorgo (extensible)
- **Datos Base**: Municipios y sus propiedades geográficas

---

## ✨ Características

### Implementadas
- ✅ **Autenticación de Usuarios** - Login con JWT tokens
- ✅ **Gestión de Parcelas** - CRUD de parcelas agrícolas
- ✅ **Cálculos Agrícolas** - Evapotranspiración (FAO-56)
- ✅ **Balance Hídrico** - Cálculos de agua disponible
- ✅ **Datos Climáticos** - Integración con servicios meteorológicos
- ✅ **Propiedades del Suelo** - Capacidad de campo, punto de marchitez
- ✅ **Tareas Asincrónicas** - Sincronización de datos con Celery
- ✅ **API REST** - Endpoints documentados con Swagger

### En Desarrollo / Futuro
- 🔄 Interfaz de Usuario (Frontend React)
- 🔄 Dashboard de análisis
- 🔄 Reportes PDF
- 🔄 Alertas automáticas
- 🔄 Historial completo de balances
- 🔄 Integración móvil

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Python** | 3.8+ | Lenguaje principal |
| **FastAPI** | 0.136.0 | Web framework async |
| **SQLAlchemy** | 2.0.49 | ORM |
| **Pydantic** | 2.13.3 | Validación de datos |
| **Uvicorn** | 0.44.0 | ASGI server |

### Base de Datos & Cache
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **PostgreSQL** | 12+ | Base de datos relacional |
| **Redis** | 6.0+ | Cache y message broker |

### Autenticación & Seguridad
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Bcrypt** | 5.0.0 | Hash de contraseñas |
| **Passlib** | 1.7.4 | Backend criptográfico |
| **JWT** | - | Tokens de autenticación |

### Task Queue
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Celery** | 5.6.3 | Task queue distribuida |
| **Redis** | 7.4.0 | Broker de tareas |

### Frontend (Futuro)
- React / Vue.js
- TypeScript
- Material UI / Bootstrap

---

## 🚀 Instalación

### Requisitos Previos
- Python 3.8 o superior
- PostgreSQL 12 o superior
- Redis 6.0 o superior
- Git

### Pasos de Instalación

#### 1. Clonar Repositorio
```bash
git clone <URL_REPOSITORIO>
cd AguaSabia/Proyecto/backend
```

#### 2. Crear Entorno Virtual
```bash
# Windows
python -m venv venv
venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

#### 4. Configurar Variables de Entorno
Crear archivo `.env` en `backend/`:

```env
# Proyecto
PROJECT_NAME=AguaSabia
API_V1_STR=/api/v1

# Seguridad
SECRET_KEY=tu_clave_secreta_super_segura_cambiar_en_produccion
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# PostgreSQL
DATABASE_URL=postgresql://postgres:contraseña@localhost:5432/aguasabia

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

#### 5. Crear Base de Datos
```bash
psql -U postgres -c "CREATE DATABASE aguasabia;"
```

#### 6. Crear Tablas
```bash
python

# En Python:
from app.db.base import Base
from app.db.session import engine
from app.models.agricultor import Agricultor
from app.models.municipio import Municipio
from app.models.parcela import Parcela
from app.models.balance import BalanceHidrico

Base.metadata.create_all(bind=engine)
exit()
```

---

## ▶️ Ejecución

### 1. Iniciar PostgreSQL
```bash
# Windows (servicio)
net start postgresql-x64-15

# macOS
brew services start postgresql@15

# Linux
sudo service postgresql start
```

### 2. Iniciar Redis
```bash
# Windows (en otra terminal)
redis-server

# macOS
brew services start redis

# Linux
sudo service redis-server start
```

### 3. Iniciar Backend
```bash
# Desde directorio backend con venv activado
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output esperado**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 4. Iniciar Celery Worker (en otra terminal)
```bash
# Con venv activado
celery -A app.workers.celery_app worker --loglevel=info
```

### 5. Acceder a la Aplicación
- **API Base**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Docs**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/`

---

## 📂 Estructura del Proyecto

```
backend/
├── .env                        # Variables de entorno
├── requirements.txt            # Dependencias
├── test_db.py                  # Script de test
│
└── app/
    ├── main.py                 # Punto de entrada
    │
    ├── api/                    # Endpoints
    │   ├── deps.py            # Dependencias
    │   └── v1/
    │       ├── router.py
    │       └── endpoints/
    │           ├── auth.py
    │           ├── parcela.py
    │           ├── balance.py
    │           └── clima.py
    │
    ├── core/                   # Configuración
    │   ├── config.py
    │   └── security.py
    │
    ├── db/                     # Base de datos
    │   ├── base.py
    │   └── session.py
    │
    ├── models/                 # Entidades ORM
    │   ├── agricultor.py
    │   ├── municipio.py
    │   ├── parcela.py
    │   └── balance.py
    │
    ├── schemas/                # DTOs
    │   ├── agricultor.py
    │   ├── parcela.py
    │   └── balance.py
    │
    ├── services/               # Lógica de negocio
    │   ├── agronomico.py
    │   ├── clima_service.py
    │   └── suelo_service.py
    │
    └── workers/                # Tareas asincrónicas
        ├── celery_app.py
        └── tasks.py
```

**Ver documentación completa**: [docs/project-structure.md](docs/project-structure.md)

---

## 🔌 Endpoints Principales

### Autenticación
```
POST   /api/v1/auth/login              Login de usuario
```

### Parcelas
```
GET    /api/v1/parcelas/               Listar parcelas
POST   /api/v1/parcelas/               Crear parcela
```

### Balance Hídrico
```
GET    /api/v1/balances/               Obtener balance hídrico
```

### Clima
```
GET    /api/v1/clima/actual            Obtener datos climáticos
```

**Documentación completa**: [docs/api-documentation.md](docs/api-documentation.md)

### Ejemplo: Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=juan@example.com&password=contraseña"
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PROJECT_NAME` | Nombre del proyecto | `AguaSabia` |
| `API_V1_STR` | Prefijo API | `/api/v1` |
| `SECRET_KEY` | Clave JWT | `aleatorio_32_caracteres` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración token | `11520` |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://...` |
| `REDIS_URL` | Conexión Redis | `redis://localhost:6379` |

### Generar SECRET_KEY Seguro
```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📚 Documentación Técnica

La documentación completa se encuentra en `/docs`:

### Documentos Disponibles

1. **[system-architecture.md](docs/system-architecture.md)**
   - Arquitectura de capas
   - Patrón arquitectónico
   - Flujo de datos
   - Tecnologías utilizadas

2. **[backend-setup.md](docs/backend-setup.md)**
   - Guía de instalación paso a paso
   - Configuración de dependencias
   - Resolución de problemas comunes

3. **[database-documentation.md](docs/database-documentation.md)**
   - Descripción de entidades
   - Relaciones y constraints
   - Esquema de base de datos

4. **[api-documentation.md](docs/api-documentation.md)**
   - Especificación de endpoints
   - Ejemplos de requests/responses
   - Códigos HTTP
   - Autenticación

5. **[testing-environment.md](docs/testing-environment.md)**
   - Setup del entorno local
   - Configuración sin Docker
   - Procedimientos de testing

6. **[traceability-matrix.md](docs/traceability-matrix.md)**
   - Matriz de trazabilidad
   - Mapeo de funcionalidades
   - Cobertura de implementación

7. **[backup-and-restore.md](docs/backup-and-restore.md)**
   - Procedimientos de backup
   - Restauración de datos
   - Estrategias de recuperación

8. **[error-handling.md](docs/error-handling.md)**
   - Manejo de errores
   - Validaciones
   - Códigos HTTP
   - Logging

9. **[project-structure.md](docs/project-structure.md)**
   - Estructura de directorios
   - Responsabilidades por capa
   - Patrones de diseño

---

## 👥 Integrantes

- **Sofía Araya**
- **Joaquín Cortés**

**Institución**: Taller de Programación - Carrera de Ingeniería de Software

---

## 📋 Entidades Principales

### Municipios
```
- id (PK)
- nombre
- región
```

### Agricultores
```
- id (PK)
- nombre
- email (UNIQUE)
- hashed_password
- municipio_id (FK)
```

### Parcelas
```
- id (PK)
- nombre
- latitud
- longitud
- área
- cultivo
- agricultor_id (FK)
```

### Balance Hídrico
```
- id (PK)
- fecha
- et_o
- evapotranspiración_real
- precipitación
- riego
- humedad_suelo
- parcela_id (FK)
```

**Diagrama MER completo**: [docs/database-documentation.md](docs/database-documentation.md)

---

## 🔐 Seguridad

### Implementaciones de Seguridad
- ✅ **JWT Tokens** - Autenticación stateless
- ✅ **Bcrypt Hashing** - Contraseñas hasheadas
- ✅ **CORS Configurado** - Control de orígenes
- ✅ **Validación Pydantic** - Type checking
- ✅ **SQL Parameterization** - SQLAlchemy ORM previene SQL Injection

### Variables Sensibles
- Usar archivo `.env` (no incluir en git)
- `SECRET_KEY` debe ser aleatorio y fuerte
- Cambiar en producción

---

## 🧪 Testing

**Estado**: Tests automatizados no implementados

**Recomendaciones para implementar**:
```bash
# Instalar pytest
pip install pytest pytest-asyncio

# Crear tests/
pytest
```

---

## 📊 Arquitectura

```
┌─────────────────────────────────────┐
│       Cliente (Frontend)             │
└──────────────┬──────────────────────┘
               │ HTTP
┌──────────────▼──────────────────────┐
│  FastAPI (Presentación)              │
│  - Endpoints                         │
│  - Validación Pydantic               │
│  - Autenticación JWT                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Services (Lógica de Negocio)        │
│  - Cálculos agrícolas (FAO-56)       │
│  - Integraciones externas            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  SQLAlchemy ORM (Mapeo)              │
│  - Modelos                           │
│  - Queries                           │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│  PostgreSQL (Persistencia)           │
└──────────────────────────────────────┘
```

---

## 🚀 Deploy

### Actualmente
- Entorno local sin Docker

### Recomendado para Producción
- Usar Railway (mencionado en docs)
- PostgreSQL managed
- Redis managed
- SSL/TLS
- Rate limiting
- Monitoring

**Ver**: [docs/testing-environment.md](docs/testing-environment.md)

---

## 📝 Notas de Desarrollo

- Los endpoints retornan datos simulados (desarrollo)
- Integración con Open-Meteo API está comentada
- Se requiere implementar endpoints CRUD completos
- Tests automatizados faltantes
- Frontend aún no implementado

---

## 📖 Recursos Externos

### Documentación de Dependencias
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/documentation)
- [Celery](https://docs.celeryproject.io/)

### Estándares Agrícolas
- [FAO-56 Evapotranspiración](http://www.fao.org/3/x0490e/x0490e00.htm)

---

## 📄 Licencia

Proyecto académico - El Salvador

---

## ✅ Checklist de Deployment Local

```
[ ] Python 3.8+ instalado
[ ] PostgreSQL corriendo
[ ] Redis corriendo
[ ] .env configurado
[ ] Dependencias instaladas (pip install -r requirements.txt)
[ ] Base de datos creada
[ ] Tablas creadas (Base.metadata.create_all)
[ ] Backend en http://localhost:8000
[ ] Swagger UI accesible
[ ] Celery worker activo
[ ] Test de endpoint exitoso
```

---

**Última actualización**: Mayo 2024

Para consultas técnicas, consultar [docs/](docs/) para documentación detallada.
