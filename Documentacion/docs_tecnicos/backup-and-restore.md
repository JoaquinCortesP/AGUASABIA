# Backup y Restore de PostgreSQL - AguaSabia

## 1. Descripción General

Este documento describe procedimientos para realizar backup (copias de seguridad) y restore (recuperación) de la base de datos PostgreSQL de AguaSabia usando herramientas nativas.

**Herramientas Usadas**:
- `pg_dump` - Exportar base de datos
- `psql` - Ejecutar scripts SQL
- `pg_restore` - Restaurar desde formato binario

---

## 2. Tipos de Backup

### 2.1 Plain SQL Format

**Ventajas**:
- Texto legible
- Portátil entre versiones
- Fácil de editar

**Desventajas**:
- Archivo grande
- Más lento de restaurar

**Comando**:
```bash
pg_dump -U postgres -d aguasabia > backup_aguasabia.sql
```

### 2.2 Custom Format (Binario Comprimido)

**Ventajas**:
- Archivo pequeño (comprimido)
- Restauración más rápida
- Mejor para bases de datos grandes

**Desventajas**:
- No editable
- Requiere `pg_restore`

**Comando**:
```bash
pg_dump -U postgres -Fc -d aguasabia > backup_aguasabia.dump
```

### 2.3 Directory Format

**Ventajas**:
- Restauración paralela
- Mejor para BD muy grandes

**Comando**:
```bash
pg_dump -U postgres -Fd -d aguasabia -f backup_aguasabia_dir
```

---

## 3. Crear Backup Completo

### 3.1 Backup Simple (Plain SQL)

```bash
# Comando básico
pg_dump -U postgres aguasabia > backup_aguasabia.sql

# O si requiere contraseña:
pg_dump -U postgres -W aguasabia > backup_aguasabia.sql
# Ingresa la contraseña cuando se pida
```

**Output**:
```
-- PostgreSQL database dump

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
...
CREATE TABLE municipios (
    id integer NOT NULL,
    nombre character varying,
    ...
);
...
```

**Tamaño**: Típicamente 1-5 MB para base de datos de desarrollo

### 3.2 Backup Comprimido (Custom Format)

```bash
# Backup con compresión
pg_dump -U postgres -Fc aguasabia > backup_aguasabia.dump

# Con nivel de compresión ajustable (-Z 1 a 9)
pg_dump -U postgres -Fc -Z 9 aguasabia > backup_aguasabia_compressed.dump
```

**Ventaja**: Archivo 50-80% más pequeño que SQL

### 3.3 Backup Completo (Todas las BD)

```bash
# Backup de todas las bases de datos
pg_dumpall -U postgres > backup_all_databases.sql

# O comprimido
pg_dumpall -U postgres | gzip > backup_all_databases.sql.gz
```

### 3.4 Backup Programado (Cron - Linux/macOS)

**Archivo**: `/etc/cron.daily/backup_aguasabia.sh`

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/postgresql"
DB_NAME="aguasabia"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql.gz"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Mantener solo últimos 30 backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup creado: $BACKUP_FILE" >> /var/log/aguasabia_backup.log
```

**Hacer ejecutable**:
```bash
chmod +x /etc/cron.daily/backup_aguasabia.sh
```

---

## 4. Restaurar Backup

### 4.1 Restaurar desde Plain SQL

**Opción A**: Restaurar a base de datos existente (DROP si existe)

```bash
# Conectar a PostgreSQL
psql -U postgres

# En psql:
DROP DATABASE IF EXISTS aguasabia;
CREATE DATABASE aguasabia;
\q

# Restaurar desde archivo SQL
psql -U postgres aguasabia < backup_aguasabia.sql
```

**Opción B**: Restaurar desde línea de comandos (una línea)

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS aguasabia;" && \
psql -U postgres -c "CREATE DATABASE aguasabia;" && \
psql -U postgres aguasabia < backup_aguasabia.sql
```

**Output esperado**:
```
DROP DATABASE
CREATE DATABASE
SET
SET
...
```

### 4.2 Restaurar desde Custom Format

```bash
# Restaurar desde .dump
pg_restore -U postgres -d aguasabia -v backup_aguasabia.dump
```

**Flags útiles**:
- `-v` - Verbose (muestra detalles)
- `-c` - Clean (DROP objetos antes)
- `-if-exists` - Ignorar si no existe
- `-j 4` - Restauración paralela con 4 jobs

**Ejemplo**:
```bash
pg_restore -U postgres -d aguasabia -c -if-exists -v backup_aguasabia.dump
```

### 4.3 Restaurar solo estructura (sin datos)

```bash
# Restaurar solo schema
pg_restore -U postgres -d aguasabia -s backup_aguasabia.dump

# O desde SQL
psql -U postgres aguasabia < backup_aguasabia.sql --schema-only
```

### 4.4 Restaurar solo datos (sin estructura)

```bash
pg_restore -U postgres -d aguasabia -a backup_aguasabia.dump
```

---

## 5. Validar Integridad del Backup

### 5.1 Verificar Archivo SQL

```bash
# Contar líneas
wc -l backup_aguasabia.sql

# Verificar sintaxis
head -20 backup_aguasabia.sql

# Buscar tablas creadas
grep "CREATE TABLE" backup_aguasabia.sql

# Buscar INSERT statements
grep "INSERT INTO" backup_aguasabia.sql | head -5
```

### 5.2 Verificar Archivo Dump

```bash
# Listar contenido sin restaurar
pg_restore -l backup_aguasabia.dump | head -20

# Verificar integridad
pg_restore --validate backup_aguasabia.dump
```

**Output exitoso**:
```
Validating dump file integrity... OK
```

### 5.3 Verificar Base de Datos Restaurada

```bash
psql -U postgres -d aguasabia

-- En psql:
\dt                          -- Listar tablas
SELECT COUNT(*) FROM municipios;    -- Contar registros
SELECT * FROM agricultores LIMIT 5; -- Ver datos
\q
```

---

## 6. Backup Incremental y Diferencial

### 6.1 Backup Incremental (Write-Ahead Logging)

Para producción, se recomienda usar WAL (Write-Ahead Logs):

```bash
# Habilitar archivado de WAL en postgresql.conf
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'

# Base backup completo
pg_basebackup -U postgres -D /path/to/backup -Ft -z -P
```

---

## 7. Migración de Base de Datos

### 7.1 Migrar a otra máquina

**En máquina origen**:
```bash
pg_dump -U postgres aguasabia > backup_aguasabia.sql
scp backup_aguasabia.sql usuario@destino:/tmp/
```

**En máquina destino**:
```bash
psql -U postgres -c "CREATE DATABASE aguasabia;"
psql -U postgres aguasabia < /tmp/backup_aguasabia.sql
```

### 7.2 Migrar de PostgreSQL 12 a 15

```bash
# Desde BD antigua (PG 12)
pg_dump -U postgres aguasabia > backup_pg12.sql

# En servidor con PG 15
psql -U postgres -c "CREATE DATABASE aguasabia;"
psql -U postgres aguasabia < backup_pg12.sql

# Validar
psql -U postgres -d aguasabia -c "SELECT version();"
```

---

## 8. Ejemplos de Comandos Prácticos

### 8.1 Backup Diario

```bash
# Backup con timestamp
pg_dump -U postgres aguasabia > backup_$(date +\%Y\%m\%d).sql

# Crear directorio de backups
mkdir -p ~/backups/aguasabia
pg_dump -U postgres aguasabia > ~/backups/aguasabia/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### 8.2 Backup Comprimido

```bash
# SQL comprimido con gzip
pg_dump -U postgres aguasabia | gzip > backup_aguasabia.sql.gz

# Descomprimir y restaurar
gunzip -c backup_aguasabia.sql.gz | psql -U postgres aguasabia
```

### 8.3 Backup en Remoto

```bash
# Enviar a servidor remoto
pg_dump -U postgres aguasabia | ssh usuario@servidor "gzip > /backups/aguasabia.sql.gz"

# O con scp
pg_dump -U postgres aguasabia > backup.sql
scp backup.sql usuario@servidor:/backups/
```

### 8.4 Backup Automático Cada Hora

**Windows (Task Scheduler)**:
```powershell
# Script PowerShell: backup.ps1
$BackupDir = "C:\Backups\PostgreSQL"
$DBName = "aguasabia"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir\backup_${Timestamp}.sql"

& "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" `
  -U postgres `
  $DBName > $BackupFile
```

**Linux (Crontab)**:
```bash
# Cada hora
0 * * * * pg_dump -U postgres aguasabia > /backups/backup_$(date +\%Y\%m\%d_\%H).sql

# Cada día a las 2 AM
0 2 * * * pg_dump -U postgres aguasabia | gzip > /backups/backup_$(date +\%Y\%m\%d).sql.gz
```

---

## 9. Restauración de Emergencia

### 9.1 Base de Datos Corrupta

```bash
# Intentar vacuum
psql -U postgres -d aguasabia -c "VACUUM FULL;"

# Si falla, restaurar desde backup
pg_restore -U postgres -d aguasabia -c backup_aguasabia.dump
```

### 9.2 Tabla Corrompida Específica

```bash
# Restaurar solo una tabla
pg_restore -U postgres -d aguasabia -t agricultores backup_aguasabia.dump
```

### 9.3 Recuperar Datos Borrados

```bash
# Si la BD está en desarrollo
# 1. Apagar la BD
sudo service postgresql stop

# 2. Copiar archivos de backup de WAL (si existen)
# 3. Reini​ciar
sudo service postgresql start

# O restaurar desde backup anterior
pg_restore -U postgres -d aguasabia backup_aguasabia.dump
```

---

## 10. Verificación y Testing de Backups

### 10.1 Test Mensual de Restauración

Rutina para verificar que los backups son validos:

```bash
#!/bin/bash

# Crear BD de prueba
psql -U postgres -c "CREATE DATABASE aguasabia_test;"

# Restaurar backup
pg_restore -U postgres -d aguasabia_test backup_aguasabia.dump

# Contar registros
psql -U postgres -d aguasabia_test -c "
SELECT 
  'municipios' as tabla, COUNT(*) as registros FROM municipios
UNION ALL
SELECT 'agricultores', COUNT(*) FROM agricultores
UNION ALL
SELECT 'parcelas', COUNT(*) FROM parcelas
UNION ALL
SELECT 'balances_hidricos', COUNT(*) FROM balances_hidricos;
"

# Dropear BD de prueba
psql -U postgres -c "DROP DATABASE aguasabia_test;"

echo "Test de backup completado exitosamente"
```

### 10.2 Comparar Backups

```bash
# Checksums
md5sum backup_aguasabia_*.sql

# Tamaño
ls -lh backup_aguasabia*

# Fecha de modificación
stat backup_aguasabia.sql
```

---

## 11. Políticas de Backup Recomendadas

| Tipo | Frecuencia | Retención | Ubicación |
|------|-----------|----------|-----------|
| Backup Completo | Semanal | 4 semanas | Local + Remoto |
| Backup Diario | Diario | 7 días | Local |
| Backup Horario | Cada hora | 24 horas | Local |
| WAL Archive | Continuo | 7 días | Local + Remoto |

---

## 12. Checklist de Backup

```
[ ] Backup creado exitosamente
[ ] Archivo no vacío (> 1 KB)
[ ] Timestamp en nombre de archivo
[ ] Validación de integridad pasada
[ ] Copia remota completada (si aplica)
[ ] Test de restauración pasado
[ ] Documentación actualizada
[ ] Alertas configuradas si falla
```

---

## 13. Resumen de Comandos

```bash
# CREAR BACKUP
pg_dump -U postgres aguasabia > backup.sql

# CREAR BACKUP COMPRIMIDO
pg_dump -U postgres -Fc aguasabia > backup.dump

# RESTAURAR DESDE SQL
psql -U postgres aguasabia < backup.sql

# RESTAURAR DESDE DUMP
pg_restore -U postgres -d aguasabia backup.dump

# VALIDAR DUMP
pg_restore --validate backup.dump

# BACKUP PROGRAMADO
pg_dump -U postgres aguasabia > ~/backups/backup_$(date +%Y%m%d).sql

# LISTAR TABLAS EN BACKUP
pg_restore -l backup.dump

# RESTAURAR SOLO SCHEMA
pg_restore -U postgres -d aguasabia -s backup.dump

# RESTAURAR SOLO DATOS
pg_restore -U postgres -d aguasabia -a backup.dump
```

---

## 14. Herramientas Alternativas

- **pgAdmin4**: GUI para PostgreSQL
- **DBeaver**: IDE SQL con backup GUI
- **Barman**: Archivado enterprise PostgreSQL
- **WAL-G**: Backup distribuido
- **pgBackRest**: CLI profesional backup/recovery

---

Este procedimiento garantiza la recuperabilidad de los datos de AguaSabia ante cualquier escenario de pérdida o corrupción.
