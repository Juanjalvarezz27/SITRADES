"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Loader2, Keyboard } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombreUsuario: string;
  isLoading: boolean;
}

export default function ConfirmarEliminacionModal({ isOpen, onClose, onConfirm, nombreUsuario, isLoading }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const wordToMatch = "ELIMINAR";

  // Limpiar el input cada vez que se abra/cierre el modal
  useEffect(() => {
    if (!isOpen) setConfirmText("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
        
        {/* Ícono de Advertencia */}
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="font-black text-slate-800 text-[18px] mb-2">Confirmar Eliminación</h3>
        
        <p className="text-[14px] text-slate-500 mb-6 font-medium px-2">
          Estás a punto de eliminar a <span className="font-bold text-slate-800">{nombreUsuario}</span>.
          <br />
          Para continuar, escribe <span className="font-bold text-red-600">{wordToMatch}</span> a continuación.
        </p>

        {/* Campo de validación */}
        <div className="mb-6 relative">
          <Keyboard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Escribe aquí..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-center tracking-widest focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:tracking-normal placeholder:font-medium"
          />
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose} 
            disabled={isLoading} 
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-[14px] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button 
            onClick={onConfirm} 
            disabled={isLoading || confirmText !== wordToMatch} 
            className={`flex-1 py-3 font-bold rounded-2xl text-[14px] transition-all flex items-center justify-center gap-2 shadow-md ${
              confirmText === wordToMatch 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 active:scale-95" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Eliminar"}
          </button>
        </div>

      </div>
    </div>
  );
}