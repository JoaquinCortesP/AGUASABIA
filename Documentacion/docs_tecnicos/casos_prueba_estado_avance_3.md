# Casos de prueba - Estado de avance 3

## Tabla de casos de prueba

| ID | Modulo | Funcionalidad | Precondicion | Datos de entrada | Accion | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| CP-001 | API | Backend disponible | Backend levantado | Ninguno | `GET /` | HTTP 200 y mensaje de bienvenida | Pendiente de ejecutar | Pendiente | Screenshot raiz API |
| CP-002 | API | Swagger disponible | Backend levantado | Ninguno | Abrir `/docs` | Swagger carga y muestra rutas | Pendiente de ejecutar | Pendiente | Screenshot Swagger |
| CP-003 | Admin | Login administrador | Admin creado por seed | `username`, `password` | `POST /api/v1/login/access-token` | HTTP 200 y bearer token | Pendiente de ejecutar | Pendiente | Screenshot Postman |
| CP-004 | Admin | Ver admin autenticado | Token admin valido | Bearer token | `GET /api/v1/admin/me` | HTTP 200 y datos del admin | Pendiente de ejecutar | Pendiente | Screenshot Postman |
| CP-005 | Usuarios | Registro de usuario | Backend levantado | Nombre, email, password | `POST /api/v1/usuarios/register` | HTTP 201 y usuario plan gratis | Pendiente de ejecutar | Pendiente | Screenshot Postman |
| CP-006 | Usuarios | Login de usuario | Usuario registrado | Email, password | `POST /api/v1/usuarios/login` | HTTP 200 y bearer token | Pendiente de ejecutar | Pendiente | Screenshot Postman |
| CP-007 | Territorio | Analizar poligono visitante | Backend levantado | Poligono valido, `guardar=false` | `POST /api/v1/territorio/consultas/analizar` | HTTP 200, resumen y modulos | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-008 | Seguridad | Impedir guardado sin login | Backend levantado | Poligono valido, `guardar=true` sin token | `POST /api/v1/territorio/consultas/analizar` | HTTP 401 | Pendiente de ejecutar | Pendiente | Screenshot error |
| CP-009 | Territorio | Guardar consulta autenticada | Usuario logeado | Poligono valido, `guardar=true` | `POST /api/v1/territorio/consultas/analizar` con token | HTTP 200, `consulta_id`, `guardada=true` | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-010 | Territorio | Listar consultas guardadas | Usuario con consulta guardada | Bearer token | `GET /api/v1/territorio/consultas` | HTTP 200 y lista | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-011 | Territorio | Ver consulta guardada | Consulta guardada | ID consulta, token | `GET /api/v1/territorio/consultas/{id}` | HTTP 200 y detalle modular | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-012 | Validacion | Rechazar poligono incompleto | Backend levantado | Poligono con 2 vertices | `POST /api/v1/territorio/consultas/analizar` | HTTP 422 | Pendiente de ejecutar | Pendiente | Screenshot error |
| CP-013 | Validacion | Rechazar coordenadas fuera de rango | Backend levantado | Latitud > 90 o longitud > 180 | `POST /api/v1/territorio/consultas/analizar` | HTTP 422 | Pendiente de ejecutar | Pendiente | Screenshot error |
| CP-014 | Clima | Consultar clima por poligono | Internet disponible | Poligono valido | `POST /api/v1/clima/poligono` | HTTP 200, centroide, ET0 y precipitacion | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-015 | Agua | Analisis hidrico explicativo | Internet disponible | Poligono valido | `POST /api/v1/agua/poligono` | HTTP 200, estado, titulo y explicacion | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-016 | Vegetacion | Contrato de vegetacion preparado | Backend levantado | Poligono valido | `POST /api/v1/vegetacion/poligono` | HTTP 200, estado pendiente, sin datos inventados | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-017 | Riesgos | Contrato de riesgos preparado | Backend levantado | Poligono valido | `POST /api/v1/riesgos/poligono` | HTTP 200, explicacion y datos pendientes | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-018 | Monetizacion | Restringir modo avanzado usuario gratis | Usuario plan gratis | `modo=avanzado` | Consulta territorial con token gratis | HTTP 200, `requiere_plan_pago=true` | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-019 | Monetizacion | Permitir modo avanzado usuario pago | Usuario plan pago | `modo=avanzado` | Consulta territorial con token pago | HTTP 200, datos avanzados visibles | Pendiente de ejecutar | Pendiente | Screenshot JSON |
| CP-020 | Regresion | Verificar dominio actualizado | Swagger/documentacion disponible | Ninguno | Revisar rutas principales | El flujo central usa territorio, agua, clima, vegetacion, riesgos y usuarios | Pendiente de ejecutar | Pendiente | Screenshot Swagger |

## Observaciones para ejecucion

- Los resultados obtenidos deben completarse despues de ejecutar cada prueba.
- El estado debe marcarse como `Aprobado`, `Rechazado` o `Bloqueado`.
- Si Open-Meteo no responde, el caso puede quedar `Bloqueado por dependencia externa` y se debe adjuntar evidencia del error.
- Las pruebas de vegetacion y riesgos validan contrato, no datos reales, porque las APIs satelitales se integraran al final.

