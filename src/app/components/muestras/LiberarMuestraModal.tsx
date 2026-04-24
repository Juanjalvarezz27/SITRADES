"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  FlaskConical, 
  FileText, 
  Loader2, 
  Info,
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";

interface LiberarMuestraModalProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: any;
  onSuccess: () => void;
}

export default function LiberarMuestraModal({ isOpen, onClose, muestra, onSuccess }: LiberarMuestraModalProps) {
  const [informe, setInforme] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar campos al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setInforme("");
      setObservaciones("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !muestra) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!informe.trim()) {
      return toast.warning("El número de informe o certificado es obligatorio para la trazabilidad.");
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Procesando liberación de la muestra...");

    try {
      const res = await fetch(`/api/muestras/${muestra.id}/liberar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ informe, observaciones })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al liberar la muestra.");

      toast.update(toastId, { render: "¡Muestra liberada y enviada a descarte!", type: "success", isLoading: false, autoClose: 3000 });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 4000 });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={!isSubmitting ? onClose : undefined} />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* CABECERA */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="font-title font-black text-xl text-slate-800 leading-tight">Liberación Operativa</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Aprobar análisis y enviar a descarte</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="relative z-10 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* CUERPO */}
          <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
            
            {/* Info de la Muestra */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl shrink-0 border border-slate-100">
                <FlaskConical size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Identificación</p>
                <p className="font-black text-slate-800 text-[15px] leading-tight">{muestra.principio_activo}</p>
                <p className="text-sm font-bold text-indigo-600 mt-1">{muestra.codigo_interno} • Lote: {muestra.lote}</p>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
              <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-800 font-medium leading-relaxed">
                Al liberar esta muestra, certificas que el análisis ha concluido. El sistema la retirará del inventario activo y la pondrá en la <strong>Cola de Descarte</strong> para su inactivación física inmediata.
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5 items-center gap-2">
                  <FileText size={14} className="text-slate-400" /> N° de Informe o Certificado Analítico <span className="text-red-500">*</span>
                </label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={informe}
                  onChange={(e) => setInforme(e.target.value)}
                  placeholder="Ej: INF-2026-0458"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-medium placeholder:text-slate-300" 
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  Observaciones Adicionales (Opcional)
                </label>
                <textarea 
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                  placeholder="Comentarios sobre el estado del remanente..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-300" 
                />
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all shadow-sm text-[13px] active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !informe.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 text-[13px] active:scale-95"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isSubmitting ? "Procesando..." : "Aprobar y Enviar a Descarte"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}