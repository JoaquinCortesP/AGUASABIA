# Configuración del Backend - AguaSabia

Esta guía explica cómo instalar, configurar y ejecutar el backend desde cero. Incluye los cambios recientes: autenticación por `Administrador`, la nueva entidad `Municipio` y el script `scripts/seed.py` que crea un administrador por defecto.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado y en funcionamiento lo siguiente en tu sistema:

- **Python 3.10 o superior**.
- **PostgreSQL 13 o superior** (ejecutándose como servicio local).
- **Redis** (para la cola de mensajes y caché de Celery, puerto `6379`).
- **Git** (para clonar y gestionar el código).

### Verificación de requisitos
Ejecuta los siguientes comandos en tu terminal para comprobar las herramientas necesarias:

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

Sabrás que el entorno virtual está activado porque verás el prefijo `(.venv)` al principio de la línea en tu terminal.

### Paso 3 — Instalar las dependencias
Con el entorno virtual activado, instala todas las librerías necesarias ejecutando:

```bash
pip install -r requirements.txt
```

Esto instalará FastAPI, SQLAlchemy, Alembic, Celery, Redis y los conectores de base de datos.

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

Abre el archivo `.env` recién creado en tu editor y actualiza `DATABASE_URL` con tus credenciales locales de PostgreSQL. Añade también las variables clave usadas por el proyecto:

```env
# Ejemplo de configuración local en .env
DATABASE_URL=postgresql://postgres:tu_contraseña_aqui@localhost:5432/aguasabia

# Variables recomendadas
SECRET_KEY=clave_secreta_para_desarrollo_cambiar_en_produccion
ACCESS_TOKEN_EXPIRE_MINUTES=11520
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=${REDIS_URL}
CELERY_RESULT_BACKEND=${REDIS_URL}
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

Opcional: si prefieres crear un usuario dedicado y asignarle permisos:

```sql
CREATE USER aguasabia_user WITH PASSWORD 'tu_pass_segura';
GRANT ALL PRIVILEGES ON DATABASE aguasabia TO aguasabia_user;
\q
```

### Paso 6 — Generar y aplicar las migraciones (Base de Datos)
El proyecto ha añadido recientemente los modelos `Administrador` y `Municipio`. Si no existen revisiones de Alembic aún, debes crear la migración inicial que incluya estas tablas.

Importante: revisa que `alembic.ini` y `app/core/config.py` (o tu `.env`) apunten correctamente a `DATABASE_URL` antes de generar la revisión.

Sigue estos dos comandos en orden:

1. **Generar la primera revisión**: Alembic comparará tus modelos de Python con tu base de datos vacía y creará los scripts de creación de tablas.
   ```bash
   python -m alembic revision --autogenerate -m "migracion inicial"
   ```
2. **Aplicar la migración a la base de datos**: Este comando ejecutará el script generado y creará las tablas físicamente.
   ```bash
   python -m alembic upgrade head
   ```
+
+### Recuperar Alembic cuando falta una revisión previa
+Si tu base de datos ya contiene la tabla `alembic_version` y apunta a una revisión que no existe en `alembic/versions/`, Alembic fallará con un error como:
+`Can't locate revision identified by '66148a459850'`.
+
+En ese caso:
+1. Crea un archivo placeholder con el nombre de la revisión faltante dentro de `alembic/versions/`.
+2. Asegúrate de que `app/models/__init__.py` importa todos los nuevos modelos, incluidos `Municipio` y `Administrador`.
+3. Vuelve a ejecutar `python -m alembic revision --autogenerate -m "migracion inicial"`.
+4. Aplica la migración con `python -m alembic upgrade head`.
+
+Esto restaura el historial de Alembic y permite que la base de datos se actualice con las nuevas tablas y columnas.

#### Verificación rápida de tablas:
Para asegurar que todo se haya creado correctamente, ejecuta:

```bash
psql -U postgres -d aguasabia -c "\dt"
```

Después de aplicar las migraciones deberías ver, como mínimo, las tablas relacionadas con dominio y las nuevas entidades:

- `regiones`
- `comunas`
- `municipios`  <-- nueva entidad
- `administradores`  <-- nueva entidad
- `agricultores`
- `parcelas`
- `balances_hidricos`

Si la migración automática no detecta algún cambio (por ejemplo relaciones o constraints nuevas), genera la revisión y corrige el script antes de aplicar.

### Paso 7 — Cargar los datos semilla (Seed)
Ejecuta el script de poblamiento inicial para cargar en la base de datos las regiones, comunas y crear un `Municipio` y `Administrador` de ejemplo:

```bash
python scripts/seed.py
```

Notas sobre `seed.py`:

- El script ahora crea también un `Municipio` de ejemplo (Municipio Copiapó) y un `Administrador` por defecto.
- Credenciales del administrador generado:
   - Email: `admin@aguasabia.cl`
   - Contraseña inicial: `Admin1234!`

Por seguridad, cambia la contraseña tras el primer login o ajusta el script si quieres otra contraseña.

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

---

## Cambios funcionales importantes (resumen rápido)

- Autenticación: El endpoint de login ahora autentica `Administradores`. Para obtener token JWT use el endpoint:

   - POST `/api/v1/login/access-token` con `username=<email>` y `password=<password>` (form-data / x-www-form-urlencoded). El token permite acceder a rutas administrativas.

- Admin-only: La creación de `Agricultores` (registro y creación de parcelas asociadas) está protegida y solo puede hacerla un `Administrador` vinculado a un `Municipio`.

- Scoping territorial: Los administradores están ligados a un `Municipio`; muchas operaciones (crear parcela, ver balances) validan que la entidad objetivo pertenezca a la comuna del municipio del admin.

## Ejemplo rápido: obtener token y llamar a la API

1) Obtener token (ejemplo con `curl`):

```bash
curl -X POST "http://localhost:8000/api/v1/login/access-token" -d "username=admin@aguasabia.cl&password=Admin1234!" -H "Content-Type: application/x-www-form-urlencoded"
```

Respuesta esperada: JSON con `access_token` y `token_type`.

2) Usar token para crear un agricultor (ejemplo simplificado):

```bash
curl -X POST "http://localhost:8000/api/v1/admin/agricultores" \
   -H "Authorization: Bearer <ACCESS_TOKEN>" \
   -H "Content-Type: application/json" \
   -d '{"nombre":"Juan", "email":"juan@ejemplo.cl","password":"Pass123!","parcela": {"nombre":"Mi Parcela","superficie":1.2,"tipo_cultivo":"olivo","latitud":-27.366,"longitud":-70.331,"comuna_id":<ID_COMUNA> }}'
```

Reemplaza `<ACCESS_TOKEN>` por el token obtenido y `<ID_COMUNA>` por la comuna correspondiente al municipio del admin.

---

Si prefieres, puedo generar una versión corta de este README con solo los comandos mínimos.
