"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean; 
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no está abierto o no se ha montado en el cliente, no renderizamos nada
  if (!isOpen || !mounted) return null;

  // Guardamos todo el diseño del modal en una constante
  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Fondo oscuro optimizado */}
      <div 
        className="absolute inset-0 bg-slate-900/60 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Botón de cerrar superior */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Icono de Alerta dinámico */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>

          <h3 className="text-[18px] font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-8">
            {message}
          </p>

          {/* Botones de Acción */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[14px] rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 font-bold text-[14px] rounded-xl transition-all shadow-md hover:shadow-lg ${
                isDanger 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                  : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}