import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="text-xl font-bold text-primary tracking-tight">AguaSabia</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link to="/mapa" className="px-4 py-2 rounded-md hover:bg-muted font-medium text-foreground transition">Mapa Territorial</Link>
          
          {/* Historial sólo para usuarios registrados */}
          {isAuthenticated && (
            <Link to="/historial" className="px-4 py-2 rounded-md hover:bg-muted font-medium text-foreground transition">Historial</Link>
          )}
          
          <Link to="/aprender" className="px-4 py-2 rounded-md hover:bg-muted font-medium text-foreground transition">Aprender</Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          {isAuthenticated ? (
            <>
              <Link to="/perfil" className="block px-4 py-2 rounded-md hover:bg-muted font-medium text-sm text-foreground transition">Mi Perfil</Link>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 rounded-md hover:bg-red-50 hover:text-red-600 font-medium text-sm text-destructive mt-1 transition"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="block px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm text-center hover:bg-primary/90 transition">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20">
        <Outlet />
      </main>
    </div>
  );
}
