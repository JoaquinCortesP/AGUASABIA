# AguaSabia 🌱💧

AguaSabia es una plataforma geoespacial orientada a consultar información hídrica y ambiental sobre áreas seleccionadas en un mapa. El usuario puede dibujar un polígono, enviar esa geometría al backend y recibir una lectura modular sobre clima, agua, territorio, vegetación y riesgos.

El enfoque del proyecto es entregar una **explicación clara para usuarios no técnicos** (capa pedagógica) y permitir un "Modo Avanzado" para analizar datos numéricos crudos, fuentes oficiales (DGA) y variables satelitales.

## 🚀 Módulos Funcionales (Estado Actual)

- **Territorio**: Recepción de polígonos dibujados por el usuario, cálculo de área y centroides matemáticos mediante **PostGIS**.
- **Clima**: Consumo de Open-Meteo para inyectar datos de temperatura y precipitaciones.
- **Agua**: Cruce espacial con capas oficiales de la Dirección General de Aguas (DGA) para cuencas y decretos de escasez hídrica (`ST_Intersects`).
- **Vegetación**: Integración programada con **Google Earth Engine (Sentinel-2)** para calcular el índice NDVI de los terrenos.
- **Riesgos**: Algoritmo de inferencia que evalúa riesgo de sequía y estrés hídrico combinando el NDVI y el clima.
- **Usuarios**: Autenticación JWT, verificación de correo simulada, guardado de consultas y restricción de "Modo Avanzado" mediante roles (`plan='pago'`).
- **Admin**: Acceso interno a métricas de uso del sistema.
- **Automatización**: Tareas en segundo plano (Celery + Redis) configuradas para sincronización de datos nocturnos.

---

## 🛠️ Stack Tecnológico

**Backend:**
- **Python / FastAPI**: Framework de alto rendimiento.
- **PostgreSQL + PostGIS**: Base de datos relacional y motor geoespacial.
- **SQLAlchemy + Alembic**: ORM y migraciones.
- **Celery + Redis**: Tareas asíncronas y periódicas.
- **Earth Engine API**: Conexión satelital.

**Frontend:**
- **React 19 + TypeScript**: Interfaz de usuario declarativa y tipada.
- **Vite**: Empaquetador ultrarrápido.
- **React-Leaflet**: Renderizado de mapas interactivos y dibujo de polígonos.
- **Zustand**: Manejo de estado global.
- **Tailwind CSS + Lucide**: Estilos modernos e íconos.
- **Recharts**: Visualización de gráficos estadísticos en el "Modo Avanzado".

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
Si quieres probar los cruces espaciales, debes cargar los datos gubernamentales:
1. Descarga los `GeoJSON` de Cuencas y Decretos de Escasez desde la web de la DGA.
2. Ejecuta en tu terminal del backend:
   ```powershell
   python scripts/ingest_dga.py ruta_a_tu_archivo/cuencas.geojson cuencas
   python scripts/ingest_dga.py ruta_a_tu_archivo/decretos.geojson decretos
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

### 5. Levantar Tareas Asíncronas (Celery) - Opcional
Para probar la automatización de actualizaciones climáticas:
1. Levantar **Redis** (En Windows usando Docker: `docker run -p 6379:6379 -d redis`).
2. Levantar el **Worker**: `celery -A app.core.celery_app worker --loglevel=info`
3. Levantar el **Programador (Beat)**: `celery -A app.core.celery_app beat --loglevel=info`

---

## 📚 Documentación del Proyecto

El detalle profundo del desarrollo, historias de usuario, requerimientos y casos de prueba se encuentran en la carpeta `Documentacion/`. Te invitamos a leer:

- **Estructura Arquitectónica:** `Documentacion/Estructura del proyecto/project-structure.md`
- **Requerimientos (Matriz de Trazabilidad):** `Documentacion/Matriz de trazabilidad/matriz_trazabilidad.md`
- **Historias de Usuario (con criterios de aceptación):** `Documentacion/Matriz de trazabilidad/historias_usuario.md`
- **Guía de Configuración Completa:** `Documentacion/docs_tecnicos/paso_a_paso_configuracion.md`
- **Plan de Pruebas y Evidencias:** `Documentacion/docs_tecnicos/plan_pruebas_aguasabia.md`
- **Endpoints de la API:** `Documentacion/Documentacion de api/api-documentation.md`
