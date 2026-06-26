import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <section 
        className="relative w-full py-24 md:py-36 flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-border/40 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/mifoto.jpg')" }}
      >
        <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        
        <div className="max-w-4xl space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
             Investigación & Tecnología Territorial
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Plataforma Territorial de <br />
            <span className="text-brand-gradient">Diagnóstico Hídrico y Resiliencia</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AguaSabia integra modelos de evapotranspiración de referencia y datos satelitales con cartografía de la Dirección General de Aguas (DGA) para estimar balances de agua a nivel predial y proveer reportes de resiliencia climática en Chile.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/aprender" 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-amber-500 hover:from-primary/95 hover:to-amber-500/95 text-primary-foreground font-semibold px-8 py-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Simular Balance Hídrico
            </Link>
          </div>
        </div>
      </section>

      {/* Qué analiza Sección */}
      <section className="w-full py-20 bg-card/45 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Módulos de Diagnóstico Geoespacial</h2>
            <p className="text-muted-foreground leading-relaxed">
              Consolidamos variables satelitales (Sentinel-2), climáticas (Open-Meteo) y geográficas públicas en reportes estructurados para el monitoreo de recursos prediales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Balance Hídrico Dinámico", 
                desc: "Estimación del balance diario de humedad en el suelo contrastando la lluvia local frente a la evapotranspiración real calculada para el predio.", 
                icon: "💧",
                color: "text-blue-500"
              },
              { 
                title: "Dinámica Climatológica", 
                desc: "Variables meteorológicas clave de temperatura, humedad y radiación para determinar la demanda de agua de la atmósfera sobre el territorio.", 
                icon: "🌤️",
                color: "text-amber-500"
              },
              { 
                title: "Salud y Vigor Vegetal (NDVI)", 
                desc: "Monitoreo espectral mediante el índice de vegetación NDVI para evaluar la biomasa fotosintéticamente activa y la sequedad foliar.", 
                icon: "🌿",
                color: "text-emerald-500"
              },
              { 
                title: "Riesgo Agroambiental", 
                desc: "Cálculo automatizado de vulnerabilidad territorial frente a escasez hídrica extrema, estrés vegetativo y proximidad a focos de incendio.", 
                icon: "⚠️",
                color: "text-red-500"
              },
            ].map((feature, i) => (
              <div key={i} className="bg-card border border-border/50 p-7 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 gold-glow-border group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Importancia Sección */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Ciencia de Datos Aplicada a la Gestión del Agua</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              La adaptación al cambio climático requiere herramientas geoespaciales precisas. AguaSabia reduce la brecha técnica mediante la interpretación automatizada de datos a escala predial para tres ejes de acción:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <h4 className="font-bold text-lg text-foreground">Transferencia Tecnológica</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Traducimos conjuntos de datos científicos complejos de sensores remotos y modelos globales a un formato didáctico y accionable para agricultores, técnicos y planificadores.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">2</div>
              <h4 className="font-bold text-lg text-foreground">Resolución Geoespacial</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Permite delimitar polígonos exactos sobre mapas cartográficos interactivos para realizar cruces con la red hidrométrica de la Dirección General de Aguas (DGA).</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">3</div>
              <h4 className="font-bold text-lg text-foreground">Educación e Incidencia</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Fomentamos la toma de decisiones basada en evidencia científica para adaptar la gestión del agua al cambio climático en las cuencas del territorio nacional.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
