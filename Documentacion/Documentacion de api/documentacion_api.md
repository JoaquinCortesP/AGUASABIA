# Documentacion de API REST - AguaSabia

## Informacion general

| Campo             | Valor                           |
| ----------------- | ------------------------------- |
| URL local         | `http://127.0.0.1:8000`       |
| Prefijo API       | `/api/v1`                     |
| Swagger           | `http://127.0.0.1:8000/docs`  |
| ReDoc             | `http://127.0.0.1:8000/redoc` |
| Formato principal | JSON                            |

## Autenticacion

Los endpoints protegidos usan bearer token:

```http
Authorization: Bearer <token>
```

Existen dos tipos de autenticacion:

- Administrador interno: `POST /api/v1/login/access-token`
- Usuario de plataforma: `POST /api/v1/usuarios/login`

## Endpoints principales

### Administracion interna

| Metodo   | Ruta                           | Uso                                |
| -------- | ------------------------------ | ---------------------------------- |
| `POST` | `/api/v1/login/access-token` | Login de administrador interno.    |
| `POST` | `/api/v1/admin/register`     | Registro de administrador interno. |
| `GET`  | `/api/v1/admin/me`           | Ver administrador autenticado.     |

### Usuarios

| Metodo   | Ruta                          | Uso                       |
| -------- | ----------------------------- | ------------------------- |
| `POST` | `/api/v1/usuarios/register` | Registrar usuario basico. |
| `POST` | `/api/v1/usuarios/login`    | Login de usuario.         |
| `GET`  | `/api/v1/usuarios/me`       | Ver usuario autenticado.  |
| `POST` | `/api/v1/usuarios/verify-email`| Verificar correo del usuario. |

Ejemplo registro:

```json
{
  "nombre": "Usuario Prueba",
  "email": "usuario.prueba@aguasabia.cl",
  "password": "usuario123"
}
```

Ejemplo login:

```json
{
  "email": "usuario.prueba@aguasabia.cl",
  "password": "usuario123"
}
```

### Territorio

| Metodo   | Ruta                                       | Uso                                     |
| -------- | ------------------------------------------ | --------------------------------------- |
| `GET`  | `/api/v1/territorio/regiones`            | Listar regiones.                        |
| `GET`  | `/api/v1/territorio/comunas?region_id=1` | Listar comunas.                         |
| `POST` | `/api/v1/territorio/consultas/analizar`  | Analizar un poligono.                   |
| `GET`  | `/api/v1/territorio/consultas`           | Listar consultas guardadas del usuario. |
| `GET`  | `/api/v1/territorio/consultas/{id}`      | Ver consulta guardada.                  |

Request principal:

```json
{
  "poligono": [
    { "latitud": -33.4480, "longitud": -70.6700 },
    { "latitud": -33.4480, "longitud": -70.6680 },
    { "latitud": -33.4500, "longitud": -70.6680 },
    { "latitud": -33.4500, "longitud": -70.6700 }
  ],
  "modo": "resumen",
  "guardar": false,
  "modulos": ["agua", "clima", "territorio", "vegetacion", "riesgos"]
}
```

Respuesta esperada:

```json
{
  "consulta_id": null,
  "guardada": false,
  "modo": "resumen",
  "modo_avanzado_disponible": true,
  "modo_avanzado_habilitado": false,
  "requiere_plan_pago": false,
  "area": {
    "centroide": {
      "latitud": -33.449,
      "longitud": -70.669
    },
    "bbox": {
      "min_latitud": -33.45,
      "min_longitud": -70.67,
      "max_latitud": -33.448,
      "max_longitud": -70.668
    },
    "superficie_aprox_ha": 4.0
  },
  "resumen_general": "Texto explicativo de la zona seleccionada.",
  "modulos": {
    "agua": {
      "estado": "informativo",
      "titulo": "Lectura hidrica inicial",
      "explicacion": "Texto simple para el usuario.",
      "datos": {},
      "fuentes": [],
      "avanzado": {},
      "avanzado_restringido": true
    }
  }
}
```

### Clima

| Metodo   | Ruta                                                        | Uso                                     |
| -------- | ----------------------------------------------------------- | --------------------------------------- |
| `GET`  | `/api/v1/clima/diario?latitud=-33.4489&longitud=-70.6693` | Clima diario por punto.                 |
| `POST` | `/api/v1/clima/poligono`                                  | Clima diario por centroide de poligono. |

Respuesta:

```json
{
  "fecha": "2026-06-08",
  "latitud": -33.4489,
  "longitud": -70.6693,
  "et0_mm": 1.5,
  "precipitacion_mm": 0.0,
  "fuente": "Open-Meteo"
}
```

### Agua

| Metodo   | Ruta                      | Uso                                       |
| -------- | ------------------------- | ----------------------------------------- |
| `POST` | `/api/v1/agua/poligono` | Lectura hidrica explicativa por poligono. |

El modulo usa datos climaticos disponibles y entrega explicacion, estado y datos basicos. No entrega recomendaciones automaticas de riego.

### Vegetacion

| Metodo   | Ruta                            | Uso                                             |
| -------- | ------------------------------- | ----------------------------------------------- |
| `POST` | `/api/v1/vegetacion/poligono` | Contrato preparado para NDVI/cobertura vegetal. |

Mientras no exista integracion satelital real, el modulo debe responder como `pendiente` y no inventar datos.

### Riesgos

| Metodo   | Ruta                         | Uso                                                          |
| -------- | ---------------------------- | ------------------------------------------------------------ |
| `POST` | `/api/v1/riesgos/poligono` | Contrato preparado para incendios, sequia y deficit hidrico. |

Mientras no existan capas externas conectadas, el modulo debe indicar estado pendiente o informativo.

## Codigos HTTP esperados

| Codigo  | Uso                                                                   |
| ------- | --------------------------------------------------------------------- |
| `200` | Consulta exitosa.                                                     |
| `201` | Recurso creado.                                                       |
| `400` | Credenciales invalidas o entidad inactiva.                            |
| `401` | Falta autenticacion.                                                  |
| `403` | Usuario sin permiso (ej. requiere plan avanzado) o cuenta no verificada. |
| `404` | Recurso no encontrado.                                                |
| `422` | Entrada invalida, coordenadas fuera de rango o poligono insuficiente. |
| `502` | Respuesta externa incompleta o rechazada.                             |
| `503` | API externa no disponible.                                            |

## Ingesta y Sincronización Externa (DGA / MOP)

| Metodo   | Ruta                                 | Uso                                                                                             |
| -------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `POST` | `/api/v1/ingest/red-hidrometrica` | Inicia el pipeline asíncrono que descarga las estaciones desde ArcGIS Server (SIT-MOP) a la BD. |

Este endpoint devuelve un código `202 Accepted` de inmediato mientras el proceso corre en segundo plano (`BackgroundTasks`) con backoff exponencial.

## 🚀 Guía de Uso Rápido con Postman

Para facilitar las pruebas de la API sin necesidad de escribir código cliente, el proyecto incluye una colección de Postman pre-configurada.

### Paso 1: Importar la Colección
1. Abre **Postman**.
2. Haz clic en el botón **Import** (arriba a la izquierda).
3. Selecciona el archivo que se encuentra en el repositorio del proyecto:
   `Documentacion/postman/AguaSabia-Backend.postman_collection.json`
*(Nota: Si no tienes el archivo a mano, puedes crear solicitudes manuales apuntando a `http://127.0.0.1:8000/api/v1/...`)*

### Paso 2: Autenticación (Tokens JWT)
La gran mayoría de los endpoints de lectura avanzada o de guardado requieren que el usuario inicie sesión.
1. Ejecuta el endpoint `POST /api/v1/usuarios/login` (o `/api/v1/usuarios/register` si aún no tienes cuenta). En el body tipo JSON envía el `email` y `password`.
2. La respuesta contendrá un `access_token` (un texto largo cifrado).
3. Copia ese token.
4. Para las siguientes peticiones (por ejemplo, ver consultas guardadas), ve a la pestaña **Authorization** en Postman, elige el tipo **Bearer Token** y pega el token en la caja.

### Paso 3: Probar Endpoints Geoespaciales
La API acepta y entrega datos espaciales nativos gracias a PostGIS.
Para probar `/api/v1/territorio/consultas/analizar`, asegúrate de configurar tu petición así:
- **Método**: `POST`
- **URL**: `http://localhost:8000/api/v1/territorio/consultas/analizar`
- **Headers**: `Content-Type: application/json`
- **Body**: (Selecciona *raw* y pega el JSON de ejemplo que vimos arriba en la sección Territorio).

### Paso 4: Probar la Ingesta del MOP
Puedes disparar la descarga de las estaciones de la DGA directamente enviando un `POST` vacío a `http://localhost:8000/api/v1/ingest/red-hidrometrica`. Revisa la consola donde está corriendo Uvicorn para ver los logs en vivo de la descarga asíncrona.

## Endpoints legacy

Los endpoints de agricultores, parcelas, balances y recomendacion de riego quedan como legado tecnico de etapas anteriores.
