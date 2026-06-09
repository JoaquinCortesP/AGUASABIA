import { Outlet, Link } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-destructive">AguaSabia Admin</Link>
          <nav className="flex gap-4 items-center">
            <Link to="/mapa" className="text-sm text-muted-foreground hover:text-foreground">Volver a la App</Link>
            <button className="text-sm font-medium text-destructive">Cerrar Sesión</button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
