# Base de Datos - AguaSabia

Esta documentación describe la estructura de la base de datos del proyecto.
La base de datos es PostgreSQL y se gestiona con SQLAlchemy (Python) y Alembic (migraciones).

---

## Modelo de datos

El sistema tiene 5 tablas principales con las siguientes relaciones:

```
Región
 └── tiene muchas Comunas
      └── cada Comuna tiene muchas Parcelas
           └── cada Parcela pertenece a un Agricultor
                └── cada Parcela tiene muchos Balances Hídricos
```

---

## Tablas

### `regiones`

Almacena las regiones de Chile.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Clave primaria, generada automáticamente |
| `nombre` | VARCHAR | Nombre de la región (ej: Atacama, Coquimbo) |

### `comunas`

Almacena las comunas dentro de cada región, junto con su situación hídrica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Clave primaria |
| `nombre` | VARCHAR | Nombre de la comuna (ej: Copiapó) |
| `region_id` | INT | FK → `regiones.id` |
| `situacion` | VARCHAR | Situación hídrica (ej: Escasez hídrica, Estrés hídrico urbano) |

### `agricultores`

Usuarios del sistema. Se autentican con email y contraseña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Clave primaria |
| `nombre` | VARCHAR | Nombre completo |
| `email` | VARCHAR | Email único, se usa para iniciar sesión |
| `hashed_password` | VARCHAR | Contraseña cifrada con bcrypt (nunca en texto plano) |
| `is_active` | BOOL | Si el usuario está habilitado o no |

### `parcelas`

Parcelas de tierra registradas por cada agricultor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Clave primaria |
| `nombre` | VARCHAR | Nombre descriptivo de la parcela |
| `agricultor_id` | INT | FK → `agricultores.id` |
| `comuna_id` | INT | FK → `comunas.id` |
| `latitud` | FLOAT | Coordenada geográfica (se usará para APIs de clima) |
| `longitud` | FLOAT | Coordenada geográfica |
| `superficie` | FLOAT | Tamaño en hectáreas |
| `tipo_cultivo` | VARCHAR | Tipo de cultivo (ej: Maíz, Vid, Palto) |

### `balances_hidricos`

Registros de balance hídrico calculados por parcela y fecha.
Inicialmente se llenan manualmente. En el futuro se calcularán con Open-Meteo y SoilGrids.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Clave primaria |
| `parcela_id` | INT | FK → `parcelas.id` |
| `fecha` | DATE | Fecha del balance |
| `evapotranspiracion` | FLOAT | Agua perdida por evapotranspiración (mm/día) |
| `precipitacion` | FLOAT | Lluvia registrada (mm) |
| `riego_sugerido` | FLOAT | Riego recomendado (mm) |
| `humedad_suelo` | FLOAT | Humedad del suelo (%) |

---

## Migraciones

Las migraciones permiten crear o modificar tablas sin borrar datos.
Se gestionan con Alembic desde la carpeta `backend/`.

```powershell
# Crear tablas por primera vez (o aplicar cambios nuevos)
python -m alembic upgrade head

# Generar una nueva migración después de cambiar un modelo
python -m alembic revision --autogenerate -m "descripcion del cambio"

# Ver el estado actual de la base de datos
python -m alembic current
```

---

## Datos iniciales

El script `scripts/seed.py` carga automáticamente las regiones y comunas de Chile
que presentan situaciones de escasez hídrica. Solo debe ejecutarse una vez:

```powershell
python scripts/seed.py
```

Cubre comunas de: Atacama, Coquimbo, Valparaíso, Metropolitana, O'Higgins, Maule y Los Lagos.

---

## Notas de diseño

- Las contraseñas nunca se guardan en texto plano. Se cifran con bcrypt antes de almacenarse.
- Las coordenadas de cada parcela son el punto de entrada para las futuras integraciones con APIs de clima y suelo.
- La tabla `balances_hidricos` es el núcleo del sistema. Actualmente se puede llenar vía API. En el futuro, Celery lo hará automáticamente cada día.
