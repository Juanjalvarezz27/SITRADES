"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, FlaskConical, Loader2, ChevronDown, Check, Plus } from "lucide-react";
import { toast } from "react-toastify";

// --- COMPONENTE SELECT PREMIUM (DISEÑO PILL + ANCHO ADAPTATIVO) ---
function CustomSelect({ name, value, options, onChange, placeholder = "Seleccionar", onAddNew }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [loadingNew, setLoadingNew] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value?.toString());

  const handleAddNew = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newValue.trim() || !onAddNew) return;
    setLoadingNew(true);
    await onAddNew(newValue);
    setNewValue("");
    setIsAddingNew(false);
    setLoadingNew(false);
  };

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
        <div className="absolute z-50 left-0 min-w-full sm:min-w-[280px] mt-2 bg-white border border-slate-100 rounded-[1.2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in zoom-in-95 origin-top flex flex-col">
          <div
            onClick={() => { onChange(name, ""); setIsOpen(false); }}
            className={`mx-2 my-1 px-3 py-2.5 text-[13px] rounded-xl font-medium cursor-pointer transition-colors flex justify-between items-center ${
              !value ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {placeholder}
            {!value && <Check size={16} strokeWidth={3} className="shrink-0" />}
          </div>
          
          {options.map((opt: any) => (
            <div
              key={opt.value}
              onClick={() => { onChange(name, opt.value); setIsOpen(false); }}
              className={`mx-2 my-1 px-3 py-2.5 text-[13px] rounded-xl font-medium cursor-pointer transition-colors flex justify-between items-center ${
                value?.toString() === opt.value ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="truncate pr-2">{opt.label}</span>
              {value?.toString() === opt.value && <Check size={16} strokeWidth={3} className="shrink-0" />}
            </div>
          ))}

          {onAddNew && (
            <div className="border-t border-slate-100 mt-2 p-2 shrink-0">
              {!isAddingNew ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsAddingNew(true); }}
                  className="w-full text-left px-3 py-2.5 text-[13px] text-brand-primary font-bold hover:bg-brand-primary/10 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} /> Añadir nueva opción
                </button>
              ) : (
                <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all w-full shadow-inner">
                  <input
                    autoFocus
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Escriba aquí..."
                    className="flex-1 min-w-[100px] bg-transparent px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={loadingNew || !newValue.trim()}
                      onClick={handleAddNew}
                      className="flex items-center justify-center w-8 h-8 bg-brand-primary text-white rounded-lg disabled:opacity-50 hover:bg-brand-primary/90 transition-all shadow-sm"
                    >
                      {loadingNew ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsAddingNew(false); }}
                      className="flex items-center justify-center w-8 h-8 bg-slate-200 text-slate-500 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- MODAL PRINCIPAL ---
export default function EditarMuestraModal({ isOpen, onClose, muestra, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  
  const [areas, setAreas] = useState<any[]>([]); 
  const [unidades, setUnidades] = useState<any[]>([]);
  const [empaques, setEmpaques] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    codigo_interno: "", lote: "", registro_sanitario: "", principio_activo: "",
    tipo_empaque_id: "", unidad_medida_id: "", riesgo_bioseguridad: "",
    cantidad: "", proposito_analisis: "", fecha_caducidad: "", fecha_fin_retencion: "",
    area_id: "", ubicacion_detalle: "",
  });

  const OPCIONES_RIESGO = [
    { value: "Riesgo Mínimo", label: "Riesgo Mínimo" },
    { value: "Riesgo Moderado", label: "Riesgo Moderado" },
    { value: "Riesgo Alto", label: "Riesgo Alto" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetch("/api/areas").then(res => res.json()).then(setAreas).catch(console.error);
      fetch("/api/unidades-medida").then(res => res.json()).then(setUnidades).catch(console.error);
      fetch("/api/tipos-empaque").then(res => res.json()).then(setEmpaques).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (muestra && isOpen) {
      setFormData({
        codigo_interno: muestra.codigo_interno || "",
        lote: muestra.lote || "",
        registro_sanitario: muestra.registro_sanitario || "",
        principio_activo: muestra.principio_activo || "",
        tipo_empaque_id: muestra.tipo_empaque_id?.toString() || "", 
        unidad_medida_id: muestra.unidad_medida_id?.toString() || "", 
        riesgo_bioseguridad: muestra.riesgo_bioseguridad || "",
        cantidad: muestra.cantidad?.toString() || "",
        proposito_analisis: muestra.proposito_analisis || "",
        area_id: muestra.area_id?.toString() || "",
        ubicacion_detalle: muestra.ubicacion_detalle || "",
        fecha_caducidad: muestra.fecha_caducidad ? new Date(muestra.fecha_caducidad).toISOString().split('T')[0] : "",
        fecha_fin_retencion: muestra.fecha_fin_retencion ? new Date(muestra.fecha_fin_retencion).toISOString().split('T')[0] : "",
      });
    }
  }, [muestra, isOpen]);

  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }));

  const crearUnidadMedida = async (nombre: string) => {
    try {
      const res = await fetch("/api/unidades-medida", { method: "POST", body: JSON.stringify({ nombre }) });
      const nueva = await res.json();
      setUnidades(prev => [...prev, nueva].sort((a,b) => a.nombre.localeCompare(b.nombre)));
      setFormData(prev => ({ ...prev, unidad_medida_id: nueva.id.toString() })); 
      toast.success("Unidad añadida exitosamente");
    } catch { toast.error("Error al añadir unidad"); }
  };

  const crearTipoEmpaque = async (nombre: string) => {
    try {
      const res = await fetch("/api/tipos-empaque", { method: "POST", body: JSON.stringify({ nombre }) });
      const nueva = await res.json();
      setEmpaques(prev => [...prev, nueva].sort((a,b) => a.nombre.localeCompare(b.nombre)));
      setFormData(prev => ({ ...prev, tipo_empaque_id: nueva.id.toString() })); 
      toast.success("Empaque añadido exitosamente");
    } catch { toast.error("Error al añadir empaque"); }
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
      if (!res.ok) throw new Error("Error");
      toast.success("Expediente actualizado");
      onSuccess(); onClose(); 
    } catch (error) { toast.error("Error al guardar cambios"); } 
    finally { setLoading(false); }
  };

  if (!isOpen || !muestra) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* CABECERA */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl"><FlaskConical size={24} /></div>
            <div>
              <h2 className="font-title font-black text-xl text-slate-800">Editar Expediente</h2>
              <p className="text-slate-500 font-medium text-xs">Modificación de ficha técnica y logística</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar pb-32">
            
            {/* BLOQUE 1: Textos */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identificación Técnica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Principio Activo *</label>
                  <input required name="principio_activo" value={formData.principio_activo} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Código Interno *</label>
                  <input required name="codigo_interno" value={formData.codigo_interno} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Lote *</label>
                  <input required name="lote" value={formData.lote} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Reg. Sanitario</label>
                  <input name="registro_sanitario" value={formData.registro_sanitario} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Propósito Análisis *</label>
                  <input required name="proposito_analisis" value={formData.proposito_analisis} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
              </div>
            </div>

            {/* BLOQUE 2: SELECTS DINÁMICOS */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Atributos Físicos y Riesgo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Cantidad *</label>
                  <input required type="number" step="0.01" name="cantidad" value={formData.cantidad} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Unidad *</label>
                  <CustomSelect 
                    name="unidad_medida_id" 
                    value={formData.unidad_medida_id} 
                    options={unidades.map((u:any) => ({ value: u.id.toString(), label: u.nombre }))} 
                    onChange={handleSelectChange} 
                    onAddNew={crearUnidadMedida} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Empaque *</label>
                  <CustomSelect 
                    name="tipo_empaque_id" 
                    value={formData.tipo_empaque_id} 
                    options={empaques.map((e:any) => ({ value: e.id.toString(), label: e.nombre }))} 
                    onChange={handleSelectChange} 
                    onAddNew={crearTipoEmpaque} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Bioseguridad *</label>
                  <CustomSelect 
                    name="riesgo_bioseguridad" 
                    value={formData.riesgo_bioseguridad} 
                    options={OPCIONES_RIESGO} 
                    onChange={handleSelectChange} 
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE 3: Ubicación y Fechas */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ubicación y Retención Legal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Área Física *</label>
                  <CustomSelect 
                    name="area_id" 
                    value={formData.area_id} 
                    options={areas.map((a:any) => ({ value: a.id.toString(), label: a.nombre }))} 
                    onChange={handleSelectChange} 
                    placeholder="Seleccione un área..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Detalle (Estante, Nevera)</label>
                  <input name="ubicacion_detalle" value={formData.ubicacion_detalle} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Fecha de Vencimiento *</label>
                  <input required type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm cursor-pointer transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Fin Retención (Res. 072) *</label>
                  <input required type="date" name="fecha_fin_retencion" value={formData.fecha_fin_retencion} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-[13px] font-semibold text-slate-700 shadow-sm cursor-pointer transition-all" />
                </div>
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 shadow-md shadow-brand-primary/20 transition-all active:scale-95">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}