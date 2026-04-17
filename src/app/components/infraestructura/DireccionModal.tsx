"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Building2, Layers, Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "react-toastify";
import { DireccionAPI, PisoAPI, SelectOption } from "@/types";

interface CustomSelectProps {
  name: string;
  options: SelectOption[];
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  icon: React.ElementType;
}

function CustomSelectForm({ name, options, value, onChange, placeholder, icon: Icon }: CustomSelectProps) {
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
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3 border rounded-2xl text-[14px] transition-all focus:outline-none ${
          isOpen ? "bg-white border-brand-primary ring-4 ring-brand-primary/10 text-slate-800" : value ? "bg-slate-50 border-brand-primary/20 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
        }`}
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Icon size={18} className={isOpen || value ? "text-brand-primary" : "text-slate-400"} /></div>
        <span className={`truncate font-medium ${!value ? "text-slate-400" : "text-slate-700"}`}>{selectedLabel}</span>
        <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-primary" : "text-slate-400"}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button key={opt.value} type="button" onClick={() => { onChange(name, opt.value); setIsOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-medium transition-colors text-left ${value === opt.value ? "bg-brand-primary/10 text-brand-primary" : "text-slate-600 hover:bg-slate-50"}`}>
              {opt.label} {value === opt.value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DireccionModal({ isOpen, onClose, direccionToEdit, onSaved }: { isOpen: boolean, onClose: () => void, direccionToEdit: DireccionAPI | null, onSaved: () => void }) {
  const [nombre, setNombre] = useState("");
  const [pisoId, setPisoId] = useState("");
  const [pisosDisponibles, setPisosDisponibles] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/pisos").then(res => res.json()).then((data: PisoAPI[]) => {
        setPisosDisponibles(data.filter(p => p.activo !== false).map(p => ({ value: p.id.toString(), label: p.nombre })));
      });
      setNombre(direccionToEdit ? direccionToEdit.nombre : "");
      setPisoId(direccionToEdit ? direccionToEdit.piso_id.toString() : "");
    }
  }, [isOpen, direccionToEdit]);

  if (!isOpen) return null;
  const isEditing = !!direccionToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pisoId) return toast.warning("Debe seleccionar un piso");
    setLoading(true);
    try {
      const url = isEditing ? `/api/direcciones/${direccionToEdit.id}` : "/api/direcciones";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, piso_id: pisoId }) });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("¡Operación exitosa!");
      onSaved(); onClose();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><Building2 size={20} /></div><h2 className="font-black text-slate-800">{isEditing ? "Editar" : "Registrar"} Dirección</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1"><label className="text-[13px] font-bold text-slate-600">Piso</label><CustomSelectForm name="piso_id" options={pisosDisponibles} value={pisoId} onChange={(_, val) => setPisoId(val)} placeholder="Seleccione..." icon={Layers} /></div>
          <div className="space-y-1"><label className="text-[13px] font-bold text-slate-600">Nombre</label><input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-brand-primary" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500">Cancelar</button><button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">{loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar</button></div>
        </form>
      </div>
    </div>
  );
}