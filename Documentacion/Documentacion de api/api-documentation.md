# Documentacion de API REST - AguaSabia

## Informacion general

| Campo | Valor |
|---|---|
| URL local | `http://127.0.0.1:8000` |
| Prefijo API | `/api/v1` |
| Swagger | `http://127.0.0.1:8000/docs` |
| ReDoc | `http://127.0.0.1:8000/redoc` |
| Formato principal | JSON |

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

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/api/v1/login/access-token` | Login de administrador interno. |
| `POST` | `/api/v1/admin/register` | Registro de administrador interno. |
| `GET` | `/api/v1/admin/me` | Ver administrador autenticado. |

### Usuarios

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/api/v1/usuarios/register` | Registrar usuario basico. |
| `POST` | `/api/v1/usuarios/login` | Login de usuario. |
| `GET` | `/api/v1/usuarios/me` | Ver usuario autenticado. |

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

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/api/v1/territorio/regiones` | Listar regiones. |
| `GET` | `/api/v1/territorio/comunas?region_id=1` | Listar comunas. |
| `POST` | `/api/v1/territorio/consultas/analizar` | Analizar un poligono. |
| `GET` | `/api/v1/territorio/consultas` | Listar consultas guardadas del usuario. |
| `GET` | `/api/v1/territorio/consultas/{id}` | Ver consulta guardada. |

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

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/api/v1/clima/diario?latitud=-33.4489&longitud=-70.6693` | Clima diario por punto. |
| `POST` | `/api/v1/clima/poligono` | Clima diario por centroide de poligono. |

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

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/api/v1/agua/poligono` | Lectura hidrica explicativa por poligono. |

El modulo usa datos climaticos disponibles y entrega explicacion, estado y datos basicos. No entrega recomendaciones automaticas de riego.

### Vegetacion

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/api/v1/vegetacion/poligono` | Contrato preparado para NDVI/cobertura vegetal. |

Mientras no exista integracion satelital real, el modulo debe responder como `pendiente` y no inventar datos.

### Riesgos

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/api/v1/riesgos/poligono` | Contrato preparado para incendios, sequia y deficit hidrico. |

Mientras no existan capas externas conectadas, el modulo debe indicar estado pendiente o informativo.

## Codigos HTTP esperados

| Codigo | Uso |
|---|---|
| `200` | Consulta exitosa. |
| `201` | Recurso creado. |
| `400` | Credenciales invalidas o entidad inactiva. |
| `401` | Falta autenticacion. |
| `403` | Usuario sin permiso. |
| `404` | Recurso no encontrado. |
| `422` | Entrada invalida, coordenadas fuera de rango o poligono insuficiente. |
| `502` | Respuesta externa incompleta o rechazada. |
| `503` | API externa no disponible. |

## Endpoints legacy

Los endpoints de agricultores, parcelas, balances y recomendacion de riego quedan como legado tecnico de etapas anteriores. No deben presentarse como flujo principal de AguaSabia en el Estado de avance 3.
