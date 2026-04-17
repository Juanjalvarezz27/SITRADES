"use client";

import { useState, useEffect } from "react";
import { X, Save, Layers, Loader2, Plus, Building2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { PisoAPI } from "@/types";

interface PisoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pisoToEdit: PisoAPI | null;
  onSaved: () => void;
}

interface DirInput {
  internalId: string;
  id?: number;
  nombre: string;
}

export default function PisoModal({ isOpen, onClose, pisoToEdit, onSaved }: PisoModalProps) {
  const [nombre, setNombre] = useState("");
  const [direcciones, setDirecciones] = useState<DirInput[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (pisoToEdit) {
        setNombre(pisoToEdit.nombre);
        setDirecciones(pisoToEdit.direcciones?.map(d => ({
          internalId: Math.random().toString(),
          id: d.id,
          nombre: d.nombre
        })) || []);
      } else {
        setNombre("");
        setDirecciones([]);
      }
    }
  }, [isOpen, pisoToEdit]);

  if (!isOpen) return null;
  const isEditing = !!pisoToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Guardando cambios...");

    try {
      const url = isEditing ? `/api/pisos/${pisoToEdit.id}` : "/api/pisos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, direcciones }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      toast.update(toastId, { render: "¡Piso actualizado!", type: "success", isLoading: false, autoClose: 3000 });
      onSaved();
      onClose();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary"><Layers size={20} /></div>
            <h2 className="font-black text-lg text-slate-800">{isEditing ? "Modificar Piso" : "Registrar Piso"}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-600">Nombre del Piso</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
          </div>

          <div className="space-y-4">
            <label className="text-[14px] font-black text-slate-700 flex items-center gap-2">
              <Building2 size={16} className="text-brand-secondary" /> Direcciones Internas
            </label>
            <div className="space-y-3">
              {direcciones.map((dir, index) => (
                <input key={dir.internalId} type="text" value={dir.nombre} readOnly className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-400 cursor-not-allowed" />
              ))}
              <p className="text-[11px] text-slate-400 italic">Las direcciones se gestionan desde su propio módulo.</p>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:text-slate-800">Cancelar</button>
          <button type="submit" onClick={handleSubmit} className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-8 py-3 rounded-2xl font-bold shadow-md shadow-brand-secondary/20 flex items-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEditing ? "Guardar Cambios" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}