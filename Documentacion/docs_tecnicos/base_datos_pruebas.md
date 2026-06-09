# Base de datos de pruebas - AguaSabia

## Proposito

La base de datos de pruebas permite validar el comportamiento del backend sin afectar datos reales ni evidencia historica del proyecto. Su uso permite ejecutar pruebas funcionales, de seguridad basica, persistencia y validacion de entrada.

## Base sugerida

```text
aguasabia_test
```

## Configuracion recomendada

Variable de entorno:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aguasabia_test
```

El valor real debe mantenerse fuera de screenshots publicos si contiene credenciales.

## Tablas principales para pruebas actuales

| Tabla | Uso en pruebas |
|---|---|
| `usuarios` | Registro, login, plan gratis/pago y consultas guardadas. |
| `consultas_territoriales` | Persistencia de poligonos analizados por usuarios. |
| `resultados_consulta_modulos` | Persistencia de resultados por modulo. |
| `administradores` | Acceso interno del equipo. |
| `regiones` | Catalogo territorial base. |
| `comunas` | Catalogo territorial base. |
| `municipios` | Relacion administrativa para admins internos. |
| `cuencas` | Tabla preparada para capas futuras. |
| `fuentes_hidricas` | Tabla preparada para rios, embalses, humedales u otras fuentes. |
| `indicadores_climaticos` | Tabla preparada para historizar clima si se requiere. |
| `indicadores_vegetacion` | Tabla preparada para NDVI/cobertura vegetal. |
| `eventos_incendio` | Tabla preparada para riesgos de incendios. |
| `indices_sequia` | Tabla preparada para sequia. |

## Tablas legacy

| Tabla | Estado | Justificacion |
|---|---|---|
| `agricultores` | Legacy | El producto ya no se centra en agricultores como usuario principal. |
| `parcelas` | Legacy | El concepto se reemplaza por consulta territorial por poligono. |
| `balances_hidricos` | Legacy parcial | Algunos datos hidricos son reutilizables, pero no como recomendacion de riego. |

Estas tablas no deben eliminarse sin una migracion formal y una decision documentada.

## Datos minimos de prueba

| Dato | Valor sugerido | Proposito |
|---|---|---|
| Admin | `admin@aguasabia.cl` | Probar login interno. |
| Password admin | `admin123` | Prueba local, no produccion. |
| Usuario gratis | `usuario.prueba@aguasabia.cl` | Probar consulta y restricciones. |
| Usuario pago | `usuario.pago@aguasabia.cl` | Probar modo avanzado. |
| Poligono | Sector Santiago centro | Probar geometria y Open-Meteo. |
| Region/comuna | Datos seed | Probar catalogos. |

## Consideraciones de seguridad

- No usar datos personales reales.
- No subir capturas con credenciales completas.
- No exponer tokens JWT completos.
- Mantener entorno de pruebas separado de produccion.
- Usar contrasenas demo solo en ambiente local.

## Consideraciones eticas

- El sistema no debe presentar resultados ambientales como certificacion oficial.
- Los modulos pendientes deben declararse como pendientes, no como datos reales.
- Las fuentes de datos deben indicarse cuando existan.
- Las decisiones finales del usuario deben apoyarse en informacion oficial cuando corresponda.

