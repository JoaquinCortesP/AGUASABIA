import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">AguaSabia</Link>
          <nav className="flex gap-4 items-center">
            <Link to="/mapa" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Mapa</Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/mapa" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Ir a la App</Link>
            ) : (
              <Link to="/login" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Iniciar Sesión</Link>
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
