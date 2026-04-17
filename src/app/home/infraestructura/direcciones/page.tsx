"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Edit2, Trash2,
  MapPin, ChevronDown, Layers, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { DireccionAPI, AreaData } from "@/types";

import DireccionModal from "../../../components/infraestructura/DireccionModal";
import ConfirmarEliminacionModal from "../../../components/personal/ConfirmarEliminacionModal";
import SearchBar from "../../../components/ui/SearchBar";
import FilterSelect from "../../../components/ui/FilterSelect";

const quitarAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

function DireccionCard({
  direccion,
  onEdit,
  onToggleStatus
}: {
  direccion: DireccionAPI;
  onEdit: (d: DireccionAPI) => void;
  onToggleStatus: (d: DireccionAPI) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const tieneAreas = direccion.areas && direccion.areas.length > 0;
  const estaActiva = direccion.activo !== false;
  const pisoPadreInactivo = direccion.piso?.activo === false;

  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all duration-300 flex flex-col h-full group border-slate-100 ${estaActiva && !pisoPadreInactivo ? 'hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30' : 'opacity-80 grayscale-[0.3]'}`}>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white shrink-0 ${estaActiva ? 'bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 text-brand-primary' : 'bg-slate-100 text-slate-400'}`}>
            <Building2 size={20} />
          </div>
          <button
            onClick={() => router.push("/home/infraestructura/pisos")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all ${pisoPadreInactivo ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-brand-primary'}`}
          >
            <Layers size={13} className={pisoPadreInactivo ? "text-amber-500" : "text-brand-secondary"} />
            {direccion.piso?.nombre || "Sin Piso"}
            {pisoPadreInactivo && (
              <span title="Piso padre inhabilitado">
                <AlertCircle size={10} />
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(direccion)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all">
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onToggleStatus(direccion)} 
            className={`p-2 rounded-xl transition-all ${estaActiva ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
            title={estaActiva ? "Inhabilitar Dirección" : "Activar Dirección"}
          >
            {estaActiva ? <Trash2 size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 mb-6">
        <h3 className={`text-[16px] sm:text-[17px] font-bold leading-snug break-words ${estaActiva ? 'text-slate-800 group-hover:text-brand-primary' : 'text-slate-500'}`}>
          {direccion.nombre}
        </h3>
      </div>

      <div className="mt-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!tieneAreas}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all font-bold text-[13px] ${
            !tieneAreas ? "bg-slate-50 border-slate-100 text-slate-400" : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-brand-primary/5"
          }`}
        >
          <span>{direccion._count?.areas || 0} Áreas Internas</span>
          <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
              {direccion.areas?.map((area: AreaData) => (
                <button key={area.id} onClick={() => router.push("/home/infraestructura/areas")} className="w-full flex items-start gap-3 text-[13px] font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:text-brand-primary transition-all text-left">
                  <MapPin size={16} className="text-brand-primary shrink-0 mt-[2px]" />
                  <span className="leading-snug flex-1 break-words">{area.nombre}</span>
                </button>
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
  const [busqueda, setBusqueda] = useState("");
  const [filtroPiso, setFiltroPiso] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<"ACTIVOS" | "INACTIVOS">("ACTIVOS");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direccionToEdit, setDireccionToEdit] = useState<DireccionAPI | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [direccionToDelete, setDireccionToDelete] = useState<DireccionAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDirecciones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/direcciones");
      const data = await res.json();
      setDirecciones(data);
    } catch (error) {
      toast.error("No se pudieron cargar las direcciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDirecciones(); }, [fetchDirecciones]);

  const confirmToggleStatus = async () => {
    if (!direccionToDelete) return;
    setIsDeleting(true);
    const nuevoEstado = !(direccionToDelete.activo !== false);
    const toastId = toast.loading(nuevoEstado ? "Activando dirección..." : "Inhabilitando...");
    
    try {
      const res = await fetch(`/api/direcciones/${direccionToDelete.id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      toast.update(toastId, { render: "¡Estado actualizado!", type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false);
      fetchDirecciones();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const opcionesPisos = Array.from(new Map(direcciones.filter(d => d.piso).map(d => [d.piso?.id, d.piso])).values())
    .map(p => ({ value: p?.id.toString() || "", label: p?.nombre || "" }));

  const direccionesFiltradas = direcciones.filter(dir => {
    const matchEstado = filtroEstado === "ACTIVOS" ? dir.activo !== false : dir.activo === false;
    const matchBusqueda = quitarAcentos(dir.nombre).includes(quitarAcentos(busqueda));
    const matchPiso = filtroPiso === "TODOS" || dir.piso_id?.toString() === filtroPiso;
    return matchEstado && matchBusqueda && matchPiso;
  });

  const direccionesPorPiso = direccionesFiltradas.reduce((acc, direccion) => {
    const pisoNombre = direccion.piso?.nombre || "Sin Piso Asignado";
    if (!acc[pisoNombre]) acc[pisoNombre] = [];
    acc[pisoNombre].push(direccion);
    return acc;
  }, {} as Record<string, DireccionAPI[]>);

  const pisosOrdenados = Object.keys(direccionesPorPiso).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl"><Building2 size={24} /></div>
            Gestión de Direcciones
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">Agrupadas por piso. El bloqueo afecta la visibilidad en formularios.</p>
        </div>
        <button onClick={() => { setDireccionToEdit(null); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-3 rounded-2xl font-bold text-[14px] shadow-md shadow-brand-secondary/25 transition-all">
          <Plus size={18} strokeWidth={3} /> Registrar Dirección
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-sm mb-6 flex flex-col gap-4 sticky top-20 z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1"><SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar dirección..." /></div>
          <div className="w-full lg:w-72"><FilterSelect value={filtroPiso} onChange={setFiltroPiso} options={opcionesPisos} defaultLabel="Todos los Pisos" icon={Layers} /></div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200/50">
            <button onClick={() => setFiltroEstado("ACTIVOS")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${filtroEstado === "ACTIVOS" ? "bg-white text-brand-primary shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}>Direcciones Activas</button>
            <button onClick={() => setFiltroEstado("INACTIVOS")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${filtroEstado === "INACTIVOS" ? "bg-white text-rose-500 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}>Inhabilitadas</button>
          </div>
          <div className="text-[13px] font-semibold text-slate-500">
            Total: <span className="text-brand-secondary font-bold">{direccionesFiltradas.length}</span> {filtroEstado.toLowerCase()}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {pisosOrdenados.map((pisoNombre) => (
          <div key={pisoNombre} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Layers size={18} className="text-slate-400" />
              <h2 className="font-bold text-slate-700">{pisoNombre}</h2>
              <div className="h-[1px] bg-slate-100 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {direccionesPorPiso[pisoNombre].map((dir) => (
                <DireccionCard key={dir.id} direccion={dir} onEdit={(d) => { setDireccionToEdit(d); setIsModalOpen(true); }} onToggleStatus={(d) => { setDireccionToDelete(d); setIsDeleteModalOpen(true); }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DireccionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} direccionToEdit={direccionToEdit} onSaved={fetchDirecciones} />
      <ConfirmarEliminacionModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmToggleStatus} nombreUsuario={`la dirección "${direccionToDelete?.nombre}"`} isLoading={isDeleting} isActivating={direccionToDelete?.activo === false} />
    </div>
  );
}