# Guía de Despliegue en Railway - AguaSabia

Esta guía describe los pasos necesarios para desplegar la arquitectura completa del backend de AguaSabia (API de FastAPI, base de datos PostgreSQL, broker Redis y worker de Celery) en la plataforma **Railway**.

---

## 1. Arquitectura de Despliegue

En Railway, desplegaremos 4 servicios interconectados dentro del mismo proyecto:

```
[ Cliente Web / Móvil ]
         │
    (HTTPS / Puerto Público)
         │
         ▼
 ┌──────────────┐     (Conexión Privada)     ┌────────────────┐
 │ FastAPI API  │ ─────────────────────────> │ PostgreSQL DB  │
 └──────────────┘                            └────────────────┘
         │
         │ (Conexión Privada a Redis)
         ▼
 ┌──────────────┐                            ┌────────────────┐
 │ Redis Broker │ <───────────────────────── │ Celery Worker  │
 └──────────────┘                            └────────────────┘
```

---

## 2. Requisitos Previos

1. Una cuenta activa en [Railway](https://railway.app/).
2. El código del proyecto subido a un repositorio privado o público en **GitHub**.
3. El proyecto debe contar con el archivo [requirements.txt](../../Proyecto/backend/requirements.txt) configurado en la carpeta del servicio para que Railway detecte automáticamente el entorno Python.

---

## 3. Despliegue Paso a Paso

### Paso 1: Crear un Nuevo Proyecto en Railway
1. Accede a tu panel de Railway y haz clic en **New Project**.
2. Selecciona **Provision PostgreSQL** para crear la base de datos relacional.
3. Una vez aprovisionada, haz clic en **New** (esquina superior derecha) y selecciona **Database** -> **Add Redis** para añadir el broker de mensajería.

---

### Paso 2: Desplegar el Servicio de la API (FastAPI)
1. Haz clic en **New** -> **GitHub Repo** y selecciona el repositorio de AguaSabia.
2. Railway creará un servicio de despliegue. Ve a las configuraciones de este servicio (**Settings**) y renómbralo a `aguasabia-api`.
3. En la pestaña **Variables**, añade las variables de entorno necesarias. Puedes usar las variables internas provistas por Railway para interconectar los servicios de forma segura:

| Nombre de Variable | Valor / Referencia de Railway | Descripción |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `AguaSabia` | Nombre de la aplicación |
| `API_V1_STR` | `/api/v1` | Prefijo de API |
| `SECRET_KEY` | *Genera una cadena aleatoria larga* | Clave para firmas JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `11520` | Expiración de tokens (8 días) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | URL autogenerada para PostgreSQL |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | URL autogenerada de conexión a Redis |
| `CELERY_BROKER_URL` | `${{Redis.REDIS_URL}}` | Broker apunta a Redis |
| `CELERY_RESULT_BACKEND` | `${{Redis.REDIS_URL}}/1` | Resultados de Celery en DB 1 de Redis |
| `BACKEND_CORS_ORIGINS` | `*` (o la URL de tu frontend publicado) | Dominios permitidos |

4. En la pestaña **Settings**, desplázate hasta **Deploy** -> **Start Command** e ingresa el comando de arranque para producción de Uvicorn:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   *(Railway inyecta el puerto dinámicamente mediante la variable `$PORT` y abre el tráfico HTTP externo).*

---

### Paso 3: Desplegar el Servicio del Worker (Celery)
El worker de Celery corre asíncronamente y no expone puertos públicos, pero comparte el mismo código y base de datos que la API.

1. Haz clic en **New** -> **GitHub Repo** y selecciona nuevamente el mismo repositorio de AguaSabia.
2. Cambia el nombre de este segundo servicio a `aguasabia-worker`.
3. Copia todas las variables de entorno configuradas en `aguasabia-api` a las variables de `aguasabia-worker` (puedes usar la opción **Shared Variables** de Railway o copiarlas manualmente).
4. Ve a **Settings** -> **Start Command** del servicio `aguasabia-worker` e ingresa:
   ```bash
   celery -A app.worker.celery_app worker --loglevel=info
   ```
   *(No requieres habilitar puertos o URLs públicas para el worker ya que solo consume y procesa tareas de la cola de Redis).*

---

## 4. Ejecución de Migraciones en Producción

Dado que Alembic gestiona el esquema de la base de datos, debes sincronizar las tablas en Railway.

Hay dos alternativas recomendadas para hacer esto:

### Opción A (Recomendada - Automatizada por despliegue)
Puedes configurar la migración como comando de construcción o pre-despliegue en la API.
En **Settings** -> **Build** -> **Builder**, o estableciendo una variable de Railway especial, puedes anteponer las migraciones al comando de inicio.
Modifica el **Start Command** de la API para que primero ejecute Alembic:
```bash
python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
Esto garantiza que cada vez que subas código nuevo a GitHub con una nueva revisión de base de datos, Railway aplicará los cambios antes de levantar la nueva versión de la API.

### Opción B (Manual - Mediante la CLI de Railway)
Si prefieres correrlas manualmente desde tu terminal local conectada a la base de datos de producción:
1. Instala la CLI de Railway en tu PC.
2. Inicia sesión: `railway login`.
3. Vincula el proyecto local: `railway link`.
4. Ejecuta las migraciones localmente pero direccionadas a la nube:
   ```bash
   railway run python -m alembic upgrade head
   ```

---

## 5. Carga de Datos Semilla en Producción
Una vez que el esquema de base de datos esté montado, ejecuta el cargador de comunas y regiones chilenas por única vez:
```bash
railway run python scripts/seed.py
```
*(El comando `railway run` lee las credenciales del servidor Postgres de producción y ejecuta el script de población directamente en la base de datos de Railway).*
