export interface Rol {
  id: number;
  nombre: string;
}

export interface UsuarioAPI {
  id: string;
  nombre: string;
  email: string;
  rol_id: number;
  creado_en: string; 
  rol: Rol;          
}
