import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Shield, Mail, User, BadgeCheck } from "lucide-react";

export default async function HomePage() {
  // 1. Verificación de seguridad estricta en el servidor
  const session = await getServerSession(authOptions);

  // Si alguien intenta escribir "/home" en la URL sin loguearse, lo rebotamos al Login
  if (!session) {
    redirect("/");
  }

  // Extraemos los datos del token JWT
  const { user } = session;

  return (
    <div className="min-h-screen bg-brand-bg p-6 sm:p-10 font-sans text-brand-text flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Cabecera de la página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-title font-black text-brand-primary tracking-tight">
            Bienvenido a SITRADES
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Panel principal del sistema
          </p>
        </div>

        {/* Tarjeta de Información del Usuario (Estilo iOS) */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <BadgeCheck className="text-brand-secondary" size={28} />
            <h2 className="text-xl font-bold text-slate-800">Datos de la Sesión Activa</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Campo: Nombre */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-blue-50 text-brand-primary rounded-2xl">
                <User size={24} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Usuario</p>
                <p className="text-[16px] font-semibold text-slate-800">{user.name}</p>
              </div>
            </div>

            {/* Campo: Correo */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Institucional</p>
                <p className="text-[16px] font-semibold text-slate-800 break-all">{user.email}</p>
              </div>
            </div>

            {/* Campo: Rol */}
            <div className="flex items-start gap-4 sm:col-span-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="p-3.5 bg-purple-50 text-brand-secondary rounded-2xl shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nivel de Acceso</p>
                <p className="text-[18px] font-black text-brand-secondary">{user.rol}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}