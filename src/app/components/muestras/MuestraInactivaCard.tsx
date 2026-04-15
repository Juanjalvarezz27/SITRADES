"use client";

import { 
  PackageX, 
  MapPin, 
  Eye, 
  Trash2, 
  FileSignature, 
  ClipboardCheck, 
  CalendarDays 
} from "lucide-react";

interface MuestraInactivaCardProps {
  muestra: any;
  onClickExpediente: () => void;
  onClickCertificado: () => void;
}

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { 
    year: "numeric", 
    month: "short", 
    day: "numeric", 
    timeZone: "UTC" 
  });
};

export default function MuestraInactivaCard({ 
  muestra, 
  onClickExpediente, 
  onClickCertificado 
}: MuestraInactivaCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-20" />

      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-brand-primary flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110">
            <PackageX size={28} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 bg-blue-50 text-brand-primary border-blue-200">
              <Trash2 size={12} strokeWidth={3} />
              Archivo Final
            </span>
            <h3 className="text-[17px] font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
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

        {/* DATOS TÉCNICOS */}
        <div className="p-4 rounded-2xl border transition-all bg-slate-50/50 border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm">
              <ClipboardCheck size={16} />
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wide">Registro Sanitario</span>
              <span className="block text-slate-700 font-black text-[12px]">{muestra.registro_sanitario || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm">
              <CalendarDays size={16} />
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wide">Fecha de Ingreso</span>
              <span className="block text-slate-700 font-black text-[12px]">{formatearFecha(muestra.fecha_ingreso)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
          <MapPin size={18} className="text-blue-400 shrink-0" />
          <div className="leading-tight text-[12px] text-slate-500 font-medium">
            Originario de: <span className="text-slate-800 font-bold">{muestra.area?.nombre || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10 flex flex-col gap-2">
        <button 
          onClick={onClickExpediente}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-brand-primary text-slate-600 hover:text-white font-black text-[13px] rounded-2xl transition-all duration-300 border border-slate-200 hover:border-slate-900 shadow-sm"
        >
          <Eye size={18} /> Ver Expediente Histórico
        </button>
        
        <button 
          onClick={onClickCertificado}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-brand-primary text-brand-primary hover:text-white font-black text-[13px] rounded-2xl transition-all duration-300 border border-blue-100 hover:border-brand-primary shadow-sm"
        >
          <FileSignature size={18} /> Ver Acta de Descarte
        </button>
      </div>
    </div>
  );
}