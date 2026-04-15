"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

interface PlantillaPDFProps {
  titulo: string;
  subtitulo?: string;
  fechaEmision: string;
  children: React.ReactNode;
}

const PlantillaPDF = forwardRef<HTMLDivElement, PlantillaPDFProps>(
  ({ titulo, subtitulo, fechaEmision, children }, ref) => {
    // Estado para controlar la altura total exacta del documento
    const [minHeight, setMinHeight] = useState(1050);
    // Referencia para medir el contenido dinámico
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Usamos un pequeño retraso para asegurar que las imágenes y fuentes se renderizaron
      const calcularPaginacion = () => {
        if (contentRef.current) {
          // Medimos cuánto mide todo el contenido (Cabecera + Título + Datos)
          const contentHeight = contentRef.current.getBoundingClientRect().height;
          
          const FOOTER_HEIGHT = 180; // Espacio que ocupa nuestro logo y textos del pie
          const PAGE_HEIGHT = 1050;  // Altura exacta de la hoja A4 en nuestra escala
          
          const totalRequerido = contentHeight + FOOTER_HEIGHT;
          // Calculamos cuántas páginas enteras se necesitan
          const paginasNecesarias = Math.ceil(totalRequerido / PAGE_HEIGHT);
          
          // Forzamos el contenedor a medir múltiplos exactos de una página
          setMinHeight(paginasNecesarias * PAGE_HEIGHT);
        }
      };

      setTimeout(calcularPaginacion, 150);
    }, [children]);

    return (
      <div className="absolute -left-[9999px] top-0">
        <div 
          ref={ref} 
          // Este contenedor principal ahora siempre medirá hojas exactas
          className="w-[790px] flex flex-col bg-white text-slate-800 p-0 m-0"
          style={{ fontFamily: "'Inter', sans-serif", minHeight: `${minHeight}px` }}
        >
          
          {/* CONTENEDOR DE MEDIDA (Todo excepto el Footer) */}
          <div ref={contentRef}>
            {/* HEADER IMAGE */}
            <div className="w-full mb-6">
              <img 
                src="/Header.png" 
                alt="INHRR Header" 
                className="w-full h-auto object-contain block"
              />
            </div>

            <div className="px-10">
              {/* TÍTULO */}
              <div className="flex items-center justify-between border-l-4 border-indigo-600 pl-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {titulo}
                  </h2>
                  {subtitulo && <p className="text-sm font-medium text-slate-500 italic">{subtitulo}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emisión</p>
                  <p className="text-[13px] font-bold text-indigo-600">{fechaEmision}</p>
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL INYECTADO */}
              <div>
                {children}
              </div>
            </div>
          </div>

          {/* PIE DE PÁGINA (Al fondo de la última hoja) */}
          {/* Gracias al flex-col del padre y la altura exacta calculada, mt-auto lo arrastra al límite inferior */}
          <div className="mt-auto px-10 pb-8 shrink-0">
            <div className="pt-6 border-t border-slate-200 flex flex-col items-center gap-6">
              
              {/* Textos del Pie de Página */}
              <div className="w-full flex justify-between items-center">
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">
                  SITRADES — Sistema de Trazabilidad y Gestión de Desechos en el Control de Muestras • INHRR
                </p>
                <p className="text-[9px] text-slate-400 font-bold">
                  Documento Oficial
                </p>
              </div>

              {/* Logo Centrado */}
              <img 
                src="/Logo.png" 
                alt="Logo INHRR" 
                className="w-28 h-auto object-contain opacity-90"
              />
              
            </div>
          </div>

        </div>
      </div>
    );
  }
);

PlantillaPDF.displayName = "PlantillaPDF";
export default PlantillaPDF;