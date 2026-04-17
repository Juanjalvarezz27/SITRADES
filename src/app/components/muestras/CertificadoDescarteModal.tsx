"use client";

import { useRef, useState } from "react";
import { 
  X, FileSignature, Thermometer, Calendar, User, ShieldCheck, Download, Loader2, ExternalLink 
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react"; // <-- Importamos el generador QR

import DescartePDFTemplate from "./DescartePDFTemplate";

interface CertificadoDescarteModalProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: any;
}

const formatearFechaHora = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
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
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'letter',
          orientation: 'portrait'
        }
      } as const;

      await html2pdf().set(opt).from(element).save();
      setIsExporting(false);
    } catch (err: any) {
      setIsExporting(false);
      console.error("Error al generar PDF:", err);
      toast.error("Error técnico al generar el documento.");
    }
  };

  if (!isOpen || !muestra) return null;

  const reporte = muestra.reporte_descarte;
  const metodoNombre = reporte?.metodo_disposicion?.nombre || "Método no especificado";
  const observaciones = reporte?.observaciones || "Sin observaciones adicionales.";
  const fechaDescarte = reporte?.fecha_descarte;
  const responsable = reporte?.ejecutor?.nombre || "Usuario no registrado";

  // Generamos la URL dinámica apuntando a la vista pública de consulta
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrPayload = baseUrl ? `${baseUrl}/consulta/${muestra.id}` : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/70 transition-opacity"
        onClick={onClose}
      />

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
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">

          {/* Identificación con QR */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-400" />
                Identificación del Residuo
              </h3>
              
              {/* GENERADOR DE CÓDIGO QR EN EL MODAL */}
              {qrPayload && (
                <div className="flex flex-col items-center gap-1.5 -mt-3">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100" title="Escanea para consultar">
                    <QRCodeCanvas value={qrPayload} size={50} level="M" />
                  </div>
                  <a 
                    href={qrPayload} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-2 py-1 rounded transition-colors"
                  >
                    <ExternalLink size={10} /> Visitar
                  </a>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mt-2">
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
              <Thermometer size={14} className="text-slate-400" />
              Protocolo Aplicado
            </h3>
            <div className="space-y-4">
              <div className="bg-white border-2 border-brand-primary/20 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0 mt-0.5">
                  <Thermometer size={18} />
                </div>
                <div>
                  <span className="block text-slate-800 font-black text-[14px]">{metodoNombre}</span>
                  <span className="block text-slate-500 font-medium text-[12px] mt-0.5">Método de disposición final ejecutado.</span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="block text-slate-500 font-bold text-[11px] uppercase tracking-wide mb-2">Observaciones / N° Acta</span>
                <p className="text-[13px] text-slate-700 font-medium italic leading-relaxed">
                  "{observaciones}"
                </p>
              </div>
            </div>
          </div>

          {/* Firmas */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              Auditoría y Cierre
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 bg-white border-2 border-slate-100 p-4 rounded-2xl">
                <div className="p-2 bg-slate-50 text-slate-500 rounded-xl shrink-0">
                  <User size={18} />
                </div>
                <div className="overflow-hidden">
                  <span className="block text-slate-400 font-bold text-[10px] uppercase">Ejecutado por</span>
                  <span className="block text-slate-700 font-black text-[13px] truncate" title={responsable}>
                    {responsable}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3 bg-white border-2 border-slate-100 p-4 rounded-2xl">
                <div className="p-2 bg-slate-50 text-slate-500 rounded-xl shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-[10px] uppercase">Fecha de Destrucción</span>
                  <span className="block text-slate-700 font-black text-[13px]">{formatearFechaHora(fechaDescarte)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={exportarPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-primary/20 text-[13px] active:scale-95 disabled:opacity-70"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? "Generando PDF..." : "Descargar Acta PDF"}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all shadow-sm text-[13px] active:scale-95"
          >
            Cerrar Certificado
          </button>
        </div>

        {/* TEMPLATE OCULTO PARA PDF PASANDO EL QR PAYLOAD */}
        <DescartePDFTemplate ref={pdfRef} muestra={muestra} qrUrl={qrPayload} />

      </div>
    </div>
  );
}