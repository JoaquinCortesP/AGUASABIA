# REFACTOR_AGUASABIA

## Proposito

Registrar los cambios realizados para alinear documentacion, gestion y pruebas con la vision actual de AguaSabia como plataforma geoespacial de consulta hidrica y ambiental.

## Archivos creados

| Archivo | Motivo |
|---|---|
| `PLAN.md` | Registrar paso a paso de ejecucion antes de modificar documentos. |
| `Documentacion/docs_tecnicos/plan_pruebas_aguasabia.md` | Plan de pruebas solicitado para Estado de avance 3. |
| `Documentacion/docs_tecnicos/casos_prueba_estado_avance_3.md` | Casos de prueba detallados con resultados esperados. |
| `Documentacion/docs_tecnicos/base_datos_pruebas.md` | Descripcion de base de datos de pruebas. |
| `Documentacion/docs_tecnicos/evidencias_configuracion.md` | Guia de evidencias de configuracion. |
| `Documentacion/docs_tecnicos/mejoras_estado_avance_3.md` | Mejoras pertinentes aplicadas o propuestas. |
| `Documentacion/docs_tecnicos/acta_aceptacion_cliente_docente.md` | Plantilla de aceptacion docente/cliente. |
| `Documentacion/docs_tecnicos/conclusion_lecciones_estado_avance_3.md` | Conclusion y lecciones aprendidas. |
| `Documentacion/docs_tecnicos/paso_a_paso_evidencias_pruebas.md` | Pasos para ejecutar pruebas y tomar screenshots. |

## Archivos modificados

| Archivo | Cambio realizado |
|---|---|
| `README.md` | Actualizado hacia consulta territorial, modulos ambientales y estado legacy. |
| `Documentacion/Documentacion de api/api-documentation.md` | Reescrito con endpoints de territorio, usuarios, clima, agua, vegetacion y riesgos. |
| `Documentacion/docs_tecnicos/backend-setup.md` | Actualizado para pruebas backend y flujo territorial. |
| `Documentacion/docs_tecnicos/database-documentation.md` | Actualizado con usuarios, consultas territoriales y tablas futuras. |
| `Documentacion/docs_tecnicos/configuracion_entorno.md` | Actualizado con variables actuales y WhatsApp como obsoleto. |
| `Documentacion/docs_tecnicos/error-handling.md` | Actualizado con errores de poligono, auth y Open-Meteo. |
| `Documentacion/docs_tecnicos/backup-and-restore.md` | Actualizado con tablas de consultas territoriales. |
| `Documentacion/Estructura del proyecto/project-structure.md` | Actualizado hacia modulos nuevos del backend. |
| `Documentacion/Matriz de trazabilidad/traceability-matrix.md` | Actualizada con RF/RNF actuales y casos de prueba. |
| `Documentacion/postman/AguaSabia-Backend.postman_collection.json` | Actualizada con coleccion de pruebas EA3. |
| `Gestion/1.1.2 Documento de registro de definicion e identificacion del proyecto.md` | Actualizado hacia evidencias, pruebas y gestion actual. |
| `Gestion/Definicion de Requerimientos AguaSabia.xlsx` | Actualizado con requerimientos nuevos y hoja de casos de prueba. |
| `Gestion/5.1 Carta Gantt (1) (1).xlsx` | Actualizado con tareas del enfoque geoespacial y resumen EA3. |

## Archivos revisados sin modificacion estructural

| Archivo/carpeta | Decision |
|---|---|
| `Documentacion/Diagramas` | Se mantienen como evidencia historica; pueden requerir version nueva futura. |
| `Documentacion/docs_tecnicos/despliegue_railway.md` | No se detecto prioridad inmediata para el encargo actual. |
| `Documentacion/Entono de pruebas/testing-environment.md` | Se mantiene como soporte general; el plan nuevo cubre evidencias EA3. |
| `Gestion/integrantes.txt` | No requiere cambio. |

## Elementos obsoletos

| Elemento | Estado | Justificacion |
|---|---|---|
| Agricultores como usuario principal | Obsoleto | El usuario central es visitante/usuario de plataforma. |
| Parcelas como entidad central | Obsoleto | El flujo usa poligono temporal o consulta territorial. |
| Recomendaciones automaticas de riego | Obsoleto | El producto informa y explica, no automatiza riego. |
| WhatsApp | Obsoleto | Ya no es canal central del producto. |
| FAO-56 como nucleo de producto | Legacy parcial | Puede informar indicadores hidricos, pero no define el flujo. |

## Cambios de dominio

Antes:

```text
Agricultor -> Parcela -> Balance hidrico -> Recomendacion de riego
```

Ahora:

```text
Usuario/visitante -> Poligono -> ConsultaTerritorial -> Modulos explicativos
```

## Cambios de pruebas

Se agregan pruebas para:

- disponibilidad del backend;
- Swagger;
- login admin;
- registro/login usuario;
- consulta territorial;
- guardado autenticado;
- errores 401 y 422;
- Open-Meteo;
- modulos agua, vegetacion y riesgos;
- modo avanzado.

## Mejoras propuestas

- Ejecutar el plan de pruebas y completar resultados obtenidos.
- Crear carpeta de evidencias con screenshots.
- Integrar PostGIS en migracion no destructiva futura.
- Integrar NDVI con fuente satelital real.
- Integrar DGA Chile para capas oficiales.
- Actualizar diagramas graficos.
- Definir plan de pago real.

## Pendientes

- No se ejecutaron pruebas reales en esta pasada documental.
- No se modifico frontend.
- No se integro API satelital.
- No se aplico PostGIS.
- No se generaron capturas; queda el paso a paso listo para hacerlo.

