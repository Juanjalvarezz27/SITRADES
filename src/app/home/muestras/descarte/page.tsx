"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  PackageX, 
  Trash2, 
  AlertOctagon, 
  MapPin
} from "lucide-react";
import { toast } from "react-toastify";

// Ajusta estas rutas de importación según la estructura exacta de tus carpetas
import SearchBar from "../../../components/ui/SearchBar";
import Pagination from "../../../components/ui/Pagination";
import FilterSelect from "../../../components/ui/FilterSelect";
import MuestraDescarteCard from "../../../components/muestras/MuestraDescarteCard";
import AnularMuestraModal from "../../../components/muestras/AnularMuestraModal"; 

const quitarAcentos = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function ColaDescartePage() {
  const { data: session } = useSession(); // <-- SESIÓN PARA EL ROL
  const userRol = (session?.user as any)?.rol || "";

  const [muestrasOriginales, setMuestrasOriginales] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState("TODOS");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // ESTADOS PARA EL MODAL DE ANULACIÓN
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any | null>(null);

  const opcionesAreas = Array.from(
    new Set(muestrasOriginales.map((m) => m.area?.nombre))
  )
    .filter(Boolean)
    .sort()
    .map((nombre) => ({ value: nombre as string, label: nombre as string }));

  const fetchMuestras = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/muestras?fase=descarte", { cache: 'no-store' });
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setMuestrasOriginales(data);
      setMuestrasFiltradas(data);
    } catch (error) {
      toast.error("Error al conectar con la cola de descarte.");
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
      
      const cumpleBusqueda = (
        quitarAcentos(muestra.codigo_interno).includes(busquedaLimpia) ||
        quitarAcentos(muestra.lote).includes(busquedaLimpia) ||
        quitarAcentos(muestra.principio_activo).includes(busquedaLimpia)
      );

      const cumpleArea = filtroArea === "TODOS" || muestra.area?.nombre === filtroArea;

      return cumpleBusqueda && cumpleArea;
    });

    setMuestrasFiltradas(filtrados);
    setCurrentPage(1); 
  }, [busqueda, filtroArea, muestrasOriginales]);

  const totalPages = Math.ceil(muestrasFiltradas.length / ITEMS_PER_PAGE);
  const muestrasPaginadas = muestrasFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto relative">
      
      {/* HEADER CON CONTADOR RESPONSIVO EQUILIBRADO */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-10">
        <div className="space-y-2 w-full md:w-auto text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-100">
              <Trash2 size={24} />
            </div>
            <h1 className="font-title font-black text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tighter">
              Cola de Descarte
            </h1>
          </div>
          <p className="text-slate-500 text-[13px] sm:text-sm font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
            Muestras con tiempo de retención legal cumplido (Res. 072) que requieren destrucción.
          </p>
        </div>
        
        {/* Contador: Optimizado para no ser invasivo */}
        <div className="w-full sm:w-auto md:min-w-[180px] bg-white border border-slate-200 px-6 py-3.5 rounded-[2rem] shadow-sm flex items-center justify-center md:justify-end gap-4 transition-all">
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-0.5">
              Pendientes
            </p>
            <p className="text-2xl font-black text-rose-700 leading-none">
              {loading ? "..." : muestrasFiltradas.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertOctagon size={18} />
          </div>
        </div>
      </div>

      {/* SEARCHBAR & FILTERS STICKY */}
      <div className="bg-white/80  border border-slate-200 p-5 rounded-[2.5rem] shadow-xl shadow-slate-200/20 mb-10 sticky top-24 z-20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar 
              value={busqueda} 
              onChange={setBusqueda} 
              placeholder="Buscar muestra a descartar por código, lote o nombre..." 
            />
          </div>
          <div className="w-full lg:w-72">
            <FilterSelect
              value={filtroArea}
              onChange={setFiltroArea}
              options={opcionesAreas}
              defaultLabel="Todas las Áreas"
              icon={MapPin}
            />
          </div>
        </div>
      </div>

      {/* GRID DE RESULTADOS */}
      <div className="w-full relative min-h-[400px]">
        {loading ? null : muestrasFiltradas.length === 0 ? (
          <div className="py-32 text-center bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <PackageX size={40} className="text-emerald-500" />
            </div>
            <p className="font-black text-slate-800 text-xl tracking-tight">Sala de espera despejada</p>
            <p className="text-slate-500 mt-2 font-medium text-sm">No hay muestras pendientes por destruir en este momento.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {muestrasPaginadas.map((muestra) => (
                <MuestraDescarteCard 
                  key={muestra.id} 
                  muestra={muestra} 
                  userRol={userRol} // <-- PASAMOS EL ROL
                  onAnular={() => { // <-- PASAMOS LA FUNCIÓN
                    setMuestraSeleccionada(muestra);
                    setIsAnularModalOpen(true);
                  }}
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

      {/* MODAL DE ANULACIÓN */}
      <AnularMuestraModal 
        isOpen={isAnularModalOpen} 
        onClose={() => setIsAnularModalOpen(false)} 
        muestra={muestraSeleccionada} 
        onSuccess={fetchMuestras} 
      />

    </div>
  );
}