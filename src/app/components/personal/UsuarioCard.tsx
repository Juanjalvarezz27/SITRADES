import { Mail, MapPin, CalendarDays, ShieldAlert, TestTube, ShieldCheck } from "lucide-react";
import { UsuarioAPI } from "@/types";

interface UsuarioCardProps {
  user: UsuarioAPI;
  onManageClick: (user: UsuarioAPI) => void;
}

export default function UsuarioCard({ user, onManageClick }: UsuarioCardProps) {
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

  const role = getRoleInfo(user.rol.nombre);
  const inicialUsuario = user.nombre ? user.nombre.charAt(0).toUpperCase() : "?";
  const fechaFormateada = new Intl.DateTimeFormat('es-VE', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  }).format(new Date(user.creado_en));

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] hover:border-brand-secondary/30 transition-all duration-300 flex flex-col h-full group">
      
      {/* Header Tarjeta */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 flex items-center justify-center text-brand-primary font-black text-[18px] shrink-0 shadow-inner border border-white">
          {inicialUsuario}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-black text-slate-800 leading-tight truncate group-hover:text-brand-secondary transition-colors" title={user.nombre}>
            {user.nombre}
          </p>
        </div>
      </div>

      {/* Body Tarjeta */}
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

        <div className="flex items-start gap-2.5 text-slate-600">
          <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5 group-hover:text-brand-secondary/50 transition-colors" />
          <div className="flex flex-col min-w-0">
            <p className="text-[13px] font-semibold text-slate-700">
              {user.area?.nombre || "Sin área asignada"}
            </p>
            {user.area?.direccion && (
              <p className="text-[11px] font-medium text-slate-500">
                {user.area.direccion.nombre} • {user.area.direccion.piso?.nombre || ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-slate-500">
          <CalendarDays size={15} className="text-slate-400 shrink-0 group-hover:text-brand-secondary/50 transition-colors" />
          <p className="text-[13px] font-medium">
            <span className="font-bold text-slate-600">{fechaFormateada}</span>
          </p>
        </div>
      </div>

      {/* Footer Tarjeta */}
      <div className="mt-auto">
        <button 
          onClick={() => onManageClick(user)}
          className="w-full py-2.5 bg-brand-secondary/5 hover:bg-brand-secondary/10 text-brand-secondary font-bold rounded-xl text-[13px] transition-colors"
        >
          Gestionar Perfil
        </button>
      </div>
    </div>
  );
}