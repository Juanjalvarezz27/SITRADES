"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Lock, User, Mail, UserCog, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    nombre: string;
    email: string;
  };
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, userData, onSuccess }: EditProfileModalProps) {
  const { update } = useSession();
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Asegura que el portal solo se renderice en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: userData.nombre,
        email: userData.email,
        password: "",
        confirmPassword: ""
      });
    }
  }, [isOpen, userData]);

  // Retorna null si no está abierto o si no se ha montado en el cliente
  if (!isOpen || !mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim() || !formData.email.trim()) {
      toast.error("El nombre y el correo son obligatorios");
      return;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password || undefined
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al actualizar");

      toast.success("Perfil actualizado correctamente");
      await update({ name: formData.nombre, email: formData.email });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={!saving ? onClose : undefined} />

      {/* AUMENTAMOS EL ANCHO A max-w-3xl PARA QUE QUEPAN LAS DOS COLUMNAS */}
      <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Cabecera */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <UserCog size={24} />
            </div>
            <div>
              <h2 className="font-title font-black text-xl text-slate-800">Editar Perfil</h2>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">Actualiza tu información personal y credenciales de seguridad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Formulario en Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">

          {/* md:grid-cols-2 HACE LA MAGIA: 1 columna en móvil, 2 en PC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Columna Izquierda: Datos Personales */}
            <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <User size={18} className="text-brand-primary" />
                <h4 className="text-[13px] font-bold uppercase tracking-widest text-slate-700">Datos Personales</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-brand-primary font-medium text-slate-800 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-brand-primary font-medium text-slate-800 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Columna Derecha: Seguridad */}
            <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <Shield size={18} className="text-brand-primary" />
                <h4 className="text-[13px] font-bold uppercase tracking-widest text-slate-700">Seguridad</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para no cambiar"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-brand-primary font-medium text-slate-800 transition-colors shadow-sm placeholder:text-slate-400"
                />
              </div>

              {formData.password && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu nueva contraseña"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl outline-none font-medium text-slate-800 transition-colors shadow-sm ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-400 focus:border-red-500 bg-red-50/50"
                        : "border-slate-200 focus:border-brand-primary"
                    }`}
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-6 sm:p-8 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto py-3 px-6 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="w-full sm:w-auto py-3 px-8 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-primary/20 disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}