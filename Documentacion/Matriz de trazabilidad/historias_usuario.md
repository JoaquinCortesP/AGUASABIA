# Historias de Usuario - AguaSabia

## Visión General
Este documento alinea las historias de usuario con la nueva visión del proyecto: **Plataforma geoespacial para evaluar la situación hídrica y ambiental de zonas seleccionadas en un mapa**.

## Épica 1: Exploración Territorial (Usuario Gratis)

* **HU-01:** Como usuario, quiero dibujar un polígono en el mapa para delimitar mi zona de interés.
  * **Criterios de Aceptación:** Se permite dibujar polígonos de al menos 3 vértices. El mapa debe devolver el área aproximada.
  * **Relacionada con:** RF-005 Analizar polígono territorial, RF-009 Consultar clima por polígono, RF-010 Entregar módulo agua.

* **HU-02:** Como usuario, quiero registrarme o iniciar sesión en la plataforma.
  * **Criterios de Aceptación:** El registro requiere correo, nombre y contraseña. El login debe validar credenciales correctamente.
  * **Relacionada con:** RF-003 Registrar usuario básico, RF-004 Login de usuario.

* **HU-03:** Como usuario, quiero guardar mis consultas territoriales para verlas después.
  * **Criterios de Aceptación:** Solo usuarios autenticados pueden guardar. El sistema listará el historial de consultas del usuario.
  * **Relacionada con:** RF-006 Impedir guardado anónimo, RF-007 Guardar consulta autenticada, RF-008 Listar consultas guardadas.

## Épica 2: Análisis Avanzado (Usuario Pro)

* **HU-04:** Como usuario Pro, quiero acceder al "Modo Avanzado" en mi consulta para ver datos sin procesar y cruces espaciales de la DGA.
  * **Criterios de Aceptación:** El sistema debe habilitar información adicional y visualizaciones avanzadas para los módulos disponibles según el plan contratado.
  * **Relacionada con:** RF-013 Restringir modo avanzado.

* **HU-06:** Como usuario, quiero obtener una interpretación educativa de la información ambiental.
  * **Criterios de Aceptación:** El sistema debe transformar indicadores climáticos y ambientales en explicaciones comprensibles para usuarios no especializados.
  * **Relacionada con:** RF-014 Generar interpretación ambiental.

## Épica 3: Administración y Métricas

* **HU-07:** Como administrador, quiero acceder a un panel para revisar el uso de la plataforma.
  * **Criterios de Aceptación:** Solo administradores pueden ver estadísticas generales.
  * **Relacionada con:** RF-001 Autenticación de administrador interno, RF-002 Ver administrador autenticado, RF-015 Visualizar métricas de uso.

## Épica 4: Mejoras de Interfaz Cartográfica

* **HU-08:** Como usuario, quiero poder cambiar el estilo visual del mapa base (satélite, calles, terreno).
  * **Criterios de Aceptación:** Un selector de capas debe permitir alternar entre distintos TileLayers de forma instantánea.
  * **Relacionada con:** RF-016 Cambiar capas cartográficas.

## Épica 5: Autenticación y Seguridad

* **HU-09:** Como usuario nuevo, debo verificar mi correo electrónico antes de poder iniciar sesión por primera vez.
  * **Relacionada con:** RF-003 Registrar usuario básico.

* **HU-10:** Como usuario gratuito, si intento acceder al modo avanzado, el sistema debe denegarme el acceso y ofrecerme mejorar mi plan (Upsell).
  * **Relacionada con:** RF-013 Restringir modo avanzado.
