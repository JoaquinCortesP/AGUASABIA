# Frontend Setup - AguaSabia

Esta guía describe cómo levantar el frontend del proyecto y explica la arquitectura implementada en la refactorización para la plataforma de consulta territorial geoespacial.

## Requisitos
- Node.js v18 o superior
- NPM o Yarn

## Levantando el Frontend

1. **Instalar dependencias**:
   ```bash
   cd Proyecto/frontend
   npm install
   ```

2. **Variables de Entorno**:
   El frontend necesita conocer la URL del backend. Crea un archivo `.env` en la raíz del frontend (`Proyecto/frontend/.env`) con el siguiente contenido:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   > Nota: Asegúrate de que el backend esté corriendo en ese puerto (ver guía del backend).

3. **Ejecutar en modo Desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

## Arquitectura y Refactorización

En el proceso de refactorización (HU-07 y RF-10), se eliminó todo el código heredado relacionado a agricultores, mensajería, alertas y dashboard municipal, orientando el producto 100% a la consulta territorial geoespacial.

### Estructura Principal
- `src/app/router`: Contiene la definición de rutas usando `react-router-dom`.
- `src/app/layouts`: Proveen los esqueletos principales de UI (PublicLayout, MainLayout, AdminLayout).
- `src/features`: Código dividido por dominios de negocio (auth, territorio, admin).
- `src/components`: Componentes reutilizables, mapas, y UI genérica construida con TailwindCSS.
- `src/services`: Capa de llamadas HTTP usando Axios.
- `src/pages`: Vistas de nivel superior enlazadas al enrutador.

### Vinculación con el Backend (FastAPI)

El frontend se comunica con el backend mediante `axios`, configurado en `src/services/api.ts`.
1. **Autenticación (JWT)**: Al hacer login o registro en `/api/v1/usuarios/login`, el backend devuelve un `access_token` que se almacena en el `localStorage`.
2. **Interceptores**: Todas las llamadas posteriores incluyen un header `Authorization: Bearer <token>`. Si el backend responde `401 Unauthorized`, el interceptor automáticamente cierra la sesión del usuario en el frontend.
3. **Roles**: El frontend decodifica la información del token o consulta `/api/v1/usuarios/me` para determinar el rol (`visitante`, `usuario`, `premium`, `admin`) y ajustar la interfaz según el nivel de acceso al modo avanzado.
4. **Consulta Territorial**: El corazón de la aplicación está en la llamada `POST /api/v1/territorio/consultas/analizar`, a la cual se le envía un array de coordenadas Leaflet, y el backend responde con los módulos (agua, clima, territorio) según el plan del usuario.
