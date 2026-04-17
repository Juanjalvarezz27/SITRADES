"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Mail, Shield, MapPin, Loader2, Calendar, Fingerprint, Edit } from "lucide-react";
import { toast } from "react-toastify";
import EditProfileModal from "../../components/ui/EditProfileModal"; 

const formatearFecha = (fecha: string) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" });
};

export default function PerfilPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPerfil = useCallback(async () => {
    try {
      const res = await fetch("/api/perfil");
      if (!res.ok) throw new Error("Error al cargar datos");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("No se pudo cargar la información del perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-600 gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="font-semibold text-sm tracking-widest text-slate-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-5xl mx-auto space-y-8">
      
      {/* Cabecera y Botón de Edición */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">
            Mi Perfil
          </h1>
          <p className="text-slate-500 font-medium mt-1.5">
            Información de cuenta y credenciales de acceso al sistema.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-primary hover:text-brand-primary px-6 py-3 rounded-2xl font-semibold transition-all shadow-sm active:scale-95"
        >
          <Edit size={18} /> Modificar perfil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta Principal (Identidad) */}
        <div className="lg:col-span-1 bg-white border-2 border-slate-100 rounded-[2rem] p-8 text-center shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[320px]">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5"></div>
          
          <div className="relative z-10 flex flex-col items-center mt-4">
            <div className="w-28 h-28 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center text-slate-300 mb-5">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h2 className="font-black text-2xl text-slate-800 mb-2">{data.nombre}</h2>
            <div className="flex flex-col gap-2 w-full mt-2">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm tracking-wide border border-purple-100">
                {data.rol?.nombre || "Sin Rol"}
              </span>
              <span className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm tracking-wide border border-blue-100 gap-2">
                <MapPin size={16} /> {data.area?.nombre || "Sin Área"}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Detalles (Toda la data) */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
            <Fingerprint size={20} className="text-brand-primary" /> Detalles de la Cuenta
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <User size={14} /> Nombre Registrado
              </span>
              <p className="font-medium text-slate-800 text-[16px] bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                {data.nombre}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Mail size={14} /> Correo Electrónico
              </span>
              <p className="font-medium text-slate-800 text-[16px] bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                {data.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Shield size={14} /> Nivel de Privilegios
              </span>
              <p className="font-medium text-slate-800 text-[16px] bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                {data.rol?.nombre}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <MapPin size={14} /> Departamento / Área
              </span>
              <p className="font-medium text-slate-800 text-[16px] bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                {data.area?.nombre}
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Calendar size={14} /> Miembro Desde
              </span>
              <p className="font-medium text-slate-800 text-[16px] bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                {formatearFecha(data.creado_en)}
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Fingerprint size={14} /> ID Interno de Sistema
              </span>
              <p className="font-medium text-slate-500 text-[14px] bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 font-mono">
                {data.id}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Renderizamos el Modal */}
      <EditProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={{ nombre: data.nombre, email: data.email }}
        onSuccess={fetchPerfil} // Recarga los datos al guardar
      />
    </div>
  );
}