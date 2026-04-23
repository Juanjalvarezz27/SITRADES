"use client";

import { Package, Trash2, ShieldCheck, AlertTriangle, Biohazard } from "lucide-react";

interface KpiSummaryProps {
  muestras: any[];
}

export default function KpiSummary({ muestras }: KpiSummaryProps) {
  const total = muestras.length;
  const activas = muestras.filter(m => m.estado?.nombre.includes("Recibida") || m.estado?.nombre.includes("Vencida")).length;
  const paraDescarte = muestras.filter(m => m.estado?.nombre.includes("Retención Cumplida") || m.estado?.nombre.includes("Bolsa Roja")).length;
  const destruidas = muestras.filter(m => m.estado?.nombre.includes("Destruida")).length;
  
  // Métrica adicional de Riesgo (asumiendo que las palabras "Alto" o "Infeccioso" denotan riesgo)
  const altoRiesgo = muestras.filter(m => {
    const riesgo = (m.riesgo_bioseguridad || "").toLowerCase();
    return riesgo.includes("alto") || riesgo.includes("infeccioso") || riesgo.includes("peligro");
  }).length;

  const kpis = [
    {
      titulo: "Volumen Histórico",
      valor: total,
      icono: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      titulo: "Muestras Activas / Custodia",
      valor: activas,
      icono: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      titulo: "Muestras de Alto Riesgo",
      valor: altoRiesgo,
      icono: Biohazard,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    {
      titulo: "Cola de Descarte / Tránsito",
      valor: paraDescarte,
      icono: Trash2,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100"
    },
    {
      titulo: "Destruidas / Inactivadas",
      valor: destruidas,
      icono: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className={`bg-white border-2 ${kpi.border} p-5 md:p-6 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
            <kpi.icono size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{kpi.titulo}</p>
            <p className={`text-2xl md:text-3xl font-black ${kpi.color} leading-none mt-1.5`}>{kpi.valor}</p>
          </div>
        </div>
      ))}
    </div>
  );
}