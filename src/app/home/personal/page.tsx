"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "react-toastify"; 
import { UsuarioAPI } from "@/types";
import Buscador from "../../components/personal/Buscador";
import UsuarioCard from "../../components/personal/UsuarioCard";
import GestionarUsuarioModal from "../../components/personal/GestionarUsuarioModal";
import ConfirmarEliminacionModal from "../../components/personal/ConfirmarEliminacionModal";
import EditarUsuarioModal from "../../components/personal/EditarUsuarioModal";

export default function DirectorioPersonalPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pisoFilter, setPisoFilter] = useState("");
  const [direccionFilter, setDireccionFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  // Modales y Selección
  const [selectedUser, setSelectedUser] = useState<UsuarioAPI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (roleFilter) params.append("rol", roleFilter);
      if (pisoFilter) params.append("piso", pisoFilter);
      if (direccionFilter) params.append("direccion", direccionFilter);
      if (areaFilter) params.append("area", areaFilter);

      const res = await fetch(`/api/usuarios?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar los usuarios");
      
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, pisoFilter, direccionFilter, areaFilter]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Handlers para abrir modales
  const handleOpenModal = (user: UsuarioAPI) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsModalOpen(false); 
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  // Acción Final de Eliminar
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Eliminando usuario...");

    try {
      const res = await fetch(`/api/usuarios/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar el usuario");
      }

      toast.update(toastId, { render: "¡Usuario eliminado con éxito!", type: "success", isLoading: false, autoClose: 3000 });
      setIsDeleteModalOpen(false);
      fetchUsuarios();

    } catch (err: any) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6 sm:mb-8">
        <div>
          <h1 className="font-title font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">Directorio de Personal</h1>
          <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1">
            Visualiza y gestiona los accesos de los usuarios en un diseño bento moderno.
          </p>
        </div>
        
        <Link href="/home/personal/nuevo" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 active:scale-95 text-white px-5 py-3 sm:py-2.5 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-brand-secondary/25">
          <UserPlus size={18} />
          Registrar Personal
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-6 flex flex-col gap-4 sticky top-20 z-10">
        <Buscador 
          onSearch={setSearchTerm} 
          onRoleChange={setRoleFilter}
          onPisoChange={setPisoFilter}
          onDireccionChange={setDireccionFilter}
          onAreaChange={setAreaFilter}
        />
        <div className="text-[13px] font-semibold text-slate-500 w-full text-right px-2 border-t border-slate-100 pt-3">
          Total: <span className="text-brand-secondary font-bold">{loading ? "..." : usuarios.length}</span> resultados
        </div>
      </div>

      {/* Cuadrícula de Usuarios */}
      <div className="w-full relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 bg-brand-bg/50 backdrop-blur-sm rounded-3xl z-20">
            <Loader2 className="animate-spin text-brand-secondary" size={36} />
            <span className="text-[15px] font-semibold text-brand-secondary">Aplicando filtros...</span>
          </div>
        )}

        {!loading && usuarios.length === 0 && (
          <div className="py-24 text-center text-slate-500 text-[15px] px-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            No se encontraron perfiles coincidentes con los filtros aplicados.
          </div>
        )}

        {!loading && usuarios.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((user) => (
              <UsuarioCard 
                key={user.id} 
                user={user} 
                onManageClick={handleOpenModal} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <GestionarUsuarioModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        usuario={selectedUser} 
        onDeleteClick={handleDeleteClick} 
        onEditClick={handleEditClick}
      />

      <EditarUsuarioModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        usuario={selectedUser}
        onUserUpdated={() => {
          setIsEditModalOpen(false);
          fetchUsuarios(); 
        }}
      />

      <ConfirmarEliminacionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        nombreUsuario={selectedUser?.nombre || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}