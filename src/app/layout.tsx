import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import "./globals.css";

// Importacion del Provider para NextAuth
import { Providers } from "./Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SITRADES | INHRR",
  description: "Sistema de Trazabilidad y Gestion de Desechos en el Control de Muestras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="font-sans bg-[#F2F2F7] text-[#1C1C1E] min-h-full flex flex-col">
        
        {/* Envolvemos la aplicacion con el Provider de Sesion */}
        <Providers>
          <main className="flex-1 flex flex-col h-full">
            {children}
          </main>
          
          {/* Contenedor global de notificaciones */}
          <ToastContainer 
            position="top-center"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="rounded-2xl shadow-lg border border-slate-100 font-sans text-sm"
          />
        </Providers>

      </body>
    </html>
  );
}