# Guia de configuracion del backend - AguaSabia

## Proposito

Esta guia indica como levantar el backend localmente para ejecutar pruebas de la API y obtener evidencias para el Estado de avance 3.

## Requisitos

- Python 3.10 o superior.
- PostgreSQL.
- Git.
- Entorno virtual Python.
- Conexion a internet para consumir Open-Meteo.
- Postman para pruebas manuales.

Redis y Celery pueden mantenerse instalados como infraestructura futura, pero no son obligatorios para validar el flujo principal de consulta territorial de esta etapa.

## Preparacion

Entrar al backend:

```powershell
cd C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Proyecto\backend
```

Crear entorno virtual si no existe:

```powershell
python -m venv .venv
```

Activar entorno:

```powershell
.\.venv\Scripts\activate
```

Instalar dependencias:

```powershell
pip install -r requirements.txt
```

## Variables de entorno

Crear `.env` desde `.env.example` si corresponde:

```powershell
Copy-Item .env.example .env
```

Configurar base de datos de pruebas:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aguasabia_test
SECRET_KEY=clave_de_pruebas
API_V1_STR=/api/v1
```

No incluir credenciales reales en screenshots.

## Migraciones

Aplicar migraciones:

```powershell
python -m alembic upgrade head
```

Verificar revision actual:

```powershell
python -m alembic current
```

## Datos semilla

Ejecutar seed:

```powershell
python scripts\seed.py
```

El seed debe crear datos territoriales base y un administrador demo:

```text
admin@aguasabia.cl
admin123
```

## Levantar backend

```powershell
uvicorn app.main:app --reload
```

URLs:

```text
API: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs
OpenAPI: http://127.0.0.1:8000/api/v1/openapi.json
```

## Flujo minimo para Postman

1. Login admin:

```text
POST /api/v1/login/access-token
```

2. Registrar usuario:

```text
POST /api/v1/usuarios/register
```

3. Login usuario:

```text
POST /api/v1/usuarios/login
```

4. Analizar poligono:

```text
POST /api/v1/territorio/consultas/analizar
```

5. Probar Open-Meteo:

```text
POST /api/v1/clima/poligono
```

6. Probar modulos:

```text
POST /api/v1/agua/poligono
POST /api/v1/vegetacion/poligono
POST /api/v1/riesgos/poligono
```

## Notas de alcance

- El frontend no se valida en esta etapa.
- Las APIs satelitales quedan planificadas para integracion posterior.
- PostGIS queda planificado, no requerido para estas pruebas.
- Agricultores, parcelas, balances y recomendacion de riego son elementos legacy y no forman parte del flujo principal actual.
