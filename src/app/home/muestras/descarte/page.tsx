"use client";

import { useState, useEffect, useCallback, SetStateAction } from "react";
import Link from "next/link";
import { 
  Loader2, 
  PackageX, 
  MapPin, 
  ShieldAlert, 
  Trash2, 
  AlertOctagon, 
  SearchX,
  ArrowRight,
  Clock
} from "lucide-react";
import { toast } from "react-toastify";
import SearchBar from "../../../components/ui/SearchBar";
import Pagination from "../../../components/ui/Pagination";

const quitarAcentos = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { 
    year: "numeric", 
    month: "short", 
    day: "numeric", 
    timeZone: "UTC" 
  });
};

// --- TARJETA DE LA COLA DE DESCARTE (Alerta Visual) ---
function MuestraDescarteCard({ muestra }: { muestra: any }) {
  return (
    <div className="bg-white border-2 border-rose-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      
      {/* Indicador de urgencia */}
      <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-50 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700" />

      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-red-50 text-rose-600 flex items-center justify-center shrink-0 shadow-inner group-hover:animate-pulse">
            <AlertOctagon size={28} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 bg-rose-50 text-rose-700 border-rose-200">
              <ShieldAlert size={12} strokeWidth={3} />
              Retención Cumplida
            </span>
            <h3 className="text-[17px] font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-rose-600 transition-colors">
              {muestra.principio_activo}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-6 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Código</span>
            <span className="font-black text-slate-700 text-[13px] truncate block">{muestra.codigo_interno}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="block text-slate-400 font-bold text-[10px] uppercase mb-1">Lote</span>
            <span className="font-black text-slate-700 text-[13px] truncate block">{muestra.lote}</span>
          </div>
        </div>

        {/* ALERTA DE VENCIMIENTO */}
        <div className="p-4 rounded-2xl border bg-rose-50/50 border-rose-200/60 flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="block text-rose-800 font-black text-[12px] uppercase tracking-wide">Tiempo de Custodia Agotado</span>
            <span className="text-[11px] text-rose-600/80 font-bold">Venció el {formatearFecha(muestra.fecha_fin_retencion)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="leading-tight text-[13px] text-slate-500">
            <strong className="text-slate-800 block mb-1 font-bold">Ubicación Física a Despejar</strong>
            <span className="text-[12px] font-medium">{muestra.area?.nombre || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        {/* AQUÍ ESTÁ LA MAGIA: Nos lleva a la página individual de descarte */}
        <Link 
          href={`/home/muestras/${muestra.id}/descarte`}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[14px] rounded-2xl transition-all duration-300 shadow-md shadow-rose-600/20 active:scale-[0.98]"
        >
          <Trash2 size={18} /> Iniciar Protocolo de Descarte <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function ColaDescartePage() {
  const [muestrasOriginales, setMuestrasOriginales] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchMuestras = useCallback(async () => {
    setLoading(true);
    try {
      // Le pedimos a la API solo la fase de descarte
      const res = await fetch("/api/muestras?fase=descarte");
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

  // Cálculos de Paginación
  const totalPages = Math.ceil(muestrasFiltradas.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const muestrasPaginadas = muestrasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 relative">
      
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

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-5 rounded-[2.5rem] shadow-xl shadow-slate-200/20 mb-10 flex flex-col gap-5 sticky top-24 z-20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar 
              value={busqueda} 
              onChange={setBusqueda} 
              placeholder="Buscar muestra a descartar por código, lote o nombre..." 
            />
          </div>
        </div>
      </div>

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