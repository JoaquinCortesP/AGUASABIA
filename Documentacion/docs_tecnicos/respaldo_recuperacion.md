# Backup y restauracion - AguaSabia

## Proposito

Proteger la informacion de pruebas y consultas guardadas sin mezclar ambientes de desarrollo, prueba y produccion.

## Datos relevantes para respaldar

| Tabla | Prioridad | Motivo |
|---|---|---|
| `usuarios` | Alta | Cuentas de plataforma. |
| `consultas_territoriales` | Alta | Consultas guardadas por usuarios. |
| `resultados_consulta_modulos` | Alta | Resultados asociados a consultas. |
| `administradores` | Media | Acceso interno. |
| `regiones` | Media | Catalogo territorial. |
| `comunas` | Media | Catalogo territorial. |
| `cuencas` | Futura | Capa territorial futura. |
| `fuentes_hidricas` | Futura | Capa hidrica futura. |

## Tablas legacy

Las tablas `agricultores`, `parcelas` y `balances_hidricos` pueden respaldarse como evidencia historica, pero no son el nucleo funcional actual.

## Crear backup

```powershell
pg_dump -U postgres -d aguasabia_test > backup_aguasabia_test.sql
```

## Restaurar backup

```powershell
psql -U postgres -d aguasabia_test -f backup_aguasabia_test.sql
```

## Verificacion posterior

```sql
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM consultas_territoriales;
SELECT COUNT(*) FROM resultados_consulta_modulos;
SELECT COUNT(*) FROM regiones;
SELECT COUNT(*) FROM comunas;
```

## Evidencia sugerida

- Captura del comando `pg_dump`.
- Captura del archivo generado.
- Captura de restauracion.
- Captura de conteo de tablas.

## Seguridad

- No respaldar en carpetas publicas.
- No subir backups con datos reales al repositorio.
- No exponer contrasenas en comandos fotografiados.
- Mantener backups de prueba separados de produccion.
