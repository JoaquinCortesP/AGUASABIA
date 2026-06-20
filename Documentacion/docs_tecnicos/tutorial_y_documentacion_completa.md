# Documentación Técnica Completa y Tutorial de Despliegue - AguaSabia

Este documento consolida toda la documentación técnica del proyecto AguaSabia. Su objetivo es servir como la **guía maestra** para levantar el proyecto desde cero en cualquier computadora (ideal para evaluación docente) y documentar el estado arquitectónico de las distintas capas del software.

---

# PARTE 1: Tutorial de Instalación Rápida (Backend + Frontend)

Esta sección explica cómo ejecutar AguaSabia en tu computadora local.

## 1. Requisitos Previos
- **Python 3.10** o superior.
- **Node.js v18** o superior (con `npm`).
- **PostgreSQL** instalado.
- **PostGIS** habilitado en PostgreSQL (Fundamental para el cruce de polígonos y mapas).
- Git.

## 2. Configurar la Base de Datos
1. Crea una base de datos local llamada `aguasabia_test` (o el nombre que prefieras).
2. Abre la consola de SQL de tu motor (pgAdmin o DBeaver) y ejecuta este comando para habilitar la extensión espacial obligatoria:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

## 3. Levantar el Backend (FastAPI)
Abre una terminal y dirígete a la carpeta del backend:
```bash
cd Proyecto/backend
```
1. **Crear y activar el entorno virtual:**
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate   # (En Windows)
   ```
2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configurar el entorno (`.env`):**
   Crea un archivo llamado `.env` en la raíz de `Proyecto/backend/` con el siguiente contenido base:
   ```env
   API_V1_STR=/api/v1
   SECRET_KEY=clave_maestra_secreta_super_segura
   ACCESS_TOKEN_EXPIRE_MINUTES=11520
   DATABASE_URL=postgresql://postgres:TU_CLAVE_AQUI@localhost:5432/aguasabia_test
   BACKEND_CORS_ORIGINS=http://localhost:5173
   ```
4. **Ejecutar Migraciones:**
   Este comando construirá automáticamente las tablas en tu base de datos.
   ```bash
   python -m alembic upgrade head
   ```
5. **Cargar Datos Reales Oficiales (Ingesta DGA):**
   AguaSabia descarga en tiempo real polígonos del Ministerio de Obras Públicas. Corre estos comandos para llenar la base de datos:
   ```bash
   python scripts/sync_capas_oficiales.py
   python scripts/sync_geo_data.py
   ```
6. **Arrancar el Servidor:**
   ```bash
   uvicorn app.main:app --reload
   ```
   *El backend quedará corriendo en `http://127.0.0.1:8000`.*

## 4. Levantar el Frontend (React + Vite)
Abre **otra** terminal y dirígete a la carpeta del frontend:
```bash
cd Proyecto/frontend
```
1. **Instalar dependencias Node:**
   ```bash
   npm install
   ```
2. **Configurar entorno Frontend (`.env`):**
   Crea un archivo `.env` en `Proyecto/frontend/` y pega:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
3. **Arrancar Servidor Web:**
   ```bash
   npm run dev
   ```
   *La plataforma quedará corriendo en `http://localhost:5173`.*

¡Listo! Ya puedes entrar al frontend, registrar un usuario y dibujar polígonos.

---

# PARTE 2: Origen de Datos y Tecnologías

AguaSabia es un orquestador de datos. Así es como obtenemos la información:

1. **Dirección General de Aguas (DGA) / MOP - API REST ArcGIS:**
   A través de los scripts `sync_capas_oficiales.py` y `sync_geo_data.py` extraemos automáticamente miles de polígonos vectoriales desde el Gobierno de Chile hacia nuestra base de datos **PostGIS** para cruces matemáticos rápidos:
   - `DGA/Acuiferos_Protegidos`
   - `DGA/Areas_de_Restriccion_y_Zonas_de_Prohibicion`
   - `DGA/Declaracion_de_Agotamiento`
   - `DGA/Decretos_Caudales_de_Reserva`
   - `DGA/Decretos_Escasez_Hidrica`
   - `DGA/ESTACION_EMBALSE` (junto con Estaciones Fluviométricas y Meteorológicas).
   - `DGA/Cuencas`

2. **Open-Meteo API (Clima):**
   Se consulta dinámicamente en tiempo real enviando el centroide del polígono que dibuja el usuario. Devuelve **Precipitación Acumulada** y **Evapotranspiración (ET0)**.

3. **Google Earth Engine (Sentinel-2) - [ESTADO: EN DESARROLLO / PREPARACIÓN]:**
   La lógica backend existe en `gee.py` para calcular NDVI (Vegetación) y Anomalías Térmicas (Incendios). Actualmente el frontend simula visualmente la capa infrarroja a la espera de la liberación productiva de las credenciales de Service Account de Google.

---

# PARTE 3: Arquitectura y Base de Datos

## 3.1 Base de Datos (PostgreSQL + PostGIS)
La plataforma abandonó el concepto *Legacy* de "agricultores y parcelas" y pivotó al 100% hacia el análisis geoespacial libre mediante el objeto GeoJSON (`GEOMETRY(POLYGON, 4326)`).

**Tablas Fundamentales:**
- `usuarios` / `administradores`: Autenticación y modelo Freemium vs Premium.
- `consultas_territoriales`: Almacenamiento geométrico del análisis. Aquí se aplica la sanitización obligatoria de polígonos a través de `ST_MakeValid` para evitar errores 500 por trazos manuales superpuestos.
- `capas_ambientales`: Almacena nativamente la vectorización de Decretos, Restricciones y Acuíferos para el operador `ST_Intersects`.

## 3.2 Manejo de Errores y Seguridad (HTTP Status)
El sistema ha sido fortificado contra ataques y malformaciones de datos:
- **422 Unprocessable Entity:** Para polígonos menores a 3 vértices o fuera del espectro geográfico mundial (`[-180, 180]`).
- **401 Unauthorized:** Intento de guardar consultas sin token JWT.
- **403 Forbidden / 402 Payment Required:** Acceso a módulos de la DGA o reportes profundos mediante el Frontend con usuario Gratuito (El frontend intercepta este error y lanza modales de Promoción).
- **503 Service Unavailable:** Interceptor genérico por si `Open-Meteo` se cae temporalmente, el backend emite un mensaje parcial sin derribar la aplicación.

---

# PARTE 4: Componentes Futuros [EN PREPARACIÓN]

Las siguientes infraestructuras tecnológicas están documentadas y estructuradas en el código base, pero se encuentran bajo el estado de **"En Preparación"** para las próximas fases (Producción y Automatización).

## 4.1 Despliegue en la Nube (Railway / Render)
El proyecto está containerizado y preparado mediante variables de entorno para subirse a la plataforma **Railway**.
- La API correrá bajo un comando de inicio `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- El esquema se sincronizará automáticamente inyectando `alembic upgrade head` en la fase de Build.

## 4.2 Automatización Celery y Redis
Para evitar consultar las APIs pesadas sincrónicamente en el momento en que un usuario hace una solicitud masiva, se incluyó `Celery`.
- Se requiere levantar `Redis` (`docker run -p 6379:6379 -d redis`) y luego iniciar un Celery Worker y un Celery Beat.
- **Estado:** Estructura de colas generada. Listo para vincular cronjobs de actualización de índices climáticos y sequía en las madrugadas.

## 4.3 Respaldos Automatizados (pg_dump)
Mecanismos de backup aislados para salvaguardar la persistencia de las consultas territoriales (`pg_dump -U postgres -d aguasabia_test > backup.sql`). No se deben mezclar datos Legacy ni credenciales en claro en los repositorios o Bitbucket.
