# Evidencias de configuracion solicitadas

## Objetivo

Registrar que el ambiente de desarrollo y pruebas fue configurado de forma reproducible para ejecutar el backend de AguaSabia y validar los casos del plan de pruebas.

## Evidencias requeridas

| ID | Evidencia | Descripcion | Captura sugerida | Criterio |
|---|---|---|---|---|
| EV-001 | Entorno virtual | `.venv` activado en terminal | Terminal con `(.venv)` | Debe verse el prompt activo. |
| EV-002 | Dependencias | Instalacion desde `requirements.txt` | Terminal o archivo requirements | No debe mostrar errores. |
| EV-003 | Variables de entorno | `.env` o `.env.example` configurado | Archivo censurado | No mostrar password real. |
| EV-004 | Base de datos | `DATABASE_URL` apuntando a pruebas | `.env` censurado | Usar base de pruebas. |
| EV-005 | Migraciones | Alembic upgrade | Terminal | Debe llegar a `head`. |
| EV-006 | Seed | Datos base cargados | Terminal | Debe crear admin demo. |
| EV-007 | Backend | Uvicorn corriendo | Terminal | Debe mostrar `127.0.0.1:8000`. |
| EV-008 | Swagger | `/docs` disponible | Navegador | Rutas visibles. |
| EV-009 | Postman | Coleccion importada | Postman | Variables configuradas. |
| EV-010 | API externa | Open-Meteo consumido | Postman | ET0/precipitacion visibles. |

## Recomendaciones para screenshots

- Ocultar tokens completos.
- Ocultar passwords.
- Mostrar solo fragmentos no sensibles de `DATABASE_URL`.
- Incluir fecha/hora si es posible.
- Usar nombres de archivos claros, por ejemplo:
  - `EV-001-entorno-virtual.png`
  - `EV-005-alembic-head.png`
  - `EV-010-open-meteo.png`

## Configuracion minima esperada

```powershell
cd C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Proyecto\backend
.\.venv\Scripts\activate
python -m alembic upgrade head
python scripts\seed.py
uvicorn app.main:app --reload
```

## Evidencia de cumplimiento

Esta seccion debe completarse despues de ejecutar las pruebas:

| Evidencia | Archivo screenshot | Estado | Observacion |
|---|---|---|---|
| EV-001 | Pendiente | Pendiente | - |
| EV-002 | Pendiente | Pendiente | - |
| EV-003 | Pendiente | Pendiente | - |
| EV-004 | Pendiente | Pendiente | - |
| EV-005 | Pendiente | Pendiente | - |
| EV-006 | Pendiente | Pendiente | - |
| EV-007 | Pendiente | Pendiente | - |
| EV-008 | Pendiente | Pendiente | - |
| EV-009 | Pendiente | Pendiente | - |
| EV-010 | Pendiente | Pendiente | - |

