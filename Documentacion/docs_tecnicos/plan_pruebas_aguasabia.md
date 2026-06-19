# Plan de Pruebas: AguaSabia

## 1. Introducción
El presente plan detalla los enfoques de prueba para asegurar la calidad de la plataforma geoespacial **AguaSabia**. El enfoque primario es asegurar la correcta integración de PostGIS, la resiliencia en la ingesta de la DGA, y el correcto manejo de casos límite por parte del backend y frontend.

## 2. Configuración de Entorno
Todas las pruebas funcionales deben ejecutarse contra la base de datos `aguasabia_test` para garantizar aislamiento de los datos de desarrollo y producción.

## 3. Casos de Prueba Funcional (Backend)

### 3.1 PR-FUNC-001 (Validación Espacial DGA)
- **Objetivo**: Asegurar que un polígono consultado intercepta correctamente (`ST_Intersects`) con las cuencas DGA descargadas vía MOP ArcGIS REST.
- **Precondición**: Correr `scripts/sync_geo_data.py`.
- **Acción**: Enviar un polígono válido por POST a `/api/v1/territorio/`.
- **Resultado Esperado**: Retorno HTTP 200 con el nombre de la cuenca correcta.

### 3.2 PR-FUNC-002 (Límite Excedido)
- **Objetivo**: Validar el control de acceso al "Modo Avanzado".
- **Acción**: Un usuario con plan "gratuito" o "básico" intenta acceder a reportes numéricos.
- **Resultado Esperado**: Retorno HTTP 403 Forbidden.

### 3.3 PR-FUNC-005 (Validación Ética)
- **Objetivo**: Proveer transparencia cuando ciertos módulos no están terminados.
- **Acción**: Consulta a módulos no finalizados (ej. Riesgos Específicos).
- **Resultado Esperado**: Retorno de payload indicando estado `"En Desarrollo"`.

### 3.4 Ingesta Resiliente (DGA REST)
- **Objetivo**: Validar el mecanismo de Retroceso Exponencial con Jitter.
- **Acción**: Simular un error 500 o timeout desde el servidor SIT-MOP durante la extracción por lotes.
- **Resultado Esperado**: El script no debe abortarse; debe reintentar hasta 3 veces y luego continuar con los lotes siguientes, registrando el error en logs.

### 3.5 Prueba de Estrés de Polígono (Inyección Espacial)
- **Objetivo**: Proteger el backend y la base de datos contra peticiones espaciales maliciosas o sobrecargas ("Inyección Espacial").
- **Acción**: Enviar un GeoJSON con una cantidad inusual de vértices (un polígono sumamente complejo de más de 5.000 puntos).
- **Resultado Esperado**: El middleware de validación topológica del backend debe rechazar el payload (HTTP 413 o 422) antes de que alcance la capa de procesamiento espacial PostGIS.

## 4. Matriz de Evidencias y Seguimiento

Al generar el informe de pruebas, el QA o desarrollador debe adjuntar las evidencias fotográficas:
- **Transparencia**: Capturas de pantalla de la terminal (ej. Uvicorn) deben mostrar claramente la conexión a `aguasabia_test` demostrando un entorno asilado.
- **Censura de Credenciales**: En capturas de Postman o logs, se debe aplicar un recuadro negro ocultando Bearer Tokens, strings de base de datos o contraseñas expuestas.

## 5. Recomendaciones para el Frontend (Control de Calidad Integrado)

Para que las pruebas de sistema completas sean exitosas, el equipo frontend debe:
1. **Error Interceptor (403)**: Capturar el código HTTP 403 del Backend e invocar un Modal amigable (ej. "Mejora tu plan para ver esto") en lugar de mostrar errores de caída del servidor.
2. **Gestión Visual de Módulos (En Desarrollo)**: Leer la bandera de respuesta del servidor (PR-FUNC-005) y deshabilitar los botones de la interfaz correspondientes, pintando etiquetas tipo "Próximamente".
3. **Filtro Preventivo GeoJSON**: Validar la geometría en el navegador del cliente (estructura mínima de puntos y cierre) para evitar enviar datos corruptos al servidor.
