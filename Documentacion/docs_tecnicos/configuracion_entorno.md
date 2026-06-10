# Configuracion de entorno - AguaSabia

## Proposito

Este documento describe las variables necesarias para ejecutar el backend en desarrollo y pruebas.

## Variables principales

| Variable                        | Descripcion                       | Ejemplo                                                          |
| ------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| `API_V1_STR`                  | Prefijo de la API                 | `/api/v1`                                                      |
| `SECRET_KEY`                  | Clave para firmar JWT             | `clave_de_pruebas`                                             |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duracion de token                 | `11520`                                                        |
| `DATABASE_URL`                | Conexion a PostgreSQL             | `postgresql://postgres:password@localhost:5432/aguasabia_test` |
| `BACKEND_CORS_ORIGINS`        | Origenes permitidos para frontend | `http://localhost:5173`                                        |
| `REDIS_URL`                   | Redis para cache/tareas futuras   | `redis://localhost:6379/0`                                     |
| `CELERY_BROKER_URL`           | Broker Celery futuro              | `redis://localhost:6379/0`                                     |
| `CELERY_RESULT_BACKEND`       | Backend Celery futuro             | `redis://localhost:6379/0`                                     |

## APIs externas

| Variable               | Estado                   | Uso                                                           |
| ---------------------- | ------------------------ | ------------------------------------------------------------- |
| `OPEN_METEO_API_KEY` | No requerida actualmente | Open-Meteo permite consultas publicas para el endpoint usado. |

## Variables obsoletas

| Variable             | Estado                          | Motivo                                                                 |
| -------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| `WHATSAPP_API_KEY` | Obsoleta para el alcance actual | AguaSabia ya no es una plataforma centrada en notificaciones WhatsApp. |

## Recomendaciones de seguridad

- Usar base de pruebas separada.
- Usar credenciales demo solo localmente.

## Ejemplo `.env` de pruebas

```env
API_V1_STR=/api/v1
SECRET_KEY=clave_de_pruebas_no_productiva
ACCESS_TOKEN_EXPIRE_MINUTES=11520
DATABASE_URL=postgresql://postgres:password@localhost:5432/aguasabia_test
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```
