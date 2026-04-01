"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { Eye, EyeOff, BookOpen, HelpCircle, LogIn } from "lucide-react";

// Importamos nuestro componente Loader
import Loader from "../app/components/layout/Loader";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para controlar nuestro Loader
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      toast.warning("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verificando credenciales...");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.update(toastId, { render: res.error, type: "error", isLoading: false, autoClose: 3000 });
        setLoading(false);
      } else if (res?.ok) {
        toast.update(toastId, { render: "¡Acceso autorizado!", type: "success", isLoading: false, autoClose: 2000 });
        
        // Activamos la pantalla de carga con el logo
        setLoginSuccess(true);
        
        // Esperamos 2.5 segundos antes de redirigir
        setTimeout(() => {
          router.push("/home");
        }, 2500);
      }
    } catch (err) {
      toast.update(toastId, { render: "Error de conexión con el servidor.", type: "error", isLoading: false, autoClose: 3000 });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans text-brand-text relative">
      
      {/* 🚀 Renderizamos el componente Loader de forma limpia */}
      <Loader isVisible={loginSuccess} />

      {/* HEADER INSTITUCIONAL ESTILO iOS */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 overflow-hidden">
              <Image 
                src="/Logo.png" 
                alt="Logo INHRR" 
                fill 
                sizes="(max-width: 640px) 56px, 64px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 leading-tight">Institución</p>
              <p className="text-[14px] font-bold text-brand-primary leading-tight">INHRR "Rafael Rangel"</p>
            </div>
          </div>

          <Link 
            href="/manual" 
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-secondary hover:bg-brand-secondary/10 px-4 py-2.5 rounded-full transition-all"
          >
            <BookOpen size={20} />
            <span className="hidden sm:block">Manual de uso</span>
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <h1 className="font-title font-black text-4xl text-brand-primary tracking-tighter mb-2">
              SITRADES
            </h1>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
              Sistema de Trazabilidad y Gestión de Desechos en el Control de Muestras
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">
                Correo Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all text-[15px] placeholder:text-slate-400"
                placeholder="ejemplo@inhrr.gob.ve"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-brand-secondary/20 focus:ring-4 focus:ring-brand-secondary/5 transition-all text-[15px] placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-secondary transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loginSuccess}
              className="w-full bg-brand-primary active:scale-[0.97] text-white font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-3 mt-4 disabled:opacity-70 text-[16px] shadow-md shadow-brand-primary/20"
            >
              {loading ? "Validando..." : loginSuccess ? "Redirigiendo..." : (
                <>
                  <LogIn size={20} />
                  Ingresar al Sistema
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 flex justify-center">
            <button type="button" className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-brand-secondary transition-colors group">
              <HelpCircle size={16} className="group-hover:animate-bounce" />
              ¿Problemas de acceso? Soporte Técnico
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}