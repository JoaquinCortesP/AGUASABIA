# AguaSabia

AguaSabia es una plataforma geoespacial orientada a consultar informacion hidrica y ambiental sobre areas seleccionadas en un mapa. El usuario puede dibujar un poligono, enviar esa geometria al backend y recibir una lectura modular sobre clima, agua, territorio, vegetacion y riesgos.

El foco actual es entregar primero una explicacion clara para usuarios no tecnicos y dejar los datos numericos, fuentes y detalle avanzado como funcionalidad de mayor profundidad.

## Modulos actuales

- **Territorio**: recepcion de poligonos, centroide, bbox y superficie aproximada.
- **Clima**: consumo de Open-Meteo desde el backend.
- **Agua**: lectura hidrica inicial basada en variables climaticas.
- **Vegetacion**: contrato preparado para NDVI/cobertura vegetal.
- **Riesgos**: contrato preparado para incendios, sequia y deficit hidrico.
- **Usuarios**: registro y login basico para guardar consultas.
- **Admin**: acceso interno del equipo.

## Stack tecnico

- FastAPI.
- SQLAlchemy.
- Alembic.
- PostgreSQL.
- Pydantic.
- Uvicorn.
- httpx.
- Redis/Celery como infraestructura futura o secundaria.

## Ejecutar backend

```powershell
cd Proyecto/backend
.\.venv\Scripts\activate
python -m alembic upgrade head
python scripts\seed.py
uvicorn app.main:app --reload
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Documentacion importante

- Plan de pruebas: `Documentacion/docs_tecnicos/plan_pruebas_aguasabia.md`
- Casos de prueba: `Documentacion/docs_tecnicos/casos_prueba_estado_avance_3.md`
- Base de datos de pruebas: `Documentacion/docs_tecnicos/base_datos_pruebas.md`
- Paso a paso de evidencias: `Documentacion/docs_tecnicos/paso_a_paso_evidencias_pruebas.md`
- API REST: `Documentacion/Documentacion de api/api-documentation.md`
- Estructura: `Documentacion/Estructura del proyecto/project-structure.md`
- Trazabilidad: `Documentacion/Matriz de trazabilidad/traceability-matrix.md`

## Elementos legacy

El proyecto tuvo una etapa anterior centrada en riego, agricultores, parcelas y recomendaciones. Esos elementos pueden existir en codigo o base de datos como legado tecnico, pero no representan el flujo principal actual.

## Pendientes

- Integrar API satelital real.
- Integrar capas oficiales de agua y territorio.
- Preparar PostGIS.
- Refactorizar frontend hacia mapa y paneles modulares.
- Definir modelo de pago real.
