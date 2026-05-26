# Documentación de API REST - AguaSabia

Esta documentación describe detalladamente los endpoints HTTP disponibles en el backend de AguaSabia, incluyendo los parámetros requeridos, esquemas de entrada y salida, autenticación y códigos de respuesta.

---

## 1. Información General

- **URL Base**: `http://localhost:8000`
- **Prefijo de API**: `/api/v1`
- **Autenticación**: OAuth2 con JWT (JSON Web Tokens)
- **Documentación Interactiva (Swagger)**: `http://localhost:8000/docs`
- **Documentación Alternativa (ReDoc)**: `http://localhost:8000/redoc`

---

## 2. Autenticación y Seguridad

Todos los endpoints protegidos requieren que se envíe el token JWT en las cabeceras de la petición en el siguiente formato:

```http
Authorization: Bearer <token_jwt>
```

---

## 3. Endpoints Disponibles

### 3.1 Obtención de Token de Acceso (Login)

Autentica a un agricultor mediante su email y contraseña, retornando un token JWT.

- **Método**: `POST`
- **Ruta**: `/api/v1/login/access-token`
- **Cabeceras**: `Content-Type: application/x-www-form-urlencoded`
- **Request Body (Form Data)**:
  - `username` (string, obligatorio): Email del agricultor (ej: `juan@example.com`).
  - `password` (string, obligatorio): Contraseña en texto plano.

#### Respuestas:

##### 🟢 200 OK (Inicio de sesión exitoso)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

##### 🔴 400 Bad Request (Credenciales incorrectas)
```json
{
  "detail": "Email o contraseña incorrectos"
}
```

##### 🔴 422 Unprocessable Entity (Datos faltantes o inválidos)
```json
{
  "detail": [
    {
      "loc": ["body", "username"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Ejemplo cURL:
```bash
curl -X POST "http://localhost:8000/api/v1/login/access-token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=juan@example.com&password=mi_contraseña_secreta"
```

---

### 3.2 Gestión de Parcelas

#### 3.2.1 Listar Parcelas
Obtiene las parcelas asociadas exclusivamente al agricultor autenticado.

- **Método**: `GET`
- **Ruta**: `/api/v1/parcelas/`
- **Autenticación**: Requerida (Bearer Token).
- **Parámetros de Consulta (Query Params)**:
  - `skip` (integer, opcional, por defecto `0`): Número de registros a saltar.
  - `limit` (integer, opcional, por defecto `100`): Límite de registros a retornar.

##### Respuestas:

##### 🟢 200 OK (Listado de parcelas obtenido)
```json
[
  {
    "id": 1,
    "nombre": "Huerto Norte",
    "agricultor_id": 2,
    "comuna_id": 15,
    "latitud": -33.456,
    "longitud": -70.648,
    "superficie": 4.5,
    "tipo_cultivo": "Paltos"
  }
]
```

##### 🔴 401 Unauthorized (Token ausente o inválido)
```json
{
  "detail": "Not authenticated"
}
```

##### 🔴 403 Forbidden (Token no válido para el usuario)
```json
{
  "detail": "No se pudo validar las credenciales"
}
```

---

#### 3.2.2 Crear Parcela
Registra una nueva parcela para el agricultor conectado.

- **Método**: `POST`
- **Ruta**: `/api/v1/parcelas/`
- **Autenticación**: Requerida (Bearer Token).
- **Cabeceras**: `Content-Type: application/json`
- **Request Body (JSON)**:
  - `nombre` (string, obligatorio): Nombre identificativo de la parcela.
  - `comuna_id` (integer, obligatorio): ID de la comuna (debe existir en la base de datos).
  - `agricultor_id` (integer, obligatorio): ID del agricultor dueño de la parcela (debe coincidir con el usuario actual o estar autorizado).
  - `latitud` (float, opcional): Coordenada latitud.
  - `longitud` (float, opcional): Coordenada longitud.
  - `superficie` (float, opcional): Superficie de la parcela en hectáreas.
  - `tipo_cultivo` (string, opcional): Tipo de cultivo plantado (ej: `Duraznos`, `Uva de mesa`).

##### Ejemplo de Body:
```json
{
  "nombre": "Parcela El Molino",
  "comuna_id": 5,
  "agricultor_id": 1,
  "latitud": -30.032,
  "longitud": -70.701,
  "superficie": 2.8,
  "tipo_cultivo": "Limones"
}
```

##### Respuestas:

##### 🟢 201 Created (Parcela creada exitosamente)
```json
{
  "id": 5,
  "nombre": "Parcela El Molino",
  "comuna_id": 5,
  "agricultor_id": 1,
  "latitud": -30.032,
  "longitud": -70.701,
  "superficie": 2.8,
  "tipo_cultivo": "Limones"
}
```

##### 🔴 401 Unauthorized (Token no provisto)
```json
{
  "detail": "Not authenticated"
}
```

##### 🔴 422 Unprocessable Entity (Validación fallida en campos de entrada)
```json
{
  "detail": [
    {
      "loc": ["body", "nombre"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

### 3.3 Gestión de Balances Hídricos

#### 3.3.1 Consultar Balances Hídricos de una Parcela
Obtiene los registros históricos de balance hídrico calculados para una parcela en particular.

- **Método**: `GET`
- **Ruta**: `/api/v1/balances/`
- **Autenticación**: Requerida (Bearer Token).
- **Parámetros de Consulta (Query Params)**:
  - `parcela_id` (integer, **obligatorio**): ID de la parcela a consultar.
  - `skip` (integer, opcional, por defecto `0`): Paginación de registros.
  - `limit` (integer, opcional, por defecto `100`): Límite de registros a retornar.

##### Respuestas:

##### 🟢 200 OK (Listado de balances obtenido)
```json
[
  {
    "id": 12,
    "parcela_id": 5,
    "fecha": "2026-05-25",
    "evapotranspiracion": 4.8,
    "precipitacion": 0.0,
    "riego_sugerido": 3.2,
    "humedad_suelo": 24.5
  }
]
```

##### 🔴 400 Bad Request (Falta el parámetro parcela_id)
FastAPI lanzará un error de validación de tipo 422 en su lugar por parámetro ausente.

##### 🔴 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

---

#### 3.3.2 Registrar Nuevo Balance Hídrico
Crea un registro de balance hídrico diario (generalmente ejecutado por la tarea programada en segundo plano o el motor de procesamiento).

- **Método**: `POST`
- **Ruta**: `/api/v1/balances/`
- **Autenticación**: Requerida (Bearer Token).
- **Cabeceras**: `Content-Type: application/json`
- **Request Body (JSON)**:
  - `parcela_id` (integer, obligatorio): ID de la parcela.
  - `fecha` (string en formato `YYYY-MM-DD`, obligatorio): Fecha del balance.
  - `evapotranspiracion` (float, opcional): Pérdida de agua estimada en milímetros (mm).
  - `precipitacion` (float, opcional): Lluvia caída en milímetros (mm).
  - `riego_sugerido` (float, opcional): Cantidad recomendada a regar en milímetros (mm).
  - `humedad_suelo` (float, opcional): Porcentaje de humedad en el suelo estimado.

##### Ejemplo de Body:
```json
{
  "parcela_id": 5,
  "fecha": "2026-05-26",
  "evapotranspiracion": 5.2,
  "precipitacion": 1.2,
  "riego_sugerido": 2.4,
  "humedad_suelo": 23.1
}
```

##### Respuestas:

##### 🟢 201 Created (Balance hídrico registrado)
```json
{
  "id": 13,
  "parcela_id": 5,
  "fecha": "2026-05-26",
  "evapotranspiracion": 5.2,
  "precipitacion": 1.2,
  "riego_sugerido": 2.4,
  "humedad_suelo": 23.1
}
```

##### 🔴 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

---

## 4. Códigos de Respuesta HTTP Comunes

El backend responde con códigos de estado estándar de la industria:

| Código | Estado | Significado |
| :--- | :--- | :--- |
| `200` | OK | La petición fue exitosa y retorna la información solicitada. |
| `201` | Created | Se ha creado exitosamente el recurso (ej: parcela, balance). |
| `400` | Bad Request | Parámetros inválidos o error en credenciales. |
| `401` | Unauthorized | Falta token de autenticación o ha caducado. |
| `403` | Forbidden | El token es válido pero no pertenece a un usuario con acceso al recurso. |
| `404` | Not Found | El recurso (por ejemplo, el agricultor o la parcela) no existe. |
| `422` | Unprocessable Entity | Pydantic rechazó la entrada por no coincidir con el tipo de datos (ej: enviar texto en un ID entero). |
| `500` | Internal Server Error | Ocurrió un error inesperado en el código del servidor o base de datos. |
