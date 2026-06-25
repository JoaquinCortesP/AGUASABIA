import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authApi } from "@/features/auth/api/auth-api";

export function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const confirmUpgradeToPro = async () => {
    try {
      await authApi.changePlan("pro");
      alert("¡Felicidades! Has sido ascendido al Plan Pro. Disfruta de tus funciones avanzadas.");
      setShowUpgradeModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el plan.");
    }
  };

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

        {user.plan === "gratis" ? (
          <div className="bg-muted/50 p-6 rounded-lg mb-8 border border-border/60">
            <h3 className="font-semibold text-foreground mb-2">Mejorar a Plan Pro</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Desbloquea el análisis científico de este terreno, cruces espaciales DGA, mapas de calor NDVI satelitales y el Dashboard completo por solo $5.000 CLP al mes.
            </p>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs font-semibold hover:bg-primary/95 transition active:scale-[0.98]"
            >
              Pasar a Pro ($5.000 CLP)
            </button>
          </div>
        ) : (
          <div className="bg-destructive/5 p-6 rounded-lg mb-8 border border-destructive/20">
            <h3 className="font-semibold text-destructive mb-2">Gestionar Suscripción Premium</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Actualmente tienes activo el plan <span className="font-bold text-foreground capitalize">{user.plan}</span>. Si deseas cancelar tu plan, volverás a la versión gratuita con historial limitado.
            </p>
            <button 
              onClick={() => setShowCancelModal(true)}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-xs font-semibold hover:bg-destructive/90 transition active:scale-[0.98]"
            >
              Cancelar Suscripción
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            onClick={logout}
            className="text-destructive font-medium hover:underline transition-all"
          >
            Cerrar sesión en este dispositivo
          </button>
        </div>
      </div>

      {/* Modal Upgrade Pro detallado */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-card border border-border/85 rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="text-4xl text-amber-400 drop-shadow block animate-bounce">⭐</span>
              <h3 className="text-xl font-black text-brand-gradient">Suscripción Profesional Pro</h3>
              <p className="text-xs text-muted-foreground">
                Desbloquea la suite completa de teledetección satelital e hidrometría de precisión.
              </p>
            </div>

            <div className="border-t border-b border-border/40 py-3.5 space-y-2.5">
              {[
                { title: "Balances Hídricos Avanzados", desc: "Cálculos diarios basados en modelos evapotranspiración FAO-56 Penman-Monteith." },
                { title: "Teledetección Satelital NDVI", desc: "Grilla espectral activa sobre el mapa obtenida en tiempo real de Sentinel-2 para medir vigor vegetal." },
                { title: "Cruces Geoespaciales Oficiales", desc: "Cruce geográfico automático con capas oficiales de la DGA (Cuencas afectadas, Decretos de Escasez Hídrica)." },
                { title: "Estudio de Inversión Predial", desc: "Inferencia de riesgos ecológicos y factibilidad de compra predial asistida." },
                { title: "Exportación Ilimitada", desc: "Descarga tus análisis territoriales en formatos tabulares CSV y reportes de impresión PDF." },
                { title: "Historial Ilimitado", desc: "Almacena sin restricciones todas tus consultas territoriales en tu cuenta." }
              ].map((b, idx) => (
                <div key={idx} className="flex gap-2 text-xs">
                  <span className="text-amber-400 font-bold shrink-0">✓</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block leading-tight">{b.title}</span>
                    <span className="text-[10px] text-muted-foreground block leading-tight">{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg border border-border/80 text-xs transition active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmUpgradeToPro}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-lg text-xs transition shadow-md active:scale-[0.97]"
              >
                Suscribirse ($5.000/mes)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelación Nativo de React */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-card border border-border/85 rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="text-4xl text-destructive block animate-pulse">⚠️</span>
              <h3 className="text-xl font-black text-destructive">¿Cancelar Suscripción?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso inmediato a los análisis avanzados, cruces geoespaciales oficiales, mapas de calor NDVI satelitales y el Dashboard de balance hídrico.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg border border-border/80 text-xs transition active:scale-[0.97]"
              >
                No, mantener plan
              </button>
              <button 
                onClick={async () => {
                  try {
                    await authApi.changePlan("gratis");
                    alert("Tu suscripción ha sido cancelada exitosamente. Tu cuenta vuelve al Plan Gratis.");
                    setShowCancelModal(false);
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert("Error al cancelar la suscripción.");
                  }
                }}
                className="flex-1 py-2.5 px-4 bg-destructive text-destructive-foreground font-bold rounded-lg text-xs hover:bg-destructive/90 transition shadow-md active:scale-[0.97]"
              >
                Sí, cancelar plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
