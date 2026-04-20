"use client";

import { useState } from "react";
import { AlertOctagon, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface AnularMuestraModalProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: any;
  onSuccess: () => void;
}

export default function AnularMuestraModal({ isOpen, onClose, muestra, onSuccess }: AnularMuestraModalProps) {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !muestra) return null;

  const handleAnular = async () => {
    if (motivo.trim().length < 10) {
      return toast.warning("La justificación debe ser detallada (mín. 10 caracteres).");
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Procesando anulación...");

    try {
      const res = await fetch(`/api/muestras/${muestra.id}/anular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo_anulacion: motivo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.update(toastId, { render: "Registro anulado con éxito", type: "success", isLoading: false, autoClose: 3000 });
      setMotivo("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 4000 });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertOctagon size={32} />
          </div>
          <h2 className="text-xl font-black text-red-700">Anular Registro</h2>
          <p className="text-[13px] text-red-600/80 font-medium mt-2 leading-snug">
            Esta acción sacará la muestra <strong className="text-red-700">{muestra.codigo_interno}</strong> del inventario activo y quedará registrada en el historial como anulada por error.
          </p>
        </div>

        <div className="p-6">
          <label className="block text-[13px] font-bold text-slate-700 mb-2">
            Justificación Técnica del Error <span className="text-red-500">*</span>
          </label>
          <textarea
            autoFocus
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Error de tipeo en el lote durante el ingreso, el código correcto debía ser..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all resize-none"
          />

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              Cancelar
            </button>
            <button 
              onClick={handleAnular} 
              disabled={isSubmitting || motivo.trim().length < 10} 
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-500/20"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Anulación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}