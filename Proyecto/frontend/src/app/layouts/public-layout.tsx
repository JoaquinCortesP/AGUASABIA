import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-brand-gradient tracking-tight transition duration-300 hover:opacity-90">AguaSabia</Link>
          <nav className="flex gap-4 items-center">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/mapa" className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]">Comenzar Análisis</Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">Iniciar Sesión</Link>
                <Link to="/register" className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]">Registrarse</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-muted/10">
        <Outlet />
      </main>
    </div>
  );
}
