"use client";

import { useRef, useState } from "react";
import {
  X, FileSignature, Thermometer, Calendar, User, ShieldCheck, Download, Loader2, ExternalLink, CheckCircle2, Target
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";

import DescartePDFTemplate from "./DescartePDFTemplate";

interface CertificadoDescarteModalProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: any;
}

const formatearFechaHora = (fecha: string | null | undefined) => {
  if (!fecha) return "Pendiente";
  return new Date(fecha).toLocaleString("es-VE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CertificadoDescarteModal({ isOpen, onClose, muestra }: CertificadoDescarteModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportarPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = pdfRef.current;
      const opt = {
        margin: 0,
        filename: `ACTA_DESCARTE_${muestra.codigo_interno}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
      } as const;

      await html2pdf().set(opt).from(element).save();
      setIsExporting(false);
    } catch (err: any) {
      setIsExporting(false);
      toast.error("Error técnico al generar el documento.");
    }
  };

  if (!isOpen || !muestra) return null;

  const reporte = muestra.reporte_descarte;
  const metodoNombre = reporte?.metodo_disposicion?.nombre || "Método no especificado";
  const observaciones = reporte?.observaciones || "Sin observaciones adicionales.";
  const fechaDescarte = reporte?.fecha_descarte;
  const responsableAnalista = reporte?.ejecutor?.nombre || "Usuario no registrado";
  const esAnalisis = muestra.tipo_muestra === "ANALISIS";

  // Buscamos el evento de Seguridad Industrial en el historial
  const eventoRecoleccion = muestra.historiales?.find(
    (h: any) => h.motivo && h.motivo.includes("Seguridad Industrial")
  );

  const responsableSeguridad = eventoRecoleccion?.usuario?.nombre || "En tránsito / Pendiente";
  const fechaRecoleccion = eventoRecoleccion?.fecha_cambio;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrPayload = baseUrl ? `${baseUrl}/consulta/${muestra.id}` : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/70 transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-[0.98] duration-200 flex flex-col max-h-[90vh]">

        {/* CABECERA */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-50 text-brand-primary rounded-2xl">
              <FileSignature size={24} />
            </div>
            <div>
              <h2 className="font-title font-black text-xl text-slate-800 leading-tight">Acta de Descarte Legal</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Certificación de Destrucción e Inactivación</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">

          {/* Identificación, Estado y QR Integrados */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Identificación y Estado Oficial
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">

              {/* BADGE DE ESTADO COMPACTO */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-4 flex-1 w-full shadow-sm">
                <div className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/20 shrink-0">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-0.5">Certificación de Cierre</p>
                  <p className="text-[16px] sm:text-lg font-black text-emerald-950 leading-none">DESCARTADO / DESTRUIDO</p>
                </div>
                <div className="ml-auto text-right hidden sm:block border-l border-emerald-200 pl-4">
                  <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">ID Auditoría</p>
                  <p className="font-mono font-bold text-emerald-800 text-xs">{muestra.codigo_interno}</p>
                </div>
              </div>

              {/* QR CODE */}
              {qrPayload && (
                <div className="flex flex-col items-center gap-1.5 shrink-0 w-full sm:w-auto">
                  <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 flex justify-center">
                    <QRCodeCanvas value={qrPayload} size={50} level="M" />
                  </div>
                  <a href={qrPayload} target="_blank" className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-lg transition-colors w-full">
                    <ExternalLink size={10} /> Visitar
                  </a>
                </div>
              )}
            </div>

            {/* Tarjetas de Datos de la Muestra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-1 sm:col-span-2">
                <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Clasificación Legal</span>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider ${esAnalisis ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-sm'}`}>
                  <Target size={14} strokeWidth={2.5} />
                  {esAnalisis ? 'Muestra Operativa (Análisis)' : 'Contramuestra Legal'}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Principio Activo</span>
                <span className="font-black text-slate-700 text-[14px] leading-tight">{muestra.principio_activo}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Lote y Código</span>
                <span className="font-black text-slate-700 text-[14px]">{muestra.lote} • {muestra.codigo_interno}</span>
              </div>
            </div>
          </div>

          {/* Protocolo */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Thermometer size={14} /> Protocolo Aplicado
            </h3>
            <div className="bg-white border-2 border-brand-primary/20 p-4 rounded-2xl flex items-start gap-4 mb-4">
              <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0 mt-0.5">
                <Thermometer size={18} />
              </div>
              <div>
                <span className="block text-slate-800 font-black text-[14px]">{metodoNombre}</span>
                <span className="block text-slate-500 font-medium text-[12px] mt-0.5">Método de inactivación definitiva.</span>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="block text-slate-500 font-bold text-[11px] uppercase tracking-wide mb-2">Observaciones de Auditoría</span>
              <p className="text-[13px] text-slate-700 font-medium italic leading-relaxed">"{observaciones}"</p>
            </div>
          </div>

          {/* Cadena de Custodia Legal */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Cadena de Custodia Legal
            </h3>
            <div className="flex flex-col gap-3">
              {/* Analista */}
              <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0"><User size={18} /></div>
                  <div>
                    <span className="block text-slate-400 font-bold text-[10px] uppercase">1. Segregación y Sellado</span>
                    <span className="block font-black text-slate-700 text-[13px]">{responsableAnalista}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="block text-slate-400 font-bold text-[10px] uppercase">Fecha</span>
                  <span className="block font-black text-slate-700 text-[12px]">{formatearFechaHora(fechaDescarte)}</span>
                </div>
              </div>

              {/* Seguridad Industrial */}
              <div className="flex items-center justify-between p-4 bg-white border-2 border-indigo-50 rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shrink-0"><ShieldCheck size={18} /></div>
                  <div>
                    <span className="block text-indigo-400 font-bold text-[10px] uppercase">2. Traslado y Disposición Final</span>
                    <span className={`block font-black text-[13px] ${!fechaRecoleccion ? 'text-indigo-400 italic' : 'text-indigo-900'}`}>{responsableSeguridad}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="block text-indigo-400 font-bold text-[10px] uppercase">Fecha</span>
                  <span className={`block font-black text-[12px] ${!fechaRecoleccion ? 'text-indigo-400 italic' : 'text-indigo-900'}`}>{formatearFechaHora(fechaRecoleccion)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={exportarPDF} disabled={isExporting} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-primary/20 text-[13px] active:scale-95 disabled:opacity-70">
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? "Generando PDF..." : "Descargar Acta PDF"}
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all shadow-sm text-[13px] active:scale-95">
            Cerrar Certificado
          </button>
        </div>

        {/* TEMPLATE PDF OCULTO */}
        <DescartePDFTemplate ref={pdfRef} muestra={muestra} qrUrl={qrPayload} />
      </div>
    </div>
  );
}