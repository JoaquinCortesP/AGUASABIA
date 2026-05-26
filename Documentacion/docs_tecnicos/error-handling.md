# Manejo de Errores - AguaSabia

Este documento describe cómo funciona el manejo de errores en el backend de AguaSabia.
Está escrito para que sea fácil de entender y sirva de referencia al momento de depurar o extender el sistema.

---

## Niveles donde ocurren los errores

```
Cliente (navegador/app)
       ↓
FastAPI (valida tipos con Pydantic → error 422)
       ↓
Lógica de endpoints (valida reglas de negocio → error 400/404)
       ↓
SQLAlchemy (ejecuta queries → error 500 si algo falla en BD)
       ↓
PostgreSQL (guarda los datos)
```

---

## Códigos de respuesta HTTP más usados

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Todo salió bien |
| 201 | Creado | Se guardó un nuevo registro |
| 400 | Petición incorrecta | Datos de negocio inválidos (ej: contraseña incorrecta) |
| 401 | No autenticado | Token JWT faltante o inválido |
| 403 | Sin permiso | El token es válido pero no tiene acceso |
| 404 | No encontrado | El recurso pedido no existe |
| 409 | Conflicto | Ej: intentar registrar un email que ya existe |
| 422 | Error de validación | Pydantic rechazó el cuerpo del request |
| 500 | Error interno | Algo falló inesperadamente en el servidor |

---

## Cómo se lanzan los errores en FastAPI

Se usa `HTTPException` para responder con un error controlado:

```python
from fastapi import HTTPException

# Ejemplo: agricultor no encontrado
raise HTTPException(
    status_code=404,
    detail="Agricultor no encontrado"
)
```

Pydantic lanza automáticamente un error 422 si los datos del body no coinciden con el schema esperado. No hay que hacer nada extra para eso.

---

## Errores de autenticación

Si el token JWT no es válido o está vencido, la dependencia `get_current_user` responde con 403:

```python
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="No se pudo validar las credenciales"
)
```

Para endpoints que requieren login, incluye la dependencia en la firma de la función:

```python
current_user: Agricultor = Depends(deps.get_current_user)
```

---

## Errores de base de datos

Si hay un problema con la conexión a PostgreSQL, SQLAlchemy lanza una excepción.
Lo más común durante desarrollo es que PostgreSQL no esté corriendo.

El error típico se ve así en la terminal:
```
sqlalchemy.exc.OperationalError: (psycopg.OperationalError) connection refused
```

Solución: asegúrate de que el servicio de PostgreSQL está activo.

Si hay un conflicto de datos únicos (por ejemplo, dos agricultores con el mismo email), SQLAlchemy lanza un `IntegrityError`. Lo correcto es capturarlo y retornar un 409:

```python
from sqlalchemy.exc import IntegrityError

try:
    db.add(agricultor)
    db.commit()
except IntegrityError:
    db.rollback()
    raise HTTPException(status_code=409, detail="El email ya está registrado")
```

---

## Errores de validación Pydantic (422)

Cuando el body de un request no tiene el tipo o formato correcto, FastAPI responde así automáticamente:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

No es necesario hacer nada extra. Pydantic y FastAPI lo manejan solos.

---

## Errores de Celery

Si Celery no puede conectar a Redis, verás esto al iniciarlo:
```
[ERROR] Cannot connect to redis://localhost:6379/0
```

Solución: verifica que Redis está corriendo (`redis-cli ping`).

Si una tarea falla, el error quedará registrado en los logs del worker de Celery en la terminal donde lo ejecutaste.

---

## Notas para el futuro

- Los errores de APIs externas (Open-Meteo, SoilGrids) deben capturarse en `app/services/agronomy.py` y convertirse en `HTTPException` con un mensaje claro para el usuario.
- No retornar mensajes con detalles internos del servidor en producción (no exponer rutas, versiones de librerías, etc.).
