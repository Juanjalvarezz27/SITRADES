"use client";

import { useState, useEffect } from "react";
import { X, Save, Layers, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { PisoAPI } from "@/types";

interface PisoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pisoToEdit: PisoAPI | null;
  onSaved: () => void;
}

export default function PisoModal({ isOpen, onClose, pisoToEdit, onSaved }: PisoModalProps) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  // Si nos pasan un piso para editar, llenamos el formulario. Si no, lo limpiamos.
  useEffect(() => {
    if (isOpen) {
      setNombre(pisoToEdit ? pisoToEdit.nombre : "");
    }
  }, [isOpen, pisoToEdit]);

  if (!isOpen) return null;

  const isEditing = !!pisoToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre del piso es obligatorio");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isEditing ? "Actualizando piso..." : "Registrando piso...");

    try {
      const url = isEditing ? `/api/pisos/${pisoToEdit.id}` : "/api/pisos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error");
      }

      toast.update(toastId, {
        render: isEditing ? "¡Piso actualizado con éxito!" : "¡Piso registrado con éxito!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform duration-150">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-800">
                {isEditing ? "Editar Piso" : "Registrar Nuevo Piso"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="space-y-2 mb-8">
            <label className="text-[13px] font-bold text-slate-600">Nombre del Piso</label>
            <input
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Planta Baja, Piso 1, Sótano..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md shadow-brand-secondary/20">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditing ? "Guardar Cambios" : "Registrar"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}