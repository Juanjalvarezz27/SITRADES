"use client";

import { useState } from "react";
import { 
  Settings, 
  Thermometer, 
  Package, 
  Ruler, 
  Building2, 
  ChevronRight 
} from "lucide-react";
import CatalogoTab from "../../components/configuracion/CatalogoTab";

const TABS = [
  { 
    id: "metodos", 
    label: "Metodos de Desecho", 
    icon: Thermometer, 
    endpoint: "/api/metodos-disposicion",
    descripcion: "Gestion de tecnicas de inactivacion y disposicion final."
  },
  { 
    id: "unidades", 
    label: "Unidades de Medida", 
    icon: Ruler, 
    endpoint: "/api/unidades-medida",
    descripcion: "Gestion de magnitudes para el pesaje y conteo de muestras."
  },
  { 
    id: "empaques", 
    label: "Tipos de Empaque", 
    icon: Package, 
    endpoint: "/api/tipos-empaque",
    descripcion: "Gestion de recipientes y envoltorios de seguridad."
  }
];

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200">
              <Settings size={24} />
            </div>
            <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">
              Configuracion del Sistema
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Gestion de catalogos maestros y parametros globales de SITRADES.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* PANEL DE NAVEGACION (TABS) */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab.id === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-white border-2 border-brand-primary shadow-md text-brand-primary" 
                    : "bg-transparent border-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-600"} />
                  <span className="font-bold text-[14px]">{tab.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DINAMICO */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-lg uppercase tracking-wider flex items-center gap-2">
                <activeTab.icon size={20} className="text-brand-primary" />
                {activeTab.label}
              </h2>
              <p className="text-slate-500 text-[13px] font-medium mt-1">{activeTab.descripcion}</p>
            </div>
            
            <div className="p-6">
              <CatalogoTab 
                key={activeTab.id} 
                endpoint={activeTab.endpoint} 
                nombreCatalogo={activeTab.label}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}