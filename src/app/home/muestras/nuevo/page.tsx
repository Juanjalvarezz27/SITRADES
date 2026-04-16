"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, Package, ShieldAlert, 
  CalendarClock, MapPin, Loader2, Info, ChevronDown, Check, Plus, X
} from "lucide-react";
import { toast } from "react-toastify";

// --- COMPONENTE SELECT PREMIUM (SIN SCROLL HORIZONTAL) ---
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
        className={`w-full px-4 py-3 rounded-2xl border ${
          isOpen 
            ? 'border-brand-primary ring-4 ring-brand-primary/10 bg-white text-slate-800' 
            : 'border-slate-200 bg-slate-50 hover:bg-white'
        } outline-none transition-all text-[14px] font-medium text-left flex justify-between items-center`}
      >
        <span className={`truncate pr-4 ${value ? "text-slate-700" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-[1.2rem] shadow-xl py-2 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in zoom-in-95 origin-top">
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

          {/* SECCIÓN DE AÑADIR NUEVO CORREGIDA (min-w-0 y shrink-0) */}
          {onAddNew && (
            <div className="border-t border-slate-100 mt-2 pt-2 px-2">
              {!isAddingNew ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsAddingNew(true); }}
                  className="w-full text-left px-3 py-2 text-[13px] text-brand-primary font-bold hover:bg-brand-primary/10 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus size={14} /> Añadir nuevo registro
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    autoFocus
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Escriba aquí..."
                    className="flex-1 min-w-0 text-[13px] border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-slate-50"
                  />
                  <button
                    type="button"
                    disabled={loadingNew || !newValue.trim()}
                    onClick={handleAddNew}
                    className="p-2 bg-brand-primary text-white rounded-lg disabled:opacity-50 hover:bg-brand-primary/90 transition-colors shadow-sm shrink-0"
                  >
                    {loadingNew ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsAddingNew(false); }}
                    className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- CONSTANTES ---
const RIESGOS_BIOSEGURIDAD = [
  { value: "Riesgo Mínimo", label: "Riesgo Mínimo" },
  { value: "Riesgo Moderado", label: "Riesgo Moderado" },
  { value: "Riesgo Alto", label: "Riesgo Alto" }
];

export default function RegistroMuestraPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ESTADOS DINÁMICOS
  const [areasOpciones, setAreasOpciones] = useState<{value: string, label: string}[]>([]);
  const [unidades, setUnidades] = useState<{value: string, label: string}[]>([]);
  const [empaques, setEmpaques] = useState<{value: string, label: string}[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const currentYear = new Date().getFullYear();
  const MIN_DATE = `${currentYear - 15}-01-01`; 
  const MAX_DATE = `${currentYear + 15}-12-31`; 

  const [formData, setFormData] = useState({
    codigo_interno: "",
    lote: "",
    registro_sanitario: "",
    principio_activo: "",
    tipo_empaque_id: "", 
    unidad_medida_id: "", 
    riesgo_bioseguridad: "",
    cantidad: "",
    proposito_analisis: "",
    fecha_caducidad: "",
    area_id: "",
    ubicacion_detalle: "",
  });

  // CARGAR DATOS AL INICIAR
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAreas, resUnidades, resEmpaques] = await Promise.all([
          fetch("/api/areas"),
          fetch("/api/unidades-medida"),
          fetch("/api/tipos-empaque")
        ]);

        const dataAreas = await resAreas.json();
        const dataUnidades = await resUnidades.json();
        const dataEmpaques = await resEmpaques.json();

        setAreasOpciones(dataAreas.map((a: any) => ({ value: a.id.toString(), label: `${a.nombre} — ${a.direccion?.nombre}` })));
        setUnidades(dataUnidades.map((u: any) => ({ value: u.id.toString(), label: u.nombre })));
        setEmpaques(dataEmpaques.map((e: any) => ({ value: e.id.toString(), label: e.nombre })));
      } catch (error) {
        toast.error("Error al cargar los catálogos del sistema");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // FUNCIONES PARA AÑADIR NUEVOS ELEMENTOS
  const crearUnidadMedida = async (nombre: string) => {
    try {
      const res = await fetch("/api/unidades-medida", { method: "POST", body: JSON.stringify({ nombre }) });
      const nueva = await res.json();
      const nuevaOpcion = { value: nueva.id.toString(), label: nueva.nombre };
      setUnidades(prev => [...prev, nuevaOpcion].sort((a,b) => a.label.localeCompare(b.label)));
      setFormData(prev => ({ ...prev, unidad_medida_id: nueva.id.toString() }));
      toast.success("Unidad añadida exitosamente");
    } catch { toast.error("Error al añadir unidad"); }
  };

  const crearTipoEmpaque = async (nombre: string) => {
    try {
      const res = await fetch("/api/tipos-empaque", { method: "POST", body: JSON.stringify({ nombre }) });
      const nueva = await res.json();
      const nuevaOpcion = { value: nueva.id.toString(), label: nueva.nombre };
      setEmpaques(prev => [...prev, nuevaOpcion].sort((a,b) => a.label.localeCompare(b.label)));
      setFormData(prev => ({ ...prev, tipo_empaque_id: nueva.id.toString() }));
      toast.success("Empaque añadido exitosamente");
    } catch { toast.error("Error al añadir empaque"); }
  };

  const fechaFinRetencion = formData.fecha_caducidad 
    ? new Date(new Date(formData.fecha_caducidad).setFullYear(new Date(formData.fecha_caducidad).getFullYear() + 1)).toISOString().split('T')[0]
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.codigo_interno || !formData.lote || !formData.registro_sanitario || 
      !formData.principio_activo || !formData.cantidad || !formData.proposito_analisis
    ) {
      return toast.warning("Por favor, completa todos los campos obligatorios (*).");
    }

    if (!formData.area_id || !formData.tipo_empaque_id || !formData.unidad_medida_id || !formData.riesgo_bioseguridad) {
      return toast.warning("Debe seleccionar Área, Empaque, Riesgo y Unidad de Medida.");
    }

    if (!formData.fecha_caducidad) {
      return toast.warning("La Fecha de Caducidad es obligatoria.");
    }

    const yearIngresado = new Date(formData.fecha_caducidad).getFullYear();
    
    if (yearIngresado > currentYear + 15) {
      return toast.warning(`Fecha irreal: La caducidad no puede superar el año ${currentYear + 15}.`);
    }
    if (yearIngresado < currentYear - 15) {
      return toast.warning(`Fecha muy antigua: La caducidad no puede ser menor al año ${currentYear - 15}.`);
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Registrando muestra y generando cadena de custodia...");

    try {
      const res = await fetch("/api/muestras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cantidad: Number(formData.cantidad),
          fecha_fin_retencion: fechaFinRetencion
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar la muestra");

      toast.update(toastId, { render: "¡Muestra registrada con éxito!", type: "success", isLoading: false, autoClose: 3000 });
      router.push("/home/muestras"); 
      
    } catch (error: any) {
      toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 5000 });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-2 mb-8">
        <Link href="/home/muestras" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors text-[14px] font-semibold w-fit mb-2">
          <ArrowLeft size={16} /> Volver al inventario
        </Link>
        <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">Registro de Nueva Muestra</h1>
        <p className="text-slate-500 text-[14px] font-medium">Ingresa los datos del producto para iniciar su cadena de custodia.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Package size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">Identificación Básica</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Código Interno <span className="text-red-500">*</span></label>
                <input required type="text" name="codigo_interno" value={formData.codigo_interno} onChange={handleChange} placeholder="Ej. INHRR-2026-001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Lote <span className="text-red-500">*</span></label>
                  <input required type="text" name="lote" value={formData.lote} onChange={handleChange} placeholder="Ej. L-45892" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Reg. Sanitario <span className="text-red-500">*</span></label>
                  <input required type="text" name="registro_sanitario" value={formData.registro_sanitario} onChange={handleChange} placeholder="Ej. EF-12345" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Principio Activo <span className="text-red-500">*</span></label>
                <input required type="text" name="principio_activo" value={formData.principio_activo} onChange={handleChange} placeholder="Ej. Amoxicilina 500mg" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <ShieldAlert size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">Logística y Bioseguridad</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Cantidad <span className="text-red-500">*</span></label>
                  <input required type="number" step="0.01" min="0" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="Ej. 150" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Unidad de Medida <span className="text-red-500">*</span></label>
                  <CustomSelect 
                    name="unidad_medida_id"
                    options={unidades} 
                    value={formData.unidad_medida_id} 
                    onChange={handleSelectChange} 
                    defaultLabel="Seleccionar"
                    onAddNew={crearUnidadMedida} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Riesgo de Bioseguridad <span className="text-red-500">*</span></label>
                <CustomSelect 
                  name="riesgo_bioseguridad"
                  options={RIESGOS_BIOSEGURIDAD} 
                  value={formData.riesgo_bioseguridad} 
                  onChange={handleSelectChange} 
                  defaultLabel="Nivel de Riesgo" 
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tipo de Empaque <span className="text-red-500">*</span></label>
                <CustomSelect 
                  name="tipo_empaque_id"
                  options={empaques} 
                  value={formData.tipo_empaque_id} 
                  onChange={handleSelectChange} 
                  defaultLabel="Seleccionar Empaque"
                  onAddNew={crearTipoEmpaque} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CalendarClock size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">Tiempos de Ley (Res. N° 072)</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Fecha de Caducidad Impresa <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="date" 
                  name="fecha_caducidad" 
                  value={formData.fecha_caducidad} 
                  onChange={handleChange} 
                  min={MIN_DATE}
                  max={MAX_DATE}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-slate-700" 
                />
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <label className="block text-[13px] font-bold text-blue-800 mb-1.5">Fecha Fin de Retención Legal (Automático)</label>
                <input type="date" readOnly value={fechaFinRetencion} className="w-full px-4 py-3 bg-white/60 border border-blue-200 rounded-xl text-[14px] font-bold text-blue-900 cursor-not-allowed outline-none" />
                <div className="flex items-start gap-2 mt-3 text-blue-600">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p className="text-[12px] leading-tight font-medium">Según la Gaceta Oficial N° 37.966, la muestra queda bloqueada para descarte hasta un año posterior a su vencimiento.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                <MapPin size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">Ubicación y Análisis</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Área de Almacenamiento <span className="text-red-500">*</span></label>
                {loadingInitial ? (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] text-slate-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cargando áreas...</div>
                ) : (
                  <CustomSelect 
                    name="area_id"
                    options={areasOpciones} 
                    value={formData.area_id} 
                    onChange={handleSelectChange} 
                    defaultLabel="Seleccione el área física" 
                  />
                )}
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Detalle de Ubicación (Opcional)</label>
                <input 
                  type="text" 
                  name="ubicacion_detalle" 
                  value={formData.ubicacion_detalle} 
                  onChange={handleChange} 
                  placeholder="Ej. Nevera 2, Estante B, Gabinete 4..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Propósito del Análisis <span className="text-red-500">*</span></label>
                <textarea required name="proposito_analisis" value={formData.proposito_analisis} onChange={handleChange} rows={3} placeholder="Detalle los análisis a realizar..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || loadingInitial} 
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:active:scale-100 text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-[15px] sm:text-[18px] transition-all shadow-lg shadow-brand-secondary/30 leading-tight"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={22} className="animate-spin shrink-0" /> 
                <span>Registrando en Sistema...</span>
              </>
            ) : (
              <>
                <Save size={22} className="shrink-0" /> 
                <span>Guardar y Generar Trazabilidad</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}