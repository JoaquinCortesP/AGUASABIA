# Paso a paso para ejecutar pruebas y tomar screenshots

## Preparacion

1. Abrir PowerShell.
2. Entrar al backend:

```powershell
cd C:\Users\Joaqu\OneDrive\Escritorio\AguaSabia\AGUASABIA\Proyecto\backend
```

3. Activar entorno virtual:

```powershell
.\.venv\Scripts\activate
```

Screenshot:

- `EV-001-entorno-virtual.png`

## Migraciones y datos base

4. Aplicar migraciones:

```powershell
python -m alembic upgrade head
```

Screenshot:

- `EV-005-alembic-head.png`

5. Ejecutar seed:

```powershell
python scripts\seed.py
```

Screenshot:

- `EV-006-seed.png`

## Levantar API

6. Iniciar backend:

```powershell
uvicorn app.main:app --reload
```

Screenshot:

- `EV-007-uvicorn.png`

7. Abrir Swagger:

```text
http://127.0.0.1:8000/docs
```

Screenshot:

- `EV-008-swagger.png`

## Pruebas en Postman

8. Probar raiz:

```text
GET http://127.0.0.1:8000/
```

Screenshot:

- `CP-001-api-raiz.png`

9. Login admin:

```text
POST http://127.0.0.1:8000/api/v1/login/access-token
```

Body `x-www-form-urlencoded`:

```text
username=admin@aguasabia.cl
password=admin123
```

Screenshot:

- `CP-003-login-admin.png`

10. Ver admin:

```text
GET http://127.0.0.1:8000/api/v1/admin/me
```

Header:

```text
Authorization: Bearer <admin_token>
```

Screenshot:

- `CP-004-admin-me.png`

11. Registrar usuario:

```text
POST http://127.0.0.1:8000/api/v1/usuarios/register
```

Body:

```json
{
  "nombre": "Usuario Prueba",
  "email": "usuario.prueba@aguasabia.cl",
  "password": "usuario123"
}
```

Screenshot:

- `CP-005-register-user.png`

12. Login usuario:

```text
POST http://127.0.0.1:8000/api/v1/usuarios/login
```

Body:

```json
{
  "email": "usuario.prueba@aguasabia.cl",
  "password": "usuario123"
}
```

Screenshot:

- `CP-006-login-user.png`

13. Consulta territorial visitante:

```text
POST http://127.0.0.1:8000/api/v1/territorio/consultas/analizar
```

Body:

```json
{
  "poligono": [
    { "latitud": -33.4480, "longitud": -70.6700 },
    { "latitud": -33.4480, "longitud": -70.6680 },
    { "latitud": -33.4500, "longitud": -70.6680 },
    { "latitud": -33.4500, "longitud": -70.6700 }
  ],
  "modo": "resumen",
  "guardar": false,
  "modulos": ["agua", "clima", "territorio", "vegetacion", "riesgos"]
}
```

Screenshot:

- `CP-007-consulta-visitante.png`

14. Error al guardar sin login:

- Cambiar `guardar` a `true`.
- No enviar token.

Screenshot:

- `CP-008-guardar-sin-login.png`

15. Guardar consulta con usuario:

- Enviar token de usuario.
- Usar `guardar=true`.

Screenshot:

- `CP-009-guardar-con-token.png`

16. Listar consultas:

```text
GET http://127.0.0.1:8000/api/v1/territorio/consultas
```

Screenshot:

- `CP-010-listar-consultas.png`

17. Clima por poligono:

```text
POST http://127.0.0.1:8000/api/v1/clima/poligono
```

Screenshot:

- `CP-014-clima-poligono.png`

18. Agua por poligono:

```text
POST http://127.0.0.1:8000/api/v1/agua/poligono
```

Screenshot:

- `CP-015-agua-poligono.png`

19. Vegetacion por poligono:

```text
POST http://127.0.0.1:8000/api/v1/vegetacion/poligono
```

Screenshot:

- `CP-016-vegetacion-poligono.png`

20. Riesgos por poligono:

```text
POST http://127.0.0.1:8000/api/v1/riesgos/poligono
```

Screenshot:

- `CP-017-riesgos-poligono.png`

21. Error por poligono invalido:

Enviar solo dos vertices.

Screenshot:

- `CP-012-poligono-invalido.png`

## Recomendacion final

Guardar las evidencias en una carpeta:

```text
Documentacion/evidencias_estado_avance_3/
```

No subir tokens completos, passwords ni cadenas de conexion reales.

