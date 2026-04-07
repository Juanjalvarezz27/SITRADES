"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, MapPin, Building2, Layers, Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "react-toastify";
import { AreaAPI, PisoAPI, SelectOption } from "@/types";

interface CustomSelectProps {
  name: string;
  options: SelectOption[];
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  icon: React.ElementType;
  disabled?: boolean;
}

function CustomSelectForm({ name, options, value, onChange, placeholder, icon: Icon, disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <input type="text" name={name} value={value} readOnly required className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3 border rounded-2xl text-[14px] transition-all focus:outline-none ${
          isOpen ? "bg-white border-brand-primary ring-4 ring-brand-primary/10 text-slate-800" : value ? "bg-slate-50/50 border-brand-primary/30 text-slate-800" : "bg-slate-50/50 border-slate-200 text-slate-500"
        }`}
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Icon size={18} className={isOpen || value ? "text-brand-primary" : "text-slate-400"} /></div>
        <span className={`truncate font-medium ${!value ? "text-slate-400" : "text-slate-700"}`}>{selectedLabel}</span>
        <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-primary" : "text-slate-400"}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
          <ul className="flex flex-col gap-1 px-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(name, opt.value); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${value === opt.value ? "bg-brand-primary/10 text-brand-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {value === opt.value && <Check size={16} strokeWidth={3} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaToEdit: AreaAPI | null;
  onSaved: () => void;
}

export default function AreaModal({ isOpen, onClose, areaToEdit, onSaved }: AreaModalProps) {
  const [nombre, setNombre] = useState("");
  const [pisoId, setPisoId] = useState("");
  const [direccionId, setDireccionId] = useState("");
  
  const [pisos, setPisos] = useState<PisoAPI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/pisos")
        .then(res => res.json())
        .then((data) => setPisos(data));

      if (areaToEdit) {
        setNombre(areaToEdit.nombre);
        setPisoId(areaToEdit.direccion?.piso?.id.toString() || "");
        setDireccionId(areaToEdit.direccion_id.toString());
      } else {
        setNombre("");
        setPisoId("");
        setDireccionId("");
      }
    }
  }, [isOpen, areaToEdit]);

  if (!isOpen) return null;

  const isEditing = !!areaToEdit;

  // Lógica de cascada
  const opcionesPisos = pisos.map(p => ({ value: p.id.toString(), label: p.nombre }));
  const pisoSeleccionado = pisos.find(p => p.id.toString() === pisoId);
  const opcionesDirecciones = (pisoSeleccionado?.direcciones || []).map(d => ({ value: d.id.toString(), label: d.nombre }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isEditing ? "Actualizando área..." : "Registrando área...");

    try {
      const url = isEditing ? `/api/areas/${areaToEdit.id}` : "/api/areas";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, direccion_id: direccionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocurrió un error");

      toast.update(toastId, { render: isEditing ? "¡Actualizada con éxito!" : "¡Registrada con éxito!", type: "success", isLoading: false, autoClose: 3000 });
      onSaved();
      onClose();
    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform duration-150">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <MapPin size={20} />
            </div>
            <div><h2 className="font-black text-lg text-slate-800">{isEditing ? "Editar Área" : "Registrar Área"}</h2></div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-600">Piso</label>
            <CustomSelectForm 
              name="piso_id" 
              options={opcionesPisos} 
              value={pisoId} 
              onChange={(name, val) => { setPisoId(val); setDireccionId(""); }} // Limpia dirección al cambiar de piso
              placeholder="Seleccione el piso..." 
              icon={Layers} 
            />
          </div>

          <div className={`space-y-1.5 transition-opacity ${!pisoId ? 'opacity-50' : 'opacity-100'}`}>
            <label className="text-[13px] font-bold text-slate-600">Dirección a la que pertenece</label>
            <CustomSelectForm 
              name="direccion_id" 
              options={opcionesDirecciones} 
              value={direccionId} 
              onChange={(name, val) => setDireccionId(val)} 
              placeholder="Seleccione la dirección..." 
              icon={Building2} 
              disabled={!pisoId}
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-[13px] font-bold text-slate-600">Nombre del Área</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Área de Análisis Físico-Químico..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md shadow-brand-secondary/20">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditing ? "Guardar" : "Registrar"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}