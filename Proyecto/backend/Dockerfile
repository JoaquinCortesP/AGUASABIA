FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requerimientos e instalar paquetes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend al contenedor
COPY . .

# Crear un usuario sin privilegios y cambiar los permisos de la carpeta de trabajo
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Exponer el puerto por defecto de FastAPI
EXPOSE 8000

# Comando por defecto para iniciar el Backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
