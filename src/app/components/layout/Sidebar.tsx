"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react"; 
import { 
  Home, 
  Users, 
  TestTube, 
  AlertTriangle, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  UserPlus,
  UsersRound
} from "lucide-react";

const MENU_ITEMS = [
  {
    path: "/home",
    name: "Inicio",
    icon: Home,
    rolesPermitidos: ["Administrador", "Analista de Laboratorio", "Seguridad Industrial"],
    exact: true,
  },
  {
    path: "/home/muestras",
    name: "Registro de Muestras",
    icon: TestTube,
    rolesPermitidos: ["Administrador", "Analista de Laboratorio"],
  },
  {
    path: "/home/alertas",
    name: "Panel de Alertas",
    icon: AlertTriangle,
    rolesPermitidos: ["Administrador", "Seguridad Industrial"],
  },
  {
    path: "/home/personal",
    name: "Gestión de Personal",
    icon: Users,
    rolesPermitidos: ["Administrador"],
    subItems: [
      {
        path: "/home/personal",
        name: "Directorio",
        icon: UsersRound,
        exact: true,
      },
      {
        path: "/home/personal/nuevo",
        name: "Registrar Personal",
        icon: UserPlus,
      }
    ]
  },
];

export default function Sidebar({ userRol }: { userRol: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    MENU_ITEMS.forEach(item => {
      if (item.subItems && pathname.startsWith(item.path)) {
        setOpenMenus(prev => ({ ...prev, [item.name]: true }));
      }
    });
  }, [pathname]);

  const toggleSubMenu = (menuName: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const menuFiltrado = MENU_ITEMS.filter((item) =>
    item.rolesPermitidos.includes(userRol)
  );

  return (
    <>
      {/* HEADER MÓVIL */}
      <div className="md:hidden w-full flex items-center justify-between bg-white border-b border-slate-100 p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-2 rounded-xl text-brand-primary">
            <ShieldAlert size={20} />
          </div>
          <h2 className="font-title font-black text-lg text-slate-800 tracking-tight">SITRADES</h2>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-2 text-slate-600 hover:text-brand-secondary bg-slate-50 hover:bg-brand-secondary/5 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY OSCURO MÓVIL */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgb(0,0,0,0.02)]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-[88px]" : "md:w-[260px] w-[280px]"}
        `}
      >
        
        {/* Cabecera del Sidebar */}
        <div className="p-5 border-b border-slate-50 flex items-center justify-between relative">
          <div className="flex items-center gap-3 overflow-hidden pr-8">
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-2.5 rounded-xl text-brand-primary shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className={`transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto block"}`}>
              <h2 className="font-title font-black text-[19px] text-slate-800 tracking-tight leading-tight whitespace-nowrap">SITRADES</h2>
              <span className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest block truncate max-w-[140px]">{userRol}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className={`px-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-4 transition-all duration-300 ${isCollapsed ? "text-center opacity-0" : "opacity-100"}`}>
            {isCollapsed ? "..." : "Menú Principal"}
          </p>
          
          {menuFiltrado.map((item) => {
            const isMenuOpen = openMenus[item.name];
            const isActive = item.subItems 
              ? pathname.startsWith(item.path)
              : item.exact ? pathname === item.path : pathname.startsWith(item.path);
            
            const Icon = item.icon;

            return (
              <div key={item.name} className="flex flex-col gap-1">
                {/* LÓGICA DE BOTÓN CON DEGRADADO PERMANENTE AL ESTAR ACTIVO */}
                {item.subItems ? (
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex items-center justify-between px-3.5 py-3.5 rounded-2xl text-[14px] font-semibold transition-all group relative w-full ${
                      isActive
                        ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-secondary/20"
                        : "text-slate-500 hover:bg-brand-secondary/5 hover:text-brand-secondary"
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-secondary transition-colors"}`} />
                      <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
                        {item.name}
                      </span>
                    </div>
                    {/* Flecha indicadora blanca si está activo */}
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isCollapsed ? "hidden" : "block"} ${isMenuOpen ? "rotate-180" : "rotate-0"} ${isActive ? "text-white/80" : "text-slate-400"}`} />
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.name : ""}
                    className={`flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-[14px] font-semibold transition-all group relative ${
                      isActive
                        ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-secondary/20"
                        : "text-slate-500 hover:bg-brand-secondary/5 hover:text-brand-secondary"
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  >
                    <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-secondary transition-colors"}`} />
                    <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
                      {item.name}
                    </span>
                  </Link>
                )}

                {/* Sub-rutas */}
                {item.subItems && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1 ${
                      isMenuOpen && !isCollapsed ? "max-h-[200px] opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.subItems.map((subItem) => {
                      const isSubActive = subItem.exact ? pathname === subItem.path : pathname.startsWith(subItem.path);
                      const SubIcon = subItem.icon;
                      
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-3 ml-4 pl-4 py-2.5 border-l-2 text-[13px] font-medium transition-all ${
                            isSubActive
                              ? "border-brand-primary text-brand-primary bg-brand-primary/5 rounded-r-xl"
                              : "border-slate-100 text-slate-500 hover:border-brand-secondary/50 hover:text-brand-secondary hover:bg-slate-50 rounded-r-xl"
                          }`}
                        >
                          <SubIcon size={16} />
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Controles Inferiores */}
        <div className="p-4 border-t border-slate-50 flex flex-col gap-3 bg-white">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-xl transition-all"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title={isCollapsed ? "Cerrar Sesión" : ""}
            className={`w-full flex items-center gap-3 px-3.5 py-3.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 hover:text-red-700 font-bold rounded-2xl transition-all group overflow-hidden ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>

      </aside>
    </>
  );
}