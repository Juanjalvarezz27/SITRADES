"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  AlertTriangle, 
  Package, 
  Archive, 
  Trash2, 
  Clock, 
  Activity, 
  Loader2,
  ArrowRight,
  ShieldAlert,
  FlaskConical,
  User,
  Shield
} from "lucide-react";
import { toast } from "react-toastify";

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: 'no-store' });
        if (!res.ok) throw new Error("Error al cargar datos");
        const json = await res.json();
        setData(json);
      } catch (error) {
        toast.error("No se pudieron cargar las métricas del dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/50 z-50">
        <Loader2 size={48} className="animate-spin text-brand-primary mb-4" />
        <p className="text-slate-500 font-semibold animate-pulse">Cargando Panel de Control...</p>
      </div>
    );
  }

  const { kpis, recientes } = data;
  const primerNombre = session?.user?.name?.split(" ")[0] || "Usuario";
  const ultimosTres = recientes.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto space-y-8">
      
      {/* SECCIÓN HERO PREMIUM CON DATOS DEL USUARIO */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight flex items-center gap-3">
            ¡Hola, {primerNombre}! 
          </h1>
          <p className="text-slate-500 font-medium mt-1.5 max-w-xl">
            Bienvenido al Panel de Control Ejecutivo de SITRADES.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-100 flex-1 md:flex-none">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0"><User size={18} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Usuario Activo</p>
              <p className="text-[13px] font-bold text-slate-700 truncate pr-2">{session?.user?.name || "Cargando..."}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-100 flex-1 md:flex-none">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shrink-0"><Shield size={18} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nivel de Acceso</p>
              <p className="text-[13px] font-black text-purple-700 truncate pr-2">{(session?.user as any)?.rol || "Cargando..."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE ALERTAS PROACTIVAS */}
      {(kpis.pendientesDescarte > 0 || kpis.vencenPronto > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {kpis.pendientesDescarte > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-[2rem] p-6 text-white shadow-lg shadow-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-8 opacity-10">
                <Trash2 size={120} />
              </div>
              <div className="flex items-start gap-4 z-10">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shrink-0">
                  <AlertTriangle size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight mb-1">Atención Requerida</h3>
                  <p className="text-red-100 font-medium text-sm leading-tight max-w-[280px]">
                    Hay <strong className="text-white text-base">{kpis.pendientesDescarte} expedientes</strong> con tiempo de retención legal cumplido esperando ejecución de descarte.
                  </p>
                </div>
              </div>
              <Link href="/home/muestras/descarte" className="w-full sm:w-auto px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-sm hover:bg-red-50 transition-all text-sm whitespace-nowrap text-center z-10 flex items-center justify-center gap-2">
                Ir a Cola de Descarte <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {kpis.vencenPronto > 0 && (
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-[2rem] p-6 text-white shadow-lg shadow-yellow-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-8 opacity-10">
                <Clock size={120} />
              </div>
              <div className="flex items-start gap-4 z-10">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shrink-0">
                  <ShieldAlert size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight mb-1">Alerta Temprana</h3>
                  <p className="text-yellow-100 font-medium text-sm leading-tight max-w-[280px]">
                    Existen <strong className="text-white text-base">{kpis.vencenPronto} muestras</strong> que caducarán en los próximos 30 días.
                  </p>
                </div>
              </div>
              <Link href="/home/muestras" className="w-full sm:w-auto px-6 py-3 bg-white text-yellow-700 font-bold rounded-xl shadow-sm hover:bg-yellow-50 transition-all text-sm whitespace-nowrap text-center z-10">
                Revisar Inventario
              </Link>
            </div>
          )}
        </div>
      )}

      {/* GRID DE KPIs (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl group-hover:bg-brand-primary/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl"><Package size={20} /></div>
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Inventario Activo</h3>
          </div>
          <p className="text-4xl font-black text-slate-800 z-10">{kpis.totalActivas}</p>
          <p className="text-sm font-medium text-emerald-500 mt-2 flex items-center gap-1 z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> En custodia legal
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2.5 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></div>
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Por Descartar</h3>
          </div>
          <p className="text-4xl font-black text-slate-800 z-10">{kpis.pendientesDescarte}</p>
          <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1 z-10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Requieren acción
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl"><Clock size={20} /></div>
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Vencen Pronto</h3>
          </div>
          <p className="text-4xl font-black text-slate-800 z-10">{kpis.vencenPronto}</p>
          <p className="text-sm font-medium text-yellow-600 mt-2 flex items-center gap-1 z-10">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Próximos 30 días
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-400/5 rounded-full blur-xl group-hover:bg-slate-400/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Archive size={20} /></div>
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Histórico (Baja)</h3>
          </div>
          <p className="text-4xl font-black text-slate-800 z-10">{kpis.historico}</p>
          <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1 z-10">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Destrucciones avaladas
          </p>
        </div>

      </div>

      {/* ACTIVIDAD RECIENTE (Bento Style) */}
      <div className="flex flex-col gap-6 pt-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-secondary/10 text-brand-secondary rounded-xl shadow-sm border border-brand-secondary/20">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <h2 className="font-title font-black text-2xl text-slate-800 tracking-tight">Últimos Ingresos</h2>
          </div>
          <Link href="/home/muestras" className="text-[13px] text-center font-bold text-brand-primary bg-white border border-slate-200 shadow-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
            Ver inventario completo
          </Link>
        </div>
        
        {ultimosTres.length === 0 ? (
          <div className="bg-white border border-slate-100 p-10 text-center flex flex-col items-center justify-center rounded-[2rem] shadow-sm">
            <Archive size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No hay registros recientes en el sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {ultimosTres.map((muestra: any) => (
              <div 
                key={muestra.id} 
                className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between min-h-[220px]"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl group-hover:bg-brand-primary/5 transition-colors"></div>

                <div className="flex items-start justify-between z-10 mb-4">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary group-hover:border-transparent transition-all shadow-sm">
                    <FlaskConical size={26} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                    <Clock size={12} /> {formatearFecha(muestra.creado_en)}
                  </span>
                </div>

                <div className="z-10 flex-1 flex flex-col justify-end">
                  <h4 className="font-black text-[22px] text-slate-800 tracking-tight leading-none mb-2 truncate">
                    {muestra.codigo_interno}
                  </h4>
                  <p className="text-[13px] font-medium text-slate-500 line-clamp-2 leading-snug mb-5 h-[36px]">
                    {muestra.principio_activo}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1.5 rounded-lg bg-brand-secondary/10 text-brand-secondary text-[10px] font-black uppercase tracking-wider">
                      LOTE: {muestra.lote}
                    </span>
                    <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold truncate max-w-[140px]">
                      {muestra.area?.nombre || "Sin área asignada"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}