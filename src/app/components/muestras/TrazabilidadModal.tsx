"use client";

import { useState, useEffect } from "react";
import { 
  X, Loader2, Activity, User, Calendar, FileText, 
  ShieldAlert, ArrowRight, MapPin, Package, Clock, Info, ChevronDown
} from "lucide-react";
import { toast } from "react-toastify";

interface TrazabilidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: any | null;
}

const formatearFechaHora = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleString("es-VE", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
  });
};

export default function TrazabilidadModal({ isOpen, onClose, muestra }: TrazabilidadModalProps) {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  useEffect(() => {
    if (isOpen && muestra?.id) {
      const fetchHistorial = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/muestras/${muestra.id}/trazabilidad`);
          if (!res.ok) throw new Error("Error al cargar historial");
          const data = await res.json();
          setHistorial(data);
        } catch (error) {
          toast.error("No se pudo cargar la línea de tiempo.");
        } finally {
          setLoading(false);
        }
      };
      fetchHistorial();
      setIsTimelineOpen(false); 
    }
  }, [isOpen, muestra]);

  if (!isOpen || !muestra) return null;

  const hoy = new Date();
  const fechaRetencion = new Date(muestra.fecha_fin_retencion);
  const esDescartable = hoy >= fechaRetencion;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/70 transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Activity className="text-brand-primary" size={24} />
              Expediente de Auditoría
            </h2>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
              Código: <span className="text-brand-primary">{muestra.codigo_interno}</span> • Lote: <span className="text-brand-primary">{muestra.lote}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BLOQUE 1: Identificación */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b border-slate-200 pb-2">
                <Package size={18} className="text-brand-primary" /> Identificación del Producto
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Principio Activo</span>
                  <p className="font-bold text-slate-700 text-[13px] leading-tight">{muestra.principio_activo}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Reg. Sanitario</span>
                  <p className="font-bold text-slate-700 text-[13px]">{muestra.registro_sanitario}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Cantidad Total</span>
                  <p className="font-black text-brand-primary text-[15px]">{muestra.cantidad} <span className="text-[12px] font-bold text-slate-500">{muestra.unidad_medida}</span></p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Tipo de Empaque</span>
                  <p className="font-bold text-slate-700 text-[13px] leading-tight">{muestra.tipo_empaque}</p>
                </div>
              </div>
            </div>

            {/* BLOQUE 2: Logística y Bioseguridad */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b border-slate-200 pb-2">
                <MapPin size={18} className="text-brand-secondary" /> Logística y Bioseguridad
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Ubicación Física</span>
                    <p className="font-bold text-slate-700 text-[13px] leading-snug">
                      {muestra.area?.nombre || "Sin área"} <br/>
                      <span className="font-medium text-slate-500">
                        {muestra.area?.direccion?.nombre} • {muestra.area?.direccion?.piso?.nombre}
                      </span>
                    </p>
                    {muestra.ubicacion_detalle && (
                      <p className="mt-2 text-[12px] text-slate-500 bg-white p-2 rounded-xl border border-slate-100 shadow-sm inline-block">
                        <strong className="text-brand-secondary">Nota:</strong> {muestra.ubicacion_detalle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Nivel de Riesgo</span>
                    <p className="font-bold text-amber-700 text-[13px]">{muestra.riesgo_bioseguridad}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOQUE 3: Tiempos Legales */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b border-slate-200 pb-2">
                <Clock size={18} className="text-blue-500" /> Tiempos Legales (Res. N° 072)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ingreso</span>
                  <p className="font-bold text-slate-700 text-[12px]">{formatearFecha(muestra.creado_en)}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Caducidad</span>
                  <p className="font-bold text-amber-900 text-[12px]">{formatearFecha(muestra.fecha_caducidad)}</p>
                </div>
                <div className={`p-2.5 rounded-xl border shadow-sm ${esDescartable ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <span className={`text-[10px] font-bold uppercase block mb-1 ${esDescartable ? 'text-red-600' : 'text-blue-600'}`}>Fin Retención</span>
                  <p className={`font-bold text-[12px] ${esDescartable ? 'text-red-700' : 'text-blue-900'}`}>{formatearFecha(muestra.fecha_fin_retencion)}</p>
                </div>
              </div>
            </div>

            {/* BLOQUE 4: Contexto Operativo */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-3 border-b border-slate-200 pb-2">
                <Info size={18} className="text-slate-500" /> Contexto Operativo
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Propósito del Análisis</span>
                  <p className="text-[13px] text-slate-600 leading-snug line-clamp-2" title={muestra.proposito_analisis}>
                    {muestra.proposito_analisis}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <User size={14} className="text-brand-primary" /> 
                  Registrado por: <strong className="text-slate-700 truncate">{muestra.usuarioRegistrador?.nombre || "Sistema"}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* LÍNEA DE TIEMPO DESPLEGABLE */}
          <div className="mt-4 pt-2">
            <button 
              onClick={() => setIsTimelineOpen(!isTimelineOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${isTimelineOpen ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary shadow-sm group-hover:bg-brand-primary/10'}`}>
                  <Activity size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 text-[15px]">Línea de Tiempo de Sucesos</h3>
                  <p className="text-[12px] text-slate-500 font-medium">Ver el historial completo de auditoría y movimientos ({historial.length} registros)</p>
                </div>
              </div>
              <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${isTimelineOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isTimelineOpen ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-brand-primary">
                  <Loader2 className="animate-spin mb-2" size={28} />
                  <span className="text-sm font-bold">Cargando historial...</span>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-5 pb-4 space-y-8">
                  {historial.map((hito, index) => (
                    <div key={hito.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${index === 0 ? 'bg-brand-primary' : 'bg-slate-300'}`} />
                      
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">
                            <Calendar size={12} /> {formatearFechaHora(hito.fecha_cambio)}
                          </p>
                          <span className="px-2 py-0.5 bg-white border rounded-md text-[10px] font-bold text-slate-500">
                            Paso #{historial.length - index}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-2">
                          {hito.estado_anterior_id !== hito.estado_nuevo_id && (
                            <>
                              <span className="text-slate-400 line-through decoration-red-400">{hito.estado_anterior.nombre}</span>
                              <ArrowRight size={14} className="text-brand-primary" />
                            </>
                          )}
                          <span className="text-brand-primary">{hito.estado_nuevo.nombre}</span>
                        </div>

                        <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
                          <FileText size={14} className="inline mr-1 text-slate-400" />
                          {hito.motivo}
                        </p>

                        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500 border-t pt-2">
                          {hito.usuario?.nombre ? (
                            <>
                              <User size={12} className="text-slate-400" />
                              {hito.usuario.nombre} <span className="font-normal">({hito.usuario.rol?.nombre})</span>
                            </>
                          ) : (
                            <>
                              <Activity size={12} className="text-brand-primary" />
                              <span className="text-brand-primary uppercase tracking-wider">Sistema Automático (Robot de Auditoría)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER & ACCIONES */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
          <div className="text-[13px] font-medium text-slate-500 hidden sm:block">
            Última actualización: {historial[0] ? formatearFechaHora(historial[0].fecha_cambio) : "..."}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold text-[14px] bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-800 transition-colors text-center">
              Cerrar Expediente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}