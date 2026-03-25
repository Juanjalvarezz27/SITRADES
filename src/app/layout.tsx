import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

// Configuración de la fuente para textos y datos
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Configuración de la fuente para Títulos y Encabezados
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Metadatos oficiales del sistema
export const metadata: Metadata = {
  title: "SITRADES | INHRR",
  description: "Sistema de Trazabilidad y Gestión de Desechos en el Control de Muestras del Instituto Nacional de Higiene Rafael Rangel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}