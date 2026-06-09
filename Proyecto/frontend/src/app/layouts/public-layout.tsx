import { Outlet, Link } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">AguaSabia</Link>
          <nav className="flex gap-4">
            <Link to="/mapa" className="text-muted-foreground hover:text-foreground">Mapa</Link>
            <Link to="/login" className="text-primary font-medium hover:underline">Iniciar Sesión</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
