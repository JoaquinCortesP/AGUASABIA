# Configuración del Backend - AguaSabia

Esta guía explica cómo instalar y ejecutar el backend del proyecto desde cero.
Está escrita para que cualquier integrante del equipo pueda seguirla sin conocimientos previos del proyecto.

---

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente en tu computador:

- **Python 3.10 o superior** (el proyecto fue probado con Python 3.11 y 3.14)
- **PostgreSQL 13 o superior** — instalado y corriendo como servicio
- **Redis** — para las tareas en segundo plano (Celery)
- **Git** — para clonar el repositorio

Si tienes dudas sobre cómo verificar que están instalados, ejecuta esto en la terminal:

```powershell
python --version
psql --version
redis-cli --version
```

---

## Paso 1 — Entrar a la carpeta del backend

```powershell
cd Proyecto/backend
```

---

## Paso 2 — Crear y activar el entorno virtual

El entorno virtual aísla las dependencias del proyecto de las del sistema.

```powershell
# Crear el entorno
python -m venv .venv

# Activar en Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Activar en macOS / Linux
source .venv/bin/activate
```

Sabrás que está activado cuando veas `(.venv)` al inicio de la línea en la terminal.

---

## Paso 3 — Instalar las dependencias

```powershell
pip install -r requirements.txt
```

Este comando instala FastAPI, SQLAlchemy, Alembic, Celery, Redis y todo lo necesario.
Puede tardar un par de minutos la primera vez.

---

## Paso 4 — Configurar las variables de entorno

Copia el archivo de ejemplo y renómbralo:

```powershell
Copy-Item .env.example .env
```

Abre el archivo `.env` con cualquier editor de texto y cambia los valores que dicen `CAMBIAR_ESTO`:

- `DATABASE_URL` → Tu usuario y contraseña de PostgreSQL
- `SECRET_KEY` → Una clave larga aleatoria (ver instrucción dentro del .env)

---

## Paso 5 — Crear la base de datos en PostgreSQL

Abre una terminal y conéctate a PostgreSQL:

```powershell
psql -U postgres
```

Dentro de la consola de PostgreSQL, ejecuta:

```sql
CREATE DATABASE aguasabia;
\q
```

---

## Paso 6 — Aplicar las migraciones

Las migraciones crean todas las tablas en la base de datos automáticamente.

```powershell
python -m alembic upgrade head
```

Si es la primera vez, también necesitas generar la migración inicial antes:

```powershell
python -m alembic revision --autogenerate -m "migracion inicial"
python -m alembic upgrade head
```

Para verificar que las tablas se crearon:

```powershell
psql -U postgres -d aguasabia -c "\dt"
```

Deberías ver: `regiones`, `comunas`, `agricultores`, `parcelas`, `balances_hidricos`.

---

## Paso 7 — Cargar datos iniciales

Este comando rellena la base de datos con las regiones y comunas de Chile que tienen problemas hídricos:

```powershell
python scripts/seed.py
```

---

## Paso 8 — Iniciar el servidor

```powershell
uvicorn app.main:app --reload
```

El servidor estará disponible en:
- API: `http://localhost:8000`
- Documentación interactiva (Swagger): `http://localhost:8000/docs`

---

## Paso 9 — Iniciar Celery (tareas en segundo plano)

Abre **otra terminal**, activa el entorno virtual y ejecuta:

```powershell
# Windows necesita el flag --pool=solo
celery -A app.worker.celery_app worker --loglevel=info --pool=solo
```

---

## Resumen de comandos

| Acción | Comando |
|--------|---------|
| Activar entorno virtual | `.venv\Scripts\Activate.ps1` |
| Instalar dependencias | `pip install -r requirements.txt` |
| Crear tablas (migración) | `python -m alembic upgrade head` |
| Cargar datos iniciales | `python scripts/seed.py` |
| Iniciar servidor | `uvicorn app.main:app --reload` |
| Iniciar Celery | `celery -A app.worker.celery_app worker --loglevel=info --pool=solo` |
| Nueva migración | `python -m alembic revision --autogenerate -m "descripcion"` |

---

## Errores comunes

**`ModuleNotFoundError: No module named 'app'`**
Asegúrate de estar dentro de `Proyecto/backend` y de tener el entorno virtual activado.

**`connection refused` al conectar a PostgreSQL**
PostgreSQL no está corriendo. En Windows, búscalo en Servicios o ejecuta:
```powershell
net start postgresql-x64-15
```

**`connection refused` al conectar a Redis**
Redis no está corriendo. Si tienes Docker:
```powershell
docker run -d -p 6379:6379 redis
```

**`psycopg2 failed to build` o error de compilación**
El proyecto usa `psycopg` (versión 3), no `psycopg2`. Si instalaste psycopg2 antes, desinstálalo:
```powershell
pip uninstall psycopg2 psycopg2-binary -y
pip install -r requirements.txt
```

**`FAILED: Target database is not up to date`**
Ejecuta `python -m alembic upgrade head` para sincronizar las migraciones.
