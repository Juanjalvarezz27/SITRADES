import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function DashboardTest() {
  // Aquí el servidor revisa si tienes un token JWT válido
  const session = await getServerSession(authOptions);

  // Si no hay sesión, rebotamos al usuario
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">❌ Acceso Denegado</h1>
        <p className="text-slate-600 mb-4">No hay ninguna sesión activa en el sistema.</p>
        <Link href="/" className="px-4 py-2 bg-brand-primary text-white rounded-lg">
          Volver al Login
        </Link>
      </div>
    );
  }

  // Si llegamos aquí, el Login funcionó a la perfección
  return (
    <div className="min-h-screen bg-brand-bg p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-emerald-600 mb-4">
          ✅ ¡Login Exitoso! Bóveda Abierta 🔓
        </h1>
        <p className="text-slate-600 mb-6">
          NextAuth ha validado tu identidad con PostgreSQL. Estos son los datos encriptados en tu token de sesión:
        </p>
        
        {/* Aquí imprimimos en crudo lo que el sistema sabe de ti */}
        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}