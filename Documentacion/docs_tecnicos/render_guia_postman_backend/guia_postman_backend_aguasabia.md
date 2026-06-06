# Guia Backend AguaSabia para Postman

## 1. Objetivo de esta guia

Este documento deja registrado:

- que se corrigio en el backend;
- por que se corrigio;
- como probar hoy mismo el backend con Postman;
- como encaja esto con el proyecto completo de AguaSabia;
- que tecnologias ya estan usando y cuales faltan por integrar.

La meta de esta iteracion fue llegar hasta un punto estable donde:

- el administrador se pueda registrar;
- el administrador pueda autenticarse y obtener un bearer token;
- el endpoint `GET /api/v1/admin/me` responda correctamente;
- el backend consuma Open-Meteo y entregue ET0 y precipitacion reales;
- la base quede lista para avanzar luego a agricultores, parcelas, Leaflet y motor agronomico.

## 2. Que se hizo y por que

### 2.1 Correccion de autenticacion de administrador

Se corrigio la logica entre:

- `POST /api/v1/login/access-token`
- `GET /api/v1/admin/me`
- `app/api/deps.py`

### Problema anterior

El login generaba el token usando `admin.id`, pero la dependencia que validaba el token intentaba buscar al administrador usando `email`.

Eso hacia que:

- el login devolviera token;
- pero `GET /api/v1/admin/me` respondiera `Administrador no encontrado`.

### Solucion aplicada

Ahora `get_current_admin`:

- decodifica el JWT;
- lee `sub`;
- si `sub` es numerico, busca por `Administrador.id`;
- si `sub` no es numerico, busca por email como compatibilidad.

Con eso se mantuvo funcionando el login actual:

- `POST /api/v1/login/access-token`

y se hizo funcional:

- `GET /api/v1/admin/me`

### 2.2 Registro de administrador

Se agrego:

- `POST /api/v1/admin/register`

Esto permite crear administradores directamente desde Postman.

### 2.3 Rutas REST expuestas y limpias

Se dejo el backend con estas rutas principales:

- `POST /api/v1/login/access-token`
- `POST /api/v1/admin/register`
- `GET /api/v1/admin/me`
- `GET /api/v1/municipios/me`
- `GET /api/v1/catalogos/regiones`
- `GET /api/v1/catalogos/comunas?region_id=1`
- `GET /api/v1/agricultores/`
- `POST /api/v1/agricultores/`
- `GET /api/v1/parcelas/`
- `POST /api/v1/parcelas/`
- `GET /api/v1/parcelas/{parcela_id}`
- `POST /api/v1/parcelas/{parcela_id}/recomendacion-riego`
- `GET /api/v1/clima/diario`
- `POST /api/v1/clima/diario/poligono`

### 2.4 Agricultores como entidad separada

Se mantuvo la separacion conceptual correcta:

- `Administrador` no "es" `Agricultor`;
- `Agricultor` sigue siendo entidad propia;
- el administrador solo tiene permisos para leer o crear agricultores dentro de su municipio.

Eso significa:

- la arquitectura conserva entidades separadas;
- el control de acceso queda del lado del backend;
- el dashboard municipal puede operar sobre agricultores sin mezclar identidades.

### 2.5 Consumo real de Open-Meteo

Se dejo operativo el consumo real desde backend usando `httpx` en:

- `app/services/clima_service.py`

Se exponen dos formas de consulta:

- por punto:
  `GET /api/v1/clima/diario?latitud=...&longitud=...`
- por poligono:
  `POST /api/v1/clima/diario/poligono`

El backend devuelve las variables mas relevantes para AguaSabia hoy:

- `et0_mm`
- `precipitacion_mm`
- `fecha`
- `latitud`
- `longitud`

### 2.6 Compatibilidad con Leaflet

Se dejo preparado el contrato de parcela para trabajar con geometria tipo mapa:

- `latitud`
- `longitud`
- `poligono_vertices`

Cuando se envian vertices:

- el backend calcula el centroide;
- guarda el poligono;
- usa el centroide para consultar Open-Meteo.

### 2.7 Limpieza de archivos fantasma

Se eliminaron archivos que generaban ruido o confusion:

- `app/api/api_v1/endpoints/auth.py`
- `app/api/api_v1/endpoints/public.py`
- `app/services/agronomico.py`
- `alembic/versions/f15febf7007d_baseline.py`

Estas eliminaciones se hicieron porque:

- no estaban en uso real;
- duplicaban logica;
- simulaban datos publicos que no representaban el comportamiento real;
- en el caso de Alembic, generaban revision duplicada y advertencias innecesarias.

## 3. Archivos mas importantes en esta iteracion

### Autenticacion y seguridad

- `Proyecto/backend/app/api/deps.py`
- `Proyecto/backend/app/api/api_v1/endpoints/login.py`
- `Proyecto/backend/app/api/api_v1/endpoints/admin.py`
- `Proyecto/backend/app/core/security.py`

### Clima y Open-Meteo

- `Proyecto/backend/app/api/api_v1/endpoints/clima.py`
- `Proyecto/backend/app/services/clima_service.py`

### Leaflet, parcelas y geometria

- `Proyecto/backend/app/api/api_v1/endpoints/parcelas.py`
- `Proyecto/backend/app/services/geometry.py`
- `Proyecto/backend/app/schemas/parcela.py`
- `Proyecto/backend/app/models/parcela.py`

### Logica agronomica base

- `Proyecto/backend/app/services/agronomy.py`
- `Proyecto/backend/app/models/balance_hidrico.py`

### Estructura general de API

- `Proyecto/backend/app/api/api_v1/api.py`
- `Proyecto/backend/app/main.py`

## 4. Paso a paso detallado para probar con Postman

## 4.0 Importar la coleccion lista

Tambien se dejo preparada una coleccion lista para importar en Postman:

- `Documentacion/postman/AguaSabia-Backend.postman_collection.json`

Variables incluidas en la coleccion:

- `baseUrl`
- `token`
- `municipioId`
- `agricultorId`
- `parcelaId`

Flujo recomendado dentro de la coleccion:

1. `Admin - Register` si quieres crear un admin nuevo.
2. `Login - Access Token` para guardar automaticamente el bearer token.
3. `Admin - Me` para validar que el token representa al administrador correcto.
4. `Clima - Diario por Punto` o `Clima - Diario por Poligono` para probar Open-Meteo desde el backend.
5. `Agricultores - Create` y luego `Parcelas - Create con Poligono` para preparar el flujo Leaflet/backend.

## 4.1 Preparacion previa

Abre una terminal dentro de:

```powershell
cd C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Proyecto\backend
```

Activa el entorno virtual:

```powershell
.\.venv\Scripts\activate
```

Aplica migraciones:

```powershell
python -m alembic upgrade head
```

Carga datos base:

```powershell
python scripts\seed.py
```

Levanta el backend:

```powershell
uvicorn app.main:app --reload
```

La API quedara disponible en:

```text
http://127.0.0.1:8000
```

La documentacion Swagger quedara en:

```text
http://127.0.0.1:8000/docs
```

## 4.2 Opcion A: usar el admin de prueba ya creado

El seed deja creado este admin:

- email: `admin@aguasabia.cl`
- password: `admin123`

Si quieres probar rapido, puedes saltar al paso de login.

## 4.3 Opcion B: registrar un admin nuevo desde Postman

### Request

- Metodo: `POST`
- URL:

```text
http://127.0.0.1:8000/api/v1/admin/register
```

- Body: `raw` + `JSON`

```json
{
  "nombre": "Admin Postman",
  "email": "admin.postman@example.com",
  "password": "admin12345",
  "municipio_id": 1
}
```

### Resultado esperado

- status `201 Created`

```json
{
  "nombre": "Admin Postman",
  "email": "admin.postman@example.com",
  "municipio_id": 1,
  "id": 2,
  "is_active": true
}
```

## 4.4 Obtener bearer token

### Request

- Metodo: `POST`
- URL:

```text
http://127.0.0.1:8000/api/v1/login/access-token
```

- Body: `x-www-form-urlencoded`

```text
username=admin.postman@example.com
password=admin12345
```

Si usas el admin del seed:

```text
username=admin@aguasabia.cl
password=admin123
```

### Resultado esperado

- status `200 OK`

```json
{
  "access_token": "TOKEN_AQUI",
  "token_type": "bearer"
}
```

Guarda ese `access_token`.

## 4.5 Validar token viendo al admin autenticado

### Request

- Metodo: `GET`
- URL:

```text
http://127.0.0.1:8000/api/v1/admin/me
```

- Header:

```text
Authorization: Bearer TU_TOKEN
```

### Resultado esperado

- status `200 OK`

```json
{
  "nombre": "Admin Postman",
  "email": "admin.postman@example.com",
  "municipio_id": 1,
  "id": 2,
  "is_active": true
}
```

Si esto responde bien, el token ya esta validando correctamente.

## 4.6 Ver el municipio del admin

### Request

- Metodo: `GET`
- URL:

```text
http://127.0.0.1:8000/api/v1/municipios/me
```

- Header:

```text
Authorization: Bearer TU_TOKEN
```

### Resultado esperado

```json
{
  "nombre": "Municipio Copiapó",
  "region_id": 1,
  "comuna_id": 1,
  "id": 1
}
```

## 4.7 Ver catalogos base

### Regiones

- Metodo: `GET`
- URL:

```text
http://127.0.0.1:8000/api/v1/catalogos/regiones
```

### Comunas por region

- Metodo: `GET`
- URL:

```text
http://127.0.0.1:8000/api/v1/catalogos/comunas?region_id=1
```

Esto sirve para alimentar selects del frontend.

## 4.8 Consumir Open-Meteo desde el backend por coordenada puntual

### Request

- Metodo: `GET`
- URL:

```text
http://127.0.0.1:8000/api/v1/clima/diario?latitud=-33.4489&longitud=-70.6693
```

### Resultado esperado

Ejemplo real validado:

```json
{
  "fecha": "2026-05-27",
  "latitud": -33.4489,
  "longitud": -70.6693,
  "et0_mm": 1.56,
  "precipitacion_mm": 0.0,
  "fuente": "Open-Meteo"
}
```

### Campos relevantes para AguaSabia

- `et0_mm`: evapotranspiracion de referencia
- `precipitacion_mm`: precipitacion diaria
- `fecha`: fecha del dato

Estos tres son clave para el motor de balance hidrico.

## 4.9 Consumir Open-Meteo desde el backend usando un poligono tipo Leaflet

### Request

- Metodo: `POST`
- URL:

```text
http://127.0.0.1:8000/api/v1/clima/diario/poligono
```

- Body: `raw` + `JSON`

```json
{
  "poligono_vertices": [
    { "latitud": -33.45, "longitud": -70.66 },
    { "latitud": -33.45, "longitud": -70.65 },
    { "latitud": -33.46, "longitud": -70.65 },
    { "latitud": -33.46, "longitud": -70.66 }
  ]
}
```

### Resultado esperado

Ejemplo real validado:

```json
{
  "fecha": "2026-05-27",
  "latitud": -33.455000028149335,
  "longitud": -70.65500005942506,
  "et0_mm": 1.56,
  "precipitacion_mm": 0.0,
  "fuente": "Open-Meteo",
  "centroide": {
    "latitud": -33.455000028149335,
    "longitud": -70.65500005942506
  }
}
```

### Que esta pasando aqui

- Postman manda vertices como lo haria Leaflet.
- El backend calcula el centroide.
- Usa ese centroide para consultar Open-Meteo.
- Devuelve clima + centroide.

Ese es el flujo correcto para el frontend futuro.

## 4.10 Crear un agricultor

### Request

- Metodo: `POST`
- URL:

```text
http://127.0.0.1:8000/api/v1/agricultores/
```

- Header:

```text
Authorization: Bearer TU_TOKEN
```

- Body: `raw` + `JSON`

```json
{
  "nombre": "Agricultor Uno",
  "email": "agricultor.uno@example.com",
  "password": "campo123"
}
```

### Resultado esperado

- status `201 Created`

```json
{
  "nombre": "Agricultor Uno",
  "email": "agricultor.uno@example.com",
  "is_active": true,
  "id": 1,
  "municipio_id": 1
}
```

## 4.11 Listar agricultores

### Request

- Metodo: `GET`
- URL:

```text
http://127.0.0.1:8000/api/v1/agricultores/
```

- Header:

```text
Authorization: Bearer TU_TOKEN
```

Este endpoint devuelve agricultores del municipio del admin autenticado.

## 4.12 Crear una parcela lista para Leaflet

### Request

- Metodo: `POST`
- URL:

```text
http://127.0.0.1:8000/api/v1/parcelas/
```

- Header:

```text
Authorization: Bearer TU_TOKEN
```

- Body: `raw` + `JSON`

```json
{
  "nombre": "Parcela Leaflet",
  "agricultor_id": 1,
  "comuna_id": 1,
  "superficie": 1.2,
  "tipo_cultivo": "maiz",
  "poligono_vertices": [
    { "latitud": -33.45, "longitud": -70.66 },
    { "latitud": -33.45, "longitud": -70.65 },
    { "latitud": -33.46, "longitud": -70.65 },
    { "latitud": -33.46, "longitud": -70.66 }
  ]
}
```

### Resultado esperado

- status `201 Created`
- el backend devuelve tambien:

```json
{
  "latitud": -33.455000028149335,
  "longitud": -70.65500005942506
}
```

Eso significa que el centroide fue calculado correctamente.

## 5. Resumen de integracion futura: satelites, APIs, Leaflet y stack

## 5.1 Como se integrara Leaflet

Leaflet sera la pieza del frontend para:

- mostrar mapas;
- dibujar parcelas;
- capturar vertices del poligono;
- calcular o mostrar el centroide;
- enviar al backend la geometria del predio.

El backend ya esta preparado para recibir:

```json
{
  "poligono_vertices": [
    { "latitud": ..., "longitud": ... }
  ]
}
```

Esto permite que la experiencia futura sea:

1. el admin abre el mapa;
2. dibuja la parcela;
3. Leaflet entrega los vertices;
4. el backend calcula centroide;
5. el backend consulta Open-Meteo y luego SoilGrids;
6. el sistema calcula riego.

## 5.2 Como se integrara Open-Meteo

Open-Meteo ya esta integrado hoy para:

- `et0_fao_evapotranspiration`
- `precipitation_sum`

Luego se puede ampliar para:

- temperatura maxima y minima;
- humedad relativa;
- viento;
- pronostico para incendios;
- mas de un dia de proyeccion.

## 5.3 Como se integrara SoilGrids

SoilGrids aun no esta conectado, pero su rol sera:

- recibir el centroide de la parcela;
- devolver propiedades del suelo;
- estimar `theta_fc` y `theta_wp`;
- alimentar `TAW` y `RAW`.

Hoy esa parte esta considerada, pero no implementada todavia.

## 5.4 Como se integraran satelites

La integracion satelital futura tendra dos objetivos:

- validar estado real del cultivo;
- agregar inteligencia territorial al municipio.

Tecnologias candidatas:

- Sentinel-2
- Copernicus
- MODIS
- GOES

Indices esperados:

- NDVI para vigor vegetativo
- NDWI para estres hidrico

Flujo futuro:

1. se toma geometria del predio;
2. se consulta imagen satelital por poligono y fecha;
3. se calculan indices;
4. se cruza con ET0, lluvia y balance hidrico;
5. se ajusta o valida la recomendacion de riego.

## 5.5 Stack tecnologico completo

### Lo que ya se usa hoy

- `FastAPI`: framework web
- `Uvicorn`: servidor ASGI
- `SQLAlchemy`: ORM
- `Alembic`: migraciones
- `PostgreSQL`: base de datos
- `Pydantic`: validacion de datos
- `JWT`: autenticacion
- `Passlib`: hash de contrasenas
- `httpx`: consumo HTTP async
- `Open-Meteo`: API externa de clima

### Lo que ya esta considerado pero aun no esta integrado del todo

- `Redis`: cache y cola
- `Celery`: tareas asincronas
- `Leaflet`: geometria y captura de mapas en frontend
- `SoilGrids`: propiedades de suelo
- `Sentinel-2 / Copernicus / MODIS / GOES`: validacion satelital
- `WhatsApp / Meta Graph API`: notificaciones
- `React + Vite`: dashboard frontend

## 6. Codigo importante para entender la logica

## 6.1 Crear proyecto FastAPI

La base del proyecto parte en:

- `app/main.py`
- `app/api/api_v1/api.py`

`main.py` crea la app y monta las rutas.

`api.py` agrupa los routers y define la API expuesta.

## 6.2 Login y token

Archivos clave:

- `app/api/api_v1/endpoints/login.py`
- `app/api/deps.py`
- `app/core/security.py`

Flujo:

1. el admin envia email y password;
2. el backend valida hash;
3. genera JWT;
4. Postman usa `Authorization: Bearer ...`;
5. `get_current_admin` resuelve al administrador autenticado.

## 6.3 Consumo de APIs

Archivo clave:

- `app/services/clima_service.py`

Ese archivo:

- construye parametros;
- llama a Open-Meteo;
- extrae `et0` y precipitacion;
- devuelve un JSON limpio listo para la API.

## 6.4 Logica agronomica

Archivo clave:

- `app/services/agronomy.py`

Hoy ahi vive la primera base del calculo:

- `ETc`
- `TAW`
- `RAW`
- `deficit_hidrico`
- `riego_sugerido_mm`
- `litros_recomendados`
- `estado_hidrico`

## 6.5 Geometria de parcela

Archivo clave:

- `app/services/geometry.py`

Ese archivo:

- recibe vertices;
- calcula centroide;
- deja listo el punto de consulta para clima y luego suelo.

## 7. Estado actual real del backend

Hoy el backend ya esta en un punto util para Postman:

- registro de admin: listo
- login de admin: listo
- validacion de token: lista
- `admin/me`: listo
- `municipios/me`: listo
- catalogos: listos
- crear y listar agricultores: listo
- crear parcelas con poligono Leaflet: listo
- consumir Open-Meteo desde backend: listo
- calcular centroide de poligono: listo

Lo que falta para una siguiente etapa:

- integrar SoilGrids;
- endurecer mas validaciones territoriales;
- ampliar CRUD completo;
- conectar frontend React;
- automatizar notificaciones;
- integrar satelites.
