"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Users,
  TestTube,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  UsersRound,
  Building2,
  MapPin,
  Layers,
  Package,
  PackagePlus,
  BookOpen,
  Archive,
  Trash,
  Settings,
  UserCog,
  BarChart3,   // <-- NUEVO ÍCONO
  FileText,    // <-- NUEVO ÍCONO
  Biohazard    // <-- NUEVO ÍCONO
} from "lucide-react";

import ConfirmModal from "../ui/ConfirmModal";

const MENU_ITEMS = [
  {
    path: "/home",
    name: "Inicio",
    icon: Home,
    rolesPermitidos: ["Administrador", "Analista de Laboratorio", "Seguridad Industrial"],
    exact: true,
  },
  {
    path: "/home/estadisticas",
    name: "Estadísticas",
    icon: BarChart3,
    rolesPermitidos: ["Administrador", "Seguridad Industrial"],
    exact: true,
  },
  {
    path: "/home/muestras",
    name: "Gestión de Muestras",
    icon: TestTube,
    rolesPermitidos: ["Administrador", "Analista de Laboratorio"],
    subItems: [
      {
        path: "/home/muestras/nuevo",
        name: "Registrar Entrada",
        icon: PackagePlus,
      },
      {
        path: "/home/muestras",
        name: "Inventario Activo",
        icon: Package,
        exact: true,
      },
      {
        path: "/home/muestras/descarte",
        name: "Cola de Descarte",
        icon: Trash,
      },
      {
        path: "/home/muestras/recoleccion",
        name: "Bolsas Rojas",
        icon: Biohazard,
      },
      {
        path: "/home/muestras/inactivo",
        name: "Archivo Histórico",
        icon: Archive,
      }
    ]
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
  {
    path: "/home/infraestructura",
    name: "Infraestructura",
    icon: Building2,
    rolesPermitidos: ["Administrador"],
    subItems: [
      {
        path: "/home/infraestructura/pisos",
        name: "Gestión de Pisos",
        icon: Layers,
      },
      {
        path: "/home/infraestructura/direcciones",
        name: "Direcciones",
        icon: Building2,
      },
      {
        path: "/home/infraestructura/areas",
        name: "Áreas de Trabajo",
        icon: MapPin,
      }
    ]
  },
  {
    path: "/home/reportes",
    name: "Centro de Reportes",
    icon: FileText,
    rolesPermitidos: ["Administrador", "Seguridad Industrial"],
    exact: true,
  },
  {
    path: "/home/configuracion",
    name: "Configuración",
    icon: Settings,
    rolesPermitidos: ["Administrador"],
    exact: true,
  },
  {
    path: "/home/perfil",
    name: "Mi Perfil",
    icon: UserCog,
    rolesPermitidos: ["Administrador", "Analista de Laboratorio", "Seguridad Industrial"],
    exact: true,
  },
];

export default function Sidebar({ userRol }: { userRol: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const activeMenu = MENU_ITEMS.find(item => item.subItems && pathname.startsWith(item.path));
    if (activeMenu) {
      setOpenMenus({ [activeMenu.name]: true });
    } else {
      setOpenMenus({});
    }
  }, [pathname]);

  const toggleSubMenu = (menuName: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev => (prev[menuName] ? {} : { [menuName]: true }));
  };

  const menuFiltrado = MENU_ITEMS.filter((item) =>
    item.rolesPermitidos.includes(userRol)
  );

  return (
    <>
      {/* HEADER MÓVIL */}
      <div className="md:hidden w-full flex items-center justify-between bg-white border-b border-slate-100 p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Image 
            src="/Logo.png" 
            alt="Logo SITRADES" 
            width={32} 
            height={32} 
            className="shrink-0 object-contain" 
          />
          <h2 className="font-title font-black text-lg text-slate-800 tracking-tight">SITRADES</h2>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:text-brand-secondary bg-slate-50 hover:bg-brand-secondary/5 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY MÓVIL */}
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
        {/* BOTÓN COLAPSAR FLOTANTE CON TOOLTIP */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-4 top-8 bg-white border border-slate-200 text-slate-500 hover:text-brand-primary hover:border-brand-primary/30 p-2 rounded-full shadow-md transition-all z-50 hover:scale-110 group"
        >
          {isCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
          
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-lg pointer-events-none">
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 rounded-sm"></div>
            {isCollapsed ? "Expandir menú" : "Colapsar menú"}
          </div>
        </button>

        <div className="p-5 border-b border-slate-50 flex items-center justify-between relative">
          <div className="flex items-center gap-3 overflow-hidden pr-8">
            <Image 
              src="/Logo.png" 
              alt="Logo SITRADES" 
              width={38} 
              height={38} 
              className="shrink-0 object-contain" 
            />
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

        {/* NAVEGACIÓN */}
        <nav className={`flex-1 px-4 pt-2 pb-6 space-y-2 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
          
          <Link
            href="/manual"
            target="_blank"
            className={`w-full flex items-center gap-3 px-3.5 py-3 mb-4 bg-slate-50/80 border border-slate-100 hover:bg-brand-primary/10 hover:border-brand-primary/20 text-slate-600 hover:text-brand-primary font-semibold text-[14px] rounded-2xl transition-all group relative overflow-visible ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <BookOpen size={20} className="shrink-0 transition-transform group-hover:scale-110" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
              Manual de Usuario
            </span>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3.5 py-2 bg-slate-800 text-white text-[12px] font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl flex items-center pointer-events-none">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm"></div>
                Manual de Usuario
              </div>
            )}
          </Link>

          <p className={`px-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-3 transition-all duration-300 ${isCollapsed ? "text-center opacity-0" : "opacity-100"}`}>
            {isCollapsed ? "..." : "Menú Principal"}
          </p>

          {menuFiltrado.map((item) => {
            const isMenuOpen = openMenus[item.name];
            const isActive = item.subItems
              ? pathname.startsWith(item.path)
              : item.exact ? pathname === item.path : pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <div key={item.name} className="flex flex-col gap-1 relative">
                {item.subItems ? (
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-[14px] font-semibold transition-all group relative w-full ${
                      isActive
                        ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-secondary/20"
                        : isMenuOpen
                          ? "text-slate-800"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                      <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
                        {item.name}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isCollapsed ? "hidden" : "block"} ${isMenuOpen ? "rotate-180" : "rotate-0"} ${isActive ? "text-white" : "text-slate-400"}`} />

                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3.5 py-2 bg-slate-800 text-white text-[12px] font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl flex items-center pointer-events-none">
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm"></div>
                        {item.name}
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-semibold transition-all group relative ${
                      isActive
                        ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-secondary/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  >
                    <Icon size={20} className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
                      {item.name}
                    </span>

                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3.5 py-2 bg-slate-800 text-white text-[12px] font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl flex items-center pointer-events-none">
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm"></div>
                        {item.name}
                      </div>
                    )}
                  </Link>
                )}

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
                              : "border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700"
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

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-50 bg-white">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 hover:text-red-700 font-semibold text-[13px] rounded-xl transition-all group relative overflow-visible ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100 w-auto"}`}>
              Cerrar Sesión
            </span>

            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3.5 py-2 bg-red-600 text-white text-[12px] font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl flex items-center pointer-events-none">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-600 rotate-45 rounded-sm"></div>
                Cerrar Sesión
              </div>
            )}
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => signOut({ callbackUrl: "/" })}
        title="¿Cerrar Sesión?"
        message="Estás a punto de salir del sistema SITRADES. Tendrás que ingresar tus credenciales nuevamente para acceder."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        isDanger={true}
      />
    </>
  );
}