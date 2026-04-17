"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Layers, Plus, Edit2, Trash2,
  Building2, MapPin, ChevronDown, CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { PisoAPI, DireccionData } from "@/types";

// Componentes del sistema
import PisoModal from "../../../components/infraestructura/PisoModal";
import ConfirmarEliminacionModal from "../../../components/personal/ConfirmarEliminacionModal";
import SearchBar from "../../../components/ui/SearchBar";

const quitarAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

function PisoCard({
  piso,
  onEdit,
  onToggleStatus
}: {
  piso: PisoAPI;
  onEdit: (p: PisoAPI) => void;
  onToggleStatus: (p: PisoAPI) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const tieneDirecciones = piso.direcciones && piso.direcciones.length > 0;
  const estaActivo = piso.activo !== false;

  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all duration-300 flex flex-col h-fit group border-slate-100 ${estaActivo ? 'hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30' : 'opacity-80 grayscale-[0.5]'}`}>

      {/* Cabecera de la Tarjeta */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white shrink-0 ${estaActivo ? 'bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 text-brand-primary' : 'bg-slate-100 text-slate-400'}`}>
            <Layers size={24} />
          </div>
          <div>
            <h3 className={`text-[17px] font-black leading-tight transition-colors ${estaActivo ? 'text-slate-800 group-hover:text-brand-primary' : 'text-slate-500'}`}>
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
          <button 
            onClick={() => onToggleStatus(piso)} 
            className={`p-2 rounded-xl transition-all ${estaActivo ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
            title={estaActivo ? "Inhabilitar Piso" : "Activar Piso"}
          >
            {estaActivo ? <Trash2 size={16} /> : <CheckCircle size={16} />}
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

      {/* Contenido Desplegable */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 pt-2">
            {piso.direcciones?.map((dir: DireccionData) => (
              <div key={dir.id} className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4">
                <button onClick={() => router.push("/home/infraestructura/direcciones")} className="w-full flex items-start gap-3 text-slate-800 font-bold text-[14px] leading-snug hover:text-brand-primary transition-colors text-left group/dir">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5 group-hover/dir:bg-brand-primary/10 transition-colors">
                    <Building2 size={16} className="text-brand-secondary group-hover/dir:text-brand-primary transition-colors" />
                  </div>
                  <span className="mt-1 flex-1">{dir.nombre}</span>
                </button>
                <div className="mt-3 ml-[15px] pl-5 border-l-2 border-slate-200 flex flex-col gap-3">
                  {dir.areas?.length ? dir.areas.map(area => (
                    <button key={area.id} onClick={() => router.push("/home/infraestructura/areas")} className="w-full flex items-start gap-2.5 text-[13px] font-semibold text-slate-600 relative hover:text-brand-primary transition-colors text-left">
                      <div className="absolute -left-5 top-[9px] w-4 border-t-2 border-slate-200"></div>
                      <MapPin size={14} className="text-brand-primary shrink-0 mt-[2px] bg-slate-50 rounded-full" />
                      <span className="leading-snug flex-1">{area.nombre}</span>
                    </button>
                  )) : (
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

export default function GestionPisosPage() {
  const [pisos, setPisos] = useState<PisoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"ACTIVOS" | "INACTIVOS">("ACTIVOS");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pisoToEdit, setPisoToEdit] = useState<PisoAPI | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pisoToDelete, setPisoToDelete] = useState<PisoAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPisos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pisos");
      const data = await res.json();
      setPisos(data);
    } catch (error) {
      toast.error("No se pudieron cargar los pisos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPisos(); }, [fetchPisos]);

  const confirmToggleStatus = async () => {
    if (!pisoToDelete) return;
    setIsDeleting(true);
    const nuevoEstado = !(pisoToDelete.activo !== false);
    const toastId = toast.loading(nuevoEstado ? "Activando piso..." : "Inhabilitando piso...");
    
    try {
      const res = await fetch(`/api/pisos/${pisoToDelete.id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      toast.update(toastId, { render: `¡Piso ${nuevoEstado ? 'activado' : 'inhabilitado'}!`, type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false);
      fetchPisos();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const pisosFiltrados = pisos.filter(piso => {
    const matchEstado = filtroEstado === "ACTIVOS" ? piso.activo !== false : piso.activo === false;
    const matchBusqueda = quitarAcentos(piso.nombre).includes(quitarAcentos(busqueda));
    return matchEstado && matchBusqueda;
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Layers size={24} />
            </div>
            Gestión de Pisos
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">
            Administra los niveles de la infraestructura. El bloqueo de un piso afecta a sus direcciones.
          </p>
        </div>
        <button onClick={() => { setPisoToEdit(null); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-brand-secondary/25">
          <Plus size={18} strokeWidth={3} />
          Registrar Piso
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-sm mb-6 flex flex-col gap-4 sticky top-20 z-10">
        <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar piso por nombre..." />
        
        {/* FILA DEL TOGGLE CORREGIDA */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200/50">
            <button
              onClick={() => setFiltroEstado("ACTIVOS")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
                filtroEstado === "ACTIVOS" 
                  ? "bg-white text-brand-primary shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pisos Activos
            </button>
            <button
              onClick={() => setFiltroEstado("INACTIVOS")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
                filtroEstado === "INACTIVOS" 
                  ? "bg-white text-rose-500 shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Inhabilitados
            </button>
          </div>
          
          <div className="text-[13px] font-semibold text-slate-500">
            Total: <span className="text-brand-secondary font-bold">{pisosFiltrados.length}</span> {filtroEstado.toLowerCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {pisosFiltrados.map((piso) => (
          <PisoCard 
            key={piso.id} 
            piso={piso} 
            onEdit={(p) => { setPisoToEdit(p); setIsModalOpen(true); }} 
            onToggleStatus={(p) => { setPisoToDelete(p); setIsDeleteModalOpen(true); }} 
          />
        ))}
      </div>

      <PisoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pisoToEdit={pisoToEdit} onSaved={fetchPisos} />
      
      <ConfirmarEliminacionModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmToggleStatus} 
        nombreUsuario={`el piso "${pisoToDelete?.nombre}"`} 
        isLoading={isDeleting} 
        isActivating={pisoToDelete?.activo === false} 
      />
    </div>
  );
}