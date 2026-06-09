# Mejoras pertinentes - Estado de avance 3

## Objetivo

Registrar mejoras aplicadas o propuestas a partir del plan de pruebas, orientadas a calidad, seguridad, claridad del dominio y coherencia con la nueva finalidad de AguaSabia.

## Mejoras

| ID | Mejora | Motivo | Impacto en calidad | Impacto en seguridad/etica | Estado |
|---|---|---|---|---|---|
| M-001 | Cambiar foco documental desde riego hacia consulta territorial | El producto ya no es una plataforma de recomendacion de riego | Alinea pruebas y documentacion con el producto actual | Evita prometer acciones automaticas no deseadas | Aplicada documentalmente |
| M-002 | Crear casos de prueba por modulo | El encargo exige detalle de casos usados | Facilita ejecucion y evidencia | Mejora trazabilidad de resultados | Aplicada documentalmente |
| M-003 | Separar usuario visitante, usuario registrado y admin interno | El modelo de uso cambio hacia freemium/pago | Aclara permisos y flujos | Reduce accesos indebidos a historial | Propuesta/implementacion backend en curso |
| M-004 | Restringir guardado de consultas a usuarios autenticados | Guardar datos consume recursos y debe asociarse a cuenta | Mejora persistencia controlada | Evita almacenamiento anonimo innecesario | Propuesta/implementacion backend en curso |
| M-005 | Mantener datos avanzados como funcionalidad pagada | El modo avanzado usa mas datos y almacenamiento | Da coherencia al modelo de negocio | Evita exponer complejidad a usuarios no tecnicos | Propuesta |
| M-006 | No inventar datos satelitales | Las APIs satelitales se integraran al final | Mejora confiabilidad | Evita desinformacion ambiental | Aplicada como criterio |
| M-007 | Documentar tablas legacy | Agricultores, parcelas y balances no son nucleo actual | Evita confusion tecnica | Evita borrar datos sin decision formal | Aplicada documentalmente |
| M-008 | Definir base de datos de pruebas | Las pruebas no deben afectar datos reales | Mejora reproducibilidad | Protege datos y evidencias | Aplicada documentalmente |
| M-009 | Crear paso a paso de screenshots | El informe requiere evidencias | Facilita evaluacion | Evita mostrar secretos por error | Aplicada documentalmente |
| M-010 | Preparar PostGIS como plan futuro | El proyecto requiere analisis geoespacial serio | Escala consultas territoriales | Evita migracion destructiva prematura | Propuesta |

## Mejoras pendientes

- Integrar proveedor satelital real para NDVI.
- Integrar fuentes DGA Chile para contexto hidrico oficial.
- Implementar PostGIS para interseccion de capas.
- Crear plan real de limites de uso para usuarios gratuitos.
- Diseñar flujo de pago o membresia.
- Actualizar diagramas graficos del proyecto.

