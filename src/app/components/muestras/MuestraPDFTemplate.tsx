"use client";

import { forwardRef } from "react";
import { User } from "lucide-react";
import PlantillaPDF from "../ui/PlantillaPDF";

// Funciones de formateo (las mismas que usa el modal)
const formatearFechaHora = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleString("es-VE", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
  });
};

interface MuestraPDFTemplateProps {
  muestra: any;
  historial: any[];
}

const MuestraPDFTemplate = forwardRef<HTMLDivElement, MuestraPDFTemplateProps>(
  ({ muestra, historial }, ref) => {
    if (!muestra) return null;

    return (
      <PlantillaPDF 
        ref={ref}
        titulo="Detalles de la Muestra"
        subtitulo="Reporte técnico de trazabilidad y custodia farmacéutica"
        fechaEmision={new Date().toLocaleDateString("es-VE")}
      >
        <div className="space-y-6">
          
          {/* BLOQUE 1: IDENTIFICACIÓN Y LOGÍSTICA */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
            <h3 className="font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">
              Identificación Técnica y Operativa
            </h3>
            <div className="grid grid-cols-2 gap-y-4 text-[12px]">
              <p><strong className="text-slate-500 uppercase text-[9px] block">Código Interno</strong> {muestra.codigo_interno}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Lote</strong> {muestra.lote}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Principio Activo</strong> {muestra.principio_activo}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Reg. Sanitario</strong> {muestra.registro_sanitario}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Cantidad Total</strong> {muestra.cantidad} {muestra.unidad_medida}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Tipo de Empaque</strong> {muestra.tipo_empaque}</p>
              <p className="col-span-2"><strong className="text-slate-500 uppercase text-[9px] block">Propósito del Análisis</strong> {muestra.proposito_analisis}</p>
            </div>
          </div>

          {/* BLOQUE 2: LOGÍSTICA Y TIEMPOS */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid mt-6" style={{ pageBreakInside: 'avoid' }}>
            <h3 className="font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">
              Logística y Tiempos Legales (Res. N° 072)
            </h3>
            <div className="grid grid-cols-2 gap-y-4 text-[12px] mb-5">
              <p><strong className="text-slate-500 uppercase text-[9px] block">Ubicación Física</strong> {muestra.area?.nombre} ({muestra.area?.direccion?.nombre})</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Nivel de Riesgo</strong> {muestra.riesgo_bioseguridad}</p>
              <p className="col-span-2"><strong className="text-slate-500 uppercase text-[9px] block">Registrado Por</strong> {muestra.usuarioRegistrador?.nombre || "Sistema"} ({formatearFechaHora(muestra.creado_en)})</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-500 uppercase">Ingreso</span>
                <span className="font-bold text-[12px] text-slate-800">{formatearFecha(muestra.creado_en)}</span>
              </div>
              <div className="bg-white border border-amber-200 p-2.5 rounded-xl">
                <span className="block text-[9px] font-bold text-amber-600 uppercase">Caducidad</span>
                <span className="font-bold text-[12px] text-amber-900">{formatearFecha(muestra.fecha_caducidad)}</span>
              </div>
              <div className="bg-white border border-red-200 p-2.5 rounded-xl">
                <span className="block text-[9px] font-bold text-red-600 uppercase">Fin Retención</span>
                <span className="font-bold text-[12px] text-red-900">{formatearFecha(muestra.fecha_fin_retencion)}</span>
              </div>
            </div>
          </div>

          {/* BLOQUE 3: HISTORIAL PROTEGIDO CONTRA CORTES */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 mt-6">
            <h3 className="font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">
              Línea de Tiempo de Auditoría
            </h3>
            <div className="space-y-0">
              {historial.map((hito, i) => (
                <div key={hito.id} className="block break-inside-avoid mb-2" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-600 border-2 border-indigo-200 shrink-0 mt-1" />
                      {i !== historial.length - 1 && <div className="w-[2px] bg-indigo-200 h-full my-1" />}
                    </div>
                    
                    <div className="bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm flex-1 mb-3">
                      <div className="flex justify-between mb-1.5">
                        <p className="font-bold text-indigo-600 text-[11px]">{formatearFechaHora(hito.fecha_cambio)}</p>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide">
                          PASO #{historial.length - i}
                        </span>
                      </div>
                      <p className="text-[12px] font-bold text-slate-800">{hito.estado_nuevo.nombre}</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">"{hito.motivo}"</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                        <User size={10} /> {hito.usuario?.nombre || "Sistema Automático"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </PlantillaPDF>
    );
  }
);

MuestraPDFTemplate.displayName = "MuestraPDFTemplate";
export default MuestraPDFTemplate;