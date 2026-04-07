"use client";

import { Search, Filter, ChevronDown, Check, Building2, MapPin, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Interfaces para tipar la respuesta de la API de ubicaciones
interface AreaData { id: number; nombre: string; }
interface DireccionData { id: number; nombre: string; areas: AreaData[]; }
interface PisoData { id: number; nombre: string; direcciones: DireccionData[]; }

interface BuscadorProps {
  onSearch: (term: string) => void;
  onRoleChange: (role: string) => void;
  onPisoChange: (pisoId: string) => void;
  onDireccionChange: (direccionId: string) => void;
  onAreaChange: (areaId: string) => void;
}

const ROLES = [
  { value: "", label: "Todos los roles" },
  { value: "Administrador", label: "Administrador" },
  { value: "Analista de Laboratorio", label: "Analista de Laboratorio" },
  { value: "Seguridad Industrial", label: "Seguridad Industrial" },
];

// Select Personalizado Reutilizable
function CustomSelect({ 
  options, value, onChange, placeholder, icon: Icon, disabled = false 
}: { 
  options: {value: string, label: string}[], value: string, onChange: (v: string) => void, placeholder: string, icon: any, disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-10 pr-4 py-3 bg-white border rounded-2xl text-[13px] font-semibold transition-all shadow-sm focus:outline-none ${
          isOpen ? "border-brand-secondary ring-4 ring-brand-secondary/10 text-brand-secondary" : value ? "border-brand-primary/30 text-slate-800" : "border-slate-200 text-slate-600 hover:border-brand-secondary/50"
        }`}
      >
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Icon size={16} className={isOpen || value ? "text-brand-secondary" : "text-slate-400"} />
        </div>
        <span className="truncate pr-2">{selectedLabel}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-secondary" : "text-slate-400"}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
          <ul className="flex flex-col gap-1 px-1">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors text-left ${
                      isSelected ? "bg-brand-secondary/10 text-brand-secondary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate pr-2" title={opt.label}>{opt.label}</span>
                    {isSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Buscador({ onSearch, onRoleChange, onPisoChange, onDireccionChange, onAreaChange }: BuscadorProps) {
  const [term, setTerm] = useState("");
  const [ubicaciones, setUbicaciones] = useState<PisoData[]>([]);
  
  // Estados Locales de los filtros
  const [rol, setRol] = useState("");
  const [piso, setPiso] = useState("");
  const [direccion, setDireccion] = useState("");
  const [area, setArea] = useState("");

  // Cargar jerarquía de ubicaciones al montar el componente
  useEffect(() => {
    fetch("/api/ubicaciones").then(res => res.json()).then(data => setUbicaciones(data));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => onSearch(term), 300);
    return () => clearTimeout(delay);
  }, [term, onSearch]);

  // Manejadores en cascada
  const handlePiso = (val: string) => {
    setPiso(val); setDireccion(""); setArea(""); 
    onPisoChange(val); onDireccionChange(""); onAreaChange("");
  };
  const handleDireccion = (val: string) => {
    setDireccion(val); setArea(""); 
    onDireccionChange(val); onAreaChange("");
  };
  const handleArea = (val: string) => {
    setArea(val); onAreaChange(val);
  };
  const handleRol = (val: string) => {
    setRol(val); onRoleChange(val);
  };

  // Preparar opciones dinámicas
  const opcionesPisos = [{ value: "", label: "Todos los Pisos" }, ...ubicaciones.map(p => ({ value: p.id.toString(), label: p.nombre }))];
  
  const pisoSeleccionado = ubicaciones.find(p => p.id.toString() === piso);
  const opcionesDirecciones = [{ value: "", label: "Todas las Direcciones" }, ...(pisoSeleccionado?.direcciones.map(d => ({ value: d.id.toString(), label: d.nombre })) || [])];

  const direccionSeleccionada = pisoSeleccionado?.direcciones.find(d => d.id.toString() === direccion);
  const opcionesAreas = [{ value: "", label: "Todas las Áreas" }, ...(direccionSeleccionada?.areas.map(a => ({ value: a.id.toString(), label: a.nombre })) || [])];

  return (
    <div className="flex flex-col gap-3 w-full flex-1">
      {/* Fila 1: Buscador de texto ocupando todo el ancho */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nombre o correo electrónico..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Fila 2: Grid de 4 Filtros Avanzados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <CustomSelect options={ROLES} value={rol} onChange={handleRol} placeholder="Todos los roles" icon={Filter} />
        <CustomSelect options={opcionesPisos} value={piso} onChange={handlePiso} placeholder="Todos los Pisos" icon={Layers} />
        <CustomSelect options={opcionesDirecciones} value={direccion} onChange={handleDireccion} placeholder="Todas las Direcciones" icon={Building2} disabled={!piso} />
        <CustomSelect options={opcionesAreas} value={area} onChange={handleArea} placeholder="Todas las Áreas" icon={MapPin} disabled={!direccion} />
      </div>
    </div>
  );
}