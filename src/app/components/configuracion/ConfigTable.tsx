"use client";

import { useState } from "react";
import { Edit2, Save, X, Trash2, Tag, CheckCircle, Ban } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../ui/ConfirmModal";

interface ConfigTableProps {
  data: any[];
  endpoint: string;
  onRefresh: () => void;
  isSoftDelete?: boolean; // NUEVA PROP
}

export default function ConfigTable({ data, endpoint, onRefresh, isSoftDelete }: ConfigTableProps) {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editNombre, setEditNombre] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToToggle, setItemToToggle] = useState<any>(null);

  const handleOpenAction = (item: any) => {
    setItemToToggle(item);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!itemToToggle) return;
    
    try {
      if (isSoftDelete) {
        // Lógica de PATCH para Inhabilitar/Activar
        const nuevoEstado = !(itemToToggle.activo !== false);
        const res = await fetch(`${endpoint}/${itemToToggle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: nuevoEstado })
        });
        if (!res.ok) throw new Error();
        toast.success(nuevoEstado ? "Activado con éxito" : "Inhabilitado con éxito");
      } else {
        // Lógica de DELETE físico para catálogos simples
        const res = await fetch(`${endpoint}/${itemToToggle.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success("Registro eliminado");
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(isSoftDelete ? "Error al actualizar estado" : "No se puede eliminar porque está en uso");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {data.map((item) => {
          const estaActivo = item.activo !== false;
          return (
            <div
              key={item.id}
              className={`bg-white border-2 ${editingId === item.id ? 'border-brand-primary' : 'border-slate-100'} rounded-[1.8rem] p-5 transition-all ${!estaActivo && isSoftDelete ? 'bg-slate-50/50 grayscale-[0.5]' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex w-10 h-10 rounded-xl items-center justify-center shrink-0 ${!estaActivo && isSoftDelete ? 'bg-slate-200 text-slate-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    <Tag size={18} />
                  </div>

                  <div className="flex-1 text-left">
                    {editingId === item.id ? (
                      <input
                        className="w-full px-0 py-1 bg-transparent border-b-2 border-brand-primary outline-none font-medium text-slate-800 text-base"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
                          {isSoftDelete ? (estaActivo ? "ACTIVO" : "INHABILITADO") : "PARÁMETRO"}
                        </p>
                        <p className={`font-medium text-[16px] ${!estaActivo && isSoftDelete ? 'text-slate-400' : 'text-slate-700'}`}>
                          {item.nombre || item.email || "Sin nombre"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                  {editingId === item.id ? (
                    <div className="flex gap-2 w-full justify-center">
                      <button onClick={() => handleUpdateNombre(item.id)} className="p-3.5 bg-brand-primary text-white rounded-xl active:scale-90 transition-all"><Save size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-3.5 bg-slate-700 text-white rounded-xl active:scale-90 transition-all"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full justify-center">
                      <button
                        onClick={() => { setEditingId(item.id); setEditNombre(item.nombre || ""); }}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl font-medium text-xs transition-all"
                      >
                        <Edit2 size={14} />
                        <span>Modificar</span>
                      </button>

                      <button
                        onClick={() => handleOpenAction(item)}
                        className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                          estaActivo 
                            ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        {estaActivo ? <Ban size={14} /> : <CheckCircle size={14} />}
                        <span>{estaActivo ? "Inhabilitar" : "Reactivar"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={isSoftDelete ? (itemToToggle?.activo !== false ? "Inhabilitar registro" : "Reactivar registro") : "¿Eliminar registro?"}
        message={isSoftDelete 
          ? `¿Estás seguro de que deseas cambiar el estado de "${itemToToggle?.nombre || itemToToggle?.email}"?`
          : `Esta acción eliminará "${itemToToggle?.nombre}" de forma permanente del catálogo.`
        }
        confirmText={isSoftDelete ? "Confirmar" : "Sí, eliminar"}
        isDanger={itemToToggle?.activo !== false}
      />
    </>
  );

  async function handleUpdateNombre(id: number | string) {
    if (!editNombre.trim()) return;
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editNombre })
      });
      if (!res.ok) throw new Error();
      toast.success("Actualizado");
      setEditingId(null);
      onRefresh();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  }
}