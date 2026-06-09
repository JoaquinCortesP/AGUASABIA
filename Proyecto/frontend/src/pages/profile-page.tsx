import { useAuth } from "@/features/auth/hooks/use-auth";

export function ProfilePage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-destructive">No has iniciado sesión.</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-8 tracking-tight">Mi Perfil</h1>
      
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
            {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user.nombre || "Usuario AguaSabia"}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Plan Actual</h3>
            <p className="text-lg font-medium text-foreground capitalize">
              {user.plan === "gratis" ? "Visitante / Gratis" : user.plan}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Fecha de Registro</h3>
            <p className="text-lg font-medium text-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Estado</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {user.is_active ? "Cuenta Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-foreground mb-2">Mejorar Plan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Los planes premium ofrecen acceso a métricas históricas, datos en bruto satelitales y mayor límite de consultas.
          </p>
          <button disabled className="bg-primary/50 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
            Próximamente
          </button>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            onClick={logout}
            className="text-destructive font-medium hover:underline transition-all"
          >
            Cerrar sesión en este dispositivo
          </button>
        </div>
      </div>
    </div>
  );
}
