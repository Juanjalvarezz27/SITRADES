"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, FlaskConical, Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "react-toastify";

// --- COMPONENTE SELECT PREMIUM ---
function CustomSelect({ name, value, options, onChange, placeholder = "Seleccionar" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border ${
          isOpen 
            ? 'border-brand-primary ring-4 ring-brand-primary/10 bg-white text-slate-800' 
            : 'border-slate-200 bg-white hover:bg-slate-50'
        } outline-none transition-all text-[13px] font-semibold text-left flex justify-between items-center shadow-sm`}
      >
        <span className={`truncate pr-4 ${value ? "text-slate-700" : "text-slate-400 font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-[1.2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 origin-top">
          <div
            onClick={() => { onChange(name, ""); setIsOpen(false); }}
            className={`mx-2 my-1 px-3 py-2.5 text-[13px] rounded-xl font-medium cursor-pointer transition-colors flex justify-between items-center ${
              !value ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {placeholder}
            {!value && <Check size={16} strokeWidth={3} />}
          </div>
          {options.map((opt: any) => (
            <div
              key={opt.value}
              onClick={() => { onChange(name, opt.value); setIsOpen(false); }}
              className={`mx-2 my-1 px-3 py-2.5 text-[13px] rounded-xl font-medium cursor-pointer transition-colors flex justify-between items-center ${
                value === opt.value ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {opt.label}
              {value === opt.value && <Check size={16} strokeWidth={3} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MODAL PRINCIPAL ---
interface EditarMuestraModalProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: any;
  onSuccess: () => void; 
}

export default function EditarMuestraModal({ isOpen, onClose, muestra, onSuccess }: EditarMuestraModalProps) {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]); 

  const [formData, setFormData] = useState({
    codigo_interno: "",
    lote: "",
    registro_sanitario: "",
    principio_activo: "",
    tipo_empaque: "",
    riesgo_bioseguridad: "",
    cantidad: "",
    unidad_medida: "",
    proposito_analisis: "",
    fecha_caducidad: "",
    fecha_fin_retencion: "",
    area_id: "",
    ubicacion_detalle: "",
  });

  // OPCIONES PARA LOS SELECTS
  const OPCIONES_UNIDAD = [
    { value: "Unidades (Cajas/Frascos)", label: "Unidades (Cajas/Frascos)" },
    { value: "Mililitros (ml)", label: "Mililitros (ml)" },
    { value: "Gramos (g)", label: "Gramos (g)" },
    { value: "Ampollas", label: "Ampollas" }
  ];

  const OPCIONES_RIESGO = [
    { value: "Riesgo Mínimo", label: "Riesgo Mínimo" },
    { value: "Riesgo Moderado", label: "Riesgo Moderado" },
    { value: "Riesgo Alto", label: "Riesgo Alto" }
  ];

  const OPCIONES_EMPAQUE = [
    { value: "Caja de Cartón", label: "Caja de Cartón" },
    { value: "Frasco de Vidrio", label: "Frasco de Vidrio" },
    { value: "Blíster Plástico/Aluminio", label: "Blíster Plástico/Aluminio" },
    { value: "Vial Ampolla", label: "Vial Ampolla" },
    { value: "Saco/Bolsa Especial", label: "Saco/Bolsa Especial" }
  ];

  const opcionesAreas = areas.map((a: any) => ({
    value: a.id.toString(),
    label: a.nombre
  }));

  useEffect(() => {
    if (isOpen) {
      fetch("/api/areas")
        .then(res => res.json())
        .then(data => setAreas(data))
        .catch(err => console.error("Error cargando áreas", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (muestra && isOpen) {
      setFormData({
        codigo_interno: muestra.codigo_interno || "",
        lote: muestra.lote || "",
        registro_sanitario: muestra.registro_sanitario || "",
        principio_activo: muestra.principio_activo || "",
        tipo_empaque: muestra.tipo_empaque || "",
        riesgo_bioseguridad: muestra.riesgo_bioseguridad || "",
        cantidad: muestra.cantidad?.toString() || "",
        unidad_medida: muestra.unidad_medida || "",
        proposito_analisis: muestra.proposito_analisis || "",
        area_id: muestra.area_id?.toString() || "",
        ubicacion_detalle: muestra.ubicacion_detalle || "",
        fecha_caducidad: muestra.fecha_caducidad ? new Date(muestra.fecha_caducidad).toISOString().split('T')[0] : "",
        fecha_fin_retencion: muestra.fecha_fin_retencion ? new Date(muestra.fecha_fin_retencion).toISOString().split('T')[0] : "",
      });
    }
  }, [muestra, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/muestras/${muestra.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al actualizar la muestra");

      toast.success("Expediente actualizado exitosamente");
      onSuccess(); 
      onClose();   
    } catch (error) {
      toast.error("Ocurrió un error al guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !muestra) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose} />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* CABECERA */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="font-title font-black text-xl text-slate-800">Editar Expediente</h2>
              <p className="text-slate-500 font-medium text-xs">Modificación de ficha técnica y logística</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar pb-32">
            
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identificación Técnica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Principio Activo *</label>
                  <input required name="principio_activo" value={formData.principio_activo} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Código Interno *</label>
                  <input required name="codigo_interno" value={formData.codigo_interno} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Lote *</label>
                  <input required name="lote" value={formData.lote} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Reg. Sanitario</label>
                  <input name="registro_sanitario" value={formData.registro_sanitario} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Propósito Análisis *</label>
                  <input required name="proposito_analisis" value={formData.proposito_analisis} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Atributos Físicos y Riesgo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Cantidad *</label>
                  <input required type="number" step="0.01" name="cantidad" value={formData.cantidad} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 text-brand-primary">Unidad de Medida *</label>
                  <CustomSelect 
                    name="unidad_medida" 
                    value={formData.unidad_medida} 
                    options={OPCIONES_UNIDAD} 
                    onChange={handleSelectChange} 
                  />
                </div>
                {/* NUEVO SELECT DE EMPAQUE */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 text-brand-primary">Tipo de Empaque *</label>
                  <CustomSelect 
                    name="tipo_empaque" 
                    value={formData.tipo_empaque} 
                    options={OPCIONES_EMPAQUE} 
                    onChange={handleSelectChange} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 text-brand-primary">Bioseguridad *</label>
                  <CustomSelect 
                    name="riesgo_bioseguridad" 
                    value={formData.riesgo_bioseguridad} 
                    options={OPCIONES_RIESGO} 
                    onChange={handleSelectChange} 
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ubicación y Retención Legal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 text-brand-primary">Área Física *</label>
                  <CustomSelect 
                    name="area_id" 
                    value={formData.area_id} 
                    options={opcionesAreas} 
                    onChange={handleSelectChange} 
                    placeholder="Seleccione un área..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Detalle (Estante, Nevera)</label>
                  <input name="ubicacion_detalle" value={formData.ubicacion_detalle} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Fecha de Vencimiento *</label>
                  <input required type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm cursor-pointer text-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Fin Retención (Res. 072) *</label>
                  <input required type="date" name="fecha_fin_retencion" value={formData.fecha_fin_retencion} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-[13px] font-semibold text-slate-700 shadow-sm cursor-pointer text-slate-500" />
                </div>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-[13px]">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-brand-primary/20 text-[13px] active:scale-95">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}