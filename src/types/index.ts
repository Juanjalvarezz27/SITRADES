export interface Rol {
  id: number;
  nombre: string;
}

export interface AreaData {
  id: number;
  nombre: string;
}

export interface DireccionData {
  id: number;
  nombre: string;
  areas: AreaData[];
}

export interface PisoData {
  id: number;
  nombre: string;
  direcciones: DireccionData[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface UsuarioAPI {
  id: string;
  nombre: string;
  email: string;
  rol_id: number;
  rol: Rol;
  area_id?: number;
  area?: {
    id: number;
    nombre: string;
    direccion?: {
      id: number;
      nombre: string;
      piso?: {
        id: number;
        nombre: string;
      }
    }
  };
  creado_en: string;
}