"use client";

import { X, Edit2, Trash2 } from "lucide-react";
import { UsuarioAPI } from "@/types";

interface GestionarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioAPI | null;
  onDeleteClick: () => void;
  onEditClick: () => void;
}

export default function GestionarUsuarioModal({
  isOpen,
  onClose,
  usuario,
  onDeleteClick,
  onEditClick,
}: GestionarUsuarioModalProps) {
  if (!isOpen || !usuario) return null;

  // Extraemos la inicial de forma segura para mantener el JSX limpio
  const inicialUsuario = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform duration-150">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 flex items-center justify-center text-brand-primary font-black text-[16px] shadow-inner border border-white shrink-0">
              {inicialUsuario}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-[15px] truncate">
                {usuario.nombre}
              </h3>
              <p className="text-[12px] font-medium text-slate-500 truncate">
                {usuario.rol.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar opciones"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-3">
          
          <button
            onClick={onEditClick}
            className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-brand-primary hover:bg-brand-primary/5 hover:shadow-sm transition-all group text-left"
          >
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl group-hover:scale-110 transition-transform shrink-0">
              <Edit2 size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[14px]">
                Editar información
              </p>
              <p className="text-[12px] font-medium text-slate-500">
                Modificar rol, área o datos de acceso
              </p>
            </div>
          </button>

          <button
            onClick={onDeleteClick}
            className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-red-500 hover:bg-red-50 hover:shadow-sm transition-all group text-left"
          >
            <div className="p-3 bg-red-100 text-red-500 rounded-xl group-hover:scale-110 transition-transform shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[14px]">
                Eliminar usuario
              </p>
              <p className="text-[12px] font-medium text-slate-500">
                Revocar acceso permanentemente del sistema
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}