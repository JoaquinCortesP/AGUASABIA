import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Map, History, BookOpen, User, LogOut } from "lucide-react";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const isPro = user !== null && (user.plan === "pago" || user.plan === "pro" || user.plan === "municipal" || user.role === "admin");

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
      isActive 
        ? "bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-3" 
        : "hover:bg-muted text-foreground hover:text-primary"
    }`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card/65 backdrop-blur-md flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border/60">
          <Link to="/" className="text-xl font-extrabold text-brand-gradient tracking-tight transition duration-300 hover:opacity-90">AguaSabia</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1.5">
          <Link to="/mapa" className={getLinkClass("/mapa")}>
            <Map className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <span>Mapa Territorial</span>
          </Link>
          
          {/* Historial sólo para usuarios registrados */}
          {isAuthenticated && (
            <Link to="/historial" className={getLinkClass("/historial")}>
              <History className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <span>Historial</span>
            </Link>
          )}
          
          <Link to="/aprender" className={getLinkClass("/aprender")}>
            <BookOpen className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <span>Aprender</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border/60">
          {isAuthenticated ? (
            <>
              <Link to="/perfil" className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-muted font-medium text-sm text-foreground hover:text-primary transition-all duration-200">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Mi Perfil</span>
                </div>
                {isPro && (
                  <span className="text-amber-400 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" title="Plan Pro Activo">⭐</span>
                )}
              </Link>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive font-medium text-sm text-muted-foreground mt-1 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Cerrar Sesión</span>
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
