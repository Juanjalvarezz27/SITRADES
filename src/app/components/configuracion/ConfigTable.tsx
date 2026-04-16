"use client";

import { useState } from "react";
import { Edit2, Save, X, Trash2, Tag } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../ui/ConfirmModal";

interface ConfigTableProps {
  data: any[];
  endpoint: string;
  onRefresh: () => void;
}

export default function ConfigTable({ data, endpoint, onRefresh }: ConfigTableProps) {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  
  // Estados para el Modal de Confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${endpoint}/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Registro eliminado");
      onRefresh();
    } catch (error) {
      toast.error("No se puede eliminar porque está en uso");
    }
  };

  const handleUpdateNombre = async (id: number | string) => {
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
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {data.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white border-2 ${editingId === item.id ? 'border-brand-primary' : 'border-slate-100'} rounded-[1.8rem] p-5 transition-all`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              
              <div className="flex items-center gap-4 flex-1">
                <div className="flex w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary items-center justify-center shrink-0">
                  <Tag size={18} />
                </div>

                <div className="flex-1">
                  {editingId === item.id ? (
                    <input
                      className="w-full px-0 py-1 bg-transparent border-b-2 border-brand-primary outline-none font-medium text-slate-800 text-base"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Parámetro</p>
                      <p className="font-medium text-slate-700 text-[16px]">{item.nombre}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                {editingId === item.id ? (
                  <div className="flex gap-2 w-full justify-center">
                    <button
                      onClick={() => handleUpdateNombre(item.id)}
                      className="flex-1 sm:flex-none p-3.5 bg-brand-primary text-white rounded-xl active:scale-90 transition-all"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 sm:flex-none p-3.5 bg-slate-700 text-white rounded-xl active:scale-90 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full justify-center">
                    <button
                      onClick={() => { setEditingId(item.id); setEditNombre(item.nombre); }}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl font-medium text-xs transition-all active:scale-95"
                    >
                      <Edit2 size={14} />
                      <span>Modificar</span>
                    </button>
                    
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-medium text-xs transition-all active:scale-95"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar registro?"
        message={`Esta acción eliminará "${itemToDelete?.nombre}" de forma permanente del catálogo. No se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </>
  );
}