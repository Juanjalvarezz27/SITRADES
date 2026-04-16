"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ShieldAlert, PackageX, CheckCircle2, ArrowRight, ArrowLeft, 
  Trash2, FileSignature, AlertOctagon, Loader2, Thermometer, Info,
  ChevronDown, Check, Plus, Save, X
} from "lucide-react";
import { toast } from "react-toastify";

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
        className={`w-full px-4 py-4 rounded-2xl border ${
          isOpen 
            ? 'border-rose-500 ring-4 ring-rose-500/10 bg-white text-slate-800' 
            : 'border-slate-200 bg-white hover:border-rose-300'
        } outline-none transition-all text-[14px] font-bold text-left flex justify-between items-center shadow-sm pl-12`}
      >
        <span className={`truncate pr-4 ${value ? "text-slate-700" : "text-slate-400 font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={20} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-rose-500' : 'text-slate-400'}`} />
      </button>

      {/* Ícono de termómetro fijo en la izquierda */}
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${isOpen ? 'text-rose-600' : 'text-rose-500'}`}>
        <Thermometer size={20} />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 min-w-full sm:min-w-[280px] mt-2 bg-white border border-slate-100 rounded-[1.2rem] shadow-[0_12px_40px_rgb(0,0,0,0.12)] py-2 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in slide-in-from-top-2 origin-top flex flex-col">
          <div
            onClick={() => { onChange(name, ""); setIsOpen(false); }}
            className={`mx-2 my-1 px-3 py-3 text-[13px] rounded-xl font-medium cursor-pointer transition-colors flex justify-between items-center ${
              !value ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {placeholder}
            {!value && <Check size={16} strokeWidth={3} className="shrink-0 text-rose-600" />}
          </div>
          
          {options.map((opt: any) => (
            <div
              key={opt.value}
              onClick={() => { onChange(name, opt.value); setIsOpen(false); }}
              className={`mx-2 my-1 px-3 py-3 text-[13px] rounded-xl font-medium cursor-pointer transition-colors flex justify-between items-center ${
                value?.toString() === opt.value ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="truncate pr-2">{opt.label}</span>
              {value?.toString() === opt.value && <Check size={16} strokeWidth={3} className="shrink-0 text-rose-600" />}
            </div>
          ))}

          {onAddNew && (
            <div className="border-t border-slate-100 mt-2 p-2 shrink-0">
              {!isAddingNew ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsAddingNew(true); }}
                  className="w-full text-left px-3 py-2.5 text-[13px] text-rose-600 font-bold hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} /> Añadir nueva técnica
                </button>
              ) : (
                <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all w-full shadow-inner">
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
                      className="flex items-center justify-center w-8 h-8 bg-rose-600 text-white rounded-lg disabled:opacity-50 hover:bg-rose-700 transition-all shadow-sm"
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

export default function DescarteWizardPage() {
  const params = useParams();
  const router = useRouter();
  
  const [muestra, setMuestra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [pasoActual, setPasoActual] = useState(1);

  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  
  // NUEVOS ESTADOS PARA MÉTODOS DINÁMICOS 
  const [metodosOpciones, setMetodosOpciones] = useState<{value: string, label: string}[]>([]);
  const [metodoId, setMetodoId] = useState(""); 
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMuestras, resMetodos] = await Promise.all([
          fetch(`/api/muestras?fase=descarte`),
          fetch(`/api/metodos-disposicion`)
        ]);
        
        const dataMuestras = await resMuestras.json();
        const encontrada = dataMuestras.find((m: any) => m.id === params.id);
        
        if (!encontrada) throw new Error("Muestra no encontrada");
        setMuestra(encontrada);

        if (resMetodos.ok) {
          const dataMetodos = await resMetodos.json();
          setMetodosOpciones(dataMetodos.map((m: any) => ({ value: m.id.toString(), label: m.nombre })));
        }

      } catch (error) {
        toast.error("Error al cargar los datos necesarios.");
        router.push("/home/muestras/descarte");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  // FUNCIÓN PARA CREAR NUEVO MÉTODO 
  const crearMetodo = async (nombre: string) => {
    try {
      const res = await fetch("/api/metodos-disposicion", { 
        method: "POST", 
        body: JSON.stringify({ nombre }) 
      });
      const nuevo = await res.json();
      const nuevaOpcion = { value: nuevo.id.toString(), label: nuevo.nombre };
      
      setMetodosOpciones(prev => [...prev, nuevaOpcion].sort((a,b) => a.label.localeCompare(b.label)));
      setMetodoId(nuevo.id.toString()); 
      toast.success("Técnica añadida al catálogo exitosamente");
    } catch { 
      toast.error("Error al añadir la nueva técnica"); 
    }
  };

  const handleSubmit = async () => {
    if (!metodoId) return toast.warning("Debe seleccionar un método de disposición final.");
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/muestras/${muestra.id}/descarte`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_disposicion_id: metodoId, observaciones })
      });

      const responseData = await res.json();

      if (!res.ok) throw new Error(responseData.error || "Error al procesar el descarte");

      toast.success("Certificado de destrucción firmado con éxito.");
      router.push("/home/muestras/inactivo"); 

    } catch (error: any) {
      toast.error(error.message || "Error al ejecutar el protocolo.");
      setIsSubmitting(false);
    }
  };

  if (loading || !muestra) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-bold uppercase tracking-widest text-sm">Cargando protocolo...</p>
      </div>
    );
  }

  const paso2Completado = check1 && check2 && check3;

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1000px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER DEL WIZARD */}
      <div className="mb-8 md:mb-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center p-4 bg-rose-100 text-rose-600 rounded-full mb-2">
          <Trash2 size={32} />
        </div>
        <h1 className="font-title font-black text-2xl md:text-3xl text-slate-800">Protocolo de Descarte y Segregación</h1>
        <p className="text-slate-500 font-medium text-sm md:text-base px-4">Decreto N° 2.218 - Normas para el Manejo de Desechos en Establecimientos de Salud</p>
      </div>

      {/* BARRA DE PROGRESO RESPONSIVE */}
      <div className="flex items-center justify-between relative mb-8 md:mb-12 max-w-2xl mx-auto px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10" />
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-rose-500 rounded-full -z-10 transition-all duration-500`} style={{ width: pasoActual === 1 ? '0%' : pasoActual === 2 ? '50%' : '100%' }} />

        {[
          { num: 1, icon: PackageX, label: "Verificación" },
          { num: 2, icon: AlertOctagon, label: "Segregación" },
          { num: 3, icon: FileSignature, label: "Cierre" },
        ].map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-2 bg-slate-50/80 px-1 md:px-2">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors border-4 ${pasoActual >= step.num ? "bg-rose-500 text-white border-rose-100 shadow-md" : "bg-slate-100 text-slate-400 border-white"}`}>
              {pasoActual > step.num ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
            </div>
            <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${pasoActual >= step.num ? "text-rose-600" : "text-slate-400"}`}>{step.label}</span>
          </div>
        ))}
      </div>

      {/* CONTENEDOR DEL WIZARD */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
        
        {/* ================= PASO 1 ================= */}
        {pasoActual === 1 && (
          <div className="p-6 sm:p-8 md:p-10 animate-in slide-in-from-right-4">
            <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2 mb-6 border-b pb-4">
              <span className="text-rose-500">1.</span> Verificación Física del Residuo
            </h2>
            
            <div className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-100 space-y-5">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <ShieldAlert className="text-rose-500 shrink-0" size={32} />
                <div>
                  <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wide">Principio Activo a Destruir</p>
                  <p className="font-black text-slate-800 text-base md:text-lg leading-tight mt-0.5">{muestra.principio_activo}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Código Interno</p>
                  <p className="font-black text-slate-700">{muestra.codigo_interno}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lote Sistema</p>
                  <p className="font-black text-slate-700">{muestra.lote}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cantidad Total</p>
                  <p className="font-black text-rose-600">{muestra.cantidad} {muestra.unidad_medida?.nombre || ""}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nivel de Riesgo</p>
                  <p className="font-bold text-slate-700">{muestra.riesgo_bioseguridad}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setPasoActual(2)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
                Confirmar Identidad Física <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 2 ================= */}
        {pasoActual === 2 && (
          <div className="p-6 sm:p-8 md:p-10 animate-in slide-in-from-right-4">
            <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
              <span className="text-rose-500">2.</span> Lista de Verificación Legal
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mb-8">El analista debe confirmar el acondicionamiento físico de la muestra según su tipo (C, D o E).</p>

            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${check1 ? 'bg-rose-50/50 border-rose-500' : 'bg-white border-slate-200 hover:border-rose-200'}`}>
                <input type="checkbox" checked={check1} onChange={(e) => setCheck1(e.target.checked)} className="mt-1 w-5 h-5 accent-rose-600 shrink-0" />
                <div>
                  <span className={`block font-black text-[13px] md:text-[14px] ${check1 ? 'text-rose-700' : 'text-slate-700'}`}>Clasificación y Empaque Correcto</span>
                  <p className="text-[11px] md:text-[12px] text-slate-500 font-medium mt-1 leading-relaxed">La muestra fue segregada en envase resistente o bolsa de polietileno blanco opaco (Mín. 0.10mm) o PVC si requiere esterilización por calor.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${check2 ? 'bg-rose-50/50 border-rose-500' : 'bg-white border-slate-200 hover:border-rose-200'}`}>
                <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} className="mt-1 w-5 h-5 accent-rose-600 shrink-0" />
                <div>
                  <span className={`block font-black text-[13px] md:text-[14px] ${check2 ? 'text-rose-700' : 'text-slate-700'}`}>Etiquetado Visual de Seguridad</span>
                  <p className="text-[11px] md:text-[12px] text-slate-500 font-medium mt-1 leading-relaxed">El recipiente cuenta con la identificación "DESECHOS PELIGROSOS" en letras rojas mayores a 5cm y el logotipo universal de Riesgo Biológico.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${check3 ? 'bg-rose-50/50 border-rose-500' : 'bg-white border-slate-200 hover:border-rose-200'}`}>
                <input type="checkbox" checked={check3} onChange={(e) => setCheck3(e.target.checked)} className="mt-1 w-5 h-5 accent-rose-600 shrink-0" />
                <div>
                  <span className={`block font-black text-[13px] md:text-[14px] ${check3 ? 'text-rose-700' : 'text-slate-700'}`}>Hermeticidad y Traslado Interno</span>
                  <p className="text-[11px] md:text-[12px] text-slate-500 font-medium mt-1 leading-relaxed">El recipiente ha sido sellado herméticamente y está posicionado en el área transitoria para su recolección o tratamiento inmediato.</p>
                </div>
              </label>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-4">
              <button onClick={() => setPasoActual(1)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3.5 rounded-xl font-bold transition-colors">
                <ArrowLeft size={18} /> Volver
              </button>
              <button 
                onClick={() => setPasoActual(3)} 
                disabled={!paso2Completado}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                Continuar al Cierre <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 3 ================= */}
        {pasoActual === 3 && (
          <div className="p-6 sm:p-8 md:p-10 animate-in slide-in-from-right-4">
            <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
              <span className="text-rose-500">3.</span> Certificación Digital
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mb-8">Defina el método de tratamiento para garantizar la inocuidad de la muestra.</p>

            <div className="space-y-6">
              
              {/* SELECT DINÁMICO IMPLEMENTADO AQUÍ */}
              <div className="relative">
                <label className="block text-[12px] font-bold text-slate-600 uppercase mb-2">Método de Disposición o Tratamiento (Obligatorio)</label>
                
                <CustomSelect 
                  name="metodoId" 
                  value={metodoId} 
                  options={metodosOpciones} 
                  onChange={(name: string, val: string) => setMetodoId(val)} 
                  onAddNew={crearMetodo} 
                  placeholder="Seleccione técnica de inactivación..."
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 uppercase mb-2">Observaciones o N° Acta (Opcional)</label>
                <textarea 
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Destrucción certificada en horno principal. Restos enviados a relleno sanitario."
                  className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-medium text-[14px] text-slate-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 min-h-[120px] transition-all resize-none shadow-sm hover:border-rose-300"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 md:p-5 rounded-2xl flex gap-3 text-amber-800 items-start shadow-sm">
                <Info size={24} className="shrink-0 mt-0.5" />
                <p className="text-[11px] md:text-[12px] font-medium leading-relaxed">
                  <strong>Aviso Legal:</strong> Al hacer clic en "Firmar y Ejecutar", usted certifica como Analista del INHRR que el proceso físico se ha cumplido. Esta acción es <strong>irreversible</strong> y el registro pasará al Archivo Histórico para auditoría.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between gap-4">
              <button onClick={() => setPasoActual(2)} disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-xl font-bold transition-colors">
                <ArrowLeft size={18} /> Atrás
              </button>
              
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !metodoId}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white min-w-[260px] py-4 px-6 rounded-2xl font-black text-[15px] transition-all shadow-lg shadow-rose-600/30 active:scale-95 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 size={20} className="animate-spin" /> Procesando Firma...</>
                ) : (
                  <><FileSignature size={20} /> Firmar y Ejecutar Descarte</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}