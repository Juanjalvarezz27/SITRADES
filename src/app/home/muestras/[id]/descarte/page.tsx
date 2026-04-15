"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ShieldAlert, PackageX, CheckCircle2, ArrowRight, ArrowLeft, 
  Trash2, FileSignature, AlertOctagon, Loader2, Thermometer, Info, ChevronDown
} from "lucide-react";
import { toast } from "react-toastify";

// Opciones del menú personalizado
const OPCIONES_METODO = [
  "Esterilización por Autoclave (Vapor)",
  "Incineración Controlada",
  "Inactivación Térmica",
  "Neutralización Química / Disolución"
];

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
  
  const [metodo, setMetodo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  // Estado para controlar nuestro Select Personalizado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchMuestra = async () => {
      try {
        const res = await fetch(`/api/muestras?fase=descarte`); 
        const data = await res.json();
        const encontrada = data.find((m: any) => m.id === params.id);
        
        if (!encontrada) throw new Error("Muestra no encontrada");
        setMuestra(encontrada);
      } catch (error) {
        toast.error("Error al cargar los datos de la muestra.");
        router.push("/home/muestras/descarte");
      } finally {
        setLoading(false);
      }
    };
    fetchMuestra();
  }, [params.id, router]);

  const handleSubmit = async () => {
    if (!metodo) return toast.warning("Debe seleccionar un método de disposición final.");
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/muestras/${muestra.id}/descarte`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_disposicion: metodo, observaciones })
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
                  <p className="font-black text-rose-600">{muestra.cantidad} {muestra.unidad_medida}</p>
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
              
              {/*  NUEVO SELECT PERSONALIZADO CON REACT */}
              <div className="relative">
                <label className="block text-[12px] font-bold text-slate-600 uppercase mb-2">Método de Disposición o Tratamiento (Obligatorio)</label>
                
                <div className="relative">
                  {/* Ícono Izquierdo */}
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${isDropdownOpen ? 'text-rose-600' : 'text-rose-500'}`}>
                    <Thermometer size={20} />
                  </div>
                  
                  {/* Botón "Trigger" del Select */}
                  <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full text-left pl-12 pr-10 py-4 bg-white border-2 rounded-2xl font-bold text-[14px] transition-all shadow-sm flex items-center justify-between outline-none
                      ${isDropdownOpen ? 'border-rose-500 ring-4 ring-rose-500/10 text-slate-800' : 'border-slate-200 hover:border-rose-300 text-slate-700'}
                    `}
                  >
                    <span className={!metodo ? "text-slate-400 font-medium" : ""}>
                      {metodo || "Seleccione técnica de inactivación..."}
                    </span>
                  </button>

                  {/* Flecha Derecha */}
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 z-10 ${isDropdownOpen ? 'rotate-180 text-rose-500' : 'text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>

                  {/* Caja de Opciones */}
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                          {OPCIONES_METODO.map((opcion) => (
                            <button
                              key={opcion}
                              type="button"
                              onClick={() => {
                                setMetodo(opcion);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all flex items-center 
                                ${metodo === opcion ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                              `}
                            >
                              {opcion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
                disabled={isSubmitting || !metodo}
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