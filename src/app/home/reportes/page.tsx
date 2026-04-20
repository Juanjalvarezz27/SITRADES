"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  MapPin, 
  User, 
  ShieldAlert,
  Search,
  FilterX,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';

import SearchBar from "../../components/ui/SearchBar";
import FilterSelect from "../../components/ui/FilterSelect";
import Pagination from "../../components/ui/Pagination";
import ReportePDFTemplate from "../../components/reportes/ReportePDFTemplate"; 

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { 
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC" 
  });
};

export default function CentroReportesPage() {
  const { data: session } = useSession();
  const nombreUsuario = session?.user?.name || "Administrador del Sistema";

  const pdfRef = useRef<HTMLDivElement>(null); 

  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroArea, setFiltroArea] = useState("TODOS");
  const [filtroUsuario, setFiltroUsuario] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [opcionesAreas, setOpcionesAreas] = useState<{value: string, label: string}[]>([]);
  const [opcionesUsuarios, setOpcionesUsuarios] = useState<{value: string, label: string}[]>([]);
  
  const opcionesEstados = [
    { value: "ACTIVA", label: "Activas / En Almacén" },
    { value: "DESCARTADA", label: "Descartadas Oficialmente" },
    { value: "ANULADA", label: "Anuladas por Error" }
  ];

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append("busqueda", busqueda);
      if (filtroArea !== "TODOS") params.append("area", filtroArea);
      if (filtroUsuario !== "TODOS") params.append("usuario", filtroUsuario);
      if (filtroEstado !== "TODOS") params.append("estado", filtroEstado);
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);

      const res = await fetch(`/api/reportes?${params.toString()}`); 
      if (!res.ok) throw new Error("Error de red");
      
      const data = await res.json();
      setReportes(data);
      
      if (opcionesAreas.length === 0) {
        const areas = Array.from(new Set(data.map((d: any) => d.area?.nombre))).filter(Boolean) as string[];
        setOpcionesAreas(areas.map(a => ({ value: a, label: a })));

        const usuarios = Array.from(new Set(data.map((d: any) => d.usuarioRegistrador?.nombre))).filter(Boolean) as string[];
        setOpcionesUsuarios(usuarios.map(u => ({ value: u, label: u })));
      }

    } catch (error) {
      toast.error("Error al cargar la data para reportes.");
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroArea, filtroUsuario, filtroEstado, fechaInicio, fechaFin]);

  useEffect(() => {
    fetchReportes();
    setCurrentPage(1); 
  }, [fetchReportes]);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    const toastId = toast.loading("Estructurando y generando Excel...");
    
    try {
      const dataParaExcel = reportes.map((item) => ({
        "Código Interno": item.codigo_interno,
        "Lote": item.lote,
        "Principio Activo": item.principio_activo,
        "Registro Sanitario": item.registro_sanitario || "N/A",
        "Cantidad": `${item.cantidad} ${item.unidad_medida?.nombre || ''}`,
        "Riesgo Bioseguridad": item.riesgo_bioseguridad,
        "Estado Actual": item.estado?.nombre,
        "Área Origen": item.area?.nombre || "N/A",
        "Dirección": item.area?.direccion?.nombre || "N/A",
        "Registrado Por": item.usuarioRegistrador?.nombre,
        "Fecha de Ingreso": formatearFecha(item.creado_en),
        "Fecha de Vencimiento": formatearFecha(item.fecha_caducidad),
        "Fecha Fin Retención": formatearFecha(item.fecha_fin_retencion),
        "Método de Descarte": item.reporte_descarte?.metodo_disposicion?.nombre || "N/A",
        "Fecha de Descarte": item.reporte_descarte?.fecha_descarte ? formatearFecha(item.reporte_descarte.fecha_descarte) : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoría SITRADES");

      const columnWidths = [
        { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, 
        { wch: 20 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
        { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 18 }
      ];
      worksheet['!cols'] = columnWidths;

      const nombreArchivo = `Reporte_Auditoria_SITRADES_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);

      toast.update(toastId, { render: "Excel descargado exitosamente.", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      toast.update(toastId, { render: "Error al generar Excel.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    setIsExportingPDF(true);
    const toastId = toast.loading("Preparando documento...");

    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // CONFIGURACIÓN EXACTAMENTE IGUAL A LA DE TrazabilidadModal.tsx
      const opt = {
        margin: [5, 0, 5, 0] as [number, number, number, number],
        filename: `Acta_Auditoria_SITRADES_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const
        },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(pdfRef.current).save();

      toast.update(toastId, { render: "¡PDF generado correctamente!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error(error);
      toast.update(toastId, { render: "Error al generar el PDF", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaInicio("");
    setFechaFin("");
    setFiltroArea("TODOS");
    setFiltroUsuario("TODOS");
    setFiltroEstado("TODOS");
  };

  const hayFiltrosActivos = busqueda || fechaInicio || fechaFin || filtroArea !== "TODOS" || filtroUsuario !== "TODOS" || filtroEstado !== "TODOS";
  const totalPages = Math.ceil(reportes.length / ITEMS_PER_PAGE);
  const reportesPaginados = reportes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getEstadoColor = (nombre: string) => {
    if (nombre?.includes("Destruida")) return "bg-blue-50 text-brand-primary border-blue-200";
    if (nombre?.includes("Anulada")) return "bg-red-50 text-red-600 border-red-200";
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
  };

  return (
    <>
      <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto relative">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8">
          <div className="space-y-2 w-full md:w-auto text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200">
                <FileText size={24} />
              </div>
              <h1 className="font-title font-black text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tighter">
                Centro de Reportes
              </h1>
            </div>
            <p className="text-slate-500 text-[13px] sm:text-sm font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
              Motor de auditoría avanzada. Filtre, analice y exporte la trazabilidad del sistema en formatos legales.
            </p>
          </div>
          
          {/* BOTONES DE EXPORTACIÓN */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleExportExcel}
              disabled={isExportingExcel || loading || reportes.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-2xl font-black text-[13px] transition-all disabled:opacity-50"
            >
              {isExportingExcel ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
              Exportar Datos (Excel)
            </button>

            <button 
              onClick={handleExportPDF}
              disabled={isExportingPDF || loading || reportes.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-[13px] transition-all shadow-md shadow-slate-800/20 disabled:opacity-50"
            >
              {isExportingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Generar Acta (PDF)
            </button>
          </div>
        </div>

        {/* PANEL DE FILTROS AVANZADOS */}
        <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm mb-8 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-black mb-2">
            <Search size={18} className="text-brand-primary" /> Filtros de Auditoría
          </div>
          
          <SearchBar 
            value={busqueda} 
            onChange={setBusqueda} 
            placeholder="Buscar por código interno, lote o principio activo..." 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <FilterSelect value={filtroArea} onChange={setFiltroArea} options={opcionesAreas} defaultLabel="Todas las Áreas" icon={MapPin} />
            <FilterSelect value={filtroUsuario} onChange={setFiltroUsuario} options={opcionesUsuarios} defaultLabel="Todos los Analistas" icon={User} />
            <FilterSelect value={filtroEstado} onChange={setFiltroEstado} options={opcionesEstados} defaultLabel="Cualquier Estado" icon={ShieldAlert} />
            
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 focus:border-brand-primary outline-none transition-all cursor-pointer" />
              <span className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-slate-400 uppercase tracking-tighter">Desde</span>
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 focus:border-brand-primary outline-none transition-all cursor-pointer" />
              <span className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hasta</span>
            </div>
          </div>

          {hayFiltrosActivos && (
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={limpiarFiltros} className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-rose-500 transition-colors">
                <FilterX size={14} /> Restablecer Filtros
              </button>
            </div>
          )}
        </div>

        {/* RESULTADOS */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden mb-6">
          
          <div className="hidden md:grid grid-cols-5 gap-4 p-5 bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
            <div>Código / Lote</div>
            <div>Producto</div>
            <div>Ubicación</div>
            <div>Registro / Analista</div>
            <div>Estado Actual</div>
          </div>

          <div className="flex flex-col p-4 md:p-0 gap-4 md:gap-0 bg-slate-50/50 md:bg-transparent">
            {loading ? (
              <div className="p-10 text-center text-slate-400 font-medium bg-white md:bg-transparent rounded-2xl md:rounded-none">
                Cargando registros...
              </div>
            ) : reportesPaginados.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium bg-white md:bg-transparent rounded-2xl md:rounded-none">
                No se encontraron registros con los filtros actuales.
              </div>
            ) : (
              reportesPaginados.map((item) => {
                const colorEstado = getEstadoColor(item.estado?.nombre);

                return (
                  <div 
                    key={item.id} 
                    className="bg-white border border-slate-100 md:border-0 md:border-b md:border-slate-100 rounded-2xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50/50 transition-colors"
                  >
                    
                    {/* === VISTA ESCRITORIO === */}
                    <div className="hidden md:grid md:grid-cols-5 gap-4 p-5 items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[14px]">{item.codigo_interno}</span>
                        <span className="text-[12px] text-slate-500">Lote: {item.lote}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-[13px]">{item.principio_activo}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{item.cantidad} {item.unidad_medida?.nombre}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-slate-600 font-medium">{item.area?.nombre || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-slate-600">{formatearFecha(item.creado_en)}</span>
                        <span className="text-[11px] font-bold text-brand-primary">{item.usuarioRegistrador?.nombre}</span>
                      </div>
                      <div className="flex flex-col items-start justify-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${colorEstado}`}>
                          {item.estado?.nombre || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* === VISTA MÓVIL === */}
                    <div className="flex md:hidden flex-col p-4 gap-4 relative">
                      
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Fecha Reg.</span>
                          <span className="text-[12px] font-bold text-slate-700">{formatearFecha(item.creado_en)}</span>
                        </div>
                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${colorEstado}`}>
                          {item.estado?.nombre || "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Producto</span>
                          <span className="font-black text-slate-800 text-[15px] leading-tight">{item.principio_activo}</span>
                          <span className="text-[12px] font-medium text-slate-500 mt-0.5">{item.cantidad} {item.unidad_medida?.nombre}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            Cód: {item.codigo_interno}
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            Lote: {item.lote}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5 flex items-center gap-1">
                            <MapPin size={10}/> Ubicación
                          </span>
                          <span className="text-[12px] font-bold text-slate-700 truncate">{item.area?.nombre || "N/A"}</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-200 pl-3">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5 flex items-center gap-1">
                            <User size={10}/> Analista
                          </span>
                          <span className="text-[12px] font-bold text-brand-primary truncate">{item.usuarioRegistrador?.nombre}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />
      </div>

      {/* PLANTILLA DE PDF COLOCADA FUERA DEL DIV PRINCIPAL, COMO EN EL MODAL */}
      <ReportePDFTemplate 
        ref={pdfRef} 
        reportes={reportes} 
        generadoPor={nombreUsuario}
        filtros={{
          busqueda,
          area: filtroArea === "TODOS" ? "Todas las áreas" : filtroArea,
          usuario: filtroUsuario === "TODOS" ? "Todos los analistas" : filtroUsuario,
          estado: filtroEstado === "TODOS" ? "Cualquier estado" : filtroEstado,
          fechaInicio,
          fechaFin
        }}
      />
    </>
  );
}