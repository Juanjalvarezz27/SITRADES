"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, Package, ShieldAlert, 
  CalendarClock, MapPin, Loader2, Info
} from "lucide-react";
import { toast } from "react-toastify";
import CustomSelect from "../../../components/ui/FilterSelect"; 

const TIPOS_EMPAQUE = [
  { value: "Caja de Cartón", label: "Caja de Cartón" },
  { value: "Frasco de Vidrio", label: "Frasco de Vidrio" },
  { value: "Blíster Plástico/Aluminio", label: "Blíster Plástico/Aluminio" },
  { value: "Vial Ampolla", label: "Vial Ampolla" },
  { value: "Saco/Bolsa Especial", label: "Saco/Bolsa Especial" },
];

const RIESGOS_BIOSEGURIDAD = [
  { value: "Bajo (No Infeccioso)", label: "Bajo (No Infeccioso)" },
  { value: "Moderado (Riesgo Químico)", label: "Moderado (Riesgo Químico)" },
  { value: "Alto (Riesgo Biológico/Infeccioso)", label: "Alto (Riesgo Biológico/Infeccioso)" },
];

const UNIDADES_MEDIDA = [
  { value: "Unidades", label: "Unidades (Cajas/Frascos)" },
  { value: "Mililitros (ml)", label: "Mililitros (ml)" },
  { value: "Gramos (g)", label: "Gramos (g)" },
  { value: "Ampollas", label: "Ampollas" },
];

export default function RegistroMuestraPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areasOpciones, setAreasOpciones] = useState<{value: string, label: string}[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  const [formData, setFormData] = useState({
    codigo_interno: "",
    lote: "",
    registro_sanitario: "",
    principio_activo: "",
    tipo_empaque: "Caja de Cartón",
    riesgo_bioseguridad: "Bajo (No Infeccioso)",
    cantidad: "",
    unidad_medida: "Unidades",
    proposito_analisis: "",
    fecha_caducidad: "",
    area_id: "",
    ubicacion_detalle: "", //  Nuevo campo en el estado
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch("/api/areas");
        const data = await res.json();
        const opciones = data.map((area: any) => ({
          value: area.id.toString(),
          label: `${area.nombre} — ${area.direccion?.nombre} (${area.direccion?.piso?.nombre})`
        }));
        setAreasOpciones(opciones);
      } catch (error) {
        toast.error("Error al cargar las áreas de almacenamiento");
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fechaFinRetencion = formData.fecha_caducidad 
    ? new Date(new Date(formData.fecha_caducidad).setFullYear(new Date(formData.fecha_caducidad).getFullYear() + 1)).toISOString().split('T')[0]
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.area_id) return toast.warning("Debe seleccionar un área de almacenamiento.");

    setIsSubmitting(true);
    const toastId = toast.loading("Registrando muestra y generando cadena de custodia...");

    try {
      const res = await fetch("/api/muestras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cantidad: parseInt(formData.cantidad),
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  <input required type="number" min="1" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="Ej. 150" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Unidad de Medida <span className="text-red-500">*</span></label>
                  <CustomSelect options={UNIDADES_MEDIDA} value={formData.unidad_medida} onChange={(val) => setFormData(p => ({...p, unidad_medida: val}))} defaultLabel="Seleccionar" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Riesgo de Bioseguridad <span className="text-red-500">*</span></label>
                <CustomSelect options={RIESGOS_BIOSEGURIDAD} value={formData.riesgo_bioseguridad} onChange={(val) => setFormData(p => ({...p, riesgo_bioseguridad: val}))} defaultLabel="Nivel de Riesgo" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tipo de Empaque <span className="text-red-500">*</span></label>
                <CustomSelect options={TIPOS_EMPAQUE} value={formData.tipo_empaque} onChange={(val) => setFormData(p => ({...p, tipo_empaque: val}))} defaultLabel="Seleccionar Empaque" />
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
                <input required type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-slate-700" />
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
                {loadingAreas ? (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] text-slate-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cargando áreas...</div>
                ) : (
                  <CustomSelect options={areasOpciones} value={formData.area_id} onChange={(val) => setFormData(p => ({...p, area_id: val}))} defaultLabel="Seleccione el área física" />
                )}
              </div>
              
              {/*  NUEVO CAMPO: Detalle de Ubicación */}
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

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:active:scale-100 text-white px-8 py-3.5 rounded-2xl font-bold text-[15px] transition-all shadow-lg shadow-brand-secondary/30">
            {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Registrando en Sistema...</> : <><Save size={20} /> Guardar y Generar Trazabilidad</>}
          </button>
        </div>
      </form>
    </div>
  );
}