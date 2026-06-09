export function LearnPage() {
  const topics = [
    {
      id: "agua",
      title: "Recursos Hídricos y Sequía",
      content: "La sequía en Chile no es solo falta de lluvia, sino una condición estructural exacerbada por el cambio climático. Un territorio con estrés hídrico afecta directamente a la agricultura, consumo humano y ecosistemas locales.",
      icon: "💧",
    },
    {
      id: "ndvi",
      title: "Índice de Vegetación (NDVI)",
      content: "El Índice de Vegetación de Diferencia Normalizada (NDVI) utiliza imágenes satelitales para medir el verdor y la densidad de las plantas. Valores cercanos a 1 indican vegetación sana, mientras que valores bajos advierten sobre sequedad o suelo desnudo.",
      icon: "🌿",
    },
    {
      id: "incendios",
      title: "Riesgo de Incendios Forestales",
      content: "El riesgo se evalúa cruzando datos de temperatura, humedad relativa, viento y el estado de sequedad de la vegetación (combustible fino muerto). Áreas con estrés hídrico prolongado son extremadamente vulnerables.",
      icon: "🔥",
    },
    {
      id: "clima",
      title: "Evapotranspiración (ET0)",
      content: "La evapotranspiración mide la cantidad de agua que regresa a la atmósfera por evaporación del suelo y transpiración de las plantas. Es un indicador clave para calcular exactamente cuánta agua necesita un cultivo para sobrevivir.",
      icon: "☀️",
    }
  ];

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-4 tracking-tight">Centro Educativo Ambiental</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          En AguaSabia creemos que los datos solo son útiles si se comprenden. 
          Explora los conceptos clave que utilizamos para analizar tu territorio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-5xl mb-6">{topic.icon}</div>
            <h2 className="text-xl font-bold text-foreground mb-3">{topic.title}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {topic.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
