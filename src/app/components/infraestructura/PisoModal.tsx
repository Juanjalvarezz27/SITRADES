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

// Interfaz interna para manejar el estado dinámico de los inputs
interface DirInput {
  internalId: string; // ID temporal para React (Key)
  id?: number;        // ID real de la base de datos (si existe)
  nombre: string;
}

export default function PisoModal({ isOpen, onClose, pisoToEdit, onSaved }: PisoModalProps) {
  const [nombre, setNombre] = useState("");
  const [direcciones, setDirecciones] = useState<DirInput[]>([]);
  const [direccionesEliminadas, setDireccionesEliminadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (pisoToEdit) {
        setNombre(pisoToEdit.nombre);
        // Cargamos las direcciones existentes en el estado dinámico
        if (pisoToEdit.direcciones) {
          setDirecciones(pisoToEdit.direcciones.map(d => ({
            internalId: Math.random().toString(),
            id: d.id,
            nombre: d.nombre
          })));
        } else {
          setDirecciones([]);
        }
      } else {
        setNombre("");
        setDirecciones([]); // Si es nuevo, arranca vacío
      }
      setDireccionesEliminadas([]);
    }
  }, [isOpen, pisoToEdit]);

  if (!isOpen) return null;

  const isEditing = !!pisoToEdit;

  // Funciones para manejar los campos dinámicos
  const addDireccionField = () => {
    setDirecciones([...direcciones, { internalId: Math.random().toString(), nombre: "" }]);
  };

  const handleDireccionChange = (internalId: string, newValue: string) => {
    setDirecciones(direcciones.map(d => d.internalId === internalId ? { ...d, nombre: newValue } : d));
  };

  const removeDireccionField = (internalId: string, dbId?: number) => {
    // Si la dirección ya existía en la base de datos, guardamos su ID para mandarlo a borrar
    if (dbId) {
      setDireccionesEliminadas([...direccionesEliminadas, dbId]);
    }
    setDirecciones(direcciones.filter(d => d.internalId !== internalId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre del piso es obligatorio");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isEditing ? "Actualizando piso..." : "Guardando piso...");

    try {
      const url = isEditing ? `/api/pisos/${pisoToEdit.id}` : "/api/pisos";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        nombre,
        direcciones,
        direccionesEliminadas // Solo se usa en el PUT
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ocurrió un error");

      toast.update(toastId, {
        render: isEditing ? "¡Piso y direcciones actualizados!" : "¡Piso registrado con éxito!",
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
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden transform scale-100 transition-transform duration-150">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-800">
                {isEditing ? "Modificar Piso" : "Registrar Nuevo Piso"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          <form id="piso-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Input Principal */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-600">Nombre del Piso <span className="text-red-500">*</span></label>
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

            {/* Sub-formulario Dinámico: Direcciones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-[14px] font-black text-slate-700 flex items-center gap-2">
                  <Building2 size={16} className="text-brand-secondary" />
                  Direcciones Internas <span className="text-slate-400 text-[12px] font-medium">(Opcional)</span>
                </label>
              </div>

              {/* Lista de Inputs */}
              <div className="space-y-3">
                {direcciones.map((dir, index) => (
                  <div key={dir.internalId} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={dir.nombre}
                        onChange={(e) => handleDireccionChange(dir.internalId, e.target.value)}
                        placeholder={`Nombre de la Dirección ${index + 1}...`}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDireccionField(dir.internalId, dir.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                      title="Quitar Dirección"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* Botón para agregar más inputs */}
                <button
                  type="button"
                  onClick={addDireccionField}
                  className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 text-slate-500 hover:text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={16} strokeWidth={3} />
                  Agregar Dirección
                </button>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="piso-form" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md shadow-brand-secondary/20">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEditing ? "Guardar Cambios" : "Registrar Todo"}
          </button>
        </div>

      </div>
    </div>
  );
}