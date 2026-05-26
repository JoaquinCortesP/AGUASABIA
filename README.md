# AguaSabia - Sistema de Gestión Hídrica para Municipios

![AguaSabia Logo](image.png)

## 📖 Descripción del Proyecto

**AguaSabia** es un sistema web de gestión hídrica diseñado para municipios, enfocado en el cálculo de balance hídrico y evapotranspiración. Este sistema busca ayudar a los agricultores a administrar el uso del agua de manera óptima basándose en condiciones climáticas.

El sistema fue reconstruido desde cero para ofrecer un backend sólido, fácil de instalar y mantener, y listo para conectarse con APIs externas de clima (Open-Meteo) y suelo (SoilGrids) en el futuro.

## 🛠️ Tecnologías del Backend

- **FastAPI**: Framework web rápido y moderno.
- **SQLAlchemy + Alembic**: ORM para gestionar la base de datos PostgreSQL y sus migraciones.
- **Pydantic**: Para validación de datos.
- **Celery + Redis**: Para manejo de tareas en segundo plano (como cálculos asíncronos o envío de mensajes).
- **JWT**: Para la seguridad y autenticación.

## 🚀 Guía de Instalación (Nivel Junior)

Sigue estos pasos para levantar el entorno en tu computadora. Todo está diseñado para ser sencillo.

### 1. Requisitos Previos
- Python 3.8+ instalado.
- PostgreSQL instalado y ejecutándose.
- Redis instalado y ejecutándose (puerto 6379).

### 2. Preparar el Entorno
Abre tu terminal y navega hasta la carpeta del backend:
```bash
cd Proyecto/backend
```

Crea y activa un entorno virtual (para no mezclar librerías con tu PC):
```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Mac/Linux
python3 -m venv .venv
source .venv/bin/activate
```

Instala las dependencias necesarias:
```bash
pip install -r requirements.txt
```

### 3. Configurar Base de Datos y Entorno
Duplica el archivo `.env.example` y renómbralo a `.env`.
Edita el `.env` con las credenciales de tu base de datos local de PostgreSQL.

### 4. Crear Base de Datos y Migraciones
Asegúrate de haber creado una base de datos vacía en PostgreSQL (ejemplo: `aguasabia`).

Luego, para crear las tablas de forma automática, usa Alembic:
```bash
alembic upgrade head
```

Para poblar la base de datos con las regiones y comunas iniciales (que sufren escasez hídrica), ejecuta:
```bash
python scripts/seed.py
```

### 5. Iniciar el Servidor
Para iniciar el servidor web FastAPI:
```bash
uvicorn app.main:app --reload
```
- Visita `http://localhost:8000/docs` para ver e interactuar con la API (Swagger UI).

### 6. Iniciar Tareas en Segundo Plano (Celery)
En una terminal nueva, activa tu entorno virtual de nuevo y ejecuta:
```bash
# En Windows, puede que necesites instalar `gevent` para celery o ejecutarlo de la siguiente manera:
celery -A app.worker.celery_app worker --loglevel=info --pool=solo
```

## 🔌 Tareas Pendientes (Para futuros desarrollos)
Las integraciones con **Open-Meteo**, **SoilGrids** y **WhatsApp** están pensadas como los próximos pasos a realizar. Los "espacios" en el código se dejaron vacíos intencionalmente con comentarios `TODO` para que puedas completarlos cuando obtengas las claves de acceso de cada API. Para más información, revisa el documento `Documentacion/pasos_siguientes.md`.
