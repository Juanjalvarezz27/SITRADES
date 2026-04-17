"use client";

import { forwardRef } from "react";
import PlantillaPDF from "../ui/PlantillaPDF"; // Asumo que usas este wrapper
import { QRCodeCanvas } from "qrcode.react";

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

interface DescartePDFTemplateProps {
  muestra: any;
  qrUrl?: string; // <-- Recibimos la URL del QR
}

const DescartePDFTemplate = forwardRef<HTMLDivElement, DescartePDFTemplateProps>(
  ({ muestra, qrUrl }, ref) => {
    if (!muestra) return null;

    const reporte = muestra.reporte_descarte;
    const metodoNombre = reporte?.metodo_disposicion?.nombre || "Método no especificado";
    const observaciones = reporte?.observaciones || "Sin observaciones adicionales.";
    const fechaDescarte = reporte?.fecha_descarte;
    const responsable = reporte?.ejecutor?.nombre || "Usuario no registrado";

    return (
      <PlantillaPDF
        ref={ref}
        titulo="ACTA DE DESCARTE Y DESTRUCCIÓN"
        subtitulo="Certificación Oficial de Disposición de Residuos"
        fechaEmision={formatearFechaHora(fechaDescarte)}
      >
        <div className="space-y-6">
          
          {/* BLOQUE DE IDENTIFICACIÓN CON CÓDIGO QR */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid">
            <div className="flex justify-between items-start mb-4 border-b border-indigo-100 pb-2">
              <h3 className="font-bold text-indigo-900">
                1. Identificación del Residuo Biológico/Químico
              </h3>
              {/* RENDERIZAMOS EL QR EN EL PDF */}
              {qrUrl && (
                <div className="-mt-1">
                  <QRCodeCanvas value={qrUrl} size={50} level="M" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-y-4 text-[12px]">
              <p><strong className="text-slate-500 uppercase text-[9px] block">Código Interno</strong> {muestra.codigo_interno}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Lote</strong> {muestra.lote}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Principio Activo</strong> {muestra.principio_activo}</p>
              <p><strong className="text-slate-500 uppercase text-[9px] block">Reg. Sanitario</strong> {muestra.registro_sanitario || "N/A"}</p>
            </div>
          </div>

          {/* PROTOCOLO APLICADO */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid">
            <h3 className="font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">
              2. Certificación de Destrucción
            </h3>
            <div className="space-y-4 text-[12px]">
              <p>
                <strong className="text-slate-500 uppercase text-[9px] block">Método Aplicado</strong> 
                {metodoNombre}
              </p>
              <p>
                <strong className="text-slate-500 uppercase text-[9px] block">Observaciones y N° de Acta</strong> 
                {observaciones}
              </p>
            </div>
          </div>

          {/* FIRMAS DE RESPONSABILIDAD */}
          <div className="border border-indigo-100 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid mt-8">
            <h3 className="font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">
              3. Firmas de Responsabilidad Técnica
            </h3>
            <div className="grid grid-cols-2 gap-8 text-[12px] text-center mt-12 pt-8">
              <div>
                <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                  <strong className="block text-slate-800">{responsable}</strong>
                  <span className="text-slate-500">Analista Ejecutor</span>
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                  <strong className="block text-slate-800">Sello del Departamento</strong>
                  <span className="text-slate-500">{muestra.area?.nombre}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </PlantillaPDF>
    );
  }
);

DescartePDFTemplate.displayName = "DescartePDFTemplate";
export default DescartePDFTemplate;