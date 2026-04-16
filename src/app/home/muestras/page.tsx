"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  PackagePlus, Loader2, Package, Calendar, MapPin, 
  ShieldAlert, Eye, FlaskConical, Edit3 
} from "lucide-react";
import { toast } from "react-toastify";
import SearchBar from "../../components/ui/SearchBar";
import FilterSelect from "../../components/ui/FilterSelect";
import TrazabilidadModal from "../../components/muestras/TrazabilidadModal";
import Pagination from "../../components/ui/Pagination";
import EditarMuestraModal from "../../components/muestras/EditarMuestraModal"; 

const quitarAcentos = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
};

// --- TARJETA DE MUESTRA ---
function MuestraCard({ muestra, onClick, onEdit }: { muestra: any, onClick: () => void, onEdit: () => void }) {
  const hoy = new Date();
  const fechaCaducidad = new Date(muestra.fecha_caducidad);

  let estadoLegal = { texto: "Vigente", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };
  if (hoy >= fechaCaducidad) {
    estadoLegal = { texto: "Vencida (En Custodia)", color: "bg-amber-50 text-amber-600 border-amber-200" };
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col h-full group">
      
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/5 transition-all shrink-0">
            <FlaskConical size={24} />
          </div>
          <div>
            <span className={`inline-flex px-2.5 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest mb-1.5 ${estadoLegal.color}`}>
              {estadoLegal.texto}
            </span>
            <h3 className="text-[16px] font-black text-slate-800 leading-tight group-hover:text-brand-primary transition-colors line-clamp-2" title={muestra.principio_activo}>
              {muestra.principio_activo}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase tracking-wide mb-1">Código</span>
            <span className="font-black text-slate-700 text-[13px] truncate block">{muestra.codigo_interno}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase tracking-wide mb-1">Lote</span>
            <span className="font-black text-slate-700 text-[13px] truncate block">{muestra.lote}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wide">Vence</span>
            </div>
            <span className="font-bold text-slate-700 text-[13px] block">{formatearFecha(muestra.fecha_caducidad)}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldAlert size={14} className="text-slate-400" />
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wide">Retención</span>
            </div>
            <span className="font-bold text-slate-700 text-[13px] block">{formatearFecha(muestra.fecha_fin_retencion)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="leading-snug text-[13px] text-slate-600">
            <strong className="text-slate-800 block mb-0.5 font-bold">{muestra.area?.nombre || "Sin área asignada"}</strong>
            <span className="font-medium text-slate-500">
              {muestra.area?.direccion?.nombre} ({muestra.area?.direccion?.piso?.nombre})
            </span>
            {muestra.ubicacion_detalle && (
              <span className="block mt-2 text-[11px] text-slate-500 font-bold uppercase tracking-wide bg-white border border-slate-200 px-2 py-1 rounded-md">
                📍 {muestra.ubicacion_detalle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOTONES 50/50 */}
      <div className="mt-auto pt-2 grid grid-cols-2 gap-3 border-t border-slate-100">
        <button 
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold text-[13px] rounded-xl transition-all border border-brand-primary/20 hover:border-brand-primary shadow-sm"
        >
          <Eye size={16} /> Trazabilidad
        </button>
        <button 
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-secondary/10 hover:bg-brand-secondary text-brand-secondary hover:text-white font-bold text-[13px] rounded-xl transition-all border border-brand-secondary/20 hover:border-brand-secondary shadow-sm"
        >
          <Edit3 size={16} /> Editar
        </button>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function InventarioMuestrasPage() {
  const [muestrasOriginales, setMuestrasOriginales] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroPiso, setFiltroPiso] = useState("TODOS");
  const [filtroDireccion, setFiltroDireccion] = useState("TODOS");
  const [filtroEstadoLegal, setFiltroEstadoLegal] = useState("TODOS");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchMuestras = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/muestras?fase=activa", { cache: 'no-store' });
      if (!res.ok) throw new Error("Error al cargar inventario");
      const data = await res.json();
      setMuestrasOriginales(data);
      setMuestrasFiltradas(data);
    } catch (error) {
      toast.error("No se pudo cargar el inventario de muestras.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMuestras();
  }, [fetchMuestras]);

  useEffect(() => {
    setFiltroDireccion("TODOS");
  }, [filtroPiso]);

  useEffect(() => {
    const hoy = new Date();
    
    const filtrados = muestrasOriginales.filter((muestra) => {
      const busquedaLimpia = quitarAcentos(busqueda);
      const matchBusqueda = 
        quitarAcentos(muestra.codigo_interno).includes(busquedaLimpia) ||
        quitarAcentos(muestra.lote).includes(busquedaLimpia) ||
        quitarAcentos(muestra.principio_activo).includes(busquedaLimpia);

      const matchPiso = filtroPiso === "TODOS" || muestra.area?.direccion?.piso_id?.toString() === filtroPiso;
      const matchDireccion = filtroDireccion === "TODOS" || muestra.area?.direccion_id?.toString() === filtroDireccion;

      let matchEstadoLegal = true;
      if (filtroEstadoLegal !== "TODOS") {
        const fechaCad = new Date(muestra.fecha_caducidad);
        if (filtroEstadoLegal === "VIGENTE") matchEstadoLegal = hoy < fechaCad;
        if (filtroEstadoLegal === "VENCIDA_CUSTODIA") matchEstadoLegal = hoy >= fechaCad;
      }

      return matchBusqueda && matchPiso && matchDireccion && matchEstadoLegal;
    });

    setMuestrasFiltradas(filtrados);
    setCurrentPage(1); 
  }, [busqueda, filtroPiso, filtroDireccion, filtroEstadoLegal, muestrasOriginales]);

  const totalPages = Math.ceil(muestrasFiltradas.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const muestrasPaginadas = muestrasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  const opcionesPisos = Array.from(new Map(muestrasOriginales.filter(m => m.area?.direccion?.piso).map(m => [m.area.direccion.piso.id, m.area.direccion.piso])).values())
    .map((p: any) => ({ value: p.id.toString(), label: p.nombre }));

  const opcionesDirecciones = Array.from(new Map(muestrasOriginales
    .filter(m => filtroPiso === "TODOS" || m.area?.direccion?.piso_id?.toString() === filtroPiso)
    .filter(m => m.area?.direccion)
    .map(m => [m.area.direccion.id, m.area.direccion])).values())
    .map((d: any) => ({ value: d.id.toString(), label: d.nombre }));

  const OPCIONES_ESTADO_LEGAL = [
    { value: "VIGENTE", label: "Vigentes (Útiles)" },
    { value: "VENCIDA_CUSTODIA", label: "Vencidas (En Custodia)" }
  ];

  const handleOpenModal = (muestra: any) => {
    setMuestraSeleccionada(muestra);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (muestra: any) => {
    setMuestraSeleccionada(muestra);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Package size={24} />
            </div>
            Inventario de Muestras Activas
          </h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-2">
            Control de trazabilidad y gestión de vida útil de las especialidades farmacéuticas en almacenamiento.
          </p>
        </div>
        
        <Link 
          href="/home/muestras/nuevo"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-brand-secondary/25 shrink-0"
        >
          <PackagePlus size={18} strokeWidth={3} />
          Registrar Entrada
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex flex-col gap-4 sticky top-20 z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar 
              value={busqueda} 
              onChange={setBusqueda} 
              placeholder="Buscar por código, lote o principio activo..." 
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <FilterSelect options={OPCIONES_ESTADO_LEGAL} value={filtroEstadoLegal} onChange={setFiltroEstadoLegal} defaultLabel="Todos los Estados" icon={ShieldAlert} />
            <FilterSelect options={opcionesPisos} value={filtroPiso} onChange={setFiltroPiso} defaultLabel="Todos los Pisos" />
            <FilterSelect options={opcionesDirecciones} value={filtroDireccion} onChange={setFiltroDireccion} defaultLabel="Todas las Direcciones" disabled={filtroPiso === "TODOS" && opcionesDirecciones.length === 0} />
          </div>
        </div>
        <div className="text-[13px] font-semibold text-slate-500 w-full text-right px-2 border-t border-slate-100 pt-3">
          Mostrando <span className="text-brand-secondary font-bold">{loading ? "..." : muestrasFiltradas.length}</span> registros activos
        </div>
      </div>

      <div className="w-full relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50/50 backdrop-blur-sm rounded-3xl z-20">
            <Loader2 className="animate-spin text-brand-secondary" size={36} />
            <span className="text-[15px] font-semibold text-brand-secondary">Cargando inventario activo...</span>
          </div>
        ) : muestrasFiltradas.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-[15px] px-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center">
            <Package size={48} className="text-slate-300 mb-4 opacity-50" />
            <p className="font-bold text-slate-700 text-lg">Inventario vacío</p>
            <p className="text-slate-500 mt-1">No hay muestras activas que coincidan con los filtros de búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {muestrasPaginadas.map((muestra) => (
                <MuestraCard 
                  key={muestra.id} 
                  muestra={muestra} 
                  onClick={() => handleOpenModal(muestra)} 
                  onEdit={() => handleOpenEditModal(muestra)}
                />
              ))}
            </div>

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }} 
            />
          </>
        )}
      </div>

      <TrazabilidadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} muestra={muestraSeleccionada} />
      <EditarMuestraModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} muestra={muestraSeleccionada} onSuccess={fetchMuestras} />
    </div>
  );
}