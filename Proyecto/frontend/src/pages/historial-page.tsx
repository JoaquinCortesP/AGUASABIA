import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { territorioApi } from "@/features/territorio/api/territorio-api";

export function HistorialPage() {
  const queryClient = useQueryClient();

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

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-primary mb-2">Historial de Consultas</h1>
      <p className="text-muted-foreground mb-8">Revisa tus análisis territoriales previos guardados en el sistema.</p>

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
              {consultas.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition">
                  <td className="p-4 text-sm whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    Lat: {item.centroide_latitud.toFixed(3)}, Lon: {item.centroide_longitud.toFixed(3)}
                  </td>
                  <td className="p-4 text-sm max-w-xs truncate" title={item.resumen_general || "Sin resumen"}>
                    {item.resumen_general || "Análisis general territorial"}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link to={`/historial/${item.id}`} className="text-primary hover:underline text-sm font-medium">
                      Ver detalle
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
