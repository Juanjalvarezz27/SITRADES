"use client";

import { 
  PackageX, 
  MapPin, 
  Eye, 
  Trash2, 
  FileSignature, 
  CalendarDays,
  AlertOctagon 
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
  
  // Determinamos si esta muestra es una anulación por error
  const esAnulada = muestra.estado?.nombre === "Anulada (Error de Registro)";

  return (
    <div className={`bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full group relative overflow-hidden ${esAnulada ? 'hover:shadow-red-500/10' : 'hover:shadow-blue-500/10'}`}>
      
      {/* Barra lateral de color dinámico */}
      <div className={`absolute top-0 left-0 w-2 h-full opacity-20 ${esAnulada ? 'bg-red-500' : 'bg-blue-500'}`} />

      {/* CABECERA - AHORA MUESTRA EL CÓDIGO INTERNO */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10 pr-4">
        <div className="flex items-center gap-3">
          
          {/* Ícono principal dinámico */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 ${esAnulada ? 'bg-gradient-to-br from-red-100 to-red-50 text-red-600' : 'bg-gradient-to-br from-blue-100 to-blue-50 text-brand-primary'}`}>
            {esAnulada ? <AlertOctagon size={28} /> : <PackageX size={28} />}
          </div>
          
          <div>
            {/* Etiqueta (Badge) dinámica */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 ${esAnulada ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-brand-primary border-blue-200'}`}>
              {esAnulada ? <AlertOctagon size={12} strokeWidth={3} /> : <Trash2 size={12} strokeWidth={3} />}
              {esAnulada ? 'Anulada por Error' : 'Archivo Final'}
            </span>
            
            <h3 className={`text-[18px] font-black text-slate-800 leading-tight line-clamp-2 transition-colors ${esAnulada ? 'group-hover:text-red-600' : 'group-hover:text-brand-primary'}`} title={muestra.codigo_interno}>
              {muestra.codigo_interno}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6 relative z-10">
        
        {/* PRINCIPIO ACTIVO A ANCHO COMPLETO */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Principio Activo</span>
          <span className="font-black text-slate-700 text-[13px] truncate block" title={muestra.principio_activo}>
            {muestra.principio_activo}
          </span>
        </div>

        {/* LOTE Y REGISTRO SANITARIO */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Lote</span>
            <span className="font-black text-slate-700 text-[13px] truncate block" title={muestra.lote}>
              {muestra.lote}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Reg. Sanitario</span>
            <span className="font-black text-slate-700 text-[13px] truncate block" title={muestra.registro_sanitario}>
              {muestra.registro_sanitario || "N/A"}
            </span>
          </div>
        </div>

        {/* FECHA DE INGRESO */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm shrink-0">
            <CalendarDays size={16} />
          </div>
          <div>
            <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wide">Fecha de Ingreso</span>
            <span className="block text-slate-700 font-black text-[12px]">
              {formatearFecha(muestra.fecha_ingreso || muestra.creado_en)}
            </span>
          </div>
        </div>

        {/* ÁREA ORIGINARIA */}
        <div className={`flex items-start gap-3 p-3 rounded-2xl border ${esAnulada ? 'bg-red-50/30 border-red-100/50' : 'bg-blue-50/30 border-blue-100/50'}`}>
          <MapPin size={18} className={`shrink-0 mt-0.5 ${esAnulada ? 'text-red-400' : 'text-blue-400'}`} />
          <div className="leading-tight text-[12px] text-slate-500 font-medium">
            <strong className="text-slate-800 block mb-0.5 font-bold">Originario de:</strong>
            <span className="text-[12px] font-medium">{muestra.area?.nombre || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10 flex flex-col gap-2">
        {/* Este botón siempre está disponible (para ver la auditoría de quién la anuló o descartó) */}
        <button 
          onClick={onClickExpediente}
          className={`w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-600 hover:text-white font-black text-[13px] rounded-2xl transition-all duration-300 border border-slate-200 hover:border-transparent shadow-sm ${esAnulada ? 'hover:bg-red-600' : 'hover:bg-brand-primary'}`}
        >
          <Eye size={18} /> Ver Expediente Histórico
        </button>
        
        {/* El Certificado de Descarte SOLO se muestra si NO fue anulada */}
        {!esAnulada && (
          <button 
            onClick={onClickCertificado}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-brand-primary text-brand-primary hover:text-white font-black text-[13px] rounded-2xl transition-all duration-300 border border-blue-100 hover:border-brand-primary shadow-sm"
          >
            <FileSignature size={18} /> Ver Acta de Descarte
          </button>
        )}
      </div>
    </div>
  );
}