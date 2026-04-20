"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Plus, Edit2, Trash2,
  Building2, Layers, Users, ChevronDown, User, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { AreaAPI } from "@/types";

import AreaModal from "../../../components/infraestructura/AreaModal";
import ConfirmarEliminacionModal from "../../../components/personal/ConfirmarEliminacionModal";
import SearchBar from "../../../components/ui/SearchBar";
import FilterSelect from "../../../components/ui/FilterSelect";
import Pagination from "../../../components/ui/Pagination";

const quitarAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

function AreaCard({
  area,
  onEdit,
  onToggleStatus
}: {
  area: AreaAPI;
  onEdit: (a: AreaAPI) => void;
  onToggleStatus: (a: AreaAPI) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const tieneUsuarios = area.usuarios && area.usuarios.length > 0;
  const estaActiva = area.activo !== false;
  
  // Detección de herencia inactiva
  const padreInactivo = area.direccion?.activo === false || area.direccion?.piso?.activo === false;

  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all duration-300 flex flex-col h-full group border-slate-100 ${estaActiva && !padreInactivo ? 'hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30' : 'opacity-80 grayscale-[0.3]'}`}>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white shrink-0 ${estaActiva ? 'bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 text-brand-primary' : 'bg-slate-100 text-slate-400'}`}>
            <MapPin size={20} />
          </div>
          <button
            onClick={() => router.push("/home/infraestructura/pisos")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all ${padreInactivo ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-brand-primary'}`}
          >
            <Layers size={13} className={padreInactivo ? "text-amber-500" : "text-brand-secondary"} />
            {area.direccion?.piso?.nombre || "Sin Piso"}
            {padreInactivo && <span title="Infraestructura superior inhabilitada" className="ml-1"><AlertCircle size={10} /></span>}
          </button>
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(area)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onToggleStatus(area)} className={`p-2 rounded-xl transition-all ${estaActiva ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
            {estaActiva ? <Trash2 size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 mb-6">
        <h3 className={`text-[15px] font-bold leading-snug break-words ${estaActiva ? 'text-slate-800 group-hover:text-brand-primary' : 'text-slate-500'}`}>
          {area.nombre}
        </h3>
      </div>

      <div className="mt-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!tieneUsuarios}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all font-bold text-[13px] ${
            !tieneUsuarios ? "bg-slate-50 border-slate-100 text-slate-400" : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-brand-primary/5"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} className={tieneUsuarios ? "text-brand-primary" : "text-slate-400"} />
            <span>{area._count?.usuarios || 0} Personal</span>
          </div>
          <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2.5">
              {area.usuarios?.map((usuario) => (
                <button key={usuario.id} onClick={() => router.push("/home/personal")} className="w-full flex items-center gap-3 text-[13px] font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:text-brand-primary transition-all text-left">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0"><User size={12} strokeWidth={3} /></div>
                  <span className="leading-snug flex-1 truncate">{usuario.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GestionAreasPage() {
  const [areas, setAreas] = useState<AreaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPiso, setFiltroPiso] = useState("TODOS");
  const [filtroDireccion, setFiltroDireccion] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<"ACTIVOS" | "INACTIVOS">("ACTIVOS");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<AreaAPI | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/areas");
      const data = await res.json();
      setAreas(data);
    } catch (error) { 
      toast.error("Error al cargar áreas."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);
  useEffect(() => { setFiltroDireccion("TODOS"); }, [filtroPiso]);
  useEffect(() => { setCurrentPage(1); }, [busqueda, filtroPiso, filtroDireccion, filtroEstado]);

  const confirmToggleStatus = async () => {
    if (!areaToDelete) return;
    setIsDeleting(true);
    const nuevoEstado = !(areaToDelete.activo !== false);
    const toastId = toast.loading(nuevoEstado ? "Activando área..." : "Inhabilitando...");
    try {
      const res = await fetch(`/api/areas/${areaToDelete.id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error en servidor");
      toast.update(toastId, { render: "¡Estado actualizado!", type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false); 
      fetchAreas();
    } catch (err: any) { 
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 }); 
    } finally { 
      setIsDeleting(false); 
    }
  };

  const opcionesPisos = Array.from(new Map(areas.filter(a => a.direccion?.piso).map(a => [a.direccion?.piso?.id, a.direccion?.piso])).values()).map(p => ({ value: p?.id.toString() || "", label: p?.nombre || "" }));
  const opcionesDirecciones = Array.from(new Map(areas.filter(a => filtroPiso === "TODOS" || a.direccion?.piso?.id.toString() === filtroPiso).filter(a => a.direccion).map(a => [a.direccion?.id, a.direccion])).values()).map(d => ({ value: d?.id.toString() || "", label: d?.nombre || "" }));

  const areasFiltradas = areas.filter(area => {
    const matchEstado = filtroEstado === "ACTIVOS" ? area.activo !== false : area.activo === false;
    const matchBusqueda = quitarAcentos(area.nombre).includes(quitarAcentos(busqueda));
    const matchPiso = filtroPiso === "TODOS" || area.direccion?.piso?.id.toString() === filtroPiso;
    const matchDireccion = filtroDireccion === "TODOS" || area.direccion_id.toString() === filtroDireccion;
    return matchEstado && matchBusqueda && matchPiso && matchDireccion;
  });

  const totalPages = Math.ceil(areasFiltradas.length / ITEMS_PER_PAGE);
  const areasPaginadas = areasFiltradas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const areasPorDireccion = areasPaginadas.reduce((acc, area) => {
    const dir = area.direccion?.nombre || "Sin Dirección";
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(area);
    return acc;
  }, {} as Record<string, AreaAPI[]>);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl"><MapPin size={24} /></div> Gestión de Áreas
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">
            Administra las áreas y laboratorios.
          </p>
        </div>
        <button onClick={() => { setAreaToEdit(null); setIsModalOpen(true); }} className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-3 rounded-2xl font-bold shadow-md transition-all flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={3} /> Registrar Área
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-sm mb-6 flex flex-col gap-4 sticky top-20 z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1"><SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar área..." /></div>
          <div className="flex flex-col sm:flex-row gap-4">
            <FilterSelect value={filtroPiso} onChange={setFiltroPiso} options={opcionesPisos} defaultLabel="Todos los Pisos" icon={Layers} />
            <FilterSelect value={filtroDireccion} onChange={setFiltroDireccion} options={opcionesDirecciones} defaultLabel="Todas las Direcciones" icon={Building2} disabled={filtroPiso === "TODOS" && opcionesDirecciones.length === 0} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200/50">
            <button onClick={() => setFiltroEstado("ACTIVOS")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${filtroEstado === "ACTIVOS" ? "bg-white text-brand-primary shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}>Áreas Activas</button>
            <button onClick={() => setFiltroEstado("INACTIVOS")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${filtroEstado === "INACTIVOS" ? "bg-white text-rose-500 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}>Inhabilitadas</button>
          </div>
          <div className="text-[13px] font-semibold text-slate-500">Total: <span className="text-brand-secondary font-bold">{areasFiltradas.length}</span> {filtroEstado.toLowerCase()}</div>
        </div>
      </div>

      {/* SEPARACIÓN VISUAL ENTRE DIRECCIONES - RESPONSIVE */}
      <div className="space-y-10 md:space-y-8 mt-8">
        {Object.keys(areasPorDireccion).sort().map((dir, index) => (
          <div 
            key={dir} 
            className={`space-y-5 ${index > 0 ? "pt-10 md:pt-0 border-t-2 md:border-t-0 border-dashed border-slate-200/70" : ""}`}
          >
            {/* Encabezado de la Dirección mejorado */}
            <div className="flex items-center gap-3 px-1 sm:px-2">
              <div className="p-2 bg-slate-100/80 rounded-xl text-slate-500">
                <Building2 size={20} />
              </div>
              <h2 className="font-black text-xl text-slate-800 tracking-tight">{dir}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {areasPorDireccion[dir].map((area) => (
                <AreaCard 
                  key={area.id} 
                  area={area} 
                  onEdit={(a) => { setAreaToEdit(a); setIsModalOpen(true); }} 
                  onToggleStatus={(a) => { setAreaToDelete(a); setIsDeleteModalOpen(true); }} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      <AreaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} areaToEdit={areaToEdit} onSaved={fetchAreas} />
      <ConfirmarEliminacionModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmToggleStatus} nombreUsuario={`el área "${areaToDelete?.nombre}"`} isLoading={isDeleting} isActivating={areaToDelete?.activo === false} />
    </div>
  );
}