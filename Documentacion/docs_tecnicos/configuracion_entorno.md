# Configuración de Entorno (.env) - AguaSabia

Este documento proporciona una guía exhaustiva de todas las variables de entorno utilizadas en el backend del proyecto AguaSabia. Explica su significado, formato esperado y cómo configurarlas tanto en desarrollo como en producción.

---

## 1. Archivo de Entorno (`.env`)

El backend de AguaSabia lee su configuración dinámicamente desde un archivo `.env` ubicado en la raíz del backend (`Proyecto/backend/.env`). Pydantic Settings carga estas variables y las expone en la aplicación global en `app/core/config.py`.

> [!CAUTION]
> El archivo `.env` contiene información sensible como contraseñas de bases de datos y llaves secretas. **Nunca debe ser subido al repositorio Git**. Está explícitamente ignorado en el archivo `.gitignore`.

---

## 2. Variables de Configuración Detalladas

A continuación se detalla cada variable definida en la plantilla [.env.example](../../Proyecto/backend/.env.example):

### 2.1 Configuración de Proyecto

#### `PROJECT_NAME`
- **Tipo**: Cadena de texto (`string`)
- **Valor por defecto**: `AguaSabia`
- **Descripción**: Nombre del proyecto. Se utiliza principalmente en los metadatos de Swagger UI y ReDoc.

#### `API_V1_STR`
- **Tipo**: Cadena de texto (`string`)
- **Valor por defecto**: `/api/v1`
- **Descripción**: Prefijo global de todas las rutas HTTP de la API REST.

---

### 2.2 Seguridad y Sesiones

#### `SECRET_KEY`
- **Tipo**: Cadena de texto (`string`)
- **Descripción**: Clave secreta e individual utilizada para firmar criptográficamente los tokens JWT generados por el backend.
- **En Desarrollo**: Puede ser una cadena de texto simple.
- **En Producción**: Debe ser una cadena de alta entropía y longitud (mínimo 32 bytes).
- **Cómo generarla**:
  Puedes usar OpenSSL en la terminal:
  ```bash
  openssl rand -hex 32
  ```
  O mediante Python:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

#### `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Tipo**: Entero (`integer`)
- **Valor por defecto**: `11520` (8 días)
- **Descripción**: Tiempo de validez del token JWT desde el momento en que se emite. Al expirar, el cliente deberá volver a loguearse.

---

### 2.3 Acceso a Base de Datos (PostgreSQL)

#### `DATABASE_URL`
- **Tipo**: URI de conexión (`string`)
- **Formato**: `postgresql://<usuario>:<contraseña>@<host>:<puerto>/<nombre_bd>`
- **Descripción**: Credenciales y dirección para que SQLAlchemy se conecte a la base de datos PostgreSQL.
- **Ejemplo Local**: `postgresql://postgres:contraseña_local@localhost:5432/aguasabia`
- **Ejemplo Railway / Nube**: `postgresql://postgres:fK3hD1-9F3a...@postgres.railway.internal:5432/railway`

---

### 2.4 Cola de Mensajes y Caché (Redis / Celery)

#### `REDIS_URL`
- **Tipo**: URI de conexión (`string`)
- **Formato**: `redis://<host>:<puerto>/<base_datos>`
- **Descripción**: URL de conexión para el servidor de Redis. Se utiliza para almacenamiento rápido y caché de datos climáticos.
- **Ejemplo Local**: `redis://localhost:6379/0`

#### `CELERY_BROKER_URL`
- **Tipo**: URI de conexión (`string`)
- **Descripción**: URL del broker de Celery donde se encolan las tareas asíncronas de fondo. Apunta típicamente al servidor Redis.
- **Ejemplo Local**: `redis://localhost:6379/0`

#### `CELERY_RESULT_BACKEND`
- **Tipo**: URI de conexión (`string`)
- **Descripción**: Ubicación donde Celery almacena el resultado y estado de la ejecución de las tareas.
- **Ejemplo Local**: `redis://localhost:6379/1` (se recomienda usar una base de datos de Redis diferente, por ejemplo `/1`, para no colisionar con la base `/0` del broker).

---

### 2.5 Configuración de CORS

#### `BACKEND_CORS_ORIGINS`
- **Tipo**: Lista de URLs separadas por comas (`string`)
- **Descripción**: Lista de dominios que tienen permiso para comunicarse con la API mediante peticiones AJAX en navegadores web.
- **Ejemplo**: `http://localhost:3000,http://localhost:8080` (permite que los frontends locales en puerto 3000 o 8080 hagan consultas).
- **Importante**: No dejes espacios después de las comas.

---

### 2.6 Integraciones con APIs Externas (Opcional en MVP)

#### `OPEN_METEO_API_KEY`
- **Descripción**: Token de API para consultas a Open-Meteo comercial (dejar vacío para usar la versión pública gratuita).

#### `WHATSAPP_API_KEY`
- **Descripción**: Token de acceso a Meta Graph API para enviar notificaciones masivas mediante plantillas de WhatsApp.

---

## 3. Configuración Inicial en el Proyecto

Cuando un nuevo desarrollador clona el proyecto:
1. Copia el archivo [.env.example](../../Proyecto/backend/.env.example) y renómbralo a `.env`.
2. Completa los valores de base de datos (`DATABASE_URL`) y Redis.
3. El código del backend detectará automáticamente los valores y levantará el servidor FastAPI sobre dichos parámetros.
