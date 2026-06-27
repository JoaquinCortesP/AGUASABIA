# AguaSabia 🌱💧

AguaSabia es una plataforma geoespacial orientada a consultar información hídrica y ambiental sobre áreas seleccionadas en un mapa. El usuario puede dibujar un polígono, enviar esa geometría al backend y recibir una lectura modular sobre clima, agua, territorio, vegetación y riesgos.

El enfoque del proyecto es entregar una **explicación clara para usuarios no técnicos** (capa pedagógica) y permitir un "Modo Avanzado" para analizar datos numéricos crudos, fuentes oficiales (DGA) y variables satelitales.

## 🚀 Módulos Funcionales (Estado Actual)

- **Territorio**: Recepción de polígonos dibujados por el usuario, cálculo de área y centroides matemáticos mediante **PostGIS** con envolturas de seguridad `ST_MakeValid`.
- **Clima y Balance Hídrico**: Consumo en tiempo real e histórico de Open-Meteo (modelos ERA5 y evapotranspiración de referencia FAO-56 Penman-Monteith) en base al centroide del predio.
- **Agua (Capas Oficiales DGA)**: Cruce espacial en tiempo real (`ST_Intersects`) con capas oficiales de la Dirección General de Aguas para Acuíferos Protegidos, Áreas de Restricción, Zonas de Prohibición, Cuencas Hidrográficas y Decretos de Escasez Hídrica.
- **Vegetación (Teledetección Satelital)**: Integración activa con **Google Earth Engine (Sentinel-3 OLCI)** para descargar y calcular el índice NDVI y retornar reflectancias espectrales Roja (RED, Oa08) e Infrarroja Cercana (NIR, Oa17) reales de tu terreno.
- **Dashboard Pro (Registro Hídrico)**: Modal avanzado interactivo con evolución gráfica Recharts de lluvia vs ET0, estimaciones de vigor vegetal, tabla de resumen agrupada cada 7 días, alertas semánticas y calculadora matemática de NDVI en tiempo real.
- **Usuarios y Seguridad**: Autenticación JWT mediante hashing BCrypt, roles (`admin` / `usuario` con planes `visitante` / `pro`) y control de tasa de solicitudes (rate limiting).
- **Orquestación y Automatización**: Tareas en segundo plano (Celery + Redis) preparadas para sincronización de catastro e ingestas espaciales, y emulación local vía `docker-compose`.

---

## 🛠️ Stack Tecnológico

**Backend:**
- **Python / FastAPI**: API de alto rendimiento con inyección de dependencias.
- **PostgreSQL + PostGIS**: Almacenamiento relacional y operaciones topológicas espaciales.
- **SQLAlchemy + Alembic**: ORM y versionamiento de base de datos.
- **Celery + Redis**: Tareas en segundo plano y almacenamiento de brokers.
- **Earth Engine API (Google Cloud)**: Procesamiento satelital remoto.

**Frontend:**
- **React 19 + TypeScript**: Desarrollo UI modular con tipado seguro.
- **Vite**: Servidor de desarrollo HMR ultrarrápido.
- **React-Leaflet + Leaflet**: Renderizado interactivo y dibujo vectorial.
- **Zustand**: Gestión ligera y eficiente de estado.
- **Tailwind CSS + Lucide Icons**: Diseño responsive premium.
- **Recharts**: Gráficos interactivos de líneas, barras y compuestos.

---

## 💻 Guía de Ejecución Local (Para Revisión Docente)

Sigue estos pasos para levantar el proyecto completo en tu máquina:

### 1. Preparar la Base de Datos
1. Instalar **PostgreSQL** y asegúrate de incluir **PostGIS** en la instalación (en Windows, puedes usar _Application Stack Builder_).
2. Crear una base de datos local (ej: `aguasabia_db`).
3. En **pgAdmin**, abrir una "Query Tool" en esa base de datos y ejecutar:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### 2. Levantar el Backend (API)
Abre una terminal y navega a la carpeta del backend:
```powershell
cd Proyecto/backend
```
Activa el entorno virtual:
```powershell
.\.venv\Scripts\activate
```
_(Nota: Asegúrate de tener las variables en un archivo `.env`. Puedes usar `.env.example` como base)._

Aplica las migraciones (creará todas las tablas y relaciones automáticamente):
```powershell
python -m alembic upgrade head
```
Levanta el servidor web:
```powershell
uvicorn app.main:app --reload
```
La API estará disponible en: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger UI).

### 3. Ingestar Datos DGA Oficiales (Opcional pero Recomendado)
Si quieres probar los cruces espaciales reales y visualizar Decretos, Acuíferos y Ríos, debes correr los scripts de ingesta automatizada que extraen los polígonos desde la API del MOP:
1. Asegúrate que tu entorno virtual esté activado.
2. Ejecuta en tu terminal del backend:
   ```powershell
   python scripts/sync_capas_oficiales.py
   python scripts/sync_geo_data.py
   ```

### 4. Levantar el Frontend (Interfaz Visual)
Abre **otra** terminal y navega a la carpeta del frontend:
```powershell
cd Proyecto/frontend
```
Instala las dependencias de Node.js (solo la primera vez):
```powershell
npm install
```
Inicia el servidor de desarrollo:
```powershell
npm run dev
```
La web estará disponible en: `http://localhost:5173` (o la URL que te indique la consola).

### 5. Levantar Entorno Orquestado Completo (Docker Compose)
Si prefieres emular el stack de producción o no deseas configurar PostgreSQL/PostGIS a mano, puedes levantar el backend al completo con Docker Compose:
1. Asegúrate de tener Docker corriendo en tu sistema.
2. Ejecuta en la raíz del monorepo:
   ```powershell
   docker compose up --build
   ```
   Esto levantará automáticamente:
   - PostgreSQL (PostGIS) expuesto en el puerto `5432`.
   - Redis en el puerto `6379`.
   - API de FastAPI en el puerto `8000` (con auto-reload activo para desarrollo).
   - Celery Worker consumiendo tareas asíncronas de fondo.

---

## ☁️ Despliegue en la Nube (Railway)

La arquitectura de este monorepo está preparada para su despliegue y auto-detección en **Railway** (usando variables dinámicas de entorno y el Dockerfile del backend).
👉 Para ver las instrucciones detalladas del despliegue en la nube, consulta el archivo: [Guía de Despliegue en Railway (Paso a Paso)](file:///C:/Users/Joaqu/.gemini/antigravity/brain/ca9a5c68-7ab8-4453-a24b-2f32480da578/walkthrough.md).

---

## 📚 Documentación del Proyecto

El detalle profundo del desarrollo, historias de usuario, requerimientos y casos de prueba se encuentran en la carpeta `Documentacion/`. Te invitamos a leer:

- **Estructura Arquitectónica:** `Documentacion/Estructura del proyecto/project-structure.md`
- **Requerimientos (Matriz de Trazabilidad):** `Documentacion/Matriz de trazabilidad/matriz_trazabilidad.md`
- **Historias de Usuario (con criterios de aceptación):** `Documentacion/Matriz de trazabilidad/historias_usuario.md`
- **Tutorial Completo y Docs. Técnicos:** `Documentacion/docs_tecnicos/tutorial_y_documentacion_completa.md`
- **Plan de Pruebas y Evidencias:** `Documentacion/docs_tecnicos/plan_pruebas_aguasabia.md`
- **Endpoints de la API:** `Documentacion/Documentacion de api/api-documentation.md`
