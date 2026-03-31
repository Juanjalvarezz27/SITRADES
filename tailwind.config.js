/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        title: ["var(--font-montserrat)"],
      },
      colors: {
        // Colores principales 
        brand: {
          primary: '#2563EB', // Azul Institucional
          secondary: '#7C3AED', // Violeta 
          bg: '#F8FAFC',      // Gris perla claro 
          text: '#334155',    // Gris pizarra oscuro
        },
        // Colores semánticos para estados
        status: {
          active: '#16A34A',  // Verde 
          custody: '#D97706', // Ámbar 
          danger: '#DC2626',  // Rojo 
        },
      },
    },
  },
  plugins: [],
};