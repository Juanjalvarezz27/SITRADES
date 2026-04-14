"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, Plus, Edit2, Trash2, Loader2, 
  Building2, Layers, Users, ChevronDown, User 
} from "lucide-react";
import { toast } from "react-toastify";
import { AreaAPI } from "@/types";

import AreaModal from "../../../components/infraestructura/AreaModal";
import ConfirmarEliminacionModal from "../../../components/personal/ConfirmarEliminacionModal";
import SearchBar from "../../../components/ui/SearchBar";
import FilterSelect from "../../../components/ui/FilterSelect";

// Importamos nuestro componente de paginación reutilizable
import Pagination from "../../../components/ui/Pagination";

// Función auxiliar para ignorar acentos y mayúsculas en las búsquedas
const quitarAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

function AreaCard({ 
  area, 
  onEdit, 
  onDelete 
}: { 
  area: AreaAPI; 
  onEdit: (a: AreaAPI) => void; 
  onDelete: (a: AreaAPI) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter(); 

  const tieneUsuarios = area.usuarios && area.usuarios.length > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30 transition-all duration-300 flex flex-col h-full group">
      
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 flex items-center justify-center text-brand-primary shadow-inner border border-white shrink-0">
            <MapPin size={20} />
          </div>
          {/* Etiqueta de Piso convertida en botón navegable */}
          <button 
            onClick={() => router.push("/home/infraestructura/pisos")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary/30 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all"
            title="Ir a Gestión de Pisos"
          >
            <Layers size={13} className="text-brand-secondary" />
            {area.direccion?.piso?.nombre || "Sin Piso"}
          </button>
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(area)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all" title="Editar Área">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(area)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar Área">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-6">
        <h3 className="text-[15px] font-bold text-slate-800 leading-snug group-hover:text-brand-primary transition-colors break-words">
          {area.nombre}
        </h3>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!tieneUsuarios}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all font-bold text-[13px] ${
            !tieneUsuarios 
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-brand-primary/5 hover:border-brand-primary/30 hover:text-brand-primary"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} className={tieneUsuarios ? "text-brand-primary" : "text-slate-400"} />
            <span>{area._count?.usuarios || 0} Personal Asignado</span>
          </div>
          <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2.5">
              {area.usuarios?.map((usuario) => (
                <button 
                  key={usuario.id} 
                  onClick={() => router.push("/home/personal")}
                  className="w-full flex items-center gap-3 text-[13px] font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-brand-primary/40 hover:shadow-md hover:text-brand-primary transition-all text-left group/user"
                  title="Ver detalles del personal"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 group-hover/user:scale-110 transition-transform">
                    <User size={12} strokeWidth={3} />
                  </div>
                  <span className="leading-snug flex-1 truncate" title={usuario.nombre}>{usuario.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DireccionSeccion({ 
  direccionNombre, 
  areas, 
  isDefaultExpanded,
  onEdit, 
  onDelete 
}: { 
  direccionNombre: string; 
  areas: AreaAPI[]; 
  isDefaultExpanded: boolean;
  onEdit: (a: AreaAPI) => void; 
  onDelete: (a: AreaAPI) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);

  return (
    <div className="bg-white/60 border border-slate-200/60 rounded-[2.5rem] p-5 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300">
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full group outline-none"
      >
        <div className="hidden md:flex items-center justify-between gap-4 w-full text-left">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${isExpanded ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-400 group-hover:bg-brand-primary/5"}`}>
              <Building2 size={22} />
            </div>
            <h2 className="text-[18px] font-bold text-slate-800 tracking-tight break-words flex-1 leading-snug group-hover:text-brand-primary transition-colors">
              {direccionNombre}
            </h2>
            <span className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[12px] font-bold whitespace-nowrap shrink-0">
              {areas.length} {areas.length === 1 ? 'Área' : 'Áreas'}
            </span>
          </div>
          <div className={`p-2 rounded-full transition-colors shrink-0 ${isExpanded ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-400"}`}>
            <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        <div className="flex md:hidden flex-col gap-4 text-left w-full">
          <div className="flex items-center justify-between w-full">
            <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${isExpanded ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-400"}`}>
              <Building2 size={20} />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">
                {areas.length} {areas.length === 1 ? 'Área' : 'Áreas'}
              </span>
              <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-400"}`}>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight break-words leading-tight group-hover:text-brand-primary transition-colors">
              {direccionNombre}
            </h2>
          </div>
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-6 md:mt-8" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-2">
            {areas.map((area) => (
              <AreaCard 
                key={area.id} 
                area={area} 
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function GestionAreasPage() {
  const [areas, setAreas] = useState<AreaAPI[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Búsqueda y Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroPiso, setFiltroPiso] = useState("TODOS");
  const [filtroDireccion, setFiltroDireccion] = useState("TODOS");

  // Estados para la Paginación
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
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      toast.error("Error al cargar áreas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Resetear el filtro de dirección si el piso cambia
  useEffect(() => {
    setFiltroDireccion("TODOS");
  }, [filtroPiso]);

  // Efecto para devolver a la página 1 cuando el usuario busca o filtra algo
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroPiso, filtroDireccion]);

  const confirmDelete = async () => {
    if (!areaToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading("Eliminando área...");
    try {
      const res = await fetch(`/api/areas/${areaToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Error al eliminar");
      toast.update(toastId, { render: "¡Área eliminada!", type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false);
      fetchAreas();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const opcionesPisos = Array.from(new Map(areas.filter(a => a.direccion?.piso).map(a => [a.direccion?.piso?.id, a.direccion?.piso])).values())
    .map(p => ({ value: p?.id.toString() || "", label: p?.nombre || "" }));

  const opcionesDirecciones = Array.from(new Map(areas
    .filter(a => filtroPiso === "TODOS" || a.direccion?.piso?.id.toString() === filtroPiso)
    .filter(a => a.direccion)
    .map(a => [a.direccion?.id, a.direccion])
  ).values()).map(d => ({ value: d?.id.toString() || "", label: d?.nombre || "" }));

  // 1. Aplicamos los filtros
  const areasFiltradas = areas.filter(area => {
    const matchBusqueda = quitarAcentos(area.nombre).includes(quitarAcentos(busqueda));
    const matchPiso = filtroPiso === "TODOS" || area.direccion?.piso?.id.toString() === filtroPiso;
    const matchDireccion = filtroDireccion === "TODOS" || area.direccion_id.toString() === filtroDireccion;
    
    return matchBusqueda && matchPiso && matchDireccion;
  });

  // 2. Calculamos la Paginación sobre las áreas filtradas
  const totalPages = Math.ceil(areasFiltradas.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const areasPaginadas = areasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  // 3. Agrupamos SOLAMENTE las áreas que pertenecen a la página actual
  const areasPorDireccion = areasPaginadas.reduce((acc, area) => {
    const dir = area.direccion?.nombre || "Sin Dirección";
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(area);
    return acc;
  }, {} as Record<string, AreaAPI[]>);

  const direccionesOrdenadas = Object.keys(areasPorDireccion).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl"><MapPin size={24} /></div>
            Gestión de Áreas
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">Administra los laboratorios y oficinas específicas de cada dirección.</p>
        </div>
        <button onClick={() => { setAreaToEdit(null); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white px-6 py-3 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-brand-secondary/25 shrink-0"><Plus size={18} strokeWidth={3} /> Registrar Área</button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      {!loading && areas.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 mb-8 p-3 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
          <SearchBar 
            value={busqueda} 
            onChange={setBusqueda} 
            placeholder="Buscar área por nombre..." 
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <FilterSelect 
              value={filtroPiso} 
              onChange={setFiltroPiso} 
              options={opcionesPisos} 
              defaultLabel="Todos los Pisos" 
              icon={Layers}
            />
            <FilterSelect 
              value={filtroDireccion} 
              onChange={setFiltroDireccion} 
              options={opcionesDirecciones} 
              defaultLabel="Todas las Direcciones" 
              icon={Building2}
              disabled={filtroPiso === "TODOS" && opcionesDirecciones.length === 0} 
            />
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3"><Loader2 className="animate-spin text-brand-secondary" size={36} /><span className="font-semibold text-brand-secondary">Cargando infraestructura...</span></div>
      ) : areas.length === 0 ? (
        <div className="py-20 text-center text-slate-500 px-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm"><MapPin size={48} className="mx-auto text-slate-200 mb-4" /><p className="font-semibold text-slate-700">No hay áreas registradas</p></div>
      ) : areasFiltradas.length === 0 ? (
        <div className="py-20 text-center text-slate-500 px-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <MapPin size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
          <p className="font-bold text-slate-700 text-lg">No se encontraron resultados</p>
          <p className="text-[14px] mt-1">Intenta ajustando los filtros o la búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {direccionesOrdenadas.map((dir) => (
              <DireccionSeccion
                key={dir}
                direccionNombre={dir}
                areas={areasPorDireccion[dir]}
                isDefaultExpanded={busqueda !== "" || filtroPiso !== "TODOS" || filtroDireccion !== "TODOS"}
                onEdit={(a) => { setAreaToEdit(a); setIsModalOpen(true); }}
                onDelete={(a) => { setAreaToDelete(a); setIsDeleteModalOpen(true); }}
              />
            ))}
          </div>

          {/* Agregamos el Componente de Paginación debajo de las tarjetas */}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll hacia arriba al cambiar
            }} 
          />
        </>
      )}

      <AreaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} areaToEdit={areaToEdit} onSaved={fetchAreas} />
      <ConfirmarEliminacionModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} nombreUsuario={`el área "${areaToDelete?.nombre}"`} isLoading={isDeleting} />
    </div>
  );
}