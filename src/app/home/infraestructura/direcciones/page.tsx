"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Building2, Plus, Edit2, Trash2, Loader2, 
  MapPin, ChevronDown, Layers 
} from "lucide-react";
import { toast } from "react-toastify";
import { DireccionAPI, AreaData } from "@/types";

import DireccionModal from "../../../components/infraestructura/DireccionModal";
import ConfirmarEliminacionModal from "../../../components/personal/ConfirmarEliminacionModal";

// SUB-COMPONENTE: Tarjeta de Dirección Rediseñada
function DireccionCard({ 
  direccion, 
  onEdit, 
  onDelete 
}: { 
  direccion: DireccionAPI; 
  onEdit: (d: DireccionAPI) => void; 
  onDelete: (d: DireccionAPI) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tieneAreas = direccion.areas && direccion.areas.length > 0;

  return (
    // h-full asegura que todas las tarjetas en la fila midan lo mismo
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30 transition-all duration-300 flex flex-col h-full group">
      
      {/* 1. CABECERA: Ícono, Etiqueta del Piso y Botones de Acción */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 flex items-center justify-center text-brand-primary shadow-inner border border-white shrink-0">
            <Building2 size={20} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[11px] font-bold tracking-wide uppercase">
            <Layers size={13} className="text-brand-secondary" />
            {direccion.piso?.nombre || "Sin Piso"}
          </span>
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(direccion)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all" title="Editar dirección">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(direccion)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar dirección">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. CUERPO: Nombre de la Dirección (Ancho completo) flex-1 empuja el pie hacia abajo */}
      <div className="flex-1 mb-6">
        <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-800 leading-snug group-hover:text-brand-primary transition-colors break-words">
          {direccion.nombre}
        </h3>
      </div>

      {/* 3. PIE: Botón del Acordeón y Lista de Áreas */}
      <div className="mt-auto">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!tieneAreas}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all font-bold text-[13px] ${
            !tieneAreas 
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-brand-primary/5 hover:border-brand-primary/30 hover:text-brand-primary"
          }`}
        >
          <span>{direccion._count?.areas || 0} {(direccion._count?.areas === 1) ? 'Área Interna' : 'Áreas Internas'}</span>
          <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
              {direccion.areas?.map((area: AreaData) => (
                <div key={area.id} className="flex items-start gap-3 text-[13px] font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <MapPin size={16} className="text-brand-primary shrink-0 mt-[2px]" />
                  <span className="leading-snug flex-1 break-words">{area.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function GestionDireccionesPage() {
  const [direcciones, setDirecciones] = useState<DireccionAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direccionToEdit, setDireccionToEdit] = useState<DireccionAPI | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [direccionToDelete, setDireccionToDelete] = useState<DireccionAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDirecciones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/direcciones");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setDirecciones(data);
    } catch (error) {
      toast.error("No se pudieron cargar las direcciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirecciones();
  }, [fetchDirecciones]);

  const confirmDelete = async () => {
    if (!direccionToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading("Eliminando dirección...");
    try {
      const res = await fetch(`/api/direcciones/${direccionToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      toast.update(toastId, { render: "¡Dirección eliminada con éxito!", type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false);
      fetchDirecciones();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const direccionesPorPiso = direcciones.reduce((acc, direccion) => {
    const pisoNombre = direccion.piso?.nombre || "Sin Piso Asignado";
    if (!acc[pisoNombre]) {
      acc[pisoNombre] = [];
    }
    acc[pisoNombre].push(direccion);
    return acc;
  }, {} as Record<string, DireccionAPI[]>);

  const pisosOrdenados = Object.keys(direccionesPorPiso).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-10">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Building2 size={24} />
            </div>
            Gestión de Direcciones
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">
            Administra las direcciones principales, agrupadas automáticamente según el piso al que pertenecen.
          </p>
        </div>
        
        <button 
          onClick={() => { setDireccionToEdit(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-brand-secondary/25 shrink-0"
        >
          <Plus size={18} strokeWidth={3} />
          Registrar Dirección
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin text-brand-secondary" size={36} />
          <span className="font-semibold text-brand-secondary">Cargando direcciones...</span>
        </div>
      ) : direcciones.length === 0 ? (
        <div className="py-20 text-center text-slate-500 px-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700">No hay direcciones registradas</p>
        </div>
      ) : (
        <div className="space-y-12">
          {pisosOrdenados.map((pisoNombre) => (
            <div key={pisoNombre} className="space-y-5">
              
              <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                <Layers size={22} className="text-brand-secondary" />
                <h2 className="text-[19px] font-black text-slate-800 tracking-tight">{pisoNombre}</h2>
                <span className="ml-2 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[12px] font-bold">
                  {direccionesPorPiso[pisoNombre].length} {direccionesPorPiso[pisoNombre].length === 1 ? 'Dirección' : 'Direcciones'}
                </span>
              </div>

              {/* 🔥 CORRECCIÓN: Quitamos el "items-start" para que el flexbox obligue a que todas las tarjetas tengan el mismo alto (h-full) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {direccionesPorPiso[pisoNombre].map((direccion) => (
                  <DireccionCard 
                    key={direccion.id} 
                    direccion={direccion} 
                    onEdit={(d) => { setDireccionToEdit(d); setIsModalOpen(true); }}
                    onDelete={(d) => { setDireccionToDelete(d); setIsDeleteModalOpen(true); }}
                  />
                ))}
              </div>
              
            </div>
          ))}
        </div>
      )}

      <DireccionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        direccionToEdit={direccionToEdit}
        onSaved={fetchDirecciones}
      />

      <ConfirmarEliminacionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        nombreUsuario={`la dirección "${direccionToDelete?.nombre}"`}
        isLoading={isDeleting}
      />
    </div>
  );
}