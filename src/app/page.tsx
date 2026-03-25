export default function Home() {
  return (
    // Probamos el fondo base (brand-bg) y el color de texto general (brand-text)
    <main className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center justify-center p-8 gap-10">
      
      {/* HEADER: Prueba de Montserrat (font-title) y Azul Institucional (brand-primary) */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-title font-bold text-brand-primary tracking-tight">
          SITRADES | INHRR
        </h1>
        <p className="text-lg font-sans max-w-2xl mx-auto text-brand-text/80">
          Si ves esto con los colores correctos, el downgrade a Tailwind v3 fue un éxito total. 
          La tipografía <strong>Inter</strong> se lee perfecto para los datos, y <strong>Montserrat</strong> le da peso al título.
        </p>
      </div>

      {/* TARJETAS: Prueba de la Paleta Semántica de Estados y fuente Inter (font-sans) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl font-sans">
        
        {/* Tarjeta: Muestra Activa (Verde) */}
        <div className="bg-status-active text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center gap-2 hover:shadow-lg transition-shadow cursor-default">
          <span className="text-2xl font-bold tracking-wide">Vigente</span>
          <span className="text-sm font-medium opacity-90">Muestra en periodo de análisis</span>
        </div>

        {/* Tarjeta: Custodia Legal (Ámbar) */}
        <div className="bg-status-custody text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center gap-2 hover:shadow-lg transition-shadow cursor-default">
          <span className="text-2xl font-bold tracking-wide">En Custodia</span>
          <span className="text-sm font-medium opacity-90">Retención legal (Res. N° 072)</span>
        </div>

        {/* Tarjeta: Alerta de Descarte (Rojo) */}
        <div className="bg-status-danger text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center gap-2 hover:shadow-lg transition-shadow cursor-default">
          <span className="text-2xl font-bold tracking-wide">Bolsa Roja</span>
          <span className="text-sm font-medium opacity-90">Alerta a Seguridad Industrial</span>
        </div>

      </div>

    </main>
  );
}