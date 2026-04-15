"use client";

import { useState, useEffect, useCallback, SetStateAction } from "react";
import { 
  Loader2, 
  PackageX, 
  Trash2, 
  AlertOctagon, 
  SearchX
} from "lucide-react";
import { toast } from "react-toastify";
import SearchBar from "../../../components/ui/SearchBar";
import Pagination from "../../../components/ui/Pagination";
// IMPORTAMOS EL NUEVO COMPONENTE
import MuestraDescarteCard from "../../../components/muestras/MuestraDescarteCard";

const quitarAcentos = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function ColaDescartePage() {
  const [muestrasOriginales, setMuestrasOriginales] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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
      return (
        quitarAcentos(muestra.codigo_interno).includes(busquedaLimpia) ||
        quitarAcentos(muestra.lote).includes(busquedaLimpia) ||
        quitarAcentos(muestra.principio_activo).includes(busquedaLimpia)
      );
    });

    setMuestrasFiltradas(filtrados);
    setCurrentPage(1); 
  }, [busqueda, muestrasOriginales]);

  const totalPages = Math.ceil(muestrasFiltradas.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const muestrasPaginadas = muestrasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200">
              <Trash2 size={28} />
            </div>
            <h1 className="font-title font-black text-3xl sm:text-4xl text-slate-800 tracking-tighter">
              Cola de Descarte
            </h1>
          </div>
          <p className="text-slate-500 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
            Muestras que han cumplido su tiempo de retención legal (Res. 072) y requieren inicio del protocolo de segregación y destrucción.
          </p>
        </div>
        
        <div className="bg-rose-50/80 px-6 py-4 rounded-[2rem] border border-rose-100 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Pendientes</p>
            <p className="text-2xl font-black text-rose-700 leading-none">{muestrasFiltradas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <AlertOctagon size={20} />
          </div>
        </div>
      </div>

      {/* SEARCHBAR STICKY */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-5 rounded-[2.5rem] shadow-xl shadow-slate-200/20 mb-10 sticky top-24 z-20">
        <SearchBar 
          value={busqueda} 
          onChange={setBusqueda} 
          placeholder="Buscar muestra a descartar por código, lote o nombre..." 
        />
      </div>

      {/* GRID DE RESULTADOS */}
      <div className="w-full relative min-h-[500px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <span className="text-sm font-black text-rose-500 uppercase tracking-widest animate-pulse">Consultando pendientes...</span>
          </div>
        ) : muestrasFiltradas.length === 0 ? (
          <div className="py-32 text-center bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center animate-in zoom-in duration-500">
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
                />
              ))}
            </div>

            <div className="mt-12">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page: SetStateAction<number>) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}