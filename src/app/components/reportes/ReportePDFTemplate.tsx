"use client";

import { forwardRef } from "react";
import PlantillaPDF from "../ui/PlantillaPDF"; 

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
  });
};

interface FiltrosProps {
  area: string;
  usuario: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  busqueda: string;
}

interface ReportePDFTemplateProps {
  reportes: any[];
  filtros: FiltrosProps;
  generadoPor: string;
}

const ReportePDFTemplate = forwardRef<HTMLDivElement, ReportePDFTemplateProps>(
  ({ reportes, filtros, generadoPor }, ref) => {
    
    if (!reportes || reportes.length === 0) return null;

    // Función para determinar el color del badge de estado en el PDF
    const getEstadoStyles = (nombre: string) => {
      const n = nombre?.toUpperCase() || "";
      if (n.includes("ANULADA")) {
        return "text-red-700 ";
      }
      if (n.includes("DESTRUIDA") || n.includes("SEGREGADA")) {
        return "text-blue-700";
      }
      // Por defecto (Recibida, Activa, etc)
      return "text-emerald-700";
    };

    return (
      <PlantillaPDF
        ref={ref}
        titulo="Acta Consolidada de Auditoría"
        subtitulo="Reporte técnico de trazabilidad y filtros del sistema"
        fechaEmision={new Date().toLocaleDateString("es-VE")}
      >
        <div className="space-y-6">

          {/* BLOQUE 1: PARÁMETROS */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
            <h3 className="font-bold text-indigo-900 mb-3 border-b border-indigo-100 pb-2 text-[13px]">
              Parámetros de Extracción
            </h3>
            <div className="grid grid-cols-2 gap-y-3 text-[11px]">
              <p><strong className="text-slate-500 uppercase text-[8px] block">Área / Ubicación</strong> {filtros.area}</p>
              <p><strong className="text-slate-500 uppercase text-[8px] block">Analista</strong> {filtros.usuario}</p>
              <p><strong className="text-slate-500 uppercase text-[8px] block">Estado</strong> {filtros.estado}</p>
              <p><strong className="text-slate-500 uppercase text-[8px] block">Rango</strong> {filtros.fechaInicio ? `Desde ${formatearFecha(filtros.fechaInicio)} al ${filtros.fechaFin ? formatearFecha(filtros.fechaFin) : 'Hoy'}` : "Histórico Completo"}</p>
            </div>
          </div>

          {/* BLOQUE 2: REGISTROS COMPACTOS */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50">
            <div className="flex justify-between items-center mb-5 border-b border-indigo-100 pb-2">
              <h3 className="font-bold text-indigo-900 text-[13px]">Expedientes Encontrados</h3>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                Total: {reportes.length} Registros
              </span>
            </div>
            
            <div className="space-y-3">
              {reportes.map((item) => (
                <div key={item.id} className="block break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                    
                    {/* FILA 1: PRODUCTO Y ESTADO CON COLORES DINÁMICOS */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-slate-800 leading-tight">
                          {item.principio_activo}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-indigo-600 px-1.5 py-0.5 rounded uppercase">
                            {item.codigo_interno}
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium italic">
                            Lote: {item.lote}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded whitespace-nowrap ${getEstadoStyles(item.estado?.nombre)}`}>
                        {item.estado?.nombre?.split("(")[0].trim()}
                      </span>
                    </div>

                    {/* FILA 2: DATA TÉCNICA DISTRIBUIDA */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold uppercase text-[7px] tracking-widest">Ubicación / Analista</span>
                        <span className="text-slate-600 font-medium">
                          {item.area?.nombre} • <span className="text-indigo-600 font-bold">{item.usuarioRegistrador?.nombre}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-col text-center">
                        <span className="text-slate-400 font-bold uppercase text-[7px] tracking-widest">Cantidad</span>
                        <span className="text-slate-800 font-bold">{item.cantidad} {item.unidad_medida?.nombre}</span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-slate-400 font-bold uppercase text-[7px] tracking-widest">Fechas (Reg / Ret)</span>
                        <span className="text-slate-600 font-medium">
                          {formatearFecha(item.creado_en)} <span className="text-red-400">/</span> {formatearFecha(item.fecha_fin_retencion)}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BLOQUE 3: PIE DE PÁGINA */}
          <div className="pt-10 break-inside-avoid text-center" style={{ pageBreakInside: 'avoid' }}>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-12">
              Sistema de Trazabilidad SITRADES - Generado por {generadoPor}
            </p>
            <div className="w-56 border-t border-slate-300 mx-auto pt-2">
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{generadoPor}</p>
              <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Firma y Sello del Auditor</p>
            </div>
          </div>

        </div>
      </PlantillaPDF>
    );
  }
);

ReportePDFTemplate.displayName = "ReportePDFTemplate";
export default ReportePDFTemplate;