# Documentación de API REST - AguaSabia

## 1. Información General

**URL Base**: `http://localhost:8000`  
**API Prefix**: `/api/v1`  
**Versión de API**: 1.0  
**Autenticación**: OAuth2 con JWT  
**Documentación Interactiva**: `http://localhost:8000/docs` (Swagger UI)

---

## 2. Endpoints de Autenticación

### 2.1 Login

**Endpoint**: `POST /api/v1/auth/login`

**Descripción**: Autentica un usuario agricultor y retorna un token JWT.

**Headers Requeridos**: Ninguno (OAuth2PasswordRequestForm)

**Request Body** (Form Data):
```
username: string (email del agricultor)
password: string (contraseña en texto plano)
```

**Response (200 - OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response (401 - Unauthorized)**:
```json
{
  "detail": "Incorrect email or password"
}
```

**Códigos HTTP**:
- `200 OK` - Autenticación exitosa
- `401 Unauthorized` - Credenciales inválidas
- `422 Unprocessable Entity` - Datos de entrada inválidos

**Ejemplo cURL**:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=juan@example.com&password=mi_contraseña"
```

**Ejemplo Python**:
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    data={
        "username": "juan@example.com",
        "password": "mi_contraseña"
    }
)

token = response.json()["access_token"]
```

**Notas**:
- Retorna token JWT que expira en 11,520 minutos (8 días)
- Token debe incluirse en header `Authorization: Bearer <token>` en próximas requests
- Actualmente solo retorna tokens simulados

---

## 3. Endpoints de Parcelas

### 3.1 Listar Parcelas

**Endpoint**: `GET /api/v1/parcelas/`

**Descripción**: Obtiene la lista de todas las parcelas registradas.

**Autenticación**: Token JWT requerido (Bearer Token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**: Ninguno

**Response (200 - OK)**:
```json
[]
```

**Códigos HTTP**:
- `200 OK` - Listado obtenido exitosamente
- `401 Unauthorized` - Token no válido o ausente
- `403 Forbidden` - Permisos insuficientes

**Ejemplo cURL**:
```bash
curl -X GET "http://localhost:8000/api/v1/parcelas/" \
  -H "Authorization: Bearer <access_token>"
```

**Notas**:
- Actualmente retorna lista vacía
- Estructura esperada: Array de objetos Parcela

---

### 3.2 Crear Parcela

**Endpoint**: `POST /api/v1/parcelas/`

**Descripción**: Crea una nueva parcela para un agricultor.

**Autenticación**: Token JWT requerido

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "nombre": "Parcela Norte",
  "latitud": 13.6929,
  "longitud": -89.2182,
  "area": 2.5,
  "cultivo": "Maíz",
  "agricultor_id": 1
}
```

**Response (201 - Created)**:
```json
{
  "id": 1,
  "nombre": "Parcela Norte",
  "latitud": 13.6929,
  "longitud": -89.2182,
  "area": 2.5,
  "cultivo": "Maíz",
  "agricultor_id": 1
}
```

**Códigos HTTP**:
- `201 Created` - Parcela creada exitosamente
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - Token no válido
- `422 Unprocessable Entity` - Validación Pydantic fallida

**Validaciones**:
- `nombre` (required): string no vacío
- `latitud` (required): float entre -90 y 90
- `longitud` (required): float entre -180 y 180
- `area` (required): float positivo
- `cultivo` (required): string no vacío
- `agricultor_id` (required): int que existe en tabla agricultores

**Ejemplo cURL**:
```bash
curl -X POST "http://localhost:8000/api/v1/parcelas/" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Parcela Norte",
    "latitud": 13.6929,
    "longitud": -89.2182,
    "area": 2.5,
    "cultivo": "Maíz",
    "agricultor_id": 1
  }'
```

**Notas**:
- Las coordenadas se usan para consultas climáticas
- El área está en hectáreas
- El cultivo determina coeficientes de evapotranspiración

---

## 4. Endpoints de Balance Hídrico

### 4.1 Obtener Balance Hídrico

**Endpoint**: `GET /api/v1/balances/`

**Descripción**: Obtiene datos de balance hídrico.

**Autenticación**: Token JWT requerido

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
```
parcela_id: integer (opcional)
fecha: date (opcional, formato: YYYY-MM-DD)
```

**Response (200 - OK)**:
```json
{
  "et_o": 5.5,
  "balance": 4.4
}
```

**Códigos HTTP**:
- `200 OK` - Balance obtenido
- `400 Bad Request` - Parámetros inválidos
- `401 Unauthorized` - Token no válido
- `404 Not Found` - Parcela no existe

**Ejemplo cURL**:
```bash
curl -X GET "http://localhost:8000/api/v1/balances/?parcela_id=1&fecha=2024-05-13" \
  -H "Authorization: Bearer <access_token>"
```

**Notas**:
- ET_o (Evapotranspiración de Referencia) en mm/día
- Balance en mm/día
- Actualmente retorna datos simulados

---

## 5. Endpoints de Clima

### 5.1 Obtener Clima Actual

**Endpoint**: `GET /api/v1/clima/actual`

**Descripción**: Obtiene datos climáticos actuales simulados.

**Autenticación**: Token JWT requerido

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
```
latitud: float (requerido)
longitud: float (requerido)
```

**Response (200 - OK)**:
```json
{
  "temperatura": 20.0,
  "humedad": 50.0,
  "precipitacion": 0.0,
  "velocidad_viento": 5.0
}
```

**Códigos HTTP**:
- `200 OK` - Datos climáticos obtenidos
- `400 Bad Request` - Coordenadas inválidas
- `401 Unauthorized` - Token no válido
- `503 Service Unavailable` - API clima no disponible

**Validaciones**:
- `latitud`: float entre -90 y 90
- `longitud`: float entre -180 y 180

**Ejemplo cURL**:
```bash
curl -X GET "http://localhost:8000/api/v1/clima/actual?latitud=13.6929&longitud=-89.2182" \
  -H "Authorization: Bearer <access_token>"
```

**Integraciones Futuras**:
- Open-Meteo API (comentada en código)
- Coordenadas se envían a servicio climático externo

**Notas**:
- Actualmente retorna datos simulados
- En producción, integra con servicio climático real

---

## 6. Estructura de Respuestas

### 6.1 Respuesta Exitosa (2xx)

```json
{
  "id": 1,
  "nombre": "Parcela Norte",
  "latitud": 13.6929,
  "longitud": -89.2182,
  "area": 2.5,
  "cultivo": "Maíz",
  "agricultor_id": 1
}
```

### 6.2 Respuesta de Error (4xx/5xx)

```json
{
  "detail": "Descripción del error",
  "status_code": 400,
  "timestamp": "2024-05-13T10:30:00Z"
}
```

### 6.3 Errores de Validación (422)

```json
{
  "detail": [
    {
      "loc": ["body", "latitud"],
      "msg": "ensure this value is less than or equal to 90",
      "type": "value_error.number.not_le"
    }
  ]
}
```

---

## 7. Autenticación y Autorización

### 7.1 Flujo OAuth2

```
1. Usuario envía credentials (email + password)
   ↓
2. Backend verifica contra hash en BD
   ↓
3. Si válido, genera JWT token con SECRET_KEY
   ↓
4. Cliente almacena token
   ↓
5. En próximas requests, envía: Authorization: Bearer <token>
   ↓
6. Backend valida JWT y procesa request
```

### 7.2 Token JWT

**Estructura**: `<header>.<payload>.<signature>`

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "sub": "juan@example.com",
  "exp": 1715598600,
  "iat": 1715510200
}
```

**Signature**: HMAC-SHA256(SECRET_KEY)

### 7.3 Incluir Token en Requests

**Option 1: Header Authorization**
```bash
curl -X GET "http://localhost:8000/api/v1/parcelas/" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Option 2: JavaScript/Fetch**
```javascript
fetch("http://localhost:8000/api/v1/parcelas/", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
```

**Option 3: Python/Requests**
```python
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/api/v1/parcelas/", headers=headers)
```

---

## 8. Códigos HTTP Usados

| Código | Significado | Caso de Uso |
|--------|-------------|-----------|
| `200` | OK | Request exitoso, retorna datos |
| `201` | Created | Recurso creado exitosamente |
| `204` | No Content | Request exitoso, sin contenido |
| `400` | Bad Request | Parámetros inválidos |
| `401` | Unauthorized | Token no válido, expirado o ausente |
| `403` | Forbidden | Usuario no tiene permisos |
| `404` | Not Found | Recurso no existe |
| `422` | Unprocessable Entity | Error de validación Pydantic |
| `500` | Internal Server Error | Error en servidor |
| `503` | Service Unavailable | Servicio externo no disponible |

---

## 9. Rate Limiting

**Estado**: No implementado actualmente

**Futuro**: Se recomienda implementar rate limiting por:
- IP address
- User ID
- API key

---

## 10. Pagination

**Estado**: No implementado actualmente

**Futuro**: GET /api/v1/parcelas/?skip=0&limit=10

---

## 11. Versionado de API

**Versión Actual**: v1

**Esquema de URLs**:
- `/api/v1/...` - Endpoints V1

**Cambios de versión**: Se crearán nuevas rutas `/api/v2/...` si hay cambios incompatibles

---

## 12. CORS (Cross-Origin Resource Sharing)

**Orígenes Permitidos** (desde .env):
```
http://localhost:3000
http://localhost:8080
```

**Métodos Permitidos**: GET, POST, PUT, DELETE, OPTIONS

**Headers Permitidos**: *

---

## 13. Ejemplo de Flujo Completo

### 13.1 Caso de Uso: Usuario se Registra y Crea Parcela

```
1. Registrar Usuario (NO EXISTE ENDPOINT YET)
   POST /api/v1/auth/register
   Body: { nombre, email, password, municipio_id }
   
2. Login
   POST /api/v1/auth/login
   Body: { username: email, password }
   Response: { access_token, token_type }
   
3. Crear Parcela
   POST /api/v1/parcelas/
   Header: Authorization: Bearer <token>
   Body: { nombre, latitud, longitud, area, cultivo, agricultor_id }
   Response: { id, nombre, ... }
   
4. Obtener Clima
   GET /api/v1/clima/actual?latitud=13.6929&longitud=-89.2182
   Header: Authorization: Bearer <token>
   Response: { temperatura, humedad, ... }
   
5. Obtener Balance Hídrico
   GET /api/v1/balances/?parcela_id=1
   Header: Authorization: Bearer <token>
   Response: { et_o, balance }
```

---

## 14. Endpoints Faltantes

**Nota**: Los siguientes endpoints no están implementados:

- ✗ `POST /api/v1/auth/register` - Registrar nuevo agricultor
- ✗ `GET /api/v1/agricultores/{id}` - Obtener detalles de agricultor
- ✗ `PUT /api/v1/agricultores/{id}` - Actualizar agricultor
- ✗ `DELETE /api/v1/agricultores/{id}` - Eliminar agricultor
- ✗ `GET /api/v1/parcelas/{id}` - Obtener parcela específica
- ✗ `PUT /api/v1/parcelas/{id}` - Actualizar parcela
- ✗ `DELETE /api/v1/parcelas/{id}` - Eliminar parcela
- ✗ `POST /api/v1/balances/` - Crear balance hídrico
- ✗ `GET /api/v1/balances/{id}` - Obtener balance específico
- ✗ `GET /api/v1/municipios/` - Listar municipios

---

## 15. Testing de Endpoints

### 15.1 Usando Swagger UI

```
1. Ir a http://localhost:8000/docs
2. Click en endpoint
3. Click "Try it out"
4. Llenar parámetros
5. Click "Execute"
```

### 15.2 Usando Postman

```
1. Importar colección desde Swagger:
   GET http://localhost:8000/openapi.json
   
2. O crear request manualmente:
   - Method: GET
   - URL: http://localhost:8000/api/v1/parcelas/
   - Headers: Authorization: Bearer <token>
```

### 15.3 Usando curl

Ver ejemplos en cada sección de endpoint.

---

## 16. Resumen General

**Endpoints Implementados**: 4 (login, parcelas list/create, balances, clima)

**Autenticación**: OAuth2 con JWT

**Estado**: Beta/Desarrollo

**Documentación**: Auto-generada en `/docs`

Esta API es funcional para operaciones básicas de lectura. Se requiere implementar endpoints CRUD completos para producción.
