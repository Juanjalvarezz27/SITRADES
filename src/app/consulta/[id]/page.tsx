"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Package, MapPin, Calendar, ShieldAlert, FlaskConical, 
  Loader2, Activity, CheckCircle2, XCircle, Archive 
} from "lucide-react";

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

export default function ConsultaMuestraPage() {
  const params = useParams();
  const id = params.id as string;

  const [muestra, setMuestra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMuestra = async () => {
      try {
        const res = await fetch(`/api/consulta/${id}`);
        
        if (!res.ok) {
          throw new Error("No se pudo localizar el expediente de esta muestra o ha sido eliminado.");
        }

        const encontrada = await res.json();
        setMuestra(encontrada);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMuestra();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-primary mb-4" size={48} />
        <p className="text-slate-600 font-bold animate-pulse">Consultando base de datos segura...</p>
      </div>
    );
  }

  if (error || !muestra) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <XCircle size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Expediente Inválido</h1>
        <p className="text-slate-500 font-medium">{error}</p>
      </div>
    );
  }

  // --- LÓGICA DE ESTADOS DINÁMICOS ---
  const hoy = new Date();
  const fechaCaducidad = new Date(muestra.fecha_caducidad);
  
  // Validamos si la muestra ya pasó por el proceso de destrucción
  const esDestruida = muestra.estado_id === 4 || muestra.estado?.nombre?.includes("Destruida");
  const estaVencida = hoy >= fechaCaducidad && !esDestruida;

  // Configuramos el banner dependiendo del estado
  let bannerConfig = {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 size={20} />,
    texto: "MUESTRA VIGENTE Y ACTIVA"
  };

  if (esDestruida) {
    bannerConfig = {
      color: "bg-slate-100 text-slate-600 border-slate-300 shadow-inner",
      icon: <Archive size={20} />,
      texto: "MUESTRA DESTRUIDA / INACTIVA"
    };
  } else if (estaVencida) {
    bannerConfig = {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <ShieldAlert size={20} />,
      texto: "MUESTRA VENCIDA (EN CUSTODIA)"
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:p-10 flex justify-center items-start">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-brand-primary/10 overflow-hidden border border-slate-100">
        
        {/* Banner Superior */}
        <div className={`p-8 text-center relative overflow-hidden ${esDestruida ? 'bg-slate-700' : 'bg-gradient-to-br from-brand-primary to-brand-secondary'}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 ${esDestruida ? 'text-slate-700 opacity-80' : 'text-brand-primary'}`}>
              {esDestruida ? <Archive size={36} strokeWidth={2} /> : <FlaskConical size={36} strokeWidth={2} />}
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">
              {muestra.principio_activo}
            </h1>
            <p className="text-white/80 text-[13px] font-bold mt-1 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-lg">
              Cod: {muestra.codigo_interno}
            </p>
          </div>
        </div>

        {/* Estado de la Muestra */}
        <div className="px-8 -mt-6 relative z-20">
          <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 font-bold border shadow-md ${bannerConfig.color}`}>
            {bannerConfig.icon}
            {bannerConfig.texto}
          </div>
        </div>

        {/* Datos Técnicos */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Lote</span>
              <span className="font-bold text-slate-800 text-[15px]">{muestra.lote}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cantidad Total</span>
              <span className="font-bold text-brand-primary text-[15px]">{muestra.cantidad} {muestra.unidad_medida?.nombre}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl shrink-0"><Calendar size={20} /></div>
              <div>
                <span className="block text-[11px] font-black text-slate-400 uppercase">Fecha de Caducidad</span>
                <span className="font-bold text-slate-700 block">{formatearFecha(muestra.fecha_caducidad)}</span>
              </div>
            </div>

            {/* SI ESTÁ DESTRUIDA, MOSTRAMOS LOS DATOS DE DESTRUCCIÓN */}
            {esDestruida && muestra.reporte_descarte ? (
              <div className="flex items-start gap-4 p-3 -mx-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2.5 bg-white text-slate-500 rounded-xl shadow-sm border border-slate-100 shrink-0"><Archive size={20} /></div>
                <div>
                  <span className="block text-[11px] font-black text-slate-400 uppercase">Proceso de Descarte</span>
                  <span className="font-bold text-slate-700 block">Ejecutado el {formatearFecha(muestra.reporte_descarte.fecha_descarte)}</span>
                  <span className="text-[13px] font-medium text-slate-500 block leading-tight mt-0.5">{muestra.reporte_descarte.metodo_disposicion?.nombre}</span>
                </div>
              </div>
            ) : (
              /* SI NO ESTÁ DESTRUIDA, MOSTRAMOS SU UBICACIÓN FÍSICA */
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl shrink-0"><MapPin size={20} /></div>
                <div>
                  <span className="block text-[11px] font-black text-slate-400 uppercase">Ubicación Actual</span>
                  <span className="font-bold text-slate-700 block">{muestra.area?.nombre || "N/A"}</span>
                  <span className="text-[13px] font-medium text-slate-500">{muestra.area?.direccion?.nombre}</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl shrink-0"><Activity size={20} /></div>
              <div>
                <span className="block text-[11px] font-black text-slate-400 uppercase">Nivel de Riesgo</span>
                <span className="font-bold text-slate-700 block">{muestra.riesgo_bioseguridad}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de Verificación */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
            SITRADES • Verificación Segura
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Escaneado el {new Date().toLocaleDateString("es-VE")}
          </p>
        </div>

      </div>
    </div>
  );
}