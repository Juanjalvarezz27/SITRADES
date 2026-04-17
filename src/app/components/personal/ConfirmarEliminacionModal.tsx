"use client";

import { useState, useEffect } from "react";
import { UserX, UserCheck, Loader2, Keyboard } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombreUsuario: string;
  isLoading: boolean;
  isActivating?: boolean; 
}

export default function ConfirmarEliminacionModal({ isOpen, onClose, onConfirm, nombreUsuario, isLoading, isActivating = false }: Props) {
  const [confirmText, setConfirmText] = useState("");
  
  // Variables dinámicas según la acción
  const wordToMatch = isActivating ? "ACTIVAR" : "INHABILITAR";
  const Icon = isActivating ? UserCheck : UserX;
  
  // Clases dinámicas de colores
  const colorTheme = isActivating 
    ? { light: "bg-emerald-100 text-emerald-500", border: "focus:border-emerald-500 focus:ring-emerald-500/10", text: "text-emerald-600", btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" }
    : { light: "bg-rose-100 text-rose-500", border: "focus:border-rose-500 focus:ring-rose-500/10", text: "text-rose-600", btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" };

  useEffect(() => {
    if (!isOpen) setConfirmText("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
        
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${colorTheme.light}`}>
          <Icon size={32} />
        </div>
        
        <h3 className="font-black text-slate-800 text-[18px] mb-2">
          Confirmar {isActivating ? "Reactivación" : "Inhabilitación"}
        </h3>
        
        <p className="text-[14px] text-slate-500 mb-6 font-medium px-2">
          Estás a punto de {isActivating ? "restaurar" : "bloquear"} el acceso de <span className="font-bold text-slate-800">{nombreUsuario}</span>.
          <br /><br />
          Para continuar, escribe <span className={`font-bold ${colorTheme.text}`}>{wordToMatch}</span>.
        </p>

        <div className="mb-6 relative">
          <Keyboard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Escribe aquí..."
            autoFocus
            className={`w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-center tracking-widest focus:outline-none focus:ring-4 transition-all placeholder:tracking-normal placeholder:font-medium ${colorTheme.border}`}
          />
        </div>
        
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
                ? `${colorTheme.btn} text-white active:scale-95` 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : isActivating ? "Activar" : "Inhabilitar"}
          </button>
        </div>

      </div>
    </div>
  );
}