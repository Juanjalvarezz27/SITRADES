"use client";

import { Search, Filter, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface BuscadorProps {
  placeholder: string;
  onSearch: (term: string) => void;
  onRoleChange: (role: string) => void;
}

const ROLES = [
  { value: "", label: "Todos los roles" },
  { value: "Administrador", label: "Administrador" },
  { value: "Analista de Laboratorio", label: "Analista de Laboratorio" },
  { value: "Seguridad Industrial", label: "Seguridad Industrial" },
];

export default function Buscador({ placeholder, onSearch, onRoleChange }: BuscadorProps) {
  const [term, setTerm] = useState("");
  
  // Estados para nuestro Select Personalizado
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Efecto de Debounce para la búsqueda de texto
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(term);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [term, onSearch]);

  // Manejador para cerrar el menú si el usuario hace clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función al seleccionar una opción
  const handleSelect = (value: string) => {
    setSelectedRole(value);
    onRoleChange(value);
    setIsOpen(false);
  };

  const selectedLabel = ROLES.find(r => r.value === selectedRole)?.label || "Todos los roles";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
      
      {/* 1. BUSCADOR DE TEXTO */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* 2. SELECT PERSONALIZADO (Estilo Premium) */}
      <div className="relative w-full sm:w-auto min-w-[240px]" ref={dropdownRef}>
        
        {/* Botón Principal del Select */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between pl-11 pr-4 py-3 bg-white border rounded-2xl text-[14px] font-semibold transition-all shadow-sm focus:outline-none ${
            isOpen 
              ? "border-brand-secondary ring-4 ring-brand-secondary/10 text-brand-secondary" 
              : "border-slate-200 text-slate-700 hover:border-brand-secondary/50"
          }`}
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Filter size={18} className={isOpen ? "text-brand-secondary" : "text-slate-400"} />
          </div>
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-secondary" : "text-slate-400"}`} 
          />
        </button>

        {/* Menú Flotante */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <ul className="flex flex-col gap-1 px-1">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <li key={role.value}>
                    <button
                      onClick={() => handleSelect(role.value)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                        isSelected 
                          ? "bg-brand-secondary/10 text-brand-secondary" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {role.label}
                      {isSelected && <Check size={16} strokeWidth={3} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}