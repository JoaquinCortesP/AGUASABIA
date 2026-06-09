import { Outlet, Link } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="text-xl font-bold text-primary">AguaSabia</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link to="/mapa" className="px-4 py-2 rounded-md hover:bg-muted font-medium">Mapa Territorial</Link>
          <Link to="/historial" className="px-4 py-2 rounded-md hover:bg-muted font-medium">Historial</Link>
          <Link to="/aprender" className="px-4 py-2 rounded-md hover:bg-muted font-medium">Aprender</Link>
        </nav>
        <div className="p-4 border-t border-border">
          <Link to="/perfil" className="block px-4 py-2 rounded-md hover:bg-muted font-medium text-sm">Mi Perfil</Link>
          <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted font-medium text-sm text-destructive mt-1">Cerrar Sesión</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
