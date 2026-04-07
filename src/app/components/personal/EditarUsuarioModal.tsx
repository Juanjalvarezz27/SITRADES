"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Save, User, Mail, Lock, Loader2, ShieldCheck, 
  MapPin, Building2, Layers, ChevronDown, Check, Eye, EyeOff 
} from "lucide-react";
import { toast } from "react-toastify";
import { UsuarioAPI, Rol, PisoData, SelectOption } from "@/types";

interface CustomSelectProps {
  name: string;
  options: SelectOption[];
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  icon: React.ElementType;
  disabled?: boolean;
  required?: boolean;
}

function CustomSelectForm({
  name,
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
  required = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div 
      className={`relative w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`} 
      ref={dropdownRef}
    >
      <input
        type="text"
        name={name}
        value={value}
        readOnly
        required={required}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3 border rounded-2xl text-[14px] transition-all focus:outline-none ${
          isOpen
            ? "bg-white border-brand-primary ring-4 ring-brand-primary/10 text-slate-800"
            : value
            ? "bg-slate-50/50 border-brand-primary/30 text-slate-800"
            : "bg-slate-50/50 border-slate-200 text-slate-500"
        }`}
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Icon size={18} className={isOpen || value ? "text-brand-primary" : "text-slate-400"} />
        </div>
        <span className={`truncate font-medium ${!value ? "text-slate-400" : "text-slate-700"}`}>
          {selectedLabel}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-primary" : "text-slate-400"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
          <ul className="flex flex-col gap-1 px-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(name, opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                    value === opt.value
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
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

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioAPI | null;
  onUserUpdated: () => void;
}

export default function EditarUsuarioModal({
  isOpen,
  onClose,
  usuario,
  onUserUpdated,
}: EditarUsuarioModalProps) {
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
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data));
      
    fetch("/api/ubicaciones")
      .then((res) => res.json())
      .then((data) => setUbicaciones(data));
  }, []);

  useEffect(() => {
    if (usuario && isOpen) {
      setFormData({
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        password: "",
        rol_id: usuario.rol_id?.toString() || "",
        piso_id: usuario.area?.direccion?.piso?.id?.toString() || "",
        direccion_id: usuario.area?.direccion?.id?.toString() || "",
        area_id: usuario.area?.id?.toString() || "",
      });
    }
  }, [usuario, isOpen]);

  if (!isOpen || !usuario) return null;

  const opcionesRoles: SelectOption[] = roles.map((r) => ({
    value: r.id.toString(),
    label: r.nombre,
  }));

  const opcionesPisos: SelectOption[] = ubicaciones.map((p) => ({
    value: p.id.toString(),
    label: p.nombre,
  }));

  const pisoSeleccionado = ubicaciones.find((p) => p.id.toString() === formData.piso_id);
  const opcionesDirecciones: SelectOption[] = (pisoSeleccionado?.direcciones || []).map((d) => ({
    value: d.id.toString(),
    label: d.nombre,
  }));

  const direccionSeleccionada = (pisoSeleccionado?.direcciones || []).find(
    (d) => d.id.toString() === formData.direccion_id
  );
  const opcionesAreas: SelectOption[] = (direccionSeleccionada?.areas || []).map((a) => ({
    value: a.id.toString(),
    label: a.nombre,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "piso_id") {
      setFormData((prev) => ({ ...prev, piso_id: value, direccion_id: "", area_id: "" }));
    } else if (name === "direccion_id") {
      setFormData((prev) => ({ ...prev, direccion_id: value, area_id: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Actualizando información...");

    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al actualizar");
      }

      toast.update(toastId, {
        render: "¡Usuario actualizado exitosamente!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      onUserUpdated();
      onClose();
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden transform scale-100 transition-transform duration-150">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="font-black text-xl text-slate-800">Editar Usuario</h2>
            <p className="text-slate-500 text-[13px] font-medium">
              Modifica los permisos o ubicación de {usuario.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8">
          <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={18} className="text-brand-secondary" /> Datos de Acceso
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-600">Nombre Completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-600">Correo Electrónico</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-600">Nueva Contraseña (Opcional)</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Dejar en blanco para no cambiar"
                      className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-slate-400"
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
                    placeholder="Seleccione..."
                    icon={ShieldCheck}
                    required
                  />
                </div>
              </div>
            </div>

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
                    placeholder="Seleccione..."
                    icon={Layers}
                    required
                  />
                </div>

                <div className={`space-y-1.5 ${!formData.piso_id ? "opacity-50 pointer-events-none" : ""}`}>
                  <label className="text-[13px] font-bold text-slate-600">Dirección</label>
                  <CustomSelectForm
                    name="direccion_id"
                    options={opcionesDirecciones}
                    value={formData.direccion_id}
                    onChange={handleSelectChange}
                    placeholder="Seleccione..."
                    icon={Building2}
                    disabled={!formData.piso_id}
                    required={!!formData.piso_id}
                  />
                </div>

                <div className={`space-y-1.5 ${!formData.direccion_id ? "opacity-50 pointer-events-none" : ""}`}>
                  <label className="text-[13px] font-bold text-slate-600">Área de Trabajo</label>
                  <CustomSelectForm
                    name="area_id"
                    options={opcionesAreas}
                    value={formData.area_id}
                    onChange={handleSelectChange}
                    placeholder="Seleccione..."
                    icon={MapPin}
                    disabled={!formData.direccion_id}
                    required={!!formData.direccion_id}
                  />
                </div>
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-form"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Cambios
          </button>
        </div>
        
      </div>
    </div>
  );
}