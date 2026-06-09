import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Comprende el estado hídrico y ambiental de cualquier territorio en Chile.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AguaSabia es la plataforma geoespacial de consulta territorial que automatiza la interpretación de datos satelitales, climáticos y geográficos para una mejor toma de decisiones.
          </p>
          <div className="pt-8">
            <Link 
              to="/mapa" 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
            >
              Comenzar Análisis
            </Link>
          </div>
        </div>
      </section>

      {/* Qué analiza Sección */}
      <section className="w-full py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">¿Qué analiza AguaSabia?</h2>
            <p className="text-muted-foreground">Consolidamos docenas de capas de información pública y satelital en reportes simples y educativos.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Agua", desc: "Disponibilidad hídrica, cuencas, y estado de embalses cercanos.", icon: "💧" },
              { title: "Clima", desc: "Condiciones actuales, índices de sequía y proyecciones de evapotranspiración.", icon: "🌤️" },
              { title: "Vegetación", desc: "Análisis satelital (NDVI) para evaluar el vigor y cobertura vegetal.", icon: "🌿" },
              { title: "Riesgos", desc: "Vulnerabilidad a incendios forestales y estrés hídrico sostenido.", icon: "⚠️" },
            ].map((feature, i) => (
              <div key={i} className="bg-background border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades Sección */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight mb-6">¿Por qué es importante la gestión del agua?</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            La crisis climática exige herramientas accesibles. AguaSabia no solo muestra datos, sino que los interpreta. Nuestro objetivo es educar a la población y asistir a tomadores de decisiones mediante:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div>
              <h4 className="font-semibold text-lg mb-2 text-primary">Interpretación Automática</h4>
              <p className="text-muted-foreground text-sm">Convertimos números complejos en conclusiones claras y aplicables.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-primary">Visualización Geográfica</h4>
              <p className="text-muted-foreground text-sm">Dibuja polígonos exactos en un mapa interactivo para delimitar tu área de interés.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-primary">Educación Ambiental</h4>
              <p className="text-muted-foreground text-sm">Fomentamos la conciencia sobre el estrés hídrico y el cambio climático en los territorios.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
