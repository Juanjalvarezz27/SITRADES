"use client";

import { useState } from "react";
import {
  Settings,
  Thermometer,
  Package,
  Ruler,
  Building2,
  ChevronRight,
  Users,
  Layers,
  MapPin
} from "lucide-react";
import CatalogoTab from "../../components/configuracion/CatalogoTab";

const TABS = [
  {
    id: "personal",
    label: "Gestión de Personal",
    icon: Users,
    endpoint: "/api/usuarios",
    descripcion: "Habilitar o inhabilitar accesos de usuarios al sistema."
  },
  {
    id: "pisos",
    label: "Pisos / Niveles",
    icon: Layers,
    endpoint: "/api/pisos",
    descripcion: "Configuración global de los niveles de la infraestructura."
  },
  {
    id: "direcciones",
    label: "Direcciones",
    icon: Building2,
    endpoint: "/api/direcciones",
    descripcion: "Gestión de las direcciones principales por piso."
  },
  {
    id: "areas",
    label: "Áreas / Laboratorios",
    icon: MapPin,
    endpoint: "/api/areas",
    descripcion: "Control de laboratorios y unidades específicas."
  },
  {
    id: "metodos",
    label: "Métodos de Desecho",
    icon: Thermometer,
    endpoint: "/api/metodos-disposicion",
    descripcion: "Gestión de técnicas de inactivación y disposición final."
  },
  {
    id: "unidades",
    label: "Unidades de Medida",
    icon: Ruler,
    endpoint: "/api/unidades-medida",
    descripcion: "Gestión de magnitudes para el pesaje y conteo de muestras."
  },
  {
    id: "empaques",
    label: "Tipos de Empaque",
    icon: Package,
    endpoint: "/api/tipos-empaque",
    descripcion: "Gestión de recipientes y envoltorios de seguridad."
  }
];

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1300px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200">
              <Settings size={24} />
            </div>
            <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">
              Configuración del Sistema
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Gestión de catálogos maestros, personal e infraestructura.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* PANEL DE NAVEGACION */}
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-lg uppercase tracking-wider flex items-center gap-2">
                <activeTab.icon size={20} className="text-brand-primary" />
                {activeTab.label}
              </h2>
              <p className="text-slate-500 text-[13px] font-medium mt-1">{activeTab.descripcion}</p>
            </div>

            <div className="p-6 flex-1">
              <CatalogoTab
                key={activeTab.id}
                endpoint={activeTab.endpoint}
                nombreCatalogo={activeTab.label}
                // Pasamos una prop extra para identificar si es un catálogo de "Inhabilitar"
                isSoftDelete={["personal", "pisos", "direcciones", "areas"].includes(activeTab.id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}