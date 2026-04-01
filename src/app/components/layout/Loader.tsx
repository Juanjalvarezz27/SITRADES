import Image from "next/image";
import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  isVisible: boolean;
}

export default function Loader({ isVisible }: LoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-brand-bg/95 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-500">
      
      {/* Logo con animación de parpadeo */}
      <div className="relative w-36 h-36 sm:w-36 sm:h-36 animate-pulse mb-6">
        <Image 
          src="/Logo.png" 
          alt="Cargando SITRADES" 
          fill 
          sizes="(max-width: 640px) 112px, 144px"
          className="object-contain" 
          priority
        />
      </div>

      <LoaderCircle 
        className="text-brand-primary animate-[spin_0.7s_linear_infinite]" 
        size={46} 
        strokeWidth={2.5} 
      />
      
    </div>
  );
}