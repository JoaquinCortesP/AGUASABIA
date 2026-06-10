# Historias de Usuario - AguaSabia

## Visión General
Este documento fusiona la visión original detallada del proyecto con los nuevos requerimientos trazados (RF), estableciendo las historias de usuario definitivas para el desarrollo de la plataforma geoespacial.

---

## Épica 1: Exploración Territorial y Acceso Básico

### **HU-01: Análisis Rápido del Territorio**
* **Descripción:** Como Visitante, quiero seleccionar o dibujar una zona geográfica en el mapa interactivo, para recibir de forma inmediata un resumen cualitativo simple de la situación ambiental y de agua de ese territorio.
* **Prioridad:** Alta
* **Criterios de Aceptación:**
  1. El sistema debe desplegar el mapa base sin requerir autenticación.
  2. El usuario debe poder hacer clic o trazar un polígono cerrado de al menos 3 vértices.
  3. La respuesta debe renderizar el resumen interpretativo simplificado sin gráficos avanzados.
* **Relacionada con:** `RF-005` Analizar polígono territorial, `RF-009` Consultar clima por polígono, `RF-010` Entregar módulo agua.

### **HU-02: Registro y Autenticación**
* **Descripción:** Como Visitante, quiero registrarme e iniciar sesión en la plataforma mediante correo y contraseña, para acceder a funciones de almacenamiento de historial de consultas.
* **Prioridad:** Alta
* **Criterios de Aceptación:**
  1. El sistema debe validar que el correo posea un formato válido y requerir verificación (ej. validación de email).
  2. Las contraseñas deben ser encriptadas de forma segura.
  3. Tras el login exitoso, el sistema debe emitir un token JWT con una expiración definida.
* **Relacionada con:** `RF-003` Registrar usuario básico, `RF-004` Login de usuario.

### **HU-03: Historial de Consultas**
* **Descripción:** Como Usuario Registrado, quiero guardar mis consultas territoriales recurrentes en un panel personal, para volver a revisar las Fichas Ambientales de mis terrenos de interés sin tener que dibujarlos nuevamente.
* **Prioridad:** Media
* **Criterios de Aceptación:**
  1. Debe existir un botón explícito de "Guardar Consulta" visible tras el análisis solo para usuarios autenticados.
  2. El panel del usuario debe listar las consultas con su fecha y un nombre personalizado.
  3. Al hacer clic en un elemento del historial, se debe re-renderizar la geometría guardada en el mapa de inmediato.
* **Relacionada con:** `RF-006` Impedir guardado anónimo, `RF-007` Guardar consulta autenticada, `RF-008` Listar consultas guardadas.

---

## Épica 2: Análisis Avanzado y Científico

### **HU-04: Modo Avanzado (Usuario Pro)**
* **Descripción:** Como Usuario Premium/Pagado, quiero activar el "Modo Avanzado o Científico" dentro de mi consulta territorial, para visualizar datos numéricos crudos, fuentes de datos gubernamentales (como DGA) y cruces espaciales detallados.
* **Prioridad:** Alta
* **Criterios de Aceptación:**
  1. El sistema debe validar el plan o rol del usuario desde el token JWT.
  2. El sistema debe habilitar información adicional y visualizaciones avanzadas para los módulos disponibles según el plan contratado (ej. Cruces PostGIS, NDVI satelital).
  3. Si un usuario gratuito intenta acceder, el sistema debe denegar el acceso y ofrecer mejorar el plan (Upsell).
* **Relacionada con:** `RF-013` Restringir modo avanzado.

### **HU-06: Interpretación y Educación Ambiental**
* **Descripción:** Como Visitante/Usuario, quiero que las explicaciones de la plataforma incluyan una capa pedagógica de educación ambiental, para comprender de qué manera los indicadores científicos influyen en la sustentabilidad del suelo real.
* **Prioridad:** Alta
* **Criterios de Aceptación:**
  1. Los textos de respuesta del backend no deben limitarse a oraciones cortas o datos crudos.
  2. Ante indicadores deficientes (como bajo NDVI o alto estrés térmico), el sistema debe inyectar párrafos educativos explicativos sobre riesgos de sequía y estrés hídrico.
* **Relacionada con:** `RF-014` Generar interpretación ambiental.

---

## Épica 3: Administración e Interfaz

### **HU-07: Dashboard de Administración**
* **Descripción:** Como Administrador, quiero visualizar un panel de métricas e indicadores de uso global del sistema, para auditar la cantidad de consultas diarias ejecutadas y controlar la carga en los servidores.
* **Prioridad:** Media
* **Criterios de Aceptación:**
  1. El endpoint de administración debe estar restringido mediante middleware de rol "admin".
  2. Se deben listar estadísticas consolidadas con la tasa de uso de la plataforma.
* **Relacionada con:** `RF-001` Autenticación de administrador interno, `RF-002` Ver administrador autenticado, `RF-015` Visualizar métricas de uso.

### **HU-08: Visualización Cartográfica**
* **Descripción:** Como Visitante/Usuario, quiero alternar entre diferentes capas visuales vectoriales del mapa interactivo (tales como visualización de satélite, vista de calles), para contrastar visualmente el relieve topográfico del terreno de análisis.
* **Prioridad:** Media
* **Criterios de Aceptación:**
  1. La interfaz en React-Leaflet debe integrar un controlador nativo de selección de capas (TileLayers).
  2. El cambio de mapa base debe ejecutarse instantáneamente en caliente sin recargar la página del navegador web.
* **Relacionada con:** `RF-016` Cambiar capas cartográficas.
