"use client";

import { useState, useEffect, useCallback, SetStateAction } from "react";
import { 
  Archive, Loader2, PackageX, MapPin, Eye, Trash2, 
  History, SearchX, FileSignature, ClipboardCheck, CalendarDays
} from "lucide-react";
import { toast } from "react-toastify";
import SearchBar from "../../../components/ui/SearchBar";
import TrazabilidadModal from "../../../components/muestras/TrazabilidadModal";
import Pagination from "../../../components/ui/Pagination";
import CertificadoDescarteModal from "../../../components/muestras/CertificadoDescarteModal"; 

const quitarAcentos = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { 
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC" 
  });
};

// --- TARJETA DEL ARCHIVO HISTÓRICO ---
function MuestraInactivaCard({ muestra, onClickExpediente, onClickCertificado }: { muestra: any, onClickExpediente: () => void, onClickCertificado: () => void }) {
  
  const fechaDescarte = muestra.reporte_descarte?.fecha_descarte;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-20" />

      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-brand-primary flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110">
            <PackageX size={28} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 bg-blue-50 text-brand-primary border-blue-200">
              <Trash2 size={12} strokeWidth={3} />
              Archivo Final
            </span>
            <h3 className="text-[17px] font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
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

        {/* NUEVA CAJA: DATOS TÉCNICOS (Sustituye al tratamiento) */}
        <div className="p-4 rounded-2xl border transition-all bg-slate-50/50 border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm">
              <ClipboardCheck size={16} />
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wide">Registro Sanitario</span>
              <span className="block text-slate-700 font-black text-[12px]">{muestra.registro_sanitario || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm">
              <CalendarDays size={16} />
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wide">Fecha de Ingreso</span>
              <span className="block text-slate-700 font-black text-[12px]">{formatearFecha(muestra.fecha_ingreso)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
          <MapPin size={18} className="text-blue-400 shrink-0" />
          <div className="leading-tight text-[12px] text-slate-500 font-medium">
            Originario de: <span className="text-slate-800 font-bold">{muestra.area?.nombre || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10 flex flex-col gap-2">
        <button 
          onClick={onClickExpediente}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-brand-primary text-slate-600 hover:text-white font-black text-[13px] rounded-2xl transition-all duration-300 border border-slate-200 hover:border-slate-900 shadow-sm"
        >
          <Eye size={18} /> Ver Expediente Histórico
        </button>
        
        <button 
          onClick={onClickCertificado}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-brand-primary text-brand-primary hover:text-white font-black text-[13px] rounded-2xl transition-all duration-300 border border-blue-100 hover:border-brand-primary shadow-sm"
        >
          <FileSignature size={18} /> Ver Acta de Descarte
        </button>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function InventarioInactivoPage() {
  const [muestrasOriginales, setMuestrasOriginales] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any | null>(null);
  const [isExpedienteModalOpen, setIsExpedienteModalOpen] = useState(false);
  const [isCertificadoModalOpen, setIsCertificadoModalOpen] = useState(false);

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

  const handleOpenExpediente = (muestra: any) => {
    setMuestraSeleccionada(muestra);
    setIsExpedienteModalOpen(true);
  };

  const handleOpenCertificado = (muestra: any) => {
    setMuestraSeleccionada(muestra);
    setIsCertificadoModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-indigo-200">
              <History size={28} />
            </div>
            <h1 className="font-title font-black text-3xl sm:text-4xl text-slate-800 tracking-tighter">
              Archivo Histórico
            </h1>
          </div>
          <p className="text-slate-500 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
            Gestión de auditoría para muestras que han completado su proceso de descarte institucional.
          </p>
        </div>
        
        <div className="bg-indigo-50/50 px-6 py-4 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Registros</p>
            <p className="text-2xl font-black text-indigo-900 leading-none">{muestrasFiltradas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Archive size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-5 rounded-[2.5rem] shadow-xl shadow-slate-200/20 mb-10 flex flex-col gap-5 sticky top-24 z-20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Filtrar expediente por código, lote o nombre del producto..." />
          </div>
        </div>
      </div>

      <div className="w-full relative min-h-[500px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <span className="text-sm font-black text-indigo-500 uppercase tracking-widest animate-pulse">Consultando Archivo...</span>
          </div>
        ) : muestrasFiltradas.length === 0 ? (
          <div className="py-32 text-center bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center animate-in zoom-in duration-500">
            <SearchX size={48} className="text-slate-200 mb-4" />
            <p className="font-black text-slate-800 text-xl tracking-tight">Sin resultados</p>
            <p className="text-slate-400 mt-1 font-medium text-sm">No hay expedientes históricos que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {muestrasPaginadas.map((muestra) => (
                <MuestraInactivaCard 
                  key={muestra.id} 
                  muestra={muestra} 
                  onClickExpediente={() => handleOpenExpediente(muestra)} 
                  onClickCertificado={() => handleOpenCertificado(muestra)} 
                />
              ))}
            </div>

            <div className="mt-12">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page: SetStateAction<number>) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
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