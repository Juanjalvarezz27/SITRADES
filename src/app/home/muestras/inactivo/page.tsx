"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Archive, 
  Loader2, 
  History, 
  SearchX, 
  MapPin, 
  Thermometer, 
  ShieldAlert, 
  Calendar,
  Trash2 
} from "lucide-react";
import { toast } from "react-toastify";

// Ajusta estas rutas según tu estructura real
import SearchBar from "../../../components/ui/SearchBar";
import FilterSelect from "../../../components/ui/FilterSelect";
import TrazabilidadModal from "../../../components/muestras/TrazabilidadModal";
import Pagination from "../../../components/ui/Pagination";
import CertificadoDescarteModal from "../../../components/muestras/CertificadoDescarteModal"; 
import MuestraInactivaCard from "../../../components/muestras/MuestraInactivaCard";

const quitarAcentos = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function InventarioInactivoPage() {
  const [muestrasOriginales, setMuestrasOriginales] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState("TODOS");
  const [filtroMetodo, setFiltroMetodo] = useState("TODOS");
  const [filtroRiesgo, setFiltroRiesgo] = useState("TODOS");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any | null>(null);
  const [isExpedienteModalOpen, setIsExpedienteModalOpen] = useState(false);
  const [isCertificadoModalOpen, setIsCertificadoModalOpen] = useState(false);

  // Opciones dinámicas para los selectores
  const opcionesAreas = Array.from(new Set(muestrasOriginales.map(m => m.area?.nombre)))
    .filter(Boolean)
    .sort()
    .map(n => ({ value: n as string, label: n as string }));
  
  const opcionesMetodos = Array.from(new Set(muestrasOriginales.map(m => m.reporte_descarte?.metodo_disposicion?.nombre)))
    .filter(Boolean)
    .sort()
    .map(m => ({ value: m as string, label: m as string }));

  const opcionesRiesgo = Array.from(new Set(muestrasOriginales.map(m => m.riesgo_bioseguridad)))
    .filter(Boolean)
    .sort()
    .map(r => ({ value: r as string, label: r as string }));

  const fetchMuestras = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/muestras?fase=inactiva", { cache: 'no-store' }); 
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setMuestrasOriginales(data);
      setMuestrasFiltradas(data);
    } catch (error) {
      toast.error("Error al conectar con el archivo histórico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchMuestras(); 
  }, [fetchMuestras]);

  useEffect(() => {
    const filtrados = muestrasOriginales.filter((muestra) => {
      const busquedaLimpia = quitarAcentos(busqueda);
      const cumpleBusqueda = quitarAcentos(muestra.codigo_interno).includes(busquedaLimpia) || 
                             quitarAcentos(muestra.lote).includes(busquedaLimpia) || 
                             quitarAcentos(muestra.principio_activo).includes(busquedaLimpia);
      
      const cumpleArea = filtroArea === "TODOS" || muestra.area?.nombre === filtroArea;
      
      const cumpleMetodo = filtroMetodo === "TODOS" || muestra.reporte_descarte?.metodo_disposicion?.nombre === filtroMetodo;
      
      const cumpleRiesgo = filtroRiesgo === "TODOS" || muestra.riesgo_bioseguridad === filtroRiesgo;

      let cumpleFechas = true;
      if (muestra.reporte_descarte?.fecha_descarte) {
        const fechaMuestra = new Date(muestra.reporte_descarte.fecha_descarte);
        if (fechaInicio) {
          const inicio = new Date(fechaInicio);
          if (fechaMuestra < inicio) cumpleFechas = false;
        }
        if (fechaFin) {
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59);
          if (fechaMuestra > fin) cumpleFechas = false;
        }
      }
      return cumpleBusqueda && cumpleArea && cumpleMetodo && cumpleRiesgo && cumpleFechas;
    });

    setMuestrasFiltradas(filtrados);
    setCurrentPage(1); 
  }, [busqueda, filtroArea, filtroMetodo, filtroRiesgo, fechaInicio, fechaFin, muestrasOriginales]);

  const totalPages = Math.ceil(muestrasFiltradas.length / ITEMS_PER_PAGE);
  const muestrasPaginadas = muestrasFiltradas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hayFiltrosActivos = fechaInicio || fechaFin || filtroArea !== "TODOS" || filtroMetodo !== "TODOS" || filtroRiesgo !== "TODOS" || busqueda;

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-10">
        <div className="space-y-2 w-full md:w-auto text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-brand-primary text-white rounded-2xl shadow-lg shadow-indigo-100">
              <History size={24} />
            </div>
            <h1 className="font-title font-black text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tighter">
              Archivo Histórico
            </h1>
          </div>
          <p className="text-slate-500 text-[13px] sm:text-sm font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
            Gestión de auditoría para muestras que han completado su proceso de descarte institucional.
          </p>
        </div>
        
        <div className="w-full sm:w-auto md:min-w-[180px] bg-white border border-slate-200 px-6 py-3.5 rounded-[2rem] shadow-sm flex items-center justify-center md:justify-end gap-4 transition-all">
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expedientes</p>
            <p className="text-2xl font-black text-brand-primary leading-none">{loading ? "..." : muestrasFiltradas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-primary flex items-center justify-center shrink-0">
            <Archive size={18} />
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white/80  border border-slate-200 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/20 mb-10 sticky top-24 z-20 space-y-6">
        <SearchBar 
          value={busqueda} 
          onChange={setBusqueda} 
          placeholder="Filtrar expediente por código, lote o nombre del producto..." 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FilterSelect value={filtroArea} onChange={setFiltroArea} options={opcionesAreas} defaultLabel="Todas las Áreas" icon={MapPin} />
          <FilterSelect value={filtroRiesgo} onChange={setFiltroRiesgo} options={opcionesRiesgo} defaultLabel="Cualquier Riesgo" icon={ShieldAlert} />
          <FilterSelect value={filtroMetodo} onChange={setFiltroMetodo} options={opcionesMetodos} defaultLabel="Todos los Métodos" icon={Thermometer} />
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-2/3">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 focus:border-brand-primary outline-none transition-all cursor-pointer" />
              <span className="absolute -top-2 left-4 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Desde</span>
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 focus:border-brand-primary outline-none transition-all cursor-pointer" />
              <span className="absolute -top-2 left-4 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter">Hasta</span>
            </div>
          </div>

          {hayFiltrosActivos && (
            <button 
              onClick={() => { setBusqueda(""); setFiltroArea("TODOS"); setFiltroMetodo("TODOS"); setFiltroRiesgo("TODOS"); setFechaInicio(""); setFechaFin(""); }}
              className="w-full lg:w-auto px-6 py-3 text-[11px] font-black text-rose-500 uppercase hover:bg-rose-50 rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Trash2 size={14} /> Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="w-full relative min-h-[500px]">
        {loading ? null : muestrasFiltradas.length === 0 ? (
          <div className="py-32 text-center bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center">
            <SearchX size={48} className="text-slate-200 mb-4" />
            <p className="font-black text-slate-800 text-xl tracking-tight">Sin resultados</p>
            <p className="text-slate-400 mt-1 font-medium text-sm">No hay expedientes que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {muestrasPaginadas.map((muestra) => (
                <MuestraInactivaCard 
                  key={muestra.id} 
                  muestra={muestra} 
                  onClickExpediente={() => { setMuestraSeleccionada(muestra); setIsExpedienteModalOpen(true); }} 
                  onClickCertificado={() => { setMuestraSeleccionada(muestra); setIsCertificadoModalOpen(true); }} 
                />
              ))}
            </div>
            <div className="mt-12">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page: number) => { 
                  setCurrentPage(page); 
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }} 
              />
            </div>
          </>
        )}
      </div>

      <TrazabilidadModal 
        isOpen={isExpedienteModalOpen} 
        onClose={() => setIsExpedienteModalOpen(false)} 
        muestra={muestraSeleccionada} 
      />
      
      <CertificadoDescarteModal 
        isOpen={isCertificadoModalOpen} 
        onClose={() => setIsCertificadoModalOpen(false)} 
        muestra={muestraSeleccionada} 
      />
    </div>
  );
}