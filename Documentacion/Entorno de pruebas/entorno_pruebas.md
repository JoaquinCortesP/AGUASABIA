# Entorno de Pruebas - AguaSabia

Esta guía explica cómo instalar los servicios necesarios para correr el proyecto en tu computador.
No se usa Docker. Todo se instala de forma nativa.

---

## Software Necesario

| Software   | Versión mínima | Para qué sirve         |
| ---------- | ---------------- | ----------------------- |
| Python     | 3.10+            | Lenguaje del backend    |
| PostgreSQL | 13+              | Base de datos           |
| Redis      | 6+               | Tareas en segundo plano |
| Git        | 2+               | Control de versiones    |

---

## Instalar Python

**Windows**: Descarga desde https://www.python.org/downloads/

- Marca la casilla "Add Python to PATH" durante la instalación.

**macOS**:

```bash
brew install python3
```

**Linux**:

```bash
sudo apt-get install python3 python3-venv python3-pip
```

Verifica que quedó instalado:

```powershell
python --version
```

---

## Instalar PostgreSQL

**Windows**: Descarga desde https://www.postgresql.org/download/windows/

- Durante la instalación, anota la contraseña que le pongas al usuario `postgres`. La necesitarás.

**macOS**:

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux**:

```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

Verifica la conexión:

```powershell
psql -U postgres
# Si abre una consola de postgres, está funcionando. Sal con \q
```

---

## Instalar Redis

**Windows** (opción recomendada — Docker):

```powershell
docker run -d -p 6379:6379 --name redis redis
```

**Windows** (sin Docker — usar WSL):

```powershell
# Abrir PowerShell como administrador, luego ejecutar wsl
sudo apt-get install redis-server
redis-server
```

**macOS**:

```bash
brew install redis
brew services start redis
```

**Linux**:

```bash
sudo apt-get install redis-server
sudo service redis-server start
```

Verifica que Redis responde:

```powershell
redis-cli ping
# Debe responder: PONG
```

---

## Levantar el proyecto (orden correcto)

Una vez que PostgreSQL y Redis estén corriendo, siga la guía `backend-setup.md` que está en esta misma carpeta.

El orden correcto de levantamiento es:

1. PostgreSQL (servicio, ya debería estar corriendo)
2. Redis
3. Backend con `uvicorn`
4. Celery en otra terminal (opcional si no se usan tareas)

---

## Puertos que usa el proyecto

| Servicio                 | Puerto |
| ------------------------ | ------ |
| FastAPI (API)            | 8000   |
| Swagger (documentación) | 8000   |
| PostgreSQL               | 5432   |
| Redis                    | 6379   |

---

## Verificación rápida

```powershell
# Verificar que el backend responde
curl http://localhost:8000/

# Verificar documentación interactiva
# Abrir en el navegador: http://localhost:8000/docs

# Verificar que Redis está corriendo
redis-cli ping

# Verificar tablas en la base de datos
psql -U postgres -d aguasabia -c "\dt"
```

---

## Problemas frecuentes

**El puerto 8000 ya está en uso**

```powershell
# Windows: buscar qué proceso lo usa
netstat -ano | findstr :8000
# Terminar el proceso con: taskkill /PID <numero> /F
```

**PostgreSQL no conecta**
Verifica que el servicio está corriendo en Windows:

- Buscador → Servicios → postgresql → Iniciar

**Redis no responde**
Verifica que está corriendo. Si usas Docker, el contenedor debe estar activo:

```powershell
docker ps
docker start redis
```

**`ModuleNotFoundError`**
Asegúrate de estar dentro de `Proyecto/backend` y de haber activado el entorno virtual con:

```powershell
.venv\Scripts\Activate.ps1
```
