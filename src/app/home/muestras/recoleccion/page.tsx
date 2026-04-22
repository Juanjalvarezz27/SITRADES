"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  ShieldAlert, 
  MapPin, 
  User, 
  Package, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock
} from "lucide-react";
import { toast } from "react-toastify";
import ModalCertificacionTraslado from "../../../components/recoleccion/ModalCertificacionTraslado";

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleString("es-VE", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
};

export default function CentroRecoleccionPage() {
  const { data: session } = useSession();
  
  // 🛡️ CONTROL DE ROLES
  const nombreUsuario = session?.user?.name || "Personal Autorizado";
  // NOTA: Asegúrate de que tu session guarde el nombre del rol en 'session.user.rol' o ajusta la ruta abajo.
  const rolUsuario = (session?.user as any)?.rol || ""; 
  const rolesPermitidos = ["Administrador", "Seguridad Industrial"];
  const tienePermiso = rolesPermitidos.includes(rolUsuario);

  const [bolsas, setBolsas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recoleccion/pendientes`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al cargar bolsas");

      if (Array.isArray(data)) {
        setBolsas(data);
      } else if (data && Array.isArray(data.pendientes)) {
        setBolsas(data.pendientes);
      } else {
        setBolsas([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor.");
      setBolsas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  const toggleSeleccion = (id: string) => {
    if (!tienePermiso) return; // Si no tiene permiso, ni siquiera puede seleccionar
    setSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmarRecoleccion = async (confirmacionEmpaque: boolean) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Registrando traslado y disposición final...");

    try {
      const res = await fetch(`/api/recoleccion/confirmar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          muestraIds: seleccionadas,
          confirmacionEmpaque: confirmacionEmpaque
        })
      });

      if (!res.ok) throw new Error("Error al confirmar");

      toast.update(toastId, { render: "¡Recolección completada con éxito!", type: "success", isLoading: false, autoClose: 3000 });
      setIsModalOpen(false);
      setSeleccionadas([]);
      fetchPendientes(); 
      
    } catch (error) {
      toast.update(toastId, { render: "Error al procesar la solicitud.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto relative min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8">
        <div className="space-y-2 w-full md:w-auto text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
              <ShieldAlert size={24} />
            </div>
            <h1 className="font-title font-black text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tighter">
              Logística de Recolección
            </h1>
          </div>
          <p className="text-slate-500 text-[13px] sm:text-sm font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
            Panel de control para Seguridad Industrial. Gestión de traslado de desechos biopeligrosos (Res. 072).
          </p>
        </div>

        {/* BOTÓN DE ACCIÓN FLOTANTE/SUPERIOR */}
        {seleccionadas.length > 0 && tienePermiso && (
          <div className="bg-white border border-indigo-100 p-2 rounded-2xl shadow-sm flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <span className="text-[13px] font-black text-indigo-900 ml-3">
              {seleccionadas.length} Bolsa(s) seleccionadas
            </span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[13px] transition-all shadow-md shadow-indigo-600/20"
            >
              <CheckSquare size={16} />
              Iniciar Traslado
            </button>
          </div>
        )}
      </div>

      {/* MENSAJE DE PERMISOS */}
      {!tienePermiso && !loading && bolsas.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800">
          <Lock size={20} className="shrink-0" />
          <p className="text-[13px] font-medium">
            Solo el personal de <strong>Seguridad Industrial</strong> y <strong>Administradores</strong> pueden registrar el traslado de bolsas rojas. Usted tiene acceso de solo lectura.
          </p>
        </div>
      )}

      {/* LISTA DE BOLSAS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4 text-indigo-600" />
          <p className="font-bold">Buscando bolsas pendientes en las áreas...</p>
        </div>
      ) : bolsas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">¡Todo limpio por ahora!</h3>
          <p className="text-slate-500 font-medium">No hay bolsas rojas pendientes de recolección en los laboratorios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bolsas.map((bolsa) => {
            const isSelected = seleccionadas.includes(bolsa.id);
            
            return (
              <div 
                key={bolsa.id}
                onClick={() => toggleSeleccion(bolsa.id)}
                className={`transition-all duration-200 border-2 rounded-[1.5rem] p-5 relative overflow-hidden ${
                  tienePermiso ? "cursor-pointer" : "cursor-not-allowed opacity-80"
                } ${
                  isSelected 
                    ? "bg-indigo-50/50 border-indigo-500 shadow-md shadow-indigo-500/10" 
                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Indicador de selección */}
                {tienePermiso && (
                  <div className={`absolute top-5 right-5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-slate-50"
                  }`}>
                    {isSelected && <CheckSquare size={14} />}
                  </div>
                )}

                {/* Cabecera de Tarjeta */}
                <div className="pr-10 mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-red-50 text-red-600 font-black text-[10px] px-2 py-0.5 rounded border border-red-100 uppercase flex items-center gap-1">
                      <AlertTriangle size={10} /> Riesgo Biológico
                    </span>
                    <span className="text-slate-400 font-bold text-[10px]">{bolsa.codigo_interno}</span>
                  </div>
                  <h3 className="font-black text-slate-800 text-[16px] leading-tight line-clamp-2">
                    {bolsa.principio_activo}
                  </h3>
                </div>

                {/* Data de la Bolsa */}
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ubicación a despejar</p>
                      <p className="text-[12px] font-bold text-slate-700">{bolsa.area?.nombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2.5 border-t border-slate-200/50 pt-2">
                    <Package size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contenido</p>
                      <p className="text-[12px] font-medium text-slate-600">{bolsa.cantidad} {bolsa.unidad_medida?.nombre} (Lote: {bolsa.lote})</p>
                    </div>
                  </div>
                </div>

                {/* Pie de Tarjeta */}
                <div className="flex justify-between items-center mt-4 text-[11px]">
                  <p className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock size={12} className="text-slate-400" />
                    Hace: {formatearFecha(bolsa.actualizado_en)}
                  </p>
                  <p className="flex items-center gap-1 text-slate-500">
                    <User size={12} className="text-slate-400" />
                    Analista: <strong className="text-slate-700">{bolsa.usuarioRegistrador?.nombre}</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPONENTE MODAL EXTRAÍDO */}
      <ModalCertificacionTraslado 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmarRecoleccion}
        cantidadBolsas={seleccionadas.length}
        nombreUsuario={nombreUsuario}
        isSubmitting={isSubmitting}
      />

    </div>
  );
}