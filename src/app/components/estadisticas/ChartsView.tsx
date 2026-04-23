"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";

interface ChartsViewProps {
  muestras: any[];
}

const COLORS_ESTADOS = ['#4f46e5', '#e11d48', '#10b981', '#f59e0b', '#64748b'];
const COLORS_RIESGOS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const COLORS_BARRAS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#06b6d4', '#84cc16'];

export default function ChartsView({ muestras }: ChartsViewProps) {
  
  // 1. DATA: Estados (SE QUEDA IGUAL)
  const dataEstados = useMemo(() => {
    const conteo = muestras.reduce((acc: any, m: any) => {
      let label = m.estado?.nombre || "Desconocido";
      if (label.includes("Recibida")) label = "Activas";
      if (label.includes("Vencida")) label = "Vencidas";
      if (label.includes("Retención")) label = "Descartables";
      if (label.includes("Recolección")) label = "En Tránsito";
      if (label.includes("Destruida")) label = "Destruidas";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(conteo).map(key => ({ name: key, valor: conteo[key] })).sort((a, b) => b.valor - a.valor);
  }, [muestras]);

  // 2. DATA: Áreas (ESCALABLE)
  const dataAreas = useMemo(() => {
    const conteo = muestras.reduce((acc: any, m: any) => {
      const nombre = m.area?.nombre || "Sin Área";
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(conteo)
      .map(key => ({ name: key, cantidad: conteo[key] }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [muestras]);

  // 3. DATA: Personal (ESCALABLE)
  const dataPersonal = useMemo(() => {
    const conteo = muestras.reduce((acc: any, m: any) => {
      const nombre = m.usuarioRegistrador?.nombre || "Desconocido";
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(conteo)
      .map(key => ({ name: key, cantidad: conteo[key] }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [muestras]);

// 4. DATA: Riesgo (SE QUEDA IGUAL)
  const dataRiesgos = useMemo(() => {
    const conteo = muestras.reduce((acc: any, m: any) => {
      const nombre = m.riesgo_bioseguridad || "No evaluado";
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(conteo).map(key => ({ name: key, valor: conteo[key] }));
  }, [muestras]);

  // 5. DATA: Empaque (ESCALABLE)
  const dataEmpaques = useMemo(() => {
    const conteo = muestras.reduce((acc: any, m: any) => {
      const nombre = m.tipo_empaque?.nombre || "No especificado";
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(conteo).map(key => ({ name: key, cantidad: conteo[key] }));
  }, [muestras]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.name}</p>
          <p className="text-2xl font-black text-white leading-none">{payload[0].value} <span className="text-[12px] font-medium text-slate-300">muestras</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8 space-y-8">
      
      {/* FILA 1: PIE CHARTS (LO QUE TE GUSTÓ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución de Estados */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-[450px]">
          <h3 className="font-black text-slate-800 text-[16px] uppercase tracking-wider mb-6">Distribución de Estados</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataEstados} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="valor" stroke="none">
                  {dataEstados.map((_, i) => <Cell key={i} fill={COLORS_ESTADOS[i % COLORS_ESTADOS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clasificación de Riesgo */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-[450px]">
          <h3 className="font-black text-slate-800 text-[16px] uppercase tracking-wider mb-6">Nivel de Riesgo Biológico</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataRiesgos} cx="50%" cy="50%" innerRadius={0} outerRadius={120} dataKey="valor" stroke="#fff" strokeWidth={4}>
                  {dataRiesgos.map((_, i) => <Cell key={i} fill={COLORS_RIESGOS[i % COLORS_RIESGOS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILA 2: GRÁFICOS ESCALABLES (CON SCROLL INTERNO) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Volumen por Área */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-[500px]">
          <div className="mb-6">
            <h3 className="font-black text-slate-800 text-[15px] uppercase tracking-wide leading-tight">Volumen por Área</h3>
            <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase">Laboratorios del INHRR</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Altura dinámica: 50px por cada barra */}
            <div style={{ height: `${Math.max(dataAreas.length * 50, 300)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataAreas} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={110} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="cantidad" radius={[0, 10, 10, 0]} barSize={24}>
                    {dataAreas.map((_, i) => <Cell key={i} fill={COLORS_BARRAS[i % COLORS_BARRAS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Productividad Personal */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-[500px]">
          <div className="mb-6">
            <h3 className="font-black text-slate-800 text-[15px] uppercase tracking-wide leading-tight">Registros por Personal</h3>
            <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase">Analistas y Administradores</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div style={{ height: `${Math.max(dataPersonal.length * 50, 300)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataPersonal} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={110} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="cantidad" radius={[0, 10, 10, 0]} barSize={24} fill="#8b5cf6">
                    {dataPersonal.map((_, i) => <Cell key={i} fill={['#6366f1', '#8b5cf6', '#d946ef', '#ec4899'][i % 4]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tipos de Empaque */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-[500px]">
          <div className="mb-6">
            <h3 className="font-black text-slate-800 text-[15px] uppercase tracking-wide leading-tight">Tipos de Empaque</h3>
            <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase">Clasificación de Envases</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div style={{ height: `${Math.max(dataEmpaques.length * 50, 300)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataEmpaques} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={110} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="cantidad" radius={[0, 10, 10, 0]} barSize={24} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}