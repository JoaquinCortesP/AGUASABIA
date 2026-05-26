# Configuración del Backend - AguaSabia

Esta guía explica detalladamente cómo instalar, configurar y ejecutar el backend del proyecto desde cero. Está estructurada paso a paso para que cualquier integrante del equipo pueda levantar el entorno de desarrollo de forma autónoma.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado y en funcionamiento lo siguiente en tu sistema:

- **Python 3.10 o superior** (probado y compatible hasta Python 3.12).
- **PostgreSQL 13 o superior** (ejecutándose como servicio local).
- **Redis** (para la cola de mensajes y caché de Celery, puerto `6379`).
- **Git** (para clonar y gestionar el código).

### Verificación de requisitos
Ejecuta los siguientes comandos en tu terminal (PowerShell en Windows, o Bash en macOS/Linux) para comprobar que tienes las herramientas necesarias:

```bash
# Verificar Python
python --version

# Verificar PostgreSQL (CLI)
psql --version

# Verificar Redis (CLI)
redis-cli --version
```

---

## Guía de Configuración Paso a Paso

### Paso 1 — Acceder a la carpeta del backend
Abre la terminal en la raíz del proyecto y desplázate al directorio del backend:
```bash
cd Proyecto/backend
```

### Paso 2 — Crear y activar el entorno virtual
El entorno virtual aísla las librerías del proyecto de tu sistema global.

**En Windows (PowerShell):**
```powershell
# Crear el entorno virtual
python -m venv .venv

# Activar el entorno virtual
.venv\Scripts\Activate.ps1
```

**En macOS / Linux:**
```bash
# Crear el entorno virtual
python3 -m venv .venv

# Activar el entorno virtual
source .venv/bin/activate
```

> [!NOTE]
> Sabrás que el entorno virtual está activado porque verás el prefijo `(.venv)` al principio de la línea en tu terminal.

### Paso 3 — Instalar las dependencias
Con el entorno virtual activado, instala todas las librerías necesarias ejecutando:
```bash
pip install -r requirements.txt
```
Esto instalará FastAPI, SQLAlchemy, Alembic, Celery, Redis y los conectores de base de datos correspondientes.

### Paso 4 — Configurar las variables de entorno
Copia la plantilla de configuración `.env.example` y renómbrala a `.env`:

**En Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**En macOS / Linux / Git Bash:**
```bash
cp .env.example .env
```

Abre el archivo `.env` recién creado en tu editor de código preferido (como VS Code) y actualiza la variable `DATABASE_URL` con tu usuario y contraseña locales de PostgreSQL.

```env
# Ejemplo de configuración local en .env
DATABASE_URL=postgresql://postgres:tu_contraseña_aqui@localhost:5432/aguasabia
```

### Paso 5 — Crear la base de datos en PostgreSQL
Antes de correr las migraciones, debes tener creada la base de datos vacía. Conéctate a tu consola de PostgreSQL:

```bash
psql -U postgres
```

Una vez dentro de la consola interactiva de SQL, crea la base de datos `aguasabia` y sal del intérprete:

```sql
CREATE DATABASE aguasabia;
\q
```

### Paso 6 — Generar y aplicar las migraciones (Base de Datos)
Dado que el repositorio no incluye archivos de migración previos en el historial de Alembic (el directorio `alembic/versions` está inicialmente vacío), **es necesario generar la migración inicial antes de intentar actualizar la base de datos**.

Sigue estos dos comandos en orden:

1. **Generar la primera revisión**: Alembic comparará tus modelos de Python con tu base de datos vacía y creará los scripts de creación de tablas.
   ```bash
   python -m alembic revision --autogenerate -m "migracion inicial"
   ```
2. **Aplicar la migración a la base de datos**: Este comando ejecutará el script generado y creará las tablas físicamente.
   ```bash
   python -m alembic upgrade head
   ```

#### Verificación rápida de tablas:
Para asegurar que todo se haya creado correctamente, ejecuta:
```bash
psql -U postgres -d aguasabia -c "\dt"
```
Deberías ver listadas las siguientes 5 tablas principales:
- `regiones`
- `comunas`
- `agricultores`
- `parcelas`
- `balances_hidricos`

### Paso 7 — Cargar los datos semilla (Seed)
Ejecuta el script de poblamiento inicial para cargar en la base de datos las regiones y comunas de Chile que presentan decretos de escasez hídrica:
```bash
python scripts/seed.py
```

### Paso 8 — Iniciar el servidor de desarrollo (FastAPI)
Para iniciar el servidor de FastAPI con recarga automática:
```bash
uvicorn app.main:app --reload
```

El backend estará disponible en:
- **API Base**: `http://localhost:8000`
- **Documentación Interactiva (Swagger UI)**: `http://localhost:8000/docs`
- **Documentación Alternativa (Redoc)**: `http://localhost:8000/redoc`

### Paso 9 — Iniciar Celery (Tareas en segundo plano)
Celery se encarga de procesar tareas costosas o asíncronas (como la futura sincronización climática). Abre **una nueva ventana de terminal**, accede a `Proyecto/backend`, activa tu entorno virtual e inicia el worker:

**Comando recomendado para Windows (modo mono-hilo para desarrollo local):**
```bash
celery -A app.worker.celery_app worker --loglevel=info --pool=solo
```

---

## Tabla Resumen de Comandos

| Acción | Comando |
| :--- | :--- |
| **Activar entorno virtual** | `.venv\Scripts\Activate.ps1` (Win) o `source .venv/bin/activate` (Mac/Linux) |
| **Instalar dependencias** | `pip install -r requirements.txt` |
| **Generar primera migración** | `python -m alembic revision --autogenerate -m "descripcion"` |
| **Aplicar cambios / migrar** | `python -m alembic upgrade head` |
| **Cargar datos iniciales** | `python scripts/seed.py` |
| **Iniciar servidor de API** | `uvicorn app.main:app --reload` |
| **Iniciar Celery Workers** | `celery -A app.worker.celery_app worker --loglevel=info --pool=solo` |

---

## Solución de Problemas Comunes

### 🔴 `ModuleNotFoundError: No module named 'app'`
Este error ocurre cuando ejecutas `uvicorn` o `alembic` desde la carpeta incorrecta. Asegúrate de estar en `Proyecto/backend` antes de lanzar los comandos.

### 🔴 `sqlalchemy.exc.OperationalError: (psycopg.OperationalError) connection refused`
PostgreSQL no está corriendo en el puerto `5432` o tus credenciales en el archivo `.env` son incorrectas.
- **En Windows**: Revisa que el servicio "postgresql-x64-XX" esté iniciado en el panel de Servicios de Windows.

### 🔴 `connection refused` al conectar con Redis
Redis no está encendido o no está escuchando en `localhost:6379`.
- Si usas Docker para Redis local, asegúrate de levantar el contenedor: `docker start redis` o `docker run -d -p 6379:6379 --name redis redis`.
- Si usas WSL, inicia el servicio: `sudo service redis-server start`.

### 🔴 `FAILED: Target database is not up to date`
La base de datos tiene un historial de Alembic diferente al código. Ejecuta `python -m alembic upgrade head` para sincronizar las migraciones.
