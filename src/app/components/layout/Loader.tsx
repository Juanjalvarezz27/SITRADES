"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  isVisible: boolean;
}

export default function Loader({ isVisible }: LoaderProps) {
  // Estado para controlar el desmontaje suave
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  const handleTransitionEnd = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      onTransitionEnd={handleTransitionEnd}
      className={`fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      
      {/* Contenedor del Logo con brillo trasero suave */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Glow effect (brillo) de fondo que pulsa suavemente */}
        <div className="absolute w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl animate-[pulse_3s_ease-in-out_infinite]" />
        
        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          <Image 
            src="/Logo.png" 
            alt="Cargando SITRADES" 
            fill 
            sizes="(max-width: 640px) 128px, 144px"
            className="object-contain drop-shadow-xl" 
            priority
          />
        </div>
      </div>

      {/* Indicador de carga fluido */}
      <div className="flex flex-col items-center gap-3">
        <Loader2 
          className="text-brand-primary animate-spin" 
          size={40} 
          strokeWidth={3} 
        />
      </div>
      
    </div>
  );
}