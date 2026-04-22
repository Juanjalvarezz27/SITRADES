"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, User, Loader2, X } from "lucide-react";

interface ModalCertificacionTrasladoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmacionEmpaque: boolean) => void;
  cantidadBolsas: number;
  nombreUsuario: string;
  isSubmitting: boolean;
}

export default function ModalCertificacionTraslado({
  isOpen,
  onClose,
  onConfirm,
  cantidadBolsas,
  nombreUsuario,
  isSubmitting
}: ModalCertificacionTrasladoProps) {
  const [confirmacionEmpaque, setConfirmacionEmpaque] = useState(false);

  // Reiniciar el checkbox cuando se abre el modal
  useEffect(() => {
    if (isOpen) setConfirmacionEmpaque(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo oscuro simple sin backdrop-blur para evitar lentitud */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => !isSubmitting && onClose()} />
      
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera Institucional */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShieldAlert className="text-indigo-600" size={24} />
              Certificación de Recepción
            </h2>
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              Registro formal de traslado interno - {cantidadBolsas} bolsa(s) a procesar.
            </p>
          </div>
          <button disabled={isSubmitting} onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Alerta de Responsabilidad (Colores del Sistema) */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3">
            <User className="text-indigo-600 shrink-0 mt-0.5" size={18} />
            <p className="text-[12px] text-indigo-900 leading-relaxed">
              Al confirmar, usted (<strong className="font-black">{nombreUsuario}</strong>) asume la custodia legal de estos residuos peligrosos para su traslado inmediato al área de disposición final (Incinerador).
            </p>
          </div>

          {/* LISTA DE VERIFICACIÓN FÍSICA */}
          <div>
            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-3">Verificación en Sitio</h3>
            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  checked={confirmacionEmpaque}
                  onChange={(e) => setConfirmacionEmpaque(e.target.checked)}
                />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Integridad del Empaque Conforme
                </p>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  Certifico visualmente que las bolsas están correctamente selladas, no presentan fugas y cumplen con el etiquetado de "Riesgo Biológico" según la normativa.
                </p>
              </div>
            </label>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-[13px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(confirmacionEmpaque)}
            disabled={!confirmacionEmpaque || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[13px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
            Confirmar Traslado
          </button>
        </div>
      </div>
    </div>
  );
}