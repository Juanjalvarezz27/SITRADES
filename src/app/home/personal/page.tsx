"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserPlus, ShieldAlert, TestTube, ShieldCheck, Loader2, Mail, CalendarDays } from "lucide-react";
import { UsuarioAPI } from "@/types";

import Buscador from "../../components/personal/Buscador";

export default function DirectorioPersonalPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsuarios = useCallback(async (query: string, rol: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/usuarios?q=${encodeURIComponent(query)}&rol=${encodeURIComponent(rol)}`);
      if (!res.ok) throw new Error("Error al cargar los usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios(searchTerm, roleFilter);
  }, [searchTerm, roleFilter, fetchUsuarios]);

  const getRoleInfo = (rolNombre: string) => {
    switch (rolNombre) {
      case "Administrador":
        return { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <ShieldAlert size={14} className="shrink-0" /> };
      case "Analista de Laboratorio":
        return { color: "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20", icon: <TestTube size={14} className="shrink-0" /> };
      case "Seguridad Industrial":
        return { color: "bg-orange-100 text-orange-700 border-orange-200", icon: <ShieldCheck size={14} className="shrink-0" /> };
      default:
        return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: null };
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6 sm:mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">Directorio de Personal</h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1">
            Visualiza y gestiona los accesos de los usuarios en un diseño bento moderno.
          </p>
        </div>
        
        <Link 
          href="/home/personal/nuevo" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white px-5 py-3 sm:py-2.5 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-brand-secondary/25"
        >
          <UserPlus size={18} />
          Registrar Personal
        </Link>
      </div>

      {/* BARRA DE HERRAMIENTAS MODULAR */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 sticky top-20 z-10">
        
        {/* Usamos el componente inyectando las funciones de estado */}
        <Buscador 
          placeholder="Buscar por nombre o correo..." 
          onSearch={setSearchTerm} 
          onRoleChange={setRoleFilter}
        />

        <div className="text-[13px] font-semibold text-slate-500 w-full lg:w-auto text-left lg:text-right px-2 shrink-0 border-t border-slate-100 lg:border-t-0 pt-3 lg:pt-0">
          Total: <span className="text-brand-secondary font-bold">{loading ? "..." : usuarios.length}</span> resultados
        </div>
      </div>

      {/* BENTO GRID DE USUARIOS */}
      <div className="w-full relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 bg-brand-bg/50 backdrop-blur-sm rounded-3xl z-20">
            <Loader2 className="animate-spin text-brand-secondary" size={36} />
            <span className="text-[15px] font-semibold text-brand-secondary">Sincronizando directorio...</span>
          </div>
        )}

        {!loading && usuarios.length === 0 && (
          <div className="py-24 text-center text-slate-500 text-[15px] px-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            No se encontraron perfiles coincidentes con los filtros aplicados.
          </div>
        )}

        {!loading && usuarios.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {usuarios.map((user) => {
              const role = getRoleInfo(user.rol.nombre);
              
              return (
                <div 
                  key={user.id} 
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 flex items-center justify-center text-brand-primary font-black text-[18px] shrink-0 shadow-inner border border-white">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-black text-slate-800 leading-tight truncate group-hover:text-brand-secondary transition-colors" title={user.nombre}>
                        {user.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 flex-1 mb-6 group-hover:bg-brand-secondary/[0.02] transition-colors">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${role.color}`}>
                        {role.icon}
                        <span className="ml-1.5">{user.rol.nombre}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600 mt-1">
                      <Mail size={15} className="text-slate-400 shrink-0 group-hover:text-brand-secondary/50 transition-colors" />
                      <p className="text-[13px] font-semibold text-slate-700 truncate" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <CalendarDays size={15} className="text-slate-400 shrink-0 group-hover:text-brand-secondary/50 transition-colors" />
                      <p className="text-[13px] font-medium">
                        <span className="font-bold text-slate-600">
                          {new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.creado_en))}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button className="w-full py-2.5 bg-brand-secondary/5 hover:bg-brand-secondary/10 text-brand-secondary font-bold rounded-xl text-[13px] transition-colors">
                      Gestionar Perfil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}