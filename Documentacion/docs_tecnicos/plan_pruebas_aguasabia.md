# Plan de pruebas de software - AguaSabia

## Objetivo del plan

Validar que AguaSabia permita realizar consultas territoriales sobre un poligono dibujado por el usuario, entregando informacion clara sobre clima, agua, territorio, vegetacion y riesgos, con controles basicos de autenticacion, persistencia y validacion de entrada.

## Alcance de las pruebas

Este plan se enfoca en el backend y en la API REST. El frontend no se prueba en esta etapa, porque su refactor visual se abordara posteriormente.

Se prueban:

- disponibilidad de la API;
- documentacion Swagger;
- autenticacion de administrador;
- registro y login de usuario;
- consulta territorial por poligono;
- calculo de centroide, caja envolvente y superficie aproximada;
- consumo de Open-Meteo desde backend;
- respuesta modular para agua, clima, territorio, vegetacion y riesgos;
- guardado de consultas solo para usuarios autenticados;
- restriccion de modo avanzado para usuarios gratis;
- validacion de poligonos y coordenadas;
- manejo de errores HTTP esperados.

No se prueban aun:

- frontend;
- pagos reales;
- integracion satelital real;
- PostGIS real;
- integracion DGA Chile;
- exportacion PDF;
- analitica historica avanzada.

## Ambiente de pruebas

| Elemento | Configuracion de prueba |
|---|---|
| Sistema | AguaSabia backend |
| Framework API | FastAPI |
| Base de datos | PostgreSQL local o Railway en ambiente de pruebas |
| Base sugerida | `aguasabia_test` |
| Cliente HTTP | Postman y Swagger |
| Documentacion interactiva | `http://127.0.0.1:8000/docs` |
| API base | `http://127.0.0.1:8000/api/v1` |
| API externa usada | Open-Meteo |
| Frontend | Fuera de alcance en esta etapa |

## Datos de entrada base

Poligono de prueba recomendado:

```json
{
  "poligono": [
    { "latitud": -33.4480, "longitud": -70.6700 },
    { "latitud": -33.4480, "longitud": -70.6680 },
    { "latitud": -33.4500, "longitud": -70.6680 },
    { "latitud": -33.4500, "longitud": -70.6700 }
  ],
  "modo": "resumen",
  "guardar": false,
  "modulos": ["agua", "clima", "territorio", "vegetacion", "riesgos"]
}
```

Usuario de prueba sugerido:

```json
{
  "nombre": "Usuario Prueba",
  "email": "usuario.prueba@aguasabia.cl",
  "password": "usuario123"
}
```

Administrador de prueba sugerido:

```text
email: admin@aguasabia.cl
password: admin123
```

## Tipos de prueba aplicados

| Tipo de prueba | Proposito |
|---|---|
| Funcional | Confirmar que cada endpoint responde segun lo esperado. |
| Validacion de entrada | Confirmar que coordenadas y poligonos invalidos son rechazados. |
| Seguridad basica | Confirmar que guardar consultas requiere autenticacion. |
| Integracion externa | Confirmar que Open-Meteo responde desde el backend. |
| Persistencia | Confirmar que las consultas guardadas quedan disponibles para el usuario. |
| Regresion conceptual | Confirmar que el flujo principal ya no depende de agricultores, parcelas ni riego. |
| Documentacion API | Confirmar que Swagger muestra las rutas necesarias para pruebas. |

## Criterios de aprobacion

Una prueba se considera aprobada cuando:

- el codigo HTTP coincide con el resultado esperado;
- el JSON de respuesta contiene los campos definidos;
- no se exponen secretos ni tokens completos en evidencias;
- los errores aparecen como respuestas controladas;
- los modulos pendientes no inventan informacion no integrada;
- las funcionalidades pagadas quedan protegidas de forma basica mediante plan de usuario.

## Criterios de rechazo

Una prueba se considera rechazada cuando:

- el backend no levanta;
- Swagger no carga;
- un endpoint protegido responde sin token cuando deberia exigirlo;
- una consulta territorial valida falla sin razon externa;
- el sistema inventa NDVI, incendios o sequia sin fuente conectada;
- se muestra lenguaje centrado en recomendacion de riego como flujo principal.

## Evidencias esperadas

Se deben capturar screenshots de:

- terminal con entorno virtual activo;
- migraciones aplicadas;
- backend corriendo;
- Swagger disponible;
- login admin;
- registro/login usuario;
- consulta territorial visitante;
- error al guardar sin login;
- consulta guardada con token;
- listado de consultas guardadas;
- modulo clima con datos Open-Meteo;
- modulo agua;
- modulo vegetacion pendiente;
- modulo riesgos pendiente;
- error 422 por poligono invalido.

## Referencias cruzadas

- Casos detallados: `Documentacion/docs_tecnicos/casos_prueba_estado_avance_3.md`
- Base de datos de pruebas: `Documentacion/docs_tecnicos/base_datos_pruebas.md`
- Evidencias de configuracion: `Documentacion/docs_tecnicos/evidencias_configuracion.md`
- Paso a paso de screenshots: `Documentacion/docs_tecnicos/paso_a_paso_evidencias_pruebas.md`
