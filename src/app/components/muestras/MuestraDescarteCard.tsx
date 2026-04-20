"use client";

import Link from "next/link";
import { 
  MapPin, 
  ShieldAlert, 
  Trash2, 
  AlertOctagon, 
  ArrowRight,
  Clock
} from "lucide-react";

// Funciones de utilidad internas
const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { 
    year: "numeric", 
    month: "short", 
    day: "numeric", 
    timeZone: "UTC" 
  });
};

interface MuestraDescarteCardProps {
  muestra: any;
  userRol: string; // <-- Nuevo: Recibe el rol del usuario
  onAnular: () => void; // <-- Nuevo: Función para disparar el modal de anulación
}

export default function MuestraDescarteCard({ muestra, userRol, onAnular }: MuestraDescarteCardProps) {
  
  // Validación de seguridad visual
  const esAdmin = userRol === "Administrador";

  return (
    <div className="bg-white border-2 border-rose-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      
      {/* Indicador de urgencia */}
      <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-50 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700" />

      {/* BOTÓN DE ANULAR CON TOOLTIP PERSONALIZADO (Solo Administrador) */}
      {esAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onAnular(); }}
          className="absolute top-4 right-4 p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-sm opacity-60 hover:opacity-100 group/btn z-20"
        >
          <AlertOctagon size={16} strokeWidth={2.5} />
          
          {/* Tooltip CSS Custom - Aparece a la izquierda del botón */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded-xl opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all duration-200 whitespace-nowrap shadow-xl flex items-center pointer-events-none">
            Anular Registro por Error
            {/* Flecha del tooltip */}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm"></div>
          </div>
        </button>
      )}

      <div className="flex items-start justify-between gap-4 mb-5 relative z-10 pr-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-red-50 text-rose-600 flex items-center justify-center shrink-0 shadow-inner group-hover:animate-pulse">
            <AlertOctagon size={28} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 bg-rose-50 text-rose-700 border-rose-200">
              <ShieldAlert size={12} strokeWidth={3} />
              Retención Cumplida
            </span>
            <h3 className="text-[17px] font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-rose-600 transition-colors">
              {muestra.principio_activo}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-6 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Código</span>
            <span className="font-black text-slate-700 text-[13px] truncate block">{muestra.codigo_interno}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Lote</span>
            <span className="font-black text-slate-700 text-[13px] truncate block">{muestra.lote}</span>
          </div>
        </div>

        {/* ALERTA DE VENCIMIENTO */}
        <div className="p-4 rounded-2xl border bg-rose-50/50 border-rose-200/60 flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="block text-rose-800 font-black text-[12px] uppercase tracking-wide">Tiempo de Custodia Agotado</span>
            <span className="text-[11px] text-rose-600/80 font-bold">Venció el {formatearFecha(muestra.fecha_fin_retencion)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="leading-tight text-[13px] text-slate-500">
            <strong className="text-slate-800 block mb-1 font-bold">Ubicación Física a Despejar</strong>
            <span className="text-[12px] font-medium">{muestra.area?.nombre || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <Link 
          href={`/home/muestras/${muestra.id}/descarte`}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[14px] rounded-2xl transition-all duration-300 shadow-md shadow-rose-600/20 active:scale-[0.98]"
        >
          <Trash2 size={18} /> Iniciar Protocolo de Descarte <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}