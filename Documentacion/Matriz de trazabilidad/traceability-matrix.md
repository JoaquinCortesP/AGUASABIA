# Matriz de Trazabilidad - AguaSabia

Este documento mapea cada requisito funcional de AguaSabia con sus correspondientes archivos físicos, controladores (endpoints), modelos de base de datos y esquemas de validación. Esto asegura que la cobertura técnica del código esté documentada y sea fácil de auditar.

---

## 1. Matriz de Trazabilidad General

| ID | Funcionalidad | Endpoint / Acción | Archivo Controlador | Modelo ORM (BD) | Esquema Pydantic (DTO) | Estado de Implementación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F001** | Autenticación de Agricultores | `POST /api/v1/login/access-token` | `app/api/api_v1/endpoints/login.py` | `Agricultor` | `Token` | ✓ Implementado (Conexión Real BD) |
| **F002** | Listar Parcelas del Usuario | `GET /api/v1/parcelas/` | `app/api/api_v1/endpoints/parcelas.py` | `Parcela` | `Parcela` | ✓ Implementado (Conexión Real BD) |
| **F003** | Registrar Nueva Parcela | `POST /api/v1/parcelas/` | `app/api/api_v1/endpoints/parcelas.py` | `Parcela` | `ParcelaCreate` | ✓ Implementado (Conexión Real BD) |
| **F004** | Obtener Clima de la Parcela | *(Simulado en Tareas)* | - | - | - | 🛠️ Planificado (Fase de integración) |
| **F005** | Calcular Evapotranspiración ($ET_0$) | `calcular_balance_hidrico_stub()` | `app/services/agronomy.py` | - | - | 🟡 Stub / De desarrollo futuro |
| **F006** | Calcular Balance Hídrico (FAO-56) | `calcular_balance_hidrico_stub()` | `app/services/agronomy.py` | `BalanceHidrico` | `BalanceHidricoCreate` | 🟡 Stub / De desarrollo futuro |
| **F007** | Consultar Historial de Balances | `GET /api/v1/balances/` | `app/api/api_v1/endpoints/balances.py` | `BalanceHidrico` | `BalanceHidrico` | ✓ Implementado (Conexión Real BD) |
| **F008** | Registrar Balance Hídrico Diario | `POST /api/v1/balances/` | `app/api/api_v1/endpoints/balances.py` | `BalanceHidrico` | `BalanceHidricoCreate` | ✓ Implementado (Conexión Real BD) |
| **F009** | Tareas Asíncronas de Sistema | `test_celery(word)` | `app/worker.py` | - | - | ✓ Base configurada y operativa |

---

## 2. Detalle Técnico por Funcionalidad

### F001: Autenticación de Agricultores
- **Descripción**: Permite que un agricultor inicie sesión con su correo electrónico y contraseña. Si las credenciales son válidas, se genera y firma un token JWT de acceso.
- **Ruta**: `/api/v1/login/access-token`
- **Método HTTP**: `POST`
- **Controlador**: [login.py](../../Proyecto/backend/app/api/api_v1/endpoints/login.py)
- **Servicio de Seguridad**: [security.py](../../Proyecto/backend/app/core/security.py) (encriptación con bcrypt y firmado JWT).
- **Modelo ORM**: [agricultor.py](../../Proyecto/backend/app/models/agricultor.py) (tabla `agricultores`).
- **Esquema Pydantic**: [token.py](../../Proyecto/backend/app/schemas/token.py) (`Token` y `TokenPayload`).
- **Dependencias**: `jose` (JWT), `passlib` (bcrypt).
- **Consultas BD**: `SELECT * FROM agricultores WHERE email = :username`.

---

### F002: Listar Parcelas del Usuario
- **Descripción**: Devuelve un listado completo de todas las parcelas asociadas únicamente al agricultor que se encuentra actualmente autenticado en la sesión.
- **Ruta**: `/api/v1/parcelas/`
- **Método HTTP**: `GET`
- **Controlador**: [parcelas.py](../../Proyecto/backend/app/api/api_v1/endpoints/parcelas.py)
- **Modelo ORM**: [parcela.py](../../Proyecto/backend/app/models/parcela.py) (tabla `parcelas`).
- **Esquema Pydantic**: [parcela.py](../../Proyecto/backend/app/schemas/parcela.py) (`Parcela`).
- **Consultas BD**: `SELECT * FROM parcelas WHERE agricultor_id = :current_user_id LIMIT :limit OFFSET :skip`.

---

### F003: Registrar Nueva Parcela
- **Descripción**: Permite dar de alta una nueva parcela de terreno asignándola al agricultor actual, especificando su nombre, coordenadas geográficas, superficie y cultivo actual.
- **Ruta**: `/api/v1/parcelas/`
- **Método HTTP**: `POST`
- **Controlador**: [parcelas.py](../../Proyecto/backend/app/api/api_v1/endpoints/parcelas.py)
- **Modelo ORM**: [parcela.py](../../Proyecto/backend/app/models/parcela.py) (tabla `parcelas`).
- **Esquema Pydantic**: [parcela.py](../../Proyecto/backend/app/schemas/parcela.py) (`ParcelaCreate`).
- **Consultas BD**: `INSERT INTO parcelas (nombre, agricultor_id, comuna_id, latitud, longitud, superficie, tipo_cultivo) VALUES (...)`.

---

### F004, F005 y F006: Motor Agronómico y de Balance (FAO-56)
- **Descripción**: Recupera el clima e índices y calcula el balance de agua en el suelo diariamente. En esta fase, las fórmulas están diseñadas pero no conectadas a servicios vivos.
- **Implementación**: [agronomy.py](../../Proyecto/backend/app/services/agronomy.py) (`calcular_balance_hidrico_stub`).
- **Detalle de Fórmulas**: Almacenado en el documento maestro [DocumentacionPersonal.txt](../../DocumentacionPersonal.txt) (fórmulas matemáticas completas del balance hídrico).

---

### F007: Consultar Historial de Balances
- **Descripción**: Permite que el frontend obtenga los registros históricos de evapotranspiración, lluvias y riego sugerido para una parcela de tierra en base a su ID.
- **Ruta**: `/api/v1/balances/`
- **Método HTTP**: `GET`
- **Controlador**: [balances.py](../../Proyecto/backend/app/api/api_v1/endpoints/balances.py)
- **Modelo ORM**: [balance_hidrico.py](../../Proyecto/backend/app/models/balance_hidrico.py) (tabla `balances_hidricos`).
- **Esquema Pydantic**: [balance_hidrico.py](../../Proyecto/backend/app/schemas/balance_hidrico.py) (`BalanceHidrico`).
- **Consultas BD**: `SELECT * FROM balances_hidricos WHERE parcela_id = :parcela_id LIMIT :limit OFFSET :skip`.

---

### F008: Registrar Balance Hídrico
- **Descripción**: Permite almacenar un registro de balance hídrico diario para una parcela específica. Este endpoint es consumido principalmente por procesos automatizados del sistema.
- **Ruta**: `/api/v1/balances/`
- **Método HTTP**: `POST`
- **Controlador**: [balances.py](../../Proyecto/backend/app/api/api_v1/endpoints/balances.py)
- **Modelo ORM**: [balance_hidrico.py](../../Proyecto/backend/app/models/balance_hidrico.py) (tabla `balances_hidricos`).
- **Esquema Pydantic**: [balance_hidrico.py](../../Proyecto/backend/app/schemas/balance_hidrico.py) (`BalanceHidricoCreate`).

---

### F009: Tareas Asíncronas (Celery / Redis)
- **Descripción**: Gestiona tareas pesadas en background como el procesamiento masivo diario.
- **Implementación**: [worker.py](../../Proyecto/backend/app/worker.py) (definición de la tarea de prueba `test_celery` y conexión con Redis).

---

## 3. Pruebas y Validación de Cobertura

Actualmente el sistema no posee un suite de pruebas automatizadas en `pytest`. Las validaciones se han realizado de forma manual sobre los endpoints usando:
1. **Swagger UI**: Validación de contratos de entrada y salida interactuando directamente en `/docs`.
2. **PostgreSQL**: Verificación de inserción correcta de registros y llaves foráneas.
3. **Logs de Servidor**: Verificación de peticiones correctas y decodificación de tokens JWT mediante `uvicorn`.
