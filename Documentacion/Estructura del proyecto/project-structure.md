# Estructura del Proyecto - AguaSabia

Este documento detalla la estructura física de archivos y carpetas del repositorio, así como la arquitectura interna del backend. Sirve de referencia para que cualquier desarrollador localice rápidamente los componentes del sistema.

---

## 1. Árbol de Directorios Real

A continuación se muestra el árbol de directorios real del proyecto tal como está organizado en el repositorio:

```
AGUASABIA/
│
├── Documentacion/                 # 📖 Documentación del proyecto
│   ├── Diagramas/                 # Diagramas y MER de base de datos
│   │   ├── MER/                   # Modelo Entidad-Relación detallado
│   │   └── (imágenes de diagramas: casos de uso, actividad, componentes...)
│   ├── Documentacion de api/
│   │   └── api-documentation.md   # Especificación de endpoints REST
│   ├── Entono de pruebas/
│   │   └── testing-environment.md # Instalación de servicios locales (Postgres, Redis)
│   ├── Estructura del proyecto/
│   │   └── project-structure.md   # Este archivo
│   ├── Matriz de trazabilidad/
│   │   └── traceability-matrix.md # Cobertura de funciones del software
│   └── docs_tecnicos/
│       ├── backend-setup.md       # Instrucciones de instalación del backend
│       ├── backup-and-restore.md  # Procedimientos de respaldo de base de datos
│       ├── configuracion_entorno.md # Detalle de variables de entorno (.env)
│       ├── database-documentation.md # Tablas y relaciones en PostgreSQL
│       ├── despliegue_railway.md  # Pasos para publicar en Railway (Nube)
│       └── error-handling.md      # Flujo y códigos de error del sistema
│
├── Gestion/                       # 📁 Documentos de gestión administrativa
│   ├── 1.1.2 Documento de registro de definición e identificación del proyecto.md
│   ├── 5.1 Carta Gantt (1) (1).xlsx
│   ├── Definición de Requerimientos AguaSabia.xlsx
│   └── integrantes.txt            # Nombre de los integrantes del equipo
│
├── Proyecto/                      # 💻 Código Fuente
│   ├── backend/                   # 🐍 Backend (Python / FastAPI)
│   │   ├── alembic/               # Directorio de Alembic para migraciones
│   │   │   ├── env.py             # Configuración del entorno de migraciones
│   │   │   ├── script.py.mako     # Plantilla para nuevos scripts de migración
│   │   │   └── versions/          # Scripts individuales de versión de BD (autogenerados)
│   │   ├── app/                   # Aplicación principal
│   │   │   ├── __init__.py
│   │   │   ├── main.py            # Punto de entrada de FastAPI y Middlewares
│   │   │   ├── worker.py          # Definición de tareas y worker de Celery
│   │   │   ├── api/               # Endpoints y dependencias de la API
│   │   │   │   ├── __init__.py
│   │   │   │   ├── deps.py        # Dependencias comunes (sesión de BD, usuario logueado)
│   │   │   │   └── api_v1/        # Endpoints versión 1
│   │   │   │       ├── __init__.py
│   │   │   │       ├── api.py     # Agrupador central de routers
│   │   │   │       └── endpoints/ # Controladores por módulo
│   │   │   │           ├── balances.py # Gestión de balance hídrico
│   │   │   │           ├── login.py    # Autenticación y obtención de token JWT
│   │   │   │           └── parcelas.py # Administración de parcelas por agricultor
│   │   │   ├── core/              # Configuración y seguridad transversal
│   │   │   │   ├── config.py      # Definición de configuraciones y lectura de .env
│   │   │   │   └── security.py    # Encriptación de claves y generación de tokens JWT
│   │   │   ├── db/                # Conexiones a bases de datos
│   │   │   │   ├── base.py        # Base declarativa de SQLAlchemy
│   │   │   │   └── session.py     # Creación del motor y fábrica de sesiones local
│   │   │   ├── models/            # Entidades ORM (Mapeo a tablas físicas)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── agricultor.py  # Modelo para la tabla "agricultores"
│   │   │   │   ├── balance_hidrico.py # Modelo para la tabla "balances_hidricos"
│   │   │   │   ├── comuna.py      # Modelo para la tabla "comunas"
│   │   │   │   ├── parcela.py     # Modelo para la tabla "parcelas"
│   │   │   │   └── region.py      # Modelo para la tabla "regiones"
│   │   │   ├── schemas/           # DTOs (Modelos Pydantic para validación y serialización)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── agricultor.py
│   │   │   │   ├── balance_hidrico.py
│   │   │   │   ├── comuna.py
│   │   │   │   ├── parcela.py
│   │   │   │   ├── region.py
│   │   │   │   └── token.py
│   │   │   └── services/          # Lógica de negocio (Stubs e integraciones)
│   │   │       ├── __init__.py
│   │   │       └── agronomy.py    # Lógica de cálculo FAO-56 para balance (Stubs)
│   │   ├── scripts/               # Scripts de utilidad
│   │   │   └── seed.py            # Poblamiento inicial de comunas y regiones de Chile
│   │   ├── .env                   # Variables de entorno (Creado localmente)
│   │   ├── .env.example           # Plantilla de variables de entorno para desarrollo
│   │   ├── alembic.ini            # Archivo de propiedades de configuración de Alembic
│   │   └── requirements.txt       # Librerías de Python requeridas
│   └── frontend/                  # 🖥️ Frontend (Carpeta lista para inicializar proyecto)
│       └── .txt                   # Marcador de posición (pendiente de implementación)
│
├── DocumentacionPersonal.txt      # 📑 Documento maestro interno con fórmulas y lógica
├── README.md                      # 📖 Guía general del repositorio
└── image.png                      # Logo o diagrama visual del proyecto
```

---

## 2. Descripción de Carpetas y Componentes Clave

### 2.1 Raíz del Repositorio
- `Documentacion/`: Contiene toda la documentación técnica de soporte arquitectónico, diseño de bases de datos, guías de instalación y manuales de API.
- `Proyecto/`: Código fuente dividido en dos áreas clave. `backend` contiene el backend completamente estructurado y funcional con base de datos y tareas asíncronas, mientras que `frontend` se reserva para el desarrollo de la interfaz de usuario en la siguiente fase.

### 2.2 Arquitectura del Backend (`Proyecto/backend`)
El backend está construido bajo el patrón de **Arquitectura Multicapa (Layered Architecture)**, asegurando la separación de responsabilidades:

1. **Capa de Entrada y Ruteo (`app/api/`)**:
   - `main.py`: Punto de entrada del servidor FastAPI. Configura los middlewares (CORS), incluye los routers y gestiona los eventos de encendido y apagado de la aplicación.
   - `api_v1/api.py`: Agrega y registra los routers de cada submódulo (`login.py`, `parcelas.py` y `balances.py`) asignándoles prefijos y tags de Swagger.
   - `api_v1/endpoints/`: Controladores de API. Reciben peticiones HTTP, validan los datos entrantes con Pydantic Schemas y delegan el procesamiento a la base de datos o lógica de negocio.

2. **Capa de Configuración y Seguridad (`app/core/`)**:
   - `config.py`: Utiliza Pydantic Settings para cargar las variables del `.env` local y aplicar validaciones a valores obligatorios (como `DATABASE_URL`).
   - `security.py`: Contiene las funciones para codificar contraseñas con el algoritmo `bcrypt` y generar/firmar tokens de acceso seguros en formato JSON Web Token (JWT).

3. **Capa de Acceso a Datos y Modelos (`app/db/` y `app/models/`)**:
   - `session.py`: Crea el motor de base de datos de SQLAlchemy con opciones de pool y expone la fábrica `SessionLocal` para conexiones cortas.
   - `models/`: Clases de Python que heredan de `Base` y representan el mapeo relacional directo a las tablas en PostgreSQL (`regiones`, `comunas`, `agricultores`, `parcelas`, `balances_hidricos`).

4. **Capa de Validación y DTOs (`app/schemas/`)**:
   - `schemas/`: Contiene validadores Pydantic. Separan los modelos de base de datos de lo que se recibe/envía por HTTP. Por ejemplo, `ParcelaCreate` valida el payload del cliente, y `Parcela` serializa la respuesta incorporando el `id` autogenerado.

5. **Capa de Lógica de Negocio (`app/services/`)**:
   - `agronomy.py`: Aloja las funciones matemáticas y algoritmos relacionados con el estándar FAO-56 para balance hídrico y evapotranspiración. En esta fase del proyecto, opera como un "stub" o simulador para facilitar pruebas integrales.

6. **Capa de Procesamiento Asíncrono (`app/worker.py`)**:
   - `worker.py`: Define e inicializa la instancia `celery_app` y define las tareas programadas (como `test_celery`) para procesamiento pesado en segundo plano fuera de la petición HTTP principal.

---

## 3. Ciclo de Vida del Request (Flujo de Datos)

El flujo de procesamiento de una petición HTTP en AguaSabia sigue el siguiente orden:

```
[Cliente HTTP] ──(Request JSON)──> [FastAPI Router]
                                         │
                                   (Valida Schema Pydantic)
                                         │
                                  [Deps (get_db / auth)] ──(Valida JWT)
                                         │
                                    [Endpoints]
                                         │
                                   (Llama Servicio/DB)
                                         │
                                   [SQLAlchemy ORM]
                                         │
                                 [Base de Datos PostgreSQL]
                                         │
                                   (Retorna Objeto)
                                         │
                                   [Schemas DTO] ──(Serializa a JSON)
                                         │
[Cliente HTTP] <──(Response JSON)──────┘
```

Esta arquitectura robusta garantiza que la lógica de validación, negocio y almacenamiento estén debidamente separadas, facilitando la mantenibilidad a largo plazo y la adición de nuevas características sin romper el código existente.
