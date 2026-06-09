# Estructura del proyecto - AguaSabia

## Backend

Estructura principal:

```text
Proyecto/backend/app
├── api
│   ├── deps.py
│   └── api_v1
│       ├── api.py
│       └── endpoints
│           ├── admin.py
│           ├── usuarios.py
│           ├── territorio.py
│           ├── clima.py
│           ├── agua.py
│           ├── vegetacion.py
│           └── riesgos.py
├── core
│   ├── config.py
│   └── security.py
├── db
│   ├── base.py
│   └── session.py
├── models
│   ├── usuario.py
│   ├── consulta_territorial.py
│   ├── capas_ambientales.py
│   ├── administrador.py
│   ├── municipio.py
│   ├── region.py
│   └── comuna.py
├── schemas
│   ├── usuario.py
│   ├── consulta_territorial.py
│   ├── geometria.py
│   ├── modulo_analisis.py
│   └── clima.py
└── services
    ├── consulta_territorial_service.py
    ├── clima_service.py
    ├── agua_service.py
    ├── territorio_service.py
    ├── vegetacion_service.py
    ├── riesgos_service.py
    └── geometry.py
```

## Flujo principal actual

1. El usuario dibuja un poligono en el mapa.
2. El frontend envia el poligono al backend.
3. El backend calcula centroide, bbox y superficie aproximada.
4. El backend consulta Open-Meteo para clima inicial.
5. El backend construye modulos:
   - agua;
   - clima;
   - territorio;
   - vegetacion;
   - riesgos.
6. El backend responde con explicacion simple y datos tecnicos opcionales.
7. Si el usuario esta autenticado y solicita guardar, se persiste la consulta.

## Capas

| Capa | Responsabilidad |
|---|---|
| Endpoints | Recibir requests y devolver respuestas REST. |
| Schemas | Validar entrada y salida. |
| Services | Orquestar calculos, APIs externas y explicaciones. |
| Models | Representar tablas SQLAlchemy. |
| DB | Gestionar sesiones y migraciones. |

## Elementos legacy

Los archivos de agricultores, parcelas, balances y agronomia pueden existir como legado tecnico, pero no son el flujo principal del producto actual. Deben mantenerse aislados hasta una migracion formal.

## Frontend

El frontend no se modifica en esta etapa. La direccion futura es:

- mapa como pantalla principal;
- seleccion por poligono;
- paneles laterales;
- resumen simple;
- modo avanzado/pago para datos tecnicos.
