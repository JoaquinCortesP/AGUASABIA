# Matriz de Trazabilidad - AguaSabia

## 1. Descripción

La matriz de trazabilidad mapea las funcionalidades del sistema con sus componentes técnicos (endpoints, servicios, entidades, modelos). Esto permite validar que cada funcionalidad está completamente implementada.

---

## 2. Matriz de Trazabilidad General

| ID | Funcionalidad | Endpoint | Servicio | Modelo | Esquema | Descripción |
|----|----|----|----|----|----|----| 
| F001 | Autenticación de Usuarios | `POST /api/v1/auth/login` | - | Agricultor | - | Login con email/password, retorna JWT token |
| F002 | Listar Parcelas | `GET /api/v1/parcelas/` | - | Parcela | Parcela | Obtener lista de todas las parcelas |
| F003 | Crear Parcela | `POST /api/v1/parcelas/` | - | Parcela | ParcelaCreate | Crear nueva parcela con datos geométricos |
| F004 | Obtener Clima | `GET /api/v1/clima/actual` | ClimaService | - | - | Obtener datos meteorológicos por coordenadas |
| F005 | Calcular ET0 | - | AgronomicoService | - | - | Calcular evapotranspiración de referencia (FAO-56) |
| F006 | Calcular Balance Hídrico | - | AgronomicoService | BalanceHidrico | BalanceHidricoCreate | Calcular balance hídrico para una parcela |
| F007 | Obtener Balance Hídrico | `GET /api/v1/balances/` | - | BalanceHidrico | BalanceHidrico | Consultar registros de balance hídrico |
| F008 | Obtener Propiedades Suelo | - | SueloService | - | - | Obtener capacidad de campo y punto de marchitez |
| F009 | Sincronizar Datos Climáticos | - (Task Celery) | ClimaService | - | - | Sincronización periódica de datos climáticos |

---

## 3. Matriz por Funcionalidad

### F001: Autenticación de Usuarios

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F001 |
| **Nombre** | Autenticación de Usuarios |
| **Endpoint** | `POST /api/v1/auth/login` |
| **Ubicación en Código** | `app/api/v1/endpoints/auth.py` |
| **Servicio** | `app/core/security.py` |
| **Modelo ORM** | `app/models/agricultor.py` → tabla `agricultores` |
| **Esquema DTO** | `app/schemas/agricultor.py` → `AgricultorCreate` |
| **Método HTTP** | POST |
| **Autenticación** | OAuth2PasswordRequestForm |
| **Request** | `{ username: string, password: string }` |
| **Response** | `{ access_token: string, token_type: "bearer" }` |
| **Códigos HTTP** | 200 (OK), 401 (Unauthorized), 422 (Validation Error) |
| **Lógica Negocio** | - Verificar email existe en BD<br/>- Verificar contraseña contra hash bcrypt<br/>- Generar JWT token con SECRET_KEY<br/>- Fijar expiración en ACCESS_TOKEN_EXPIRE_MINUTES |
| **BD Queries** | `SELECT * FROM agricultores WHERE email = ?` |
| **Dependencias** | Passlib, Bcrypt, JWT |
| **Status** | ✓ Implementado (con datos simulados) |

---

### F002: Listar Parcelas

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F002 |
| **Nombre** | Listar Parcelas |
| **Endpoint** | `GET /api/v1/parcelas/` |
| **Ubicación en Código** | `app/api/v1/endpoints/parcela.py` |
| **Servicio** | - (directo desde endpoint) |
| **Modelo ORM** | `app/models/parcela.py` → tabla `parcelas` |
| **Esquema DTO** | `app/schemas/parcela.py` → `Parcela` |
| **Método HTTP** | GET |
| **Autenticación** | Bearer Token JWT |
| **Request** | Headers: `Authorization: Bearer <token>` |
| **Response** | `[ { id, nombre, latitud, longitud, area, cultivo, agricultor_id } ]` |
| **Códigos HTTP** | 200 (OK), 401 (Unauthorized) |
| **Lógica Negocio** | - Validar token JWT<br/>- Consultar todas las parcelas<br/>- Retornar lista formateada |
| **BD Queries** | `SELECT * FROM parcelas` |
| **Dependencias** | SQLAlchemy ORM, FastAPI Security |
| **Status** | ✓ Implementado (retorna lista vacía) |

---

### F003: Crear Parcela

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F003 |
| **Nombre** | Crear Parcela |
| **Endpoint** | `POST /api/v1/parcelas/` |
| **Ubicación en Código** | `app/api/v1/endpoints/parcela.py` |
| **Servicio** | - (directo desde endpoint) |
| **Modelo ORM** | `app/models/parcela.py` → tabla `parcelas` |
| **Esquema DTO** | `app/schemas/parcela.py` → `ParcelaCreate` |
| **Método HTTP** | POST |
| **Autenticación** | Bearer Token JWT |
| **Request** | `{ nombre, latitud, longitud, area, cultivo, agricultor_id }` |
| **Response** | `{ id, nombre, latitud, longitud, area, cultivo, agricultor_id }` |
| **Códigos HTTP** | 201 (Created), 400 (Bad Request), 422 (Validation) |
| **Validaciones Pydantic** | - nombre: string no vacío<br/>- latitud: float -90 a 90<br/>- longitud: float -180 a 180<br/>- area: float > 0<br/>- cultivo: string<br/>- agricultor_id: int existe |
| **Lógica Negocio** | - Validar datos entrada<br/>- Verificar agricultor existe<br/>- Insertar parcela en BD<br/>- Retornar parcela creada |
| **BD Queries** | `INSERT INTO parcelas (...) VALUES (...)`<br/>`SELECT * FROM agricultores WHERE id = ?` |
| **Dependencias** | SQLAlchemy ORM, Pydantic, FastAPI |
| **Status** | ✓ Implementado |

---

### F004: Obtener Clima

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F004 |
| **Nombre** | Obtener Clima |
| **Endpoint** | `GET /api/v1/clima/actual` |
| **Ubicación en Código** | `app/api/v1/endpoints/clima.py` |
| **Servicio** | `app/services/clima_service.py` → `ClimaService.obtener_pronostico()` |
| **Modelo ORM** | - (sin persistencia) |
| **Esquema DTO** | - (respuesta libre) |
| **Método HTTP** | GET |
| **Autenticación** | Bearer Token JWT |
| **Query Params** | `latitud: float, longitud: float` |
| **Response** | `{ temperatura, humedad, precipitacion, velocidad_viento }` |
| **Códigos HTTP** | 200 (OK), 400 (Invalid coords), 401 (Unauthorized) |
| **Validaciones** | - latitud: -90 a 90<br/>- longitud: -180 a 180 |
| **Lógica Negocio** | - Validar coordenadas<br/>- Llamar ClimaService.obtener_pronostico()<br/>- Retornar datos (simulados actualmente) |
| **API Externas** | Open-Meteo API (comentada) |
| **Dependencias** | httpx, FastAPI |
| **Status** | ✓ Implementado (datos simulados) |

---

### F005: Calcular ET0

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F005 |
| **Nombre** | Calcular ET0 (Evapotranspiración Referencia) |
| **Endpoint** | - (función de servicio) |
| **Ubicación en Código** | `app/services/agronomico.py` → `AgronomicoService.calcular_et_o()` |
| **Input** | `datos_climaticos: dict` |
| **Output** | `float` (mm/día) |
| **Algoritmo** | FAO-56 Penman-Monteith (simplificado) |
| **Parámetros FAO-56** | - Temperatura<br/>- Humedad relativa<br/>- Velocidad viento<br/>- Radiación solar |
| **Fórmula** | ET0 = c × (Rn / λ + γ / (Δ + γ)) × (u2 / T + 273) |
| **Status** | ✓ Implementado (retorna 5.5 mm/día) |
| **Lógica Actual** | Valor hardcoded de prueba |

---

### F006: Calcular Balance Hídrico

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F006 |
| **Nombre** | Calcular Balance Hídrico |
| **Endpoint** | - (función de servicio) |
| **Ubicación en Código** | `app/services/agronomico.py` → `AgronomicoService.calcular_balance_hidrico()` |
| **Input** | `et_o: float, cultivo: string` |
| **Output** | `float` (mm/día) |
| **Modelo ORM** | `app/models/balance.py` → tabla `balances_hidricos` |
| **Esquema DTO** | `app/schemas/balance.py` → `BalanceHidricoCreate` |
| **Fórmula** | Balance = ET0 × Kc(cultivo) |
| **Coeficientes Kc** | - Maíz: 0.8<br/>- Frijol: 0.75<br/>- Sorgo: 0.7<br/>- Otros: 0.8 |
| **Status** | ✓ Implementado (retorna ET0 × 0.8) |
| **Persistencia** | Guarda en tabla `balances_hidricos` |

---

### F007: Obtener Balance Hídrico

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F007 |
| **Nombre** | Obtener Balance Hídrico |
| **Endpoint** | `GET /api/v1/balances/` |
| **Ubicación en Código** | `app/api/v1/endpoints/balance.py` |
| **Servicio** | - (directo desde endpoint) |
| **Modelo ORM** | `app/models/balance.py` → tabla `balances_hidricos` |
| **Esquema DTO** | `app/schemas/balance.py` → `BalanceHidrico` |
| **Método HTTP** | GET |
| **Autenticación** | Bearer Token JWT |
| **Query Params** | `parcela_id: int (opcional), fecha: date (opcional)` |
| **Response** | `{ et_o, balance, precipitacion, riego, humedad_suelo }` |
| **BD Queries** | `SELECT * FROM balances_hidricos WHERE parcela_id = ? AND fecha = ?` |
| **Status** | ✓ Implementado (datos simulados) |

---

### F008: Obtener Propiedades Suelo

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F008 |
| **Nombre** | Obtener Propiedades Suelo |
| **Endpoint** | - (función de servicio) |
| **Ubicación en Código** | `app/services/suelo_service.py` → `SueloService.obtener_propiedades_suelo()` |
| **Input** | `latitud: float, longitud: float` |
| **Output** | `{ capacidad_campo: float, punto_marchitez: float }` |
| **Capacidad Campo** | Humedad máxima que suelo retiene |
| **Punto Marchitez** | Humedad mínima para crecimiento |
| **Status** | ✓ Implementado (valores constantes por prueba) |
| **Valores Actuales** | - Capacidad: 30%<br/>- Marchitez: 15% |

---

### F009: Sincronizar Datos Climáticos (Celery Task)

| Componente | Detalles |
|-----------|----------|
| **ID Función** | F009 |
| **Nombre** | Sincronizar Datos Climáticos |
| **Tipo** | Tarea Asincrónica (Celery) |
| **Ubicación en Código** | `app/workers/tasks.py` → `sincronizar_clima()` |
| **Broker** | Redis |
| **Servicio** | `app/services/clima_service.py` |
| **Task Name** | `sincronizar_clima` |
| **Trigger** | Periódico (tiempo por definir) |
| **Entrada** | - (sin parámetros) |
| **Salida** | `{ status: string, mensaje: string }` |
| **Lógica** | - Consultar todas las parcelas<br/>- Para cada parcela obtener clima<br/>- Calcular ET0<br/>- Crear registro balance_hidrico<br/>- Guardar en BD |
| **Status** | ✓ Implementado (retorna string simulado) |
| **Error Handling** | Reintenta automáticamente si falla |

---

## 4. Matriz de Dependencias

```
Endpoint → Servicio → Modelo → BD
   ↓          ↓         ↓        ↓
  deps.py  business  SQLAlchemy  PG
```

### Flujo de Dependencias

| Capa | Componente | Depende De |
|------|-----------|-----------|
| **Presentación** | auth.py | security.py, Agricultor model |
| **Presentación** | parcela.py | get_db(), Parcela model |
| **Presentación** | balance.py | get_db(), BalanceHidrico model |
| **Presentación** | clima.py | ClimaService |
| **Negocio** | agronomico.py | - (standalone) |
| **Negocio** | clima_service.py | httpx |
| **Negocio** | suelo_service.py | - (standalone) |
| **Acceso Datos** | session.py | create_engine, SessionLocal |
| **Modelos** | agricultor | Base, ForeignKey(municipios) |
| **Modelos** | parcela | Base, ForeignKey(agricultores) |
| **Modelos** | balance | Base, ForeignKey(parcelas) |
| **Workers** | tasks.py | celery_app, servicios |

---

## 5. Matriz de Validación

| Funcionalidad | Validación Requerida | Ubicación | Status |
|---|---|---|---|
| F001 - Login | Email existe, Password correcta | auth.py + security.py | ✓ Implementado |
| F002 - Listar Parcelas | Token JWT válido | auth.py (decorator) | ✓ Implementado |
| F003 - Crear Parcela | Datos schema válidos, Agricultor existe | parcela.py | ✓ Implementado |
| F004 - Obtener Clima | Coordenadas válidas (-90..90, -180..180) | clima.py | ✓ Implementado |
| F005 - ET0 | Datos climáticos disponibles | agronomico.py | ✓ Implementado |
| F006 - Balance | Parcela existe, Cultivo válido | balance.py | ✓ Implementado |
| F007 - Get Balance | Parcela existe, Fecha válida | balance.py | ✓ Implementado |
| F008 - Suelo | Coordenadas válidas | suelo_service.py | ✓ Implementado |
| F009 - Sync Clima | Tareas previas completadas | tasks.py | ✓ Implementado |

---

## 6. Matriz de Cobertura de Testing

| Función | Unit Tests | Integration Tests | E2E Tests |
|---|---|---|---|
| F001 - Login | - | - | - |
| F002 - Listar Parcelas | - | - | - |
| F003 - Crear Parcela | - | - | - |
| F004 - Obtener Clima | - | - | - |
| F005 - Calcular ET0 | - | - | - |
| F006 - Balance Hídrico | - | - | - |
| F007 - Get Balance | - | - | - |
| F008 - Suelo | - | - | - |
| F009 - Sync Clima | - | - | - |

**Nota**: No hay tests automatizados implementados. Recomendado: pytest

---

## 7. Resumen de Implementación

| Métrica | Valor |
|---|---|
| Total de Funcionalidades | 9 |
| Funcionalidades Implementadas | 9 (100%) |
| Con Datos Reales | 0 (0%) |
| Con Datos Simulados | 9 (100%) |
| Endpoints Totales | 4 |
| Servicios | 3 |
| Modelos ORM | 4 |
| Esquemas DTO | 3 |
| Tareas Celery | 2 |

---

## 8. Matriz de Completitud

La matriz indica que el backend tiene estructura completa pero con funcionalidades de prueba. Para llevar a producción requiere:

- [ ] Implementar datos reales en lugar de simulados
- [ ] Conexión real a API de clima (Open-Meteo)
- [ ] Tests unitarios e integración
- [ ] Endpoints CRUD faltantes (UPDATE, DELETE)
- [ ] Validaciones más estrictas
- [ ] Manejo de errores más robusto
- [ ] Logging y monitoreo

Este documento sirve como referencia para auditoría y evaluación académica del proyecto.
