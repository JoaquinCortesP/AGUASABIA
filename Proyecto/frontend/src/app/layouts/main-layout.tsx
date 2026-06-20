import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card/65 backdrop-blur-md flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border/60">
          <Link to="/" className="text-xl font-extrabold text-brand-gradient tracking-tight transition duration-300 hover:opacity-90">AguaSabia</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1.5">
          <Link to="/mapa" className="px-4 py-2.5 rounded-lg hover:bg-muted font-medium text-foreground hover:text-primary transition-all duration-200">🗺️ Mapa Territorial</Link>
          
          {/* Historial sólo para usuarios registrados */}
          {isAuthenticated && (
            <Link to="/historial" className="px-4 py-2.5 rounded-lg hover:bg-muted font-medium text-foreground hover:text-primary transition-all duration-200">📜 Historial</Link>
          )}
          
          <Link to="/aprender" className="px-4 py-2.5 rounded-lg hover:bg-muted font-medium text-foreground hover:text-primary transition-all duration-200">💡 Aprender</Link>
        </nav>
        
        <div className="p-4 border-t border-border/60">
          {isAuthenticated ? (
            <>
              <Link to="/perfil" className="block px-4 py-2.5 rounded-lg hover:bg-muted font-medium text-sm text-foreground hover:text-primary transition-all duration-200">👤 Mi Perfil</Link>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive font-medium text-sm text-muted-foreground mt-1 transition-all duration-200"
              >
                🚪 Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="block px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm text-center hover:bg-primary/90 transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]">
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
