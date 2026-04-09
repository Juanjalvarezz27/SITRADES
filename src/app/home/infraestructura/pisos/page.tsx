"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; 
import { 
  Layers, Plus, Edit2, Trash2, Loader2, 
  Building2, MapPin, ChevronDown 
} from "lucide-react";
import { toast } from "react-toastify";
import { PisoAPI, DireccionData } from "@/types";

import PisoModal from "../../../components/infraestructura/PisoModal";
import ConfirmarEliminacionModal from "../../../components/personal/ConfirmarEliminacionModal";

// --- SUB-COMPONENTE: Tarjeta de Piso con Acordeón tipo Árbol Interactivo ---
function PisoCard({ 
  piso, 
  onEdit, 
  onDelete 
}: { 
  piso: PisoAPI; 
  onEdit: (p: PisoAPI) => void; 
  onDelete: (p: PisoAPI) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter(); 

  const tieneDirecciones = piso.direcciones && piso.direcciones.length > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30 transition-all duration-300 flex flex-col h-fit group">
      
      {/* Cabecera de la Tarjeta */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 flex items-center justify-center text-brand-primary shadow-inner border border-white shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="text-[17px] font-black text-slate-800 leading-tight group-hover:text-brand-primary transition-colors">
              {piso.nombre}
            </h3>
            <p className="text-[12px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
              {piso._count?.direcciones || 0} Direcciones
            </p>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(piso)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all" title="Editar Piso">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(piso)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar Piso">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Botón Desplegable */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={!tieneDirecciones}
        className={`mt-5 w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all font-bold text-[13px] ${
          !tieneDirecciones 
          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-brand-primary/5 hover:border-brand-primary/30 hover:text-brand-primary"
        }`}
      >
        <span>Ver Estructura Interna</span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {/* Contenido Desplegable (Acordeón tipo Árbol Interactivo) */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 pt-2">
            {piso.direcciones?.map((dir: DireccionData) => (
              <div key={dir.id} className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4">
                
                {/* Título de la Dirección convertido en Botón Navegable */}
                <button 
                  onClick={() => router.push("/home/infraestructura/direcciones")}
                  className="w-full flex items-start gap-3 text-slate-800 font-bold text-[14px] leading-snug hover:text-brand-primary transition-colors text-left group/dir"
                  title="Gestionar Direcciones"
                >
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5 group-hover/dir:bg-brand-primary/10 transition-colors">
                    <Building2 size={16} className="text-brand-secondary group-hover/dir:text-brand-primary transition-colors" />
                  </div>
                  <span className="mt-1 flex-1">{dir.nombre}</span>
                </button>
                
                {/* Árbol de Áreas (Jerarquía visual) */}
                <div className="mt-3 ml-[15px] pl-5 border-l-2 border-slate-200 flex flex-col gap-3">
                  {dir.areas?.length ? (
                    dir.areas.map(area => (
                      /* Área convertida en Botón Navegable */
                      <button 
                        key={area.id}
                        onClick={() => router.push("/home/infraestructura/areas")}
                        className="w-full flex items-start gap-2.5 text-[13px] font-semibold text-slate-600 relative hover:text-brand-primary transition-colors text-left"
                        title="Gestionar Áreas"
                      >
                        <div className="absolute -left-5 top-[9px] w-4 border-t-2 border-slate-200"></div>
                        <MapPin size={14} className="text-brand-primary shrink-0 mt-[2px] bg-slate-50 rounded-full" />
                        <span className="leading-snug flex-1">{area.nombre}</span>
                      </button>
                    ))
                  ) : (
                    <div className="flex items-center text-[12px] font-medium text-slate-400 italic relative">
                      <div className="absolute -left-5 top-1/2 w-4 border-t-2 border-slate-200"></div>
                      <span className="ml-2">Sin áreas registradas</span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function GestionPisosPage() {
  const [pisos, setPisos] = useState<PisoAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pisoToEdit, setPisoToEdit] = useState<PisoAPI | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pisoToDelete, setPisoToDelete] = useState<PisoAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPisos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pisos");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setPisos(data);
    } catch (error) {
      toast.error("No se pudieron cargar los pisos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPisos();
  }, [fetchPisos]);

  const confirmDelete = async () => {
    if (!pisoToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading("Eliminando piso...");
    try {
      const res = await fetch(`/api/pisos/${pisoToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      toast.update(toastId, { render: "¡Piso eliminado con éxito!", type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false);
      fetchPisos();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Layers size={24} />
            </div>
            Gestión de Pisos
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">
            Administra los niveles de la infraestructura. Haz clic en las direcciones o áreas para gestionarlas.
          </p>
        </div>
        
        <button 
          onClick={() => { setPisoToEdit(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-brand-secondary/25 shrink-0"
        >
          <Plus size={18} strokeWidth={3} />
          Registrar Piso
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin text-brand-secondary" size={36} />
          <span className="font-semibold text-brand-secondary">Cargando infraestructura...</span>
        </div>
      ) : pisos.length === 0 ? (
        <div className="py-20 text-center text-slate-500 px-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <Layers size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700">No hay pisos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {pisos.map((piso) => (
            <PisoCard 
              key={piso.id} 
              piso={piso} 
              onEdit={(p) => { setPisoToEdit(p); setIsModalOpen(true); }}
              onDelete={(p) => { setPisoToDelete(p); setIsDeleteModalOpen(true); }}
            />
          ))}
        </div>
      )}

      <PisoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pisoToEdit={pisoToEdit}
        onSaved={fetchPisos}
      />

      <ConfirmarEliminacionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        nombreUsuario={`el piso "${pisoToDelete?.nombre}"`}
        isLoading={isDeleting}
      />
    </div>
  );
}