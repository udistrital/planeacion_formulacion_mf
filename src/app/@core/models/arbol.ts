export type Subgrupo = {
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  children?: Subgrupo[];
};

// Objeto fila
export type Nodo = {
  expandable: boolean;
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  level: number;
  icon?: string;
  idx?: number;
  padre_idx?: number | undefined;
  hijos_idx?: (number | undefined)[];
};
