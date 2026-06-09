# Manejo de errores - AguaSabia

## Proposito

Definir respuestas esperadas para errores comunes durante pruebas del backend.

## Errores HTTP principales

| Codigo | Caso | Ejemplo |
|---|---|---|
| `400` | Credenciales incorrectas o entidad inactiva | Login invalido. |
| `401` | Falta autenticacion | Intentar guardar consulta sin token. |
| `403` | Acceso no permitido | Recurso fuera de permisos. |
| `404` | Recurso no encontrado | Consulta guardada inexistente. |
| `422` | Entrada invalida | Poligono con menos de 3 vertices. |
| `502` | Respuesta externa incompleta | Open-Meteo devuelve formato inesperado. |
| `503` | Servicio externo no disponible | Timeout o error de conexion con Open-Meteo. |

## Validacion de poligonos

El backend debe rechazar:

- menos de 3 vertices;
- latitud fuera de `[-90, 90]`;
- longitud fuera de `[-180, 180]`;
- cuerpo JSON incompleto.

Ejemplo esperado:

```json
{
  "detail": [
    {
      "loc": ["body", "poligono"],
      "msg": "Debe enviar un poligono con al menos 3 vertices"
    }
  ]
}
```

## Seguridad basica

Guardar consultas requiere usuario autenticado.

Ejemplo:

```json
{
  "detail": "Debe iniciar sesion para guardar consultas"
}
```

## Dependencias externas

Si Open-Meteo falla, el backend debe responder con error controlado y no bloquear toda la aplicacion.

Ejemplo:

```json
{
  "detail": "No se pudo conectar con Open-Meteo"
}
```

## Criterio etico

Cuando vegetacion, incendios o sequia no tengan API real conectada, el sistema debe responder `pendiente` o `no_disponible`, no inventar indicadores.
