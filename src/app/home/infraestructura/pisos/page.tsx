"use client";

import { Layers } from "lucide-react";

export default function GestionPisosPage() {
  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6 sm:mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <Layers className="text-brand-primary" size={28} />
            Gestión de Pisos
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1">
            Administra los pisos de la institución para organizar las direcciones.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
        <p className="text-slate-500 font-medium">Módulo en construcción...</p>
      </div>
    </div>
  );
}