"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  defaultLabel: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

export default function FilterSelect({ value, onChange, options, defaultLabel, icon: Icon, disabled }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si haces clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = value === "TODOS" 
    ? defaultLabel 
    : options.find((o) => o.value === value)?.label || defaultLabel;

  const allOptions = [{ value: "TODOS", label: defaultLabel }, ...options];

  return (
    <div className={`relative min-w-[200px] w-full sm:w-auto ${disabled ? "opacity-50 pointer-events-none" : ""}`} ref={dropdownRef}>
      
      {/* Botón Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-3 pr-4 border rounded-2xl text-[14px] transition-all focus:outline-none shadow-sm ${
          Icon ? "pl-11" : "pl-4"
        } ${
          isOpen 
          ? "bg-white border-brand-primary ring-4 ring-brand-primary/10 text-slate-800" 
          : value !== "TODOS" 
            ? "bg-brand-primary/5 border-brand-primary/30 text-brand-primary font-bold"
            : "bg-white border-slate-200 text-slate-600 font-medium"
        }`}
      >
        {Icon && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Icon size={18} className={value !== "TODOS" ? "text-brand-primary" : "text-slate-400"} />
          </div>
        )}
        
        <span className="truncate pr-4">{selectedLabel}</span>
        <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-primary" : "text-slate-400"}`} />
      </button>

      {/* Menú Desplegable Corregido (Anclado a la derecha, fluido y responsive) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-full w-max max-w-[90vw] sm:max-w-[380px] bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-[70] animate-in fade-in zoom-in-95 origin-top-right max-h-60 overflow-y-auto overflow-x-hidden">
          <ul className="flex flex-col gap-1 px-1.5">
            {allOptions.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start justify-between px-3 py-2.5 rounded-xl text-[13px] sm:text-[14px] transition-colors text-left ${
                    value === opt.value 
                    ? "bg-brand-primary/10 text-brand-primary font-bold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span className="flex-1 whitespace-normal break-words leading-snug pr-3">
                    {opt.label}
                  </span>
                  {value === opt.value && <Check size={16} strokeWidth={3} className="shrink-0 mt-0.5" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}