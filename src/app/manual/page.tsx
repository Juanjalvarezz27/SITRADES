"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Target, 
  ShieldCheck, 
  Users, 
  Package, 
  Trash2, 
  Biohazard, 
  Activity, 
  QrCode, 
  FileText, 
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  MousePointerClick,
  Filter,
  LayoutDashboard
} from "lucide-react";

export default function ManualUsuarioPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleVolver = () => {
    // Si hay una sesión activa, volvemos al dashboard. Si no, al login.
    if (session) {
      router.push("/home");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER BANNER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-slate-900">SITRADES</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manual de Usuario</p>
            </div>
          </div>
          
          {/* BOTÓN DE REGRESO DINÁMICO */}
          <button 
            onClick={handleVolver}
            className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver al Sistema</span>
            <span className="sm:hidden">Volver</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* NAVEGACIÓN LATERAL (STICKY) */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-28 z-10 bg-white md:bg-transparent p-4 md:p-0 rounded-3xl md:rounded-none border border-slate-200 md:border-none shadow-sm md:shadow-none">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-3">Índice del Manual</h3>
          <nav className="flex flex-col gap-1">
            <button onClick={() => scrollToSection('introduccion')} className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
              1. Introducción <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button onClick={() => scrollToSection('navegacion')} className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
              2. Navegación Básica <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button onClick={() => scrollToSection('roles')} className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
              3. Roles y Permisos <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button onClick={() => scrollToSection('flujo')} className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
              4. Flujo Operativo <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button onClick={() => scrollToSection('certificacion')} className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
              5. Trazabilidad QR <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 space-y-12 pb-20 w-full">
          
          {/* SECCIÓN 1: INTRODUCCIÓN */}
          <section id="introduccion" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Target size={20} /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">1. Introducción y Objetivos</h2>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
              <p>
                Bienvenidos a <strong>SITRADES</strong> (Sistema de Trazabilidad y Gestión de Desechos en el Control de Muestras). Una plataforma diseñada específicamente para gestionar el ciclo de vida de las muestras biológicas y especialidades farmacéuticas en almacenamiento.
              </p>
              <p>
                Este sistema garantiza el cumplimiento de los protocolos legales y de bioseguridad, automatizando la vigilancia del tiempo de retención y digitalizando las actas de destrucción.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <Activity className="text-indigo-500 mb-3" size={24} />
                  <h4 className="font-bold text-slate-800 mb-2">Trazabilidad Total</h4>
                  <p className="text-xs font-medium text-slate-500">Registro inmutable de cada paso de la muestra, desde su ingreso hasta su destrucción.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <ShieldCheck className="text-emerald-500 mb-3" size={24} />
                  <h4 className="font-bold text-slate-800 mb-2">Seguridad Legal</h4>
                  <p className="text-xs font-medium text-slate-500">Generación de Certificados PDF y validación de auditoría mediante códigos QR.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <Biohazard className="text-rose-500 mb-3" size={24} />
                  <h4 className="font-bold text-slate-800 mb-2">Control de Riesgos</h4>
                  <p className="text-xs font-medium text-slate-500">Alertas tempranas de vencimiento y gestión estructurada de rutas de recolección.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: NAVEGACIÓN BÁSICA (NUEVA SECCIÓN) */}
          <section id="navegacion" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><MousePointerClick size={20} /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">2. Navegación y Uso Básico</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="p-3 bg-slate-50 w-fit rounded-xl border border-slate-100 text-slate-600 mb-2">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="font-black text-lg text-slate-800">Menú Principal (Lateral)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Toda la navegación del sistema se encuentra en la barra lateral izquierda. Desde allí puedes acceder a tus módulos permitidos. Si usas un dispositivo móvil, el menú se oculta automáticamente bajo el botón de las tres rayas en la parte superior.
                </p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="p-3 bg-slate-50 w-fit rounded-xl border border-slate-100 text-slate-600 mb-2">
                  <Filter size={24} />
                </div>
                <h3 className="font-black text-lg text-slate-800">Filtros Inteligentes</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  En los módulos de Inventario y Archivo, encontrarás una barra de búsqueda y botones desplegables. Úsalos para filtrar registros por Piso, Área o Estado Legal. Los resultados se actualizan instantáneamente sin necesidad de recargar la página.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: ROLES */}
          <section id="roles" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={20} /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">3. Roles y Permisos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Analista */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -z-0 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <h3 className="font-black text-lg text-blue-900 mb-1">Analista de Laboratorio</h3>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Gestión Operativa</p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-400 shrink-0 mt-0.5" /> Registrar ingreso de nuevas muestras.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-400 shrink-0 mt-0.5" /> Consultar el inventario activo de sus áreas.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-400 shrink-0 mt-0.5" /> Ejecutar la segregación y enviar a Cola de Descarte.</li>
                  </ul>
                </div>
              </div>

              {/* Seguridad Industrial */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-[4rem] -z-0 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <h3 className="font-black text-lg text-rose-900 mb-1">Seguridad Industrial</h3>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">Logística y Cierre</p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-rose-400 shrink-0 mt-0.5" /> Monitorear el módulo de Recolección.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-rose-400 shrink-0 mt-0.5" /> Confirmar el traslado de bolsas rojas biopeligrosas.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-rose-400 shrink-0 mt-0.5" /> Generar estadísticas y reportes de cumplimiento.</li>
                  </ul>
                </div>
              </div>

              {/* Administrador */}
              <div className="bg-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group md:col-span-2">
                <div className="absolute right-0 bottom-0 text-slate-700/50"><Lock size={120} className="-mr-6 -mb-6" /></div>
                <div className="relative z-10">
                  <h3 className="font-black text-lg text-white mb-1">Administrador del Sistema</h3>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Control Total</p>
                  <p className="text-sm text-slate-300 max-w-2xl">
                    Tiene acceso irrestricto a todos los módulos. Es el único autorizado para crear nuevos usuarios, configurar la infraestructura (Pisos, Direcciones, Áreas) y anular registros erróneos del sistema para mantener la integridad de la base de datos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: FLUJO OPERATIVO */}
          <section id="flujo" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Activity size={20} /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">4. Flujo Operativo Estándar</h2>
            </div>

            <div className="space-y-4">
              
              <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 font-black text-xl rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">1</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-2"><Package size={18} className="text-indigo-500" /> Inventario Activo</h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">La muestra ingresa al sistema con sus datos técnicos (Lote, Registro Sanitario, Fechas). El sistema vigila silenciosamente el tiempo. Cuando la fecha de retención legal expira, la muestra se marca como <span className="font-bold text-amber-600">Vencida (En Custodia)</span>.</p>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 font-black text-xl rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">2</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-2"><Trash2 size={18} className="text-amber-500" /> Cola de Descarte</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">El Analista revisa las muestras con retención cumplida. Inicia el protocolo de inactivación, selecciona el método adecuado, firma electrónicamente y la muestra se empaca en bolsa roja.</p>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 font-black text-xl rounded-2xl flex items-center justify-center shrink-0 border border-rose-100">3</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-2"><Biohazard size={18} className="text-rose-500" /> Logística de Recolección</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Seguridad Industrial recibe la alerta, se dirige al laboratorio correspondiente, retira la bolsa y certifica el traslado en el sistema, cerrando la cadena de custodia física.</p>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 font-black text-xl rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">4</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-2"><FileText size={18} className="text-emerald-500" /> Archivo Histórico</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">La muestra desaparece del inventario activo y pasa al archivo inactivo. Queda registrada permanentemente para futuras auditorías, permitiendo imprimir su Certificado de Cierre.</p>
                </div>
              </div>

            </div>
          </section>

          {/* SECCIÓN 5: QR Y TRAZABILIDAD */}
          <section id="certificacion" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><QrCode size={20} /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">5. Trazabilidad y Validación QR</h2>
            </div>

            <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <div className="flex-1 space-y-4 text-slate-300">
                <h3 className="text-2xl font-black text-white">Auditoría Transparente</h3>
                <p className="leading-relaxed text-sm">
                  Cada muestra en el Archivo Histórico genera un <strong>Certificado de Descarte en PDF</strong>. Este documento incluye todas las firmas, fechas y observaciones legales de los responsables.
                </p>
                <p className="leading-relaxed text-sm">
                  Para prevenir falsificaciones, el sistema incrusta un <strong>Código QR único</strong> en cada acta. Cualquier auditor que escanee este código con su teléfono celular será redirigido al portal público de SITRADES, verificando en tiempo real la validez del documento contra nuestra base de datos.
                </p>
              </div>
              <div className="w-40 h-40 bg-white p-4 rounded-3xl shrink-0 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                <QrCode size={120} className="text-slate-800" />
              </div>
            </div>
          </section>

        </main>
      </div>
      
    </div>
  );
}