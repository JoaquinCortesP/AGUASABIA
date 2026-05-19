# Documentación de Base de Datos - AguaSabia

## 1. Descripción General

La base de datos de AguaSabia es un sistema relacional PostgreSQL que almacena información sobre municipios, agricultores, sus parcelas, y datos de balance hídrico. Utiliza SQLAlchemy como ORM para abstracción.

**Versión**: PostgreSQL 12+
**ORM**: SQLAlchemy 2.0.49
**Driver**: psycopg2-binary 2.9.12

## 2. Modelo Entidad-Relación (MER)

```
┌─────────────────────┐
│     MUNICIPIOS      │
├─────────────────────┤
│ id (PK)      INT    │
│ nombre       STRING │
│ region       STRING │
└─────────────────────┘
         ▲
         │ 1
         │ : N
         │
    ┌────────────────────────────┐
    │      AGRICULTORES          │
    ├────────────────────────────┤
    │ id (PK)         INT        │
    │ nombre          STRING     │
    │ email           STRING (U) │
    │ hashed_password STRING     │
    │ municipio_id (FK) INT      │
    └────────────────────────────┘
              ▲
              │ 1
              │ : N
              │
         ┌────────────────────────────┐
         │       PARCELAS             │
         ├────────────────────────────┤
         │ id (PK)         INT        │
         │ nombre          STRING     │
         │ latitud         FLOAT      │
         │ longitud        FLOAT      │
         │ area            FLOAT      │
         │ cultivo         STRING     │
         │ agricultor_id (FK) INT     │
         └────────────────────────────┘
                  ▲
                  │ 1
                  │ : N
                  │
         ┌────────────────────────────┐
         │ BALANCES_HIDRICOS          │
         ├────────────────────────────┤
         │ id (PK)           INT      │
         │ fecha             DATE     │
         │ et_o              FLOAT    │
         │ evapotranspiracion_real F  │
         │ precipitacion     FLOAT    │
         │ riego             FLOAT    │
         │ humedad_suelo     FLOAT    │
         │ parcela_id (FK)   INT      │
         └────────────────────────────┘
```

## 3. Descripción Detallada de Entidades

### 3.1 Tabla: MUNICIPIOS

**Propósito**: Almacenar municipios donde operan los agricultores.

**Ubicación en código**: `app/models/municipio.py`

**Estructura**:

```python
class Municipio(Base):
    __tablename__ = "municipios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    region = Column(String)
```

**Atributos**:

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| `id` | INT | PRIMARY KEY, INDEX | Identificador único del municipio |
| `nombre` | VARCHAR | INDEX, NOT NULL | Nombre del municipio (ej: San Salvador) |
| `region` | VARCHAR | - | Región o departamento (ej: Cuscatlán) |

**Ejemplo de datos**:

```sql
INSERT INTO municipios (nombre, region) VALUES
('San Salvador', 'Cuscatlán'),
('Soyapango', 'San Salvador'),
('Santa Tecla', 'La Libertad');
```

**Relaciones**:
- 1 Municipio → N Agricultores

---

### 3.2 Tabla: AGRICULTORES

**Propósito**: Almacenar información de usuarios agricultores registrados.

**Ubicación en código**: `app/models/agricultor.py`

**Estructura**:

```python
class Agricultor(Base):
    __tablename__ = "agricultores"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    municipio_id = Column(Integer, ForeignKey("municipios.id"))
```

**Atributos**:

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| `id` | INT | PRIMARY KEY, INDEX | Identificador único del agricultor |
| `nombre` | VARCHAR | INDEX, NOT NULL | Nombre completo del agricultor |
| `email` | VARCHAR | UNIQUE, INDEX, NOT NULL | Email para autenticación y contacto |
| `hashed_password` | VARCHAR | NOT NULL | Hash bcrypt de la contraseña |
| `municipio_id` | INT | FOREIGN KEY, NOT NULL | Referencia al municipio |

**Ejemplo de datos**:

```sql
INSERT INTO agricultores (nombre, email, hashed_password, municipio_id) VALUES
('Juan Pérez', 'juan@example.com', '$2b$12$...hash...', 1),
('María González', 'maria@example.com', '$2b$12$...hash...', 2);
```

**Relaciones**:
- Muchos → 1 Municipio
- 1 Agricultor → N Parcelas

**Notas**:
- La contraseña se almacena hasheada con bcrypt (nunca en texto plano)
- El email es único para evitar duplicados
- El municipio_id vincula al agricultor con su región

---

### 3.3 Tabla: PARCELAS

**Propósito**: Almacenar información de parcelas de tierra de cada agricultor.

**Ubicación en código**: `app/models/parcela.py`

**Estructura**:

```python
class Parcela(Base):
    __tablename__ = "parcelas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    latitud = Column(Float)
    longitud = Column(Float)
    area = Column(Float)
    cultivo = Column(String)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"))
```

**Atributos**:

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| `id` | INT | PRIMARY KEY, INDEX | Identificador único de la parcela |
| `nombre` | VARCHAR | INDEX, NOT NULL | Nombre descriptivo (ej: Parcela Norte) |
| `latitud` | FLOAT | NOT NULL | Coordenada geográfica de latitud |
| `longitud` | FLOAT | NOT NULL | Coordenada geográfica de longitud |
| `area` | FLOAT | NOT NULL | Área de la parcela en hectáreas |
| `cultivo` | VARCHAR | NOT NULL | Tipo de cultivo (ej: Maíz, Frijol) |
| `agricultor_id` | INT | FOREIGN KEY, NOT NULL | Referencia al agricultor propietario |

**Ejemplo de datos**:

```sql
INSERT INTO parcelas (nombre, latitud, longitud, area, cultivo, agricultor_id) VALUES
('Parcela Norte', 13.6929, -89.2182, 2.5, 'Maíz', 1),
('Parcela Sur', 13.6900, -89.2200, 1.8, 'Frijol', 1),
('Parcela Este', 13.7050, -89.2100, 3.2, 'Sorgo', 2);
```

**Relaciones**:
- Muchos → 1 Agricultor
- 1 Parcela → N Balances Hídricos

**Notas**:
- Las coordenadas (latitud/longitud) se usan para consultar datos climáticos
- El área está en hectáreas
- El cultivo determina coeficientes de evapotranspiración

---

### 3.4 Tabla: BALANCES_HIDRICOS

**Propósito**: Almacenar registros históricos de balance hídrico por parcela y fecha.

**Ubicación en código**: `app/models/balance.py`

**Estructura**:

```python
class BalanceHidrico(Base):
    __tablename__ = "balances_hidricos"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    et_o = Column(Float)
    evapotranspiracion_real = Column(Float)
    precipitacion = Column(Float)
    riego = Column(Float)
    humedad_suelo = Column(Float)
    parcela_id = Column(Integer, ForeignKey("parcelas.id"))
```

**Atributos**:

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| `id` | INT | PRIMARY KEY, INDEX | Identificador único del registro |
| `fecha` | DATE | NOT NULL, INDEX | Fecha del balance (ej: 2024-05-13) |
| `et_o` | FLOAT | NOT NULL | Evapotranspiración de referencia (mm/día) |
| `evapotranspiracion_real` | FLOAT | NOT NULL | Evapotranspiración real del cultivo (mm/día) |
| `precipitacion` | FLOAT | NOT NULL | Precipitación registrada (mm) |
| `riego` | FLOAT | NOT NULL | Agua de riego aplicada (mm) |
| `humedad_suelo` | FLOAT | NOT NULL | Contenido de humedad del suelo (%) |
| `parcela_id` | INT | FOREIGN KEY, NOT NULL | Referencia a la parcela |

**Ejemplo de datos**:

```sql
INSERT INTO balances_hidricos (fecha, et_o, evapotranspiracion_real, precipitacion, riego, humedad_suelo, parcela_id) 
VALUES
('2024-05-13', 5.5, 4.4, 0.0, 5.0, 65.0, 1),
('2024-05-14', 5.3, 4.2, 2.1, 3.0, 68.5, 1),
('2024-05-13', 4.8, 3.8, 0.0, 4.5, 60.2, 2);
```

**Relaciones**:
- Muchos → 1 Parcela

**Fórmula FAO-56**:

```
Balance Hídrico = Precipitación + Riego - Evapotranspiración Real
Humedad Suelo (t+1) = Humedad Suelo (t) + Balance Hídrico
```

**Notas**:
- ET_o (evapotranspiración de referencia) se calcula basado en datos climáticos
- ET_real = ET_o × Kc (Kc depende del cultivo)
- Este tabla es la más crítica para análisis agrícola

---

## 4. Claves Primarias y Foráneas

### 4.1 Claves Primarias

| Tabla | Campo PK | Tipo | Auto-increment |
|-------|----------|------|----------------|
| MUNICIPIOS | `id` | INT | Sí |
| AGRICULTORES | `id` | INT | Sí |
| PARCELAS | `id` | INT | Sí |
| BALANCES_HIDRICOS | `id` | INT | Sí |

### 4.2 Claves Foráneas

| Tabla | Campo FK | Referencia | ON DELETE |
|-------|----------|-----------|-----------|
| AGRICULTORES | `municipio_id` | MUNICIPIOS.id | (Default: Restrict) |
| PARCELAS | `agricultor_id` | AGRICULTORES.id | (Default: Restrict) |
| BALANCES_HIDRICOS | `parcela_id` | PARCELAS.id | (Default: Restrict) |

### 4.3 Constraints Únicos

| Tabla | Campo | Descripción |
|-------|-------|-------------|
| AGRICULTORES | `email` | No puede haber dos agricultores con el mismo email |

---

## 5. Índices

SQLAlchemy crea índices automáticamente en:
- Claves primarias (id)
- Campos con `index=True`

**Índices por tabla**:

```sql
-- MUNICIPIOS
CREATE INDEX ix_municipios_id ON municipios(id);
CREATE INDEX ix_municipios_nombre ON municipios(nombre);

-- AGRICULTORES
CREATE INDEX ix_agricultores_id ON agricultores(id);
CREATE INDEX ix_agricultores_nombre ON agricultores(nombre);
CREATE INDEX ix_agricultores_email ON agricultores(email);

-- PARCELAS
CREATE INDEX ix_parcelas_id ON parcelas(id);
CREATE INDEX ix_parcelas_nombre ON parcelas(nombre);

-- BALANCES_HIDRICOS
CREATE INDEX ix_balances_hidricos_id ON balances_hidricos(id);
CREATE INDEX ix_balances_hidricos_fecha ON balances_hidricos(fecha);
```

---

## 6. Flujo de Persistencia

### 6.1 Crear Agricultor

```python
# 1. Recibir datos JSON
agricultor_data = {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "contraseña123",
    "municipio_id": 1
}

# 2. Validar con Pydantic (AgricultorCreate schema)
agricultor_create = AgricultorCreate(**agricultor_data)

# 3. Hash de contraseña
hashed_pwd = get_password_hash(agricultor_create.password)

# 4. Crear instancia del modelo
agricultor_model = Agricultor(
    nombre=agricultor_create.nombre,
    email=agricultor_create.email,
    hashed_password=hashed_pwd,
    municipio_id=agricultor_create.municipio_id
)

# 5. Guardar en BD
db.add(agricultor_model)
db.commit()
db.refresh(agricultor_model)

# 6. Retornar DTO
return Agricultor.from_orm(agricultor_model)
```

### 6.2 Crear Balance Hídrico

```python
# 1. Obtener parcela
parcela = db.query(Parcela).filter(Parcela.id == parcela_id).first()

# 2. Obtener datos climáticos
datos_clima = await clima_service.obtener_pronostico(parcela.latitud, parcela.longitud)

# 3. Calcular ET0 (evapotranspiración de referencia)
et_o = agronomico_service.calcular_et_o(datos_clima)

# 4. Calcular balance hídrico
balance = agronomico_service.calcular_balance_hidrico(et_o, parcela.cultivo)

# 5. Crear registro
balance_hidrico = BalanceHidrico(
    fecha=date.today(),
    et_o=et_o,
    evapotranspiracion_real=balance,
    precipitacion=datos_clima.get('precipitacion', 0),
    riego=0,  # Se actualizará manualmente
    humedad_suelo=65.0,  # Valor inicial
    parcela_id=parcela_id
)

# 6. Guardar en BD
db.add(balance_hidrico)
db.commit()
```

---

## 7. Tecnología ORM - SQLAlchemy

### 7.1 Configuración de Conexión

**Archivo**: `app/db/session.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine con pool de conexiones
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Verifica conexión antes de usar
)

# Factory de sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

**Ventajas de `pool_pre_ping=True`**:
- Verifica que la conexión esté activa
- Reconecta automáticamente si se perdió
- Evita errores de "connection lost"

### 7.2 Inyección de Dependencias

**Archivo**: `app/api/deps.py`

```python
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Uso en endpoints**:

```python
@router.get("/")
def get_agricultores(db: Session = Depends(get_db)):
    return db.query(Agricultor).all()
```

### 7.3 Ventajas de SQLAlchemy 2.0

- **Type-safe queries**: Validación en tiempo de desarrollo
- **Async support**: Soporte para operaciones asincrónicas
- **Lazy loading**: Carga de relaciones bajo demanda
- **Expression language**: SQL flexible y pythónico

---

## 8. Consultas Comunes

### 8.1 Obtener Agricultor por Email

```python
agricultor = db.query(Agricultor).filter(
    Agricultor.email == "juan@example.com"
).first()
```

### 8.2 Obtener Parcelas de un Agricultor

```python
parcelas = db.query(Parcela).filter(
    Parcela.agricultor_id == agricultor_id
).all()
```

### 8.3 Obtener Balance Hídrico por Fecha y Parcela

```python
from datetime import date

balances = db.query(BalanceHidrico).filter(
    (BalanceHidrico.parcela_id == parcela_id) &
    (BalanceHidrico.fecha == date.today())
).all()
```

### 8.4 Obtener Promedios de Humedad del Suelo

```python
from sqlalchemy import func

promedio_humedad = db.query(
    func.avg(BalanceHidrico.humedad_suelo)
).filter(
    BalanceHidrico.parcela_id == parcela_id
).scalar()
```

---

## 9. Backup y Restore

### 9.1 Crear Backup

```bash
# Backup completo
pg_dump -U postgres aguasabia > backup_aguasabia.sql

# Backup con compresión
pg_dump -U postgres -Fc aguasabia > backup_aguasabia.dump
```

### 9.2 Restaurar Backup

```bash
# Restaurar desde SQL
psql -U postgres aguasabia < backup_aguasabia.sql

# Restaurar desde dump comprimido
pg_restore -U postgres -d aguasabia backup_aguasabia.dump
```

---

## 10. Diagrama de Transacciones

```
Cliente Request
    ↓
FastAPI Endpoint
    ↓
Pydantic Schema (Validación)
    ↓
Service Layer (Lógica de negocio)
    ↓
SQLAlchemy ORM (Mapeo)
    ↓
PostgreSQL (Transacción SQL)
    ↓
Commit/Rollback
    ↓
Cliente Response (DTO)
```

---

## 11. Resumen de Configuración de BD

- **Motor**: PostgreSQL 12+
- **ORM**: SQLAlchemy 2.0.49
- **Driver**: psycopg2-binary
- **Tablas**: 4 (Municipios, Agricultores, Parcelas, Balances Hídricos)
- **Relaciones**: 3 FK (Municipio→Agricultor, Agricultor→Parcela, Parcela→Balance)
- **Pool de conexiones**: Habilitado con verificación de disponibilidad
- **Inyección de dependencias**: FastAPI Depends

Esta arquitectura permite escalabilidad horizontal y mantenibilidad del código.
