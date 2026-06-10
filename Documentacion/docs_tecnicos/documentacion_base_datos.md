# Documentacion de base de datos - AguaSabia

## Proposito

Este documento resume las tablas relevantes para pruebas y desarrollo actual. La persistencia se centra en usuarios y consultas territoriales, no en almacenar todos los terrenos de Chile.

## Modelo actual recomendado

| Tabla | Proposito |
|---|---|
| `usuarios` | Usuarios de plataforma, plan gratis/pago y autenticacion basica. |
| `consultas_territoriales` | Consultas realizadas sobre un poligono enviado por el usuario. |
| `resultados_consulta_modulos` | Resultado modular de agua, clima, territorio, vegetacion y riesgos. |
| `administradores` | Usuarios internos del equipo. |
| `municipios` | Soporte administrativo para admins internos. |
| `regiones` | Catalogo territorial base. |
| `comunas` | Catalogo territorial base. |

## Tablas preparadas para capas ambientales

| Tabla | Uso futuro |
|---|---|
| `cuencas` | Cuencas hidrograficas y geometria asociada. |
| `fuentes_hidricas` | Rios, embalses, humedales, pozos u otras fuentes. |
| `indicadores_climaticos` | Datos climaticos historizados si se decide persistirlos. |
| `indicadores_vegetacion` | NDVI, EVI y cobertura vegetal desde satelites. |
| `eventos_incendio` | Eventos o zonas de incendio. |
| `indices_sequia` | Indicadores de sequia por periodo o fuente. |

## Consulta territorial

Una consulta territorial representa una pregunta del usuario sobre un area seleccionada.

Campos esperados:

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | INT | Identificador. |
| `usuario_id` | INT nullable | Usuario que guardo la consulta. |
| `nombre` | VARCHAR nullable | Nombre opcional. |
| `poligono` | GEOMETRY(POLYGON, 4326) | Vertices convertidos a geometría espacial PostGIS. |
| `centroide_latitud` | FLOAT | Centroide. |
| `centroide_longitud` | FLOAT | Centroide. |
| `bbox` | JSON | Caja envolvente. |
| `superficie_aprox_ha` | FLOAT | Superficie real calculada usando ST_Area de PostGIS. |
| `modo` | VARCHAR | `resumen` o `avanzado`. |
| `guardada` | BOOLEAN | Indica si se persistio. |
| `resumen_general` | TEXT | Lectura simple para usuario. |
| `resultado_json` | JSON | Resultado consolidado. |

## Legacy

| Tabla | Estado | Motivo |
|---|---|---|
| `agricultores` | Legacy | El producto ya no centra su flujo en agricultores. |
| `parcelas` | Legacy | El concepto operativo se reemplaza por consulta territorial por poligono. |
| `balances_hidricos` | Legacy parcial | Datos hidricos reutilizables, pero ya no como recomendacion de riego. |

No se deben eliminar estas tablas sin migracion formal.

## PostGIS

PostGIS **está implementado activamente** en el núcleo de las consultas territoriales.

Objetivos cumplidos y en curso:

- almacenar poligonos como geometria nativa (`GEOMETRY(POLYGON, 4326)`);
- calcular areas reales y precisas usando `ST_Area` y cast a geography;
- (Próximamente) intersectar con cuencas, rios, humedales y limites administrativos;
- (Próximamente) cruzar capas de la DGA para decretos de escasez.

Para desarrollo local, recuerda ejecutar:
```sql
CREATE EXTENSION postgis;
```
