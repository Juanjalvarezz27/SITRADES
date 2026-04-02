export interface Rol {
  id: number;
  nombre: string;
}

export interface Piso {
  nombre: string;
}

export interface Direccion {
  nombre: string;
  piso: Piso;
}

export interface Area {
  nombre: string;
  direccion: Direccion;
}

export interface UsuarioAPI {
  id: string;
  nombre: string;
  email: string;
  rol_id: number;
  creado_en: string; 
  rol: Rol;          
  area: Area; 
}