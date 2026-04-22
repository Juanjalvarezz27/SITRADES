"use client";

import { forwardRef } from "react";
import PlantillaPDF from "../ui/PlantillaPDF";
import { QRCodeCanvas } from "qrcode.react";

const formatearFechaHora = (fecha: string | null | undefined) => {
  if (!fecha) return "Pendiente de registro";
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
  qrUrl?: string;
}

const DescartePDFTemplate = forwardRef<HTMLDivElement, DescartePDFTemplateProps>(
  ({ muestra, qrUrl }, ref) => {
    if (!muestra) return null;

    const reporte = muestra.reporte_descarte;
    const metodoNombre = reporte?.metodo_disposicion?.nombre || "Método no especificado";
    const observaciones = reporte?.observaciones || "Sin observaciones adicionales.";
    const fechaDescarte = reporte?.fecha_descarte;
    const responsableAnalista = reporte?.ejecutor?.nombre || "Usuario no registrado";

    // Extraer datos de Seguridad Industrial desde el historial
    const eventoRecoleccion = muestra.historiales?.find(
      (h: any) => h.motivo && h.motivo.includes("Seguridad Industrial")
    );
    const responsableSeguridad = eventoRecoleccion?.usuario?.nombre || "PENDIENTE DE TRASLADO";
    const fechaRecoleccion = eventoRecoleccion?.fecha_cambio;

    return (
      <PlantillaPDF
        ref={ref}
        titulo="ACTA DE DESCARTE Y DESTRUCCIÓN"
        subtitulo="Certificación Oficial de Disposición de Residuos (Decreto 2.218)"
        fechaEmision={formatearFechaHora(fechaRecoleccion || fechaDescarte)}
      >
        <div className="space-y-6">
          
          {/* BANNER DE ESTADO FINAL - SELLO DE AGUA VISUAL EN EL PDF */}
          <div className="border-2 border-emerald-500 p-4 rounded-2xl bg-emerald-50/30 flex justify-between items-center break-inside-avoid">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Estado Final del Residuo</p>
              <h2 className="text-xl font-black text-emerald-800">DESCARTADO / DESTRUIDO</h2>
            </div>
            <div className="text-right border-l-2 border-emerald-200 pl-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Certificación N°</p>
              <p className="font-mono font-bold text-emerald-900">{muestra.codigo_interno}</p>
            </div>
          </div>

          {/* 1. IDENTIFICACIÓN CON QR */}
          <div className="border border-slate-200 p-5 rounded-2xl bg-white break-inside-avoid">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-[13px] uppercase">
                1. Información Técnica del Residuo
              </h3>
              {qrUrl && (
                <div className="bg-white p-1 border border-slate-100 rounded">
                  <QRCodeCanvas value={qrUrl} size={60} level="M" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[12px]">
              <p><strong className="text-slate-400 uppercase text-[9px] block">Principio Activo</strong> {muestra.principio_activo}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Lote</strong> {muestra.lote}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Código Interno</strong> {muestra.codigo_interno}</p>
              <p><strong className="text-slate-400 uppercase text-[9px] block">Laboratorio de Origen</strong> {muestra.area?.nombre}</p>
            </div>
          </div>

          {/* 2. PROTOCOLO DE INACTIVACIÓN */}
          <div className="border border-slate-200 p-5 rounded-2xl bg-white break-inside-avoid">
            <h3 className="font-bold text-slate-800 text-[13px] uppercase mb-4 border-b border-slate-100 pb-2">
              2. Protocolo de Inactivación Aplicado
            </h3>
            <div className="space-y-4 text-[12px]">
              <div>
                <strong className="text-slate-400 uppercase text-[9px] block">Método de Disposición Final</strong> 
                <span className="font-bold text-indigo-900">{metodoNombre}</span>
              </div>
              <div>
                <strong className="text-slate-400 uppercase text-[9px] block">Observaciones Técnicas</strong> 
                <p className="italic text-slate-700">{observaciones}</p>
              </div>
            </div>
          </div>

          {/* 3. CADENA DE CUSTODIA Y FIRMAS */}
          <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50/50 break-inside-avoid">
            <h3 className="font-bold text-slate-800 text-[13px] uppercase mb-8 border-b border-slate-100 pb-2 text-center">
              3. Firmas de Responsabilidad Legal
            </h3>
            
            <div className="grid grid-cols-2 gap-12 text-[11px] text-center mt-12">
              {/* Analista */}
              <div className="flex flex-col items-center">
                <div className="border-t border-slate-400 w-full pt-2">
                  <strong className="block text-slate-900 uppercase font-black">{responsableAnalista}</strong>
                  <span className="text-slate-500 font-bold text-[9px] uppercase">Analista de Laboratorio</span>
                  <p className="text-slate-400 mt-1">Firma y Sello (Segregación)</p>
                  <p className="text-[10px] font-bold mt-1">{formatearFechaHora(fechaDescarte)}</p>
                </div>
              </div>

              {/* Seguridad Industrial */}
              <div className="flex flex-col items-center">
                <div className="border-t border-slate-400 w-full pt-2">
                  <strong className="block text-slate-900 uppercase font-black">{responsableSeguridad}</strong>
                  <span className="text-slate-500 font-bold text-[9px] uppercase">Oficial de Seguridad Industrial</span>
                  <p className="text-slate-400 mt-1">Firma y Sello (Traslado y Cierre)</p>
                  <p className="text-[10px] font-bold mt-1">{formatearFechaHora(fechaRecoleccion)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="inline-block p-4 border-2 border-slate-100 rounded-xl bg-white">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Validación del Sistema SITRADES</p>
                <p className="text-[10px] text-slate-600 max-w-[400px] leading-relaxed mx-auto italic">
                  Este documento ha sido generado electrónicamente y representa la certificación final de la cadena de custodia de la muestra conforme a las Normas del INHRR.
                </p>
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