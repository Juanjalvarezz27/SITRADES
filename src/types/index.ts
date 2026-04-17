export interface Rol {
  id: number;
  nombre: string;
}

export interface AreaData {
  id: number;
  nombre: string;
  direccion_id: number;
  activo?: boolean;
}

export interface DireccionData {
  id: number;
  nombre: string;
  piso_id: number;
  activo?: boolean;
  areas?: AreaData[];
  piso?: PisoAPI;
  _count?: {
    areas: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PisoAPI {
  id: number;
  nombre: string;
  activo?: boolean;
  direcciones?: DireccionData[];
  _count?: {
    direcciones: number;
  };
}

export interface DireccionAPI {
  id: number;
  nombre: string;
  piso_id: number;
  activo: boolean;
  piso?: {
    id: number;
    nombre: string;
    activo?: boolean;
  };
  areas?: AreaData[];
  _count?: {
    areas: number;
  };
}

export interface AreaAPI {
  id: number;
  nombre: string;
  direccion_id: number;
  activo: boolean;
  direccion?: {
    id: number;
    nombre: string;
    activo?: boolean; 
    piso?: {
      id: number;
      nombre: string;
      activo?: boolean; 
    }
  };
  usuarios?: {
    id: string;
    nombre: string;
  }[];
  _count?: {
    usuarios: number;
  };
}

export interface UsuarioAPI {
  id: string;
  nombre: string;
  email: string;
  rol_id: number;
  activo: boolean;
  rol: Rol;
  area_id?: number;
  area?: {
    id: number;
    nombre: string;
    activo?: boolean;
    direccion?: {
      id: number;
      nombre: string;
      activo?: boolean;
      piso?: {
        id: number;
        nombre: string;
        activo?: boolean;
      }
    }
  };
  creado_en: string;
}