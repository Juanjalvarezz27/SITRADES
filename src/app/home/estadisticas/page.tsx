"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import KpiSummary from "../../components/estadisticas/KpiSummary";
import ChartsView from "../../components/estadisticas/ChartsView";

export default function EstadisticasPage() {
  const [muestrasGlobales, setMuestrasGlobales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaLaData = useCallback(async () => {
    setLoading(true);
    try {
      // Hacemos las 3 peticiones en paralelo para que la carga sea ultrarrápida
      const [resActivas, resDescarte, resInactivas] = await Promise.all([
        fetch(`/api/muestras?fase=activa`, { cache: 'no-store' }),
        fetch(`/api/muestras?fase=descarte`, { cache: 'no-store' }),
        fetch(`/api/muestras?fase=inactiva`, { cache: 'no-store' })
      ]);

      if (!resActivas.ok || !resDescarte.ok || !resInactivas.ok) {
        throw new Error("Error obteniendo datos del servidor.");
      }

      const [dataActivas, dataDescarte, dataInactivas] = await Promise.all([
        resActivas.json(),
        resDescarte.json(),
        resInactivas.json()
      ]);

      // Unificamos todo el universo de datos en un solo array para los componentes
      const dataUnificada = [...dataActivas, ...dataDescarte, ...dataInactivas];
      setMuestrasGlobales(dataUnificada);

    } catch (error) {
      console.error(error);
      toast.error("Error técnico al cargar las métricas del sistema.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaLaData();
  }, [fetchTodaLaData]);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto min-h-screen">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-10">
        <div className="space-y-2 w-full text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200">
              <BarChart3 size={24} />
            </div>
            <h1 className="font-title font-black text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tighter">
              Inteligencia Operativa
            </h1>
          </div>
          <p className="text-slate-500 text-[13px] sm:text-sm font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
            Métricas globales y análisis en tiempo real del ciclo de vida de los residuos del INHRR.
          </p>
        </div>
      </div>

      {/* ESTADOS DE CARGA Y VACÍO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
          <p className="font-bold tracking-widest uppercase text-sm">Analizando volumen de datos...</p>
        </div>
      ) : muestrasGlobales.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[3rem] p-16 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-2">Sistema en blanco</h3>
          <p className="text-slate-500 font-medium">Comience a registrar muestras en los laboratorios para visualizar el rendimiento del sistema.</p>
        </div>
      ) : (
        /* RENDERIZADO DEL DASHBOARD COMPLETO */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* 1. Tarjetas de Resumen Rápido (Top) */}
          <KpiSummary muestras={muestrasGlobales} />

          {/* 2. Panel de Gráficos Detallados (Bottom) */}
          <ChartsView muestras={muestrasGlobales} />
          
        </div>
      )}

    </div>
  );
}