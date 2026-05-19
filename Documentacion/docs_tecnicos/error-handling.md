# Manejo de Errores - AguaSabia

## 1. Descripción General

Este documento describe cómo el sistema AguaSabia maneja errores, excepciones, validaciones y respuestas de error en todos los niveles: presentación, negocio y datos.

---

## 2. Niveles de Manejo de Errores

```
┌─────────────────────────────────────┐
│    Errores HTTP (Presentación)      │
│    400, 401, 404, 422, 500          │
├─────────────────────────────────────┤
│   Validación Pydantic (DTOs)        │
│   Type checking, constraints        │
├─────────────────────────────────────┤
│    Lógica de Negocio (Services)     │
│    Validaciones de reglas           │
├─────────────────────────────────────┤
│    Errores de Base de Datos         │
│    SQLAlchemy, PostgreSQL           │
└─────────────────────────────────────┘
```

---

## 3. Códigos HTTP y Significados

### 3.1 2xx - Éxito

| Código | Significado | Caso de Uso |
|--------|-------------|-----------|
| `200` | OK | Request procesado exitosamente |
| `201` | Created | Recurso creado exitosamente |
| `204` | No Content | Request exitoso, sin cuerpo de respuesta |

### 3.2 4xx - Error del Cliente

| Código | Significado | Causa | Ejemplo |
|--------|-------------|-------|---------|
| `400` | Bad Request | Solicitud malformada | Datos JSON inválidos |
| `401` | Unauthorized | Autenticación fallida | Token expirado, missing |
| `403` | Forbidden | Autorización fallida | Usuario sin permisos |
| `404` | Not Found | Recurso no existe | Parcela ID inválido |
| `409` | Conflict | Conflicto (ej: email duplicado) | Email ya registrado |
| `422` | Unprocessable Entity | Error de validación Pydantic | Tipo de dato incorrecto |
| `429` | Too Many Requests | Rate limit excedido | Demasiadas requests |

### 3.3 5xx - Error del Servidor

| Código | Significado | Causa |
|--------|-------------|-------|
| `500` | Internal Server Error | Error inesperado en servidor |
| `502` | Bad Gateway | Servicio backend no disponible |
| `503` | Service Unavailable | Servidor sobrecargado o en mantenimiento |

---

## 4. Validación en Capas

### 4.1 Capa Presentación (FastAPI)

**Ubicación**: `app/api/v1/endpoints/*.py`

**Ejemplo**: Crear Parcela

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.parcela import ParcelaCreate

@router.post("/")
def create_parcela(
    parcela: ParcelaCreate,  # Pydantic valida automáticamente
    db: Session = Depends(get_db)
):
    # Si ParcelaCreate no valida, FastAPI retorna 422 automáticamente
    
    # Validación adicional de negocio
    agricultor = db.query(Agricultor).filter(...).first()
    if not agricultor:
        raise HTTPException(
            status_code=404,
            detail=f"Agricultor {parcela.agricultor_id} no encontrado"
        )
    
    # Insertar en BD
    db_parcela = Parcela(**parcela.dict())
    db.add(db_parcela)
    db.commit()
    
    return db_parcela
```

**Validaciones automáticas Pydantic**:

```python
class ParcelaCreate(BaseModel):
    nombre: str              # Non-null, string
    latitud: float           # float, -90 a 90 (si se agrega constraint)
    longitud: float          # float, -180 a 180 (si se agrega constraint)
    area: float              # float > 0
    cultivo: str             # Non-null, string
    agricultor_id: int       # integer, > 0
```

**Error 422 - Ejemplo**:

```json
{
  "detail": [
    {
      "loc": ["body", "latitud"],
      "msg": "value is not a valid float",
      "type": "type_error.float"
    }
  ]
}
```

### 4.2 Capa de Datos (SQLAlchemy)

**Ubicación**: `app/db/session.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError, IntegrityError

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True  # Valida conexión antes de usar
)

try:
    with engine.connect() as conn:
        conn.execute("SELECT 1")
except OperationalError as e:
    print(f"Error de conexión: {e}")
    # Reintentar automáticamente
except IntegrityError as e:
    print(f"Violación de constraint: {e}")
    # Posible duplicado de email
```

**Errores comunes de SQLAlchemy**:

| Error | Causa | Solución |
|-------|-------|----------|
| `OperationalError` | Conexión rechazada | Verificar PostgreSQL activo |
| `IntegrityError` | Constraint violado (ej: email duplicado) | Validar datos únicos |
| `ProgrammingError` | SQL inválido | Revisar query |
| `DatabaseError` | Error en BD | Revisar logs PostgreSQL |

### 4.3 Capa de Negocio (Services)

**Ubicación**: `app/services/*.py`

```python
class AgronomicoService:
    @staticmethod
    def calcular_balance_hidrico(et_o: float, cultivo: str) -> float:
        # Validar entrada
        if et_o < 0:
            raise ValueError("ET_o no puede ser negativo")
        
        if cultivo not in ["Maíz", "Frijol", "Sorgo"]:
            raise ValueError(f"Cultivo '{cultivo}' no soportado")
        
        # Calcular con coeficiente Kc
        kc = {"Maíz": 0.8, "Frijol": 0.75, "Sorgo": 0.7}
        return et_o * kc.get(cultivo, 0.8)
```

---

## 5. Manejo de Excepciones

### 5.1 HTTPException (FastAPI)

```python
from fastapi import HTTPException

# Uso básico
raise HTTPException(
    status_code=404,
    detail="Parcela no encontrada"
)

# Con headers personalizados
raise HTTPException(
    status_code=401,
    detail="Token inválido",
    headers={"WWW-Authenticate": "Bearer"}
)
```

### 5.2 Excepciones Personalizadas

**Crear excepciones personalizadas**:

```python
# app/core/exceptions.py

class AgricultorNotFoundError(Exception):
    """Agricultor no existe"""
    pass

class ParcelaNotFoundError(Exception):
    """Parcela no existe"""
    pass

class ValidationError(Exception):
    """Error de validación de negocio"""
    pass
```

**Usar en servicios**:

```python
from app.core.exceptions import ParcelaNotFoundError

def obtener_parcela(db, parcela_id: int):
    parcela = db.query(Parcela).filter(Parcela.id == parcela_id).first()
    if not parcela:
        raise ParcelaNotFoundError(f"Parcela {parcela_id} no existe")
    return parcela
```

### 5.3 Exception Handlers (Globales)

```python
# app/main.py

from fastapi import FastAPI
from app.core.exceptions import ParcelaNotFoundError

app = FastAPI()

@app.exception_handler(ParcelaNotFoundError)
async def parcela_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)}
    )
```

---

## 6. Validaciones de Autenticación

### 6.1 Token JWT Expirado

**Error 401**:

```json
{
  "detail": "Token expirado"
}
```

**Código**:

```python
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

@router.get("/")
def get_data(credentials: HTTPAuthCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )
```

### 6.2 Token Ausente

**Error 401**:

```json
{
  "detail": "No autorizado"
}
```

---

## 7. Validaciones de Negocio

### 7.1 Coordenadas Geográficas

```python
from pydantic import BaseModel, field_validator

class ParcelaCreate(BaseModel):
    latitud: float
    longitud: float
    
    @field_validator('latitud')
    @classmethod
    def validate_latitud(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitud debe estar entre -90 y 90')
        return v
    
    @field_validator('longitud')
    @classmethod
    def validate_longitud(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitud debe estar entre -180 y 180')
        return v
```

**Error 422**:

```json
{
  "detail": [
    {
      "loc": ["body", "latitud"],
      "msg": "Latitud debe estar entre -90 y 90",
      "type": "value_error"
    }
  ]
}
```

### 7.2 Email Único

```python
from sqlalchemy.exc import IntegrityError

try:
    agricultor = Agricultor(
        nombre="Juan",
        email="juan@example.com",  # Email ya existe
        hashed_password="...",
        municipio_id=1
    )
    db.add(agricultor)
    db.commit()
except IntegrityError as e:
    db.rollback()
    raise HTTPException(
        status_code=409,
        detail="Email ya registrado"
    )
```

### 7.3 Area de Parcela Positiva

```python
class ParcelaCreate(BaseModel):
    area: float
    
    @field_validator('area')
    @classmethod
    def validate_area(cls, v):
        if v <= 0:
            raise ValueError('Área debe ser positiva')
        if v > 10000:  # Max 10,000 hectáreas
            raise ValueError('Área no puede exceder 10,000 hectáreas')
        return v
```

---

## 8. Manejo de Errores de Base de Datos

### 8.1 Conexión Fallida

**Error 503**:

```python
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        pass
except OperationalError as e:
    raise HTTPException(
        status_code=503,
        detail="Base de datos no disponible"
    )
```

### 8.2 Timeout de Query

```python
from sqlalchemy.pool import QueuePool
from sqlalchemy import event

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    pool_timeout=30  # Timeout en segundos
)

@event.listens_for(engine, "engine_disposed")
def receive_engine_disposed(engine):
    print("Conexión a BD perdida")
```

---

## 9. Respuestas de Error Estandarizadas

### 9.1 Formato de Error

**Patrón consistente**:

```json
{
  "status_code": 400,
  "detail": "Descripción del error",
  "timestamp": "2024-05-13T10:30:00Z",
  "path": "/api/v1/parcelas/",
  "method": "POST"
}
```

### 9.2 Implementar Formato Consistente

```python
# app/core/responses.py

from datetime import datetime
from fastapi.responses import JSONResponse

class ErrorResponse:
    def __init__(self, status_code: int, detail: str, path: str):
        self.status_code = status_code
        self.detail = detail
        self.path = path
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self):
        return {
            "status_code": self.status_code,
            "detail": self.detail,
            "path": self.path,
            "timestamp": self.timestamp
        }

# Uso:
error = ErrorResponse(404, "Parcela no encontrada", "/api/v1/parcelas/1")
raise HTTPException(status_code=404, detail=error.to_dict())
```

---

## 10. Logging de Errores

### 10.1 Configurar Logging

```python
# app/core/logging.py

import logging
from logging.handlers import RotatingFileHandler

# Logger para la app
logger = logging.getLogger("aguasabia")
logger.setLevel(logging.INFO)

# Handler a archivo
file_handler = RotatingFileHandler(
    "logs/aguasabia.log",
    maxBytes=10485760,  # 10 MB
    backupCount=10
)

formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
```

### 10.2 Usar Logger en Endpoints

```python
from app.core.logging import logger

@router.post("/")
def create_parcela(parcela: ParcelaCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creando parcela: {parcela.nombre}")
        
        # Crear parcela
        db_parcela = Parcela(**parcela.dict())
        db.add(db_parcela)
        db.commit()
        
        logger.info(f"Parcela creada exitosamente: {db_parcela.id}")
        return db_parcela
        
    except Exception as e:
        logger.error(f"Error creando parcela: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno")
```

---

## 11. Ejemplos de Flujos de Error

### 11.1 Login Fallido

```
Request: POST /api/v1/auth/login
Body: {username: "juan@example.com", password: "wrong"}

↓

Endpoint: auth.login()
  ↓
  Buscar agricultor por email
  ↓
  Email no encontrado → raise ParcellaNotFoundError
  ↓
  Exception Handler → HTTPException 404
  ↓

Response: 404
{
  "detail": "Agricultor no encontrado"
}
```

### 11.2 Crear Parcela con Datos Inválidos

```
Request: POST /api/v1/parcelas/
Body: {
  nombre: "Parcela",
  latitud: 150,        ← Inválido (> 90)
  longitud: -89.2,
  area: 2.5,
  cultivo: "Maíz",
  agricultor_id: 1
}

↓

Pydantic Validation
  ↓
  latitud validator falla
  ↓
  ValidationError
  ↓

Response: 422
{
  "detail": [
    {
      "loc": ["body", "latitud"],
      "msg": "Latitud debe estar entre -90 y 90",
      "type": "value_error"
    }
  ]
}
```

### 11.3 Email Duplicado

```
Request: POST /api/v1/agricultores/
Body: {
  nombre: "Juan",
  email: "juan@example.com",  ← Email ya existe
  password: "123"
}

↓

Pydantic: OK
  ↓
  Service: Verificar email único
  ↓
  SQLAlchemy: INSERT → IntegrityError (UNIQUE constraint)
  ↓
  Exception Handler → HTTPException 409
  ↓

Response: 409
{
  "detail": "Email ya registrado"
}
```

---

## 12. Checklist de Validación

```
[ ] Todos los inputs validados con Pydantic
[ ] Autenticación JWT en endpoints protegidos
[ ] Códigos HTTP correctos por caso de error
[ ] Mensajes de error claros y útiles
[ ] Sin exponer información sensible en errores
[ ] Logging de errores configurado
[ ] Exception handlers globales implementados
[ ] Validaciones de negocio en servicios
[ ] Transacciones BD con rollback en errores
[ ] Rate limiting considerado
```

---

## 13. Resumen de Manejo de Errores

**Capas de validación**:
1. Pydantic (tipos, formatos)
2. Lógica de negocio (reglas)
3. Base de datos (constraints)
4. Exception handlers (HTTP)

**Principios**:
- Validar temprano (en presentación)
- Mensajes claros al cliente
- Log detallado internamente
- Códigos HTTP semánticos
- Sin datos sensibles en errores

Este enfoque garantiza confiabilidad, debuggabilidad y experiencia del usuario.
