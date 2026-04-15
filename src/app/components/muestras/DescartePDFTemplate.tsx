"use client";

import { forwardRef } from "react";
import { ShieldCheck, Thermometer, User, ClipboardList } from "lucide-react";
import PlantillaPDF from "../ui/PlantillaPDF";

interface DescartePDFTemplateProps {
  muestra: any;
}

const DescartePDFTemplate = forwardRef<HTMLDivElement, DescartePDFTemplateProps>(
  ({ muestra }, ref) => {
    if (!muestra || !muestra.reporte_descarte) return null;

    const reporte = muestra.reporte_descarte;

    return (
      <PlantillaPDF 
        ref={ref}
        titulo="Certificado de Descarte Legal"
        subtitulo="Acta de disposición final de especialidades farmacéuticas"
        fechaEmision={new Date().toLocaleDateString("es-VE")}
      >
        <div className="space-y-8 mt-6">
          
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50/30">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-[11px] tracking-wider">
              <ShieldCheck size={16} className="text-brand-primary" /> Identificación del Residuo Farmacéutico
            </h3>
            <div className="grid grid-cols-2 gap-y-5 text-[12px]">
              <p><strong className="text-slate-400 uppercase text-[9px] block">Principio Activo</strong> {muestra.principio_activo}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Registro Sanitario</strong> {muestra.registro_sanitario}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Lote</strong> {muestra.lote}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Código Interno</strong> {muestra.codigo_interno}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Cantidad</strong> {muestra.cantidad} {muestra.unidad_medida}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Área de Origen</strong> {muestra.area?.nombre}</p>
            </div>
          </div>

          {/* SECCIÓN 2: PROTOCOLO */}
          <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50/30">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-[11px] tracking-wider">
              <Thermometer size={16} className="text-brand-primary" /> Protocolo de Disposición Final
            </h3>
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Método Aplicado</span>
                <span className="font-bold text-[13px] text-slate-800">{reporte.metodo_disposicion}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Observaciones Técnicas</span>
                <p className="text-[12px] text-slate-700 italic leading-relaxed">"{reporte.observaciones}"</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: VALIDACIÓN */}
          <div className="pt-10">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase text-[11px] tracking-wider">
              <User size={16} className="text-brand-primary" /> Validación de Ejecución
            </h3>
            <div className="grid grid-cols-2 gap-10 text-[12px]">
              <div>
                <p><strong className="text-slate-400 uppercase text-[9px] block">Responsable</strong> {reporte.ejecutor?.nombre || "Analista Autorizado"}</p>
                <p className="mt-4"><strong className="text-slate-400 uppercase text-[9px] block">Fecha de Cierre</strong> {new Date(reporte.fecha_descarte).toLocaleString("es-VE")}</p>
              </div>
              <div className="flex flex-col items-center justify-end border-t border-slate-300 pt-2 h-24">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Firma y Sello del Analista</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[9px] text-slate-400 text-center leading-relaxed">
              Documento generado por SITRADES. Este certificado avala que la muestra ha sido tratada siguiendo los protocolos de bioseguridad del INHRR y el Decreto N° 2.218.
            </p>
          </div>

        </div>
      </PlantillaPDF>
    );
  }
);

DescartePDFTemplate.displayName = "DescartePDFTemplate";
export default DescartePDFTemplate;