INFORME INTEGRAL: PLAN DE PRUEBAS Y CONFIGURACIÓN DEL SISTEMA
Plataforma de Monitoreo Territorial Hidrológico - AguaSabia
Documento Técnico de Aseguramiento de Calidad

Responsables: Joaquín Cortes y Sofía Araya

Docente: Jorge Augusto Niochet

---

## 1. Alineación con la Problemática y Objetivos del Plan
El proyecto AguaSabia responde a la necesidad crítica de gestionar de forma eficiente, ética y segura la información hídrica y ambiental del territorio. Con el fin de garantizar que los módulos de visualización, los indicadores climáticos (como los obtenidos mediante la API de Open-Meteo), el análisis espacial real con la **Dirección General de Aguas (DGA)** mediante **PostGIS**, y el análisis de polígonos GeoJSON funcionen bajo estrictos estándares de software, se ha estructurado este Plan de Pruebas. El objetivo principal es validar el comportamiento completo del backend aislándolo de entornos productivos, asegurando la resiliencia ante geometrías malformadas (usando `ST_MakeValid`), el cumplimiento de los límites de los planes de usuario (gratuito y pago) y la correcta persistencia e intersección de información geográfica.

---

## 2. Plan de Acciones y Casos de Prueba Funcionales
La siguiente tabla describe detalladamente las acciones de prueba planificadas sobre las funcionalidades críticas del producto, indicando los componentes evaluados, la descripción precisa de la comprobación y el resultado esperado.

| ID | Funcionalidad / Componente | Acción a Realizar (Prueba) | Resultado Esperado | Estado |
|---|---|---|---|---|
| **PR-FUNC-001** | Autenticación y Control de Acceso | Ingresar al backend con credenciales demo de administrador (`admin@aguasabia.cl`) y contraseñas de usuario estándar. | Generación exitosa de token JWT con rol correspondiente. Denegación inmediata ante contraseñas inválidas. | Implementado |
| **PR-FUNC-002** | Restricción de Plan y Funciones Pro | Realizar una consulta territorial con un usuario sin sesión (Guest) o usuario Gratuito. | El sistema oculta capas DGA, humedales y coordenadas exactas, retornando un aviso visual (HTTP 403 en endpoints protegidos o `avanzado_restringido` en el JSON) invitando a mejorar el plan. | Implementado |
| **PR-FUNC-003** | Persistencia y Validación de Polígonos | Enviar un objeto GeoJSON estructurado con la geometría de un predio complejo que cruce sus propias líneas a la API. | Validación espacial correcta y sanitización mediante `ST_MakeValid` de PostGIS, evitando errores 500 y permitiendo el análisis espacial fluido. | Implementado |
| **PR-FUNC-004** | Cruce Espacial DGA Real (PostGIS) | Analizar un polígono intersectando con las bases de datos ingeridas desde el MOP/ArcGIS. | El backend retorna con precisión qué Decretos de Escasez, Acuíferos Protegidos y Zonas de Restricción cruzan físicamente por el predio. | Implementado |
| **PR-FUNC-005** | Consumo de API Climática (Open-Meteo) | Gatillar una consulta climática de telemetría hídrica (evapotranspiración y precipitaciones) para el centroide del polígono. | Conexión exitosa, parsing correcto del JSON externo y entrega de datos hídricos diarios. | Implementado |
| **PR-FUNC-006** | Validación Visual Frontend (NDVI / Sequía) | Interacción con el selector de capas del Frontend para encender índices de Vegetación y Focos de Sequía. | El polígono en el mapa (Leaflet) cambia dinámicamente de color (Infrarrojo simulado/Rojo) como capa representativa de riesgo. | Implementado |

---

## 3. Detalle de la Base de Datos de Pruebas

### 3.1 Propósito de la Base de Datos
La base de datos de pruebas permite validar con total fidelidad el comportamiento del backend y sus **intersecciones espaciales con PostGIS** sin alterar la evidencia productiva. Facilita la ejecución continua de pruebas sobre las ingestas de la DGA y estabilidad en la persistencia.

### 3.2 Base Sugerida y Configuración Recomendada
Nombre de la Base de Datos de Pruebas: `aguasabia_test`
Configuración recomendada mediante variables de entorno (archivo `.env`):
`DATABASE_URL=postgresql://postgres:password@localhost:5432/aguasabia_test`
*Nota de seguridad crítica: El valor real de estas credenciales debe mantenerse rigurosamente fuera de screenshots públicos o repositorios.*

### 3.3 Estructura de Tablas Principales para Pruebas Actuales

| Tabla | Uso Específico en el Plan de Pruebas |
|---|---|
| `usuarios` | Validación de flujos de registro, inicio de sesión (login), control de planes (gratis/pago) y roles (Admin). |
| `consultas_territoriales` | Persistencia y modelamiento de geometrías (Polígonos GeoJSON) analizados por la plataforma. |
| `capas_ambientales` | (Nuevas) **Acuiferos Protegidos, Áreas de Restricción, Agotamiento, Decretos Reserva, Escasez**. Usadas para cruce espacial con `ST_Intersects`. |
| `estaciones_hidrometricas` | Puntos geoespaciales sincronizados desde la DGA para determinar ríos y embalses a menos de 5km de distancia del polígono. |
| `resultados_consulta_modulos` | Persistencia estricta de las métricas calculadas. |

### 3.4 Conjunto Mínimo de Datos de Prueba (Seed & Sync)

| Dato Ficticio / Real | Valor Sugerido para Pruebas | Propósito Operacional |
|---|---|---|
| Administrador de Sistema | `admin@aguasabia.cl` | Validación completa del inicio de sesión interno y bypass del modelo de cobros "Pago" para testeo. |
| Sincronización DGA | `sync_capas_oficiales.py` | Descargar ~1600 registros de polígonos reales de la DGA para pruebas fidedignas de cruces PostGIS. |
| Usuario Plan Gratuito | `usuario.prueba@aguasabia.cl` | Comprobación de que el Backend restringe exitosamente la data avanzada (coordenadas, decretos) mostrando avisos de Upgrade. |

---

## 4. Evidencias de Configuración Solicitadas

| ID | Evidencia Requerida | Descripción Técnica | Criterio de Aceptación |
|---|---|---|---|
| **EV-001** | Entorno Virtual | Verificar la inicialización del ambiente Python. | Se aprecia el prompt `(.venv)` activo. |
| **EV-002** | Dependencias y PostGIS | Asegurar que la base de datos corre la extensión Geoespacial PostGIS y las librerías Pip están sanas. | Ausencia de errores de compilación geoespacial. |
| **EV-003** | Variables de Entorno y CORS | Verificación de `.env` configurado, sin errores de arrays y permitiendo el acceso CORS (`http://localhost:5173`). | El Frontend React logra consumir la API sin recibir errores HTTP 400 u OPTIONS bloqueados. |
| **EV-004** | Migraciones de Esquema | Ejecución completa de la DB vía Alembic (`alembic upgrade head`). | Log alcanza exitosamente la etiqueta 'head' sin fallos ni duplicidad de índices. |
| **EV-005** | Carga de Datos DGA (Ingesta) | Ejecución exitosa de `sync_capas_oficiales.py` consumiendo la API de ArcGIS MOP. | Terminal refleja >1000 registros insertados correctamente. |
| **EV-006** | Levantamiento Full-Stack | Backend (Uvicorn puerto 8000) y Frontend (Vite puerto 5173) operando simultáneamente. | Interfaz dibuja polígonos y obtiene respuestas HTTP 200 OK en análisis. |

### 4.1 Secuencia de Comandos para Configuración Local Mínima
Para replicabilidad, los comandos ejecutados en PowerShell son:
```bash
cd C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Proyecto\backend
.\.venv\Scripts\activate
python -m alembic upgrade head
python scripts\sync_capas_oficiales.py
uvicorn app.main:app --reload
```
En paralelo (Frontend):
```bash
cd C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Proyecto\frontend
npm run dev
```

---

## 5. Mejoras Aplicadas al Producto según Estándares de Calidad
1. **Calidad de Software y Resiliencia Geoespacial:** Se implementó la envoltura `ST_MakeValid()` en todas las consultas territoriales del Backend. Esto soluciona cuelgues graves cuando los usuarios dibujaban polígonos defectuosos en el mapa (líneas que se cruzan formando "moños"), asegurando un Uptime del 100%.
2. **Arquitectura y Transparencia en Frontend:** Se implementó la protección visual por permisos. Un usuario no logueado ("Guest") puede trazar polígonos, pero se le ocultan estratégicamente las capas oficiales y se muestra un Badge sugiriendo el Registro. De igual forma, los roles "Admin" evaden la restricción de pagos para tareas de auditoría interna.
3. **Migración de Datos Oficiales (Zero-Mock):** Ya no se utilizan datos de prueba inventados para los decretos. Se creó un motor de sincronización directa con los endpoints de la Dirección General de Aguas (ArcGIS), garantizando que las zonas de prohibición y acuíferos coinciden estrictamente con la realidad geográfica de Chile.

---

## 6. Actas de Aceptación y Conclusiones

### 6.1 Conclusión General
El desarrollo ha trascendido de ser un prototipo "mockeado" a convertirse en una plataforma de Sistema de Información Geográfica (GIS) funcional. Con la ingesta en tiempo real de Open-Meteo y la base PostGIS alimentada por el MOP/DGA, AguaSabia es capaz de procesar operaciones matemáticas espaciales complejas. Los permisos y la UI/UX actúan coordinados para incentivar la conversión de usuarios sin poner en riesgo la carga del servidor.

### 6.2 Lecciones Aprendidas
1. **La Complejidad del Formato Espacial:** Dibujar a mano trae geometrías inválidas. Validar en Frontend y limpiar en Backend con PostGIS (`MakeValid`) demostró ser una técnica vital de sanitización de datos.
2. **CORS y Configuración Base:** Los pequeños errores de sintaxis en el archivo `.env` pueden hacer creer erróneamente que la lógica interna falló, cuando en realidad el navegador bloqueaba las pre-flight request (`OPTIONS 400 Bad Request`).
3. **Separación de Responsabilidades Frontend/Backend:** Mostrar el mapa base gratuitamente pero bloquear la capa de inferencia de la DGA requiere que el Backend devuelva variables banderas (`avanzado_restringido`) para que el Frontend renderice correctamente mensajes de mejora de cuenta.
