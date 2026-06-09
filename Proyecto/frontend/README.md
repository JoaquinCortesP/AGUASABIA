# AGUASABIA Frontend

Frontend municipal B2G para monitoreo hidrico territorial, construido con React,
Vite, TypeScript, TailwindCSS, componentes estilo shadcn/ui, React Router,
Axios, TanStack React Query, Zustand, Recharts, React Leaflet, Framer Motion,
React Hook Form, Zod y Socket.IO Client.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Variables

Copia `.env.example` a `.env` si necesitas cambiar la URL de FastAPI.

```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

## Acceso

La pantalla de login permite probar credenciales JWT contra FastAPI. Tambien
incluye un modo demo municipal para revisar la consola aunque el backend B2G
completo aun no exponga todos los endpoints.

## Integracion

La capa API esta en `src/features/*/api` y `src/lib/axios/client.ts`. Las vistas
no hacen fetch directo; usan hooks de React Query y stores Zustand solo para
sesion, tema, sidebar y preferencias UI.
