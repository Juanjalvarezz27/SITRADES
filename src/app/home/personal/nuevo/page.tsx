"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; //  Importamos Image de Next.js
import { ArrowLeft, Save, User, Mail, Lock, Loader2, ShieldCheck, MapPin, Building2, Layers, ChevronDown, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify"; 

interface Rol { id: number; nombre: string; }
interface AreaData { id: number; nombre: string; }
interface DireccionData { id: number; nombre: string; areas: AreaData[]; }
interface PisoData { id: number; nombre: string; direcciones: DireccionData[]; }

function CustomSelectForm({ 
  name, options, value, onChange, placeholder, icon: Icon, disabled = false, required = false
}: { 
  name: string, options: {value: string, label: string}[], value: string, onChange: (name: string, value: string) => void, placeholder: string, icon: any, disabled?: boolean, required?: boolean
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
      <input type="text" name={name} value={value} readOnly required={required} className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3 border rounded-2xl text-[14px] transition-all shadow-sm focus:outline-none ${
          isOpen ? "bg-white border-brand-primary ring-4 ring-brand-primary/10 text-slate-800" : value ? "bg-slate-50/50 border-brand-primary/30 text-slate-800" : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-brand-primary/50"
        }`}
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Icon size={18} className={isOpen || value ? "text-brand-primary" : "text-slate-400"} />
        </div>
        <span className={`truncate font-medium ${!value ? "text-slate-400" : "text-slate-700"}`}>{selectedLabel}</span>
        <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-primary" : "text-slate-400"}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
          <ul className="flex flex-col gap-1 px-1">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => { onChange(name, opt.value); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                      isSelected ? "bg-brand-primary/10 text-brand-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate pr-2" title={opt.label}>{opt.label}</span>
                    {isSelected && <Check size={16} strokeWidth={3} className="shrink-0" />}
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

export default function NuevoPersonalPage() {
  const router = useRouter();
  
  const [roles, setRoles] = useState<Rol[]>([]);
  const [ubicaciones, setUbicaciones] = useState<PisoData[]>([]);
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol_id: "",
    piso_id: "",
    direccion_id: "",
    area_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/roles").then(res => res.json()).then(data => setRoles(data));
    fetch("/api/ubicaciones").then(res => res.json()).then(data => setUbicaciones(data));
  }, []);

  const opcionesRoles = roles.map(r => ({ value: r.id.toString(), label: r.nombre }));
  const opcionesPisos = ubicaciones.map(p => ({ value: p.id.toString(), label: p.nombre }));
  
  const pisoSeleccionado = ubicaciones.find(p => p.id.toString() === formData.piso_id);
  const opcionesDirecciones = (pisoSeleccionado?.direcciones || []).map(d => ({ value: d.id.toString(), label: d.nombre }));
  
  const direccionSeleccionada = (pisoSeleccionado?.direcciones || []).find(d => d.id.toString() === formData.direccion_id);
  const opcionesAreas = (direccionSeleccionada?.areas || []).map(a => ({ value: a.id.toString(), label: a.nombre }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "piso_id") {
      setFormData(prev => ({ ...prev, piso_id: value, direccion_id: "", area_id: "" }));
    } else if (name === "direccion_id") {
      setFormData(prev => ({ ...prev, direccion_id: value, area_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Registrando nuevo usuario...");

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar el usuario");
      }

      toast.update(toastId, { render: "¡Personal registrado exitosamente!", type: "success", isLoading: false, autoClose: 3000 });

      router.push("/home/personal");
      router.refresh();

    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Link href="/home/personal" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary font-semibold text-[14px] transition-colors mb-6 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Volver al Directorio
      </Link>

      {/*  CABECERA CON IMAGEN DE LA BATA */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">Registrar Nuevo Personal</h1>
          <p className="text-slate-500 text-[14px] font-medium mt-1">
            Completa los datos para dar acceso a un nuevo miembro del equipo.
          </p>
        </div>
        
        {/* Contenedor de la imagen (oculto en móviles muy pequeños para no estorbar) */}
        <div className="hidden sm:block shrink-0 relative w-20 h-20 md:w-24 md:h-24">
          {/* Resplandor decorativo de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full blur-xl"></div>
          <Image 
            src="/Bata.png" 
            alt="Ilustración Bata de Laboratorio" 
            fill
            className="object-contain drop-shadow-md relative z-10 hover:scale-105 transition-transform duration-300"
            priority 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* COLUMNA 1: Datos Personales */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={18} className="text-brand-secondary" /> Datos de Acceso
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-600">Nombre Completo</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej. Dra. Ana López" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-600">Correo Electrónico (Usuario)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="correo@inhrr.gob.ve" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-600">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="••••••••" 
                    className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-600">Rol en el Sistema</label>
                <CustomSelectForm 
                  name="rol_id" 
                  options={opcionesRoles} 
                  value={formData.rol_id} 
                  onChange={handleSelectChange} 
                  placeholder="Seleccione un rol..." 
                  icon={ShieldCheck} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* COLUMNA 2: Ubicación Física */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin size={18} className="text-brand-secondary" /> Asignación de Área
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-600">Piso</label>
                <CustomSelectForm 
                  name="piso_id" 
                  options={opcionesPisos} 
                  value={formData.piso_id} 
                  onChange={handleSelectChange} 
                  placeholder="Seleccione el piso..." 
                  icon={Layers} 
                  required 
                />
              </div>

              <div className={`space-y-1.5 transition-opacity duration-300 ${!formData.piso_id ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-[13px] font-bold text-slate-600">Dirección</label>
                <CustomSelectForm 
                  name="direccion_id" 
                  options={opcionesDirecciones} 
                  value={formData.direccion_id} 
                  onChange={handleSelectChange} 
                  placeholder="Seleccione la dirección..." 
                  icon={Building2} 
                  disabled={!formData.piso_id}
                  required={!!formData.piso_id}
                />
              </div>

              <div className={`space-y-1.5 transition-opacity duration-300 ${!formData.direccion_id ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-[13px] font-bold text-slate-600">Área de Trabajo</label>
                <CustomSelectForm 
                  name="area_id" 
                  options={opcionesAreas} 
                  value={formData.area_id} 
                  onChange={handleSelectChange} 
                  placeholder="Seleccione el área específica..." 
                  icon={MapPin} 
                  disabled={!formData.direccion_id}
                  required={!!formData.direccion_id}
                />
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 text-white px-10 py-4 rounded-2xl font-bold text-[15px] transition-all shadow-md shadow-brand-secondary/25 w-full sm:w-auto min-w-[250px] justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? "Registrando..." : "Registrar Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}