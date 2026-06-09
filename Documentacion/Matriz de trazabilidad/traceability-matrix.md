# Matriz de trazabilidad - AguaSabia

## Requerimientos funcionales actuales

| ID | Requerimiento | Endpoint/artefacto | Archivo principal | Prueba asociada | Estado |
|---|---|---|---|---|---|
| RF-001 | Autenticacion de administrador interno | `POST /api/v1/login/access-token` | `app/api/api_v1/endpoints/login.py` | CP-003 | Implementado |
| RF-002 | Ver administrador autenticado | `GET /api/v1/admin/me` | `app/api/api_v1/endpoints/admin.py` | CP-004 | Implementado |
| RF-003 | Registrar usuario basico | `POST /api/v1/usuarios/register` | `app/api/api_v1/endpoints/usuarios.py` | CP-005 | Planificado/implementacion backend |
| RF-004 | Login de usuario | `POST /api/v1/usuarios/login` | `app/api/api_v1/endpoints/usuarios.py` | CP-006 | Planificado/implementacion backend |
| RF-005 | Analizar poligono territorial | `POST /api/v1/territorio/consultas/analizar` | `app/api/api_v1/endpoints/territorio.py` | CP-007 | Planificado/implementacion backend |
| RF-006 | Impedir guardado anonimo | `POST /api/v1/territorio/consultas/analizar` | `app/api/api_v1/endpoints/territorio.py` | CP-008 | Planificado/implementacion backend |
| RF-007 | Guardar consulta autenticada | `POST /api/v1/territorio/consultas/analizar` | `app/models/consulta_territorial.py` | CP-009 | Planificado/implementacion backend |
| RF-008 | Listar consultas guardadas | `GET /api/v1/territorio/consultas` | `app/api/api_v1/endpoints/territorio.py` | CP-010 | Planificado/implementacion backend |
| RF-009 | Consultar clima por poligono | `POST /api/v1/clima/poligono` | `app/services/clima_service.py` | CP-014 | Implementado/parcial |
| RF-010 | Entregar modulo agua | `POST /api/v1/agua/poligono` | `app/services/agua_service.py` | CP-015 | Planificado/implementacion backend |
| RF-011 | Preparar modulo vegetacion | `POST /api/v1/vegetacion/poligono` | `app/services/vegetacion_service.py` | CP-016 | Planificado |
| RF-012 | Preparar modulo riesgos | `POST /api/v1/riesgos/poligono` | `app/services/riesgos_service.py` | CP-017 | Planificado |
| RF-013 | Restringir modo avanzado | `modo=avanzado` | `app/services/consulta_territorial_service.py` | CP-018, CP-019 | Planificado |

## Requerimientos no funcionales

| ID | Requerimiento | Evidencia | Prueba |
|---|---|---|
| RNF-001 | API documentada en Swagger | Captura `/docs` | CP-002 |
| RNF-002 | Manejo de errores controlado | Respuestas 401/422/503 | CP-008, CP-012, CP-013 |
| RNF-003 | No exponer secretos | Evidencias censuradas | EV-003, EV-004 |
| RNF-004 | No inventar datos satelitales | Modulos pendientes | CP-016, CP-017 |
| RNF-005 | Separar pruebas de produccion | Base `aguasabia_test` | Documento BD pruebas |

## Elementos legacy trazados

| Elemento | Estado | Decision |
|---|---|---|
| Agricultores como usuario principal | Obsoleto | No usar en flujo principal. |
| Parcelas como entidad central | Obsoleto | Reemplazar por consulta territorial. |
| Recomendacion automatica de riego | Obsoleto | No presentar como funcionalidad actual. |
| WhatsApp | Obsoleto | No usar como centro del producto. |
| Balance FAO-56 | Legacy parcial | Reutilizar solo conceptos hidricos generales si corresponde. |
