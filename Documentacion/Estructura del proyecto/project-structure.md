# Estructura del Proyecto - AguaSabia

## 1. Árbol de Directorios Completo

```
AGUASABIA/
│
├── .git/                          # Git repository
│
├── Documentacion/                 # Documentación académica
│   ├── Arquitectura/
│   ├── Diagramas/
│   │   ├── MER/
│   │   └── WireFrames/
│   ├── docs_tecnicos/
│   │   ├── backup_restore.md
│   │   ├── configuracion_entorno.md
│   │   └── despliegue_railway.md
│   ├── Documentacion api/
│   └── Screenshots/
│
├── Gestion/                       # Gestión del proyecto
│   ├── 1.1.2 Documento de registro de definición e identificación del proyecto.md
│   └── integrantes.txt
│
├── Proyecto/                      # Código fuente
│   ├── backend/                   # 🎯 Backend Python/FastAPI
│   │   ├── .env                   # Variables de entorno
│   │   ├── .venv/                 # Virtual environment
│   │   ├── requirements.txt        # Dependencias Python
│   │   ├── test_db.py             # Script test DB
│   │   │
│   │   └── app/                   # Aplicación principal
│   │       ├── __init__.py
│   │       ├── main.py            # Punto de entrada FastAPI
│   │       │
│   │       ├── api/               # 🔌 Capa de Presentación (Endpoints)
│   │       │   ├── deps.py        # Dependencias compartidas
│   │       │   └── v1/
│   │       │       ├── router.py  # Enrutador agregador
│   │       │       └── endpoints/  # Controladores por dominio
│   │       │           ├── auth.py         # Autenticación
│   │       │           ├── parcela.py      # Gestión de parcelas
│   │       │           ├── balance.py      # Balance hídrico
│   │       │           └── clima.py        # Datos climáticos
│   │       │
│   │       ├── core/              # ⚙️ Configuración Central
│   │       │   ├── config.py      # Settings + variables de entorno
│   │       │   └── security.py    # Funciones criptográficas
│   │       │
│   │       ├── db/                # 💾 Capa de Acceso a Datos
│   │       │   ├── base.py        # SQLAlchemy declarative base
│   │       │   └── session.py     # Engine y SessionLocal
│   │       │
│   │       ├── models/            # 🗄️ Entidades ORM (SQLAlchemy)
│   │       │   ├── agricultor.py  # Tabla: agricultores
│   │       │   ├── balance.py     # Tabla: balances_hidricos
│   │       │   ├── municipio.py   # Tabla: municipios
│   │       │   └── parcela.py     # Tabla: parcelas
│   │       │
│   │       ├── schemas/           # 📋 DTOs (Pydantic)
│   │       │   ├── agricultor.py
│   │       │   ├── balance.py
│   │       │   └── parcela.py
│   │       │
│   │       ├── services/          # 🧠 Capa de Lógica de Negocio
│   │       │   ├── agronomico.py        # Cálculos FAO-56
│   │       │   ├── clima_service.py     # Datos meteorológicos
│   │       │   └── suelo_service.py     # Propiedades del suelo
│   │       │
│   │       └── workers/           # 🔄 Tareas Asincrónicas (Celery)
│   │           ├── celery_app.py  # Configuración Celery
│   │           └── tasks.py       # Tareas asincrónicas
│   │
│   ├── database/                  # 📦 Scripts SQL
│   │   ├── data(momentanea).sql
│   │   ├── Indexes.sql
│   │   ├── schema.sql
│   │   └── triggers.sql
│   │
│   └── frontend/                  # 🖥️ Frontend (sin implementar)
│
├── docs/                          # 📖 Documentación técnica (GENERADA)
│   ├── system-architecture.md     # Arquitectura del sistema
│   ├── backend-setup.md           # Guía de configuración
│   ├── database-documentation.md  # Documentación BD
│   ├── api-documentation.md       # Documentación de API
│   ├── testing-environment.md     # Entorno de testing
│   ├── traceability-matrix.md     # Matriz de trazabilidad
│   ├── backup-and-restore.md      # Procedimientos backup
│   ├── error-handling.md          # Manejo de errores
│   ├── project-structure.md       # Este archivo
│   └── README.md                  # (Actualizado)
│
├── image.png                      # Imagen del proyecto
├── README.md                      # (Original, será actualizado)
└── .git/                          # Control de versiones

```

---

## 2. Descripción de Directorios

### 2.1 Raíz del Proyecto

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| `.git/` | Directorio | Repositorio Git |
| `Documentacion/` | Directorio | Documentación académica y técnica |
| `Gestion/` | Directorio | Documentos de gestión del proyecto |
| `Proyecto/` | Directorio | Código fuente (backend + frontend) |
| `docs/` | Directorio | Documentación técnica generada |
| `README.md` | Archivo | Descripción general del proyecto |
| `image.png` | Imagen | Captura/diagrama del proyecto |

---

## 3. Estructura Backend (Detallada)

### 3.1 Entrada: `app/main.py`

```python
# Punto de entrada principal
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(api_router, prefix=settings.API_V1_STR)
```

**Responsabilidades**:
- Crear instancia FastAPI
- Configurar CORS
- Registrar routers
- Healthcheck endpoint

---

### 3.2 Capa de Presentación: `app/api/`

#### Estructura

```
api/
├── deps.py                    # Inyección de dependencias
└── v1/
    ├── router.py              # Agregador de rutas
    └── endpoints/
        ├── auth.py            # Autenticación
        ├── parcela.py         # Gestión de parcelas
        ├── balance.py         # Balance hídrico
        └── clima.py           # Datos climáticos
```

#### `api/deps.py`

```python
def get_db() -> Generator:
    """Inyecta sesión de BD en endpoints"""
```

**Dependencias proporcionadas**:
- `get_db`: Sesión SQLAlchemy

#### `api/v1/router.py`

```python
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(parcela.router, prefix="/parcelas", tags=["parcelas"])
api_router.include_router(balance.router, prefix="/balances", tags=["balances"])
api_router.include_router(clima.router, prefix="/clima", tags=["clima"])
```

**Patrón**: Agregar subrouters a enrutador principal

#### Endpoints

**`endpoints/auth.py`**
- `POST /auth/login` - Autenticación

**`endpoints/parcela.py`**
- `GET /parcelas/` - Listar
- `POST /parcelas/` - Crear

**`endpoints/balance.py`**
- `GET /balances/` - Obtener

**`endpoints/clima.py`**
- `GET /clima/actual` - Clima actual

---

### 3.3 Configuración: `app/core/`

#### `core/config.py`

```python
class Settings(BaseSettings):
    PROJECT_NAME: str
    API_V1_STR: str
    SECRET_KEY: str
    DATABASE_URL: str
    REDIS_URL: str
    # ... más variables

settings = Settings()  # Instancia global
```

**Lectura**: `app.core.config.settings`

#### `core/security.py`

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

def verify_password(plain: str, hashed: str) -> bool
def get_password_hash(password: str) -> str
```

---

### 3.4 Capa de Datos: `app/db/`

#### `db/base.py`

```python
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()  # Clase base para modelos ORM
```

#### `db/session.py`

```python
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
```

**Pool de conexiones**: 
- `pool_pre_ping`: Verifica conexión antes de usar
- Reconecta automáticamente si perdida

---

### 3.5 Modelos ORM: `app/models/`

#### Estructura

```
models/
├── agricultor.py   # class Agricultor(Base)
├── municipio.py    # class Municipio(Base)
├── parcela.py      # class Parcela(Base)
└── balance.py      # class BalanceHidrico(Base)
```

#### Relaciones

```
Municipio (1) ──→ (N) Agricultor
Agricultor (1) ──→ (N) Parcela
Parcela (1) ──→ (N) BalanceHidrico
```

---

### 3.6 Esquemas DTO: `app/schemas/`

#### Convención Pydantic

```python
# Schemas para cada modelo

class XyzBase(BaseModel):
    """Campos comunes opcionados"""

class XyzCreate(XyzBase):
    """Para POST - campos requeridos"""

class Xyz(XyzBase):
    id: int
    """Para respuestas - incluye ID"""
```

#### Ejemplo: Parcela

```
ParcelaBase
├── nombre: Optional[str]
├── latitud: Optional[float]
└── ...

ParcelaCreate(ParcelaBase)
├── nombre: str (required)
└── agricultor_id: int (required)

Parcela(ParcelaBase)
├── id: int
├── agricultor_id: int
└── Config.from_attributes = True
```

---

### 3.7 Servicios (Lógica): `app/services/`

#### Patrones

```python
class XyzService:
    @staticmethod
    def metodo_calcular(args) -> resultado:
        """Métodos estáticos para facilitar testing"""
```

#### `agronomico.py`

- `calcular_et_o()` - Evapotranspiración FAO-56
- `calcular_balance_hidrico()` - Balance hídrico

#### `clima_service.py`

- `obtener_pronostico()` - Datos meteorológicos (simulados)

#### `suelo_service.py`

- `obtener_propiedades_suelo()` - Capacidad de campo, marchitez

---

### 3.8 Workers (Celery): `app/workers/`

#### `celery_app.py`

```python
celery_app = Celery("workers", broker=REDIS_URL)
```

#### `tasks.py`

```python
@celery_app.task(name="test_task")
def test_task(nombre):
    """Tarea de prueba"""

@celery_app.task(name="sincronizar_clima")
def sincronizar_clima():
    """Sincronizar datos climáticos periódicamente"""
```

---

## 4. Responsabilidades por Capa

### 4.1 Presentación (Controllers)

**Ubicación**: `api/v1/endpoints/`

**Responsabilidades**:
- ✅ Recibir requests HTTP
- ✅ Validar input con Pydantic
- ✅ Verificar autenticación
- ✅ Llamar servicios
- ✅ Retornar JSON
- ✅ Manejar errores HTTP

**No debe**:
- ❌ Lógica de negocio compleja
- ❌ Acceso directo a BD
- ❌ Cálculos especializados

---

### 4.2 Servicios (Business Logic)

**Ubicación**: `services/`

**Responsabilidades**:
- ✅ Lógica de negocio
- ✅ Cálculos especializados (FAO-56)
- ✅ Integración con APIs externas
- ✅ Validaciones complejas
- ✅ Transformación de datos

**No debe**:
- ❌ Manejar requests HTTP
- ❌ Retornar objetos HTTP
- ❌ Acceso directo a BD (pasar session)

---

### 4.3 Modelos (ORM)

**Ubicación**: `models/`

**Responsabilidades**:
- ✅ Mapear tabla PostgreSQL
- ✅ Definir columnas y tipos
- ✅ Relaciones con otras tablas
- ✅ Constraints y índices

**No debe**:
- ❌ Lógica de negocio
- ❌ Métodos de cálculo

---

### 4.4 Esquemas (DTOs)

**Ubicación**: `schemas/`

**Responsabilidades**:
- ✅ Validar entrada (Pydantic)
- ✅ Transformar datos para API
- ✅ Documentación implícita
- ✅ Separación ORM ↔ API

**Ventaja**: Cambiar BD sin afectar API

---

## 5. Flujos de Datos

### 5.1 Request - Response Cycle

```
1. Cliente                    Request HTTP
   │
2. FastAPI                   Rutea a endpoint
   │
3. Endpoint (Controller)     Valida con Pydantic
   │                         Inyecta dependencias
   │
4. Service (Negocio)        Procesa lógica
   │
5. ORM (SQLAlchemy)         Mapea a modelo
   │
6. PostgreSQL               Ejecuta SQL
   │
7. ORM (SQLAlchemy)         Mapea a objeto
   │
8. Service                  Transforma resultado
   │
9. Schema (Pydantic)        Serializa a JSON
   │
10. Endpoint               Retorna respuesta
   │
11. Cliente               Recibe JSON
```

---

## 6. Separación de Responsabilidades (SoC)

```
Presentación Layer
└─ DTOs (Schemas)
   └─ Business Logic Layer
      └─ Services
         └─ Data Access Layer
            └─ ORM (Models)
               └─ Database Layer
                  └─ PostgreSQL
```

**Ventajas**:
- Fácil testing (mockear capas)
- Cambios localizados
- Reutilización de código
- Mantenimiento

---

## 7. Dependencias Entre Módulos

```
main.py
  ├─→ api/v1/router.py
  │    ├─→ endpoints/auth.py
  │    ├─→ endpoints/parcela.py
  │    ├─→ endpoints/balance.py
  │    └─→ endpoints/clima.py
  │
  └─→ core/config.py
       ├─→ db/session.py
       └─→ workers/celery_app.py
```

---

## 8. Ciclo de Vida de Objetos

### 8.1 Sesión de BD

```python
# En cada request:
1. Crear sesión (SessionLocal())
2. Ejecutar request
3. Commit o Rollback
4. Cerrar sesión (finally: session.close())
```

### 8.2 Token JWT

```python
1. Usuario login
2. Generar JWT con exp time
3. Cliente almacena
4. Incluye en header Authorization
5. Backend valida firma y exp
6. Expira después de 11,520 minutos (8 días)
```

---

## 9. Importancia de la Estructura

### 9.1 Escalabilidad

```
Nueva funcionalidad = nuevo endpoint + servicio + modelo
Sin afectar existentes
```

### 9.2 Testabilidad

```
Services son stateless → fácil mockear
Endpoints inyectan dependencias → fácil testear
```

### 9.3 Mantenibilidad

```
Cambios en BD → modificar solo models/
Cambios en API → modificar solo endpoints/
Cambios lógica → modificar solo services/
```

---

## 10. Extensibilidad

### 10.1 Agregar Nueva Funcionalidad

```
Ejemplo: Gestión de usuarios (CRUD)

1. Crear endpoint: api/v1/endpoints/usuarios.py
2. Crear servicio: services/usuario_service.py
3. Crear schema: schemas/usuario.py
   (modelo ya existe: models/agricultor.py)
4. Incluir en router: api/v1/router.py

Sin modificar nada más.
```

---

## 11. Checklist de Estructura

```
[ ] Todos los endpoints en api/v1/endpoints/
[ ] Lógica de negocio en services/
[ ] Modelos ORM en models/
[ ] Esquemas en schemas/
[ ] Config en core/config.py
[ ] Security en core/security.py
[ ] Dependencias en api/deps.py
[ ] DB session en db/session.py
[ ] Tareas en workers/tasks.py
[ ] Punto entrada en main.py
```

---

## 12. Resumen

| Aspecto | Detalles |
|--------|----------|
| Patrón | Layered Architecture |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 |
| BD | PostgreSQL |
| Task Queue | Celery + Redis |
| Validación | Pydantic |
| Autenticación | JWT |
| Capas | 4 (Presentación, Negocio, Datos, BD) |

Esta estructura sigue **best practices** de arquitectura de software y es apropiada para proyectos de mediano tamaño con mantenimiento a largo plazo.
