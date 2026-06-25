import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { territorioApi } from "@/features/territorio/api/territorio-api";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authApi } from "@/features/auth/api/auth-api";

export function HistorialPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isFree = user && user.plan !== "pago" && user.plan !== "pro" && user.plan !== "municipal" && user.role !== "admin";

  const { data: consultas, isLoading, isError } = useQuery({
    queryKey: ["historial"],
    queryFn: territorioApi.getHistorial,
  });

  const deleteMutation = useMutation({
    mutationFn: territorioApi.eliminarConsulta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historial"] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["historial"] });
  };

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgradeToPro = () => {
    setShowUpgradeModal(true);
  };

  const confirmUpgradeToPro = async () => {
    try {
      await authApi.changePlan("pro");
      alert("¡Felicidades! Has sido ascendido a Plan Pro. Ahora tienes historial ilimitado.");
      setShowUpgradeModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el plan. Inicia sesión primero.");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Historial de Consultas</h1>
          <p className="text-muted-foreground text-xs mt-1">Revisa tus análisis territoriales previos guardados en el sistema.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isFree && (
            <button 
              onClick={handleUpgradeToPro}
              className="bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:opacity-95 shadow-sm transition active:scale-[0.98]"
            >
              ⭐ Pasar a Pro
            </button>
          )}
          <button 
            onClick={handleRefresh}
            className="bg-muted border border-border/80 text-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-muted/80 transition active:scale-[0.98]"
          >
            🔄 Actualizar Tabla
          </button>
        </div>
      </div>

      {isFree && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-4 mb-6 text-xs leading-relaxed space-y-1">
          <span className="font-bold block">⚠️ Alerta de Almacenamiento:</span>
          <p>
            Tu cuenta gratuita de AguaSabia tiene un límite de almacenamiento de <strong>3 consultas guardadas</strong>. Las consultas nuevas sobrescribirán las más antiguas automáticamente. Para almacenamiento ilimitado y análisis de cuencas DGA, considera mejorar tu plan.
          </p>
        </div>
      )}

      {isLoading && <div className="text-center py-10">Cargando historial...</div>}
      {isError && <div className="text-red-500 py-10">Ocurrió un error al cargar el historial. Verifica tu conexión.</div>}

      {!isLoading && !isError && (!consultas || consultas.length === 0) && (
        <div className="bg-card border border-border p-8 rounded-lg text-center">
          <p className="text-muted-foreground mb-4">No tienes consultas guardadas en tu historial.</p>
          <Link to="/mapa" className="text-primary hover:underline font-medium">Ir al mapa para realizar un análisis</Link>
        </div>
      )}

      {consultas && consultas.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm text-muted-foreground">Fecha</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Ubicación (Centroide)</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Resumen</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((item, index) => {
                const isLocked = isFree && index >= 3;
                return (
                  <tr key={item.id} className={`border-b border-border hover:bg-muted/20 transition ${isLocked ? "bg-muted/30 text-muted-foreground/40 opacity-60" : ""}`}>
                    <td className="p-4 text-sm whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      Lat: {item.centroide_latitud.toFixed(3)}, Lon: {item.centroide_longitud.toFixed(3)}
                    </td>
                    <td className="p-4 text-sm max-w-xs truncate" title={item.resumen_general || "Sin resumen"}>
                      {isLocked ? "🔒 Contenido Bloqueado - Límite Plan Gratuito" : (item.resumen_general || "Análisis general territorial")}
                    </td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      {isLocked ? (
                        <span className="text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/20 select-none">
                          Límite
                        </span>
                      ) : (
                        <Link to={`/mapa?consulta_id=${item.id}`} className="text-primary hover:underline text-sm font-medium">
                          Ver detalle
                        </Link>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive/80 text-sm font-medium transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
                { title: "Intersección Espacial PostGIS", desc: "Cruce geográfico automático con capas oficiales de la DGA (Cuencas afectadas, Decretos de Escasez Hídrica)." },
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
    </div>
  );
}
