export function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Panel de Administración</h1>
      <p className="text-muted-foreground mb-8">Estadísticas y gestión de usuarios (HU-07, RF-10)</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Consultas Hoy</h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Usuarios Registrados</h2>
        {/* Tabla de usuarios */}
      </div>
    </div>
  );
}
