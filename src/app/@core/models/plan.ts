export type ResumenPlan = {
  id?: string;
  dependencia_id: string;
  dependencia_nombre?: string;
  estado?: string;
  estado_id?: string;
  nombre: string;
  ultima_modificacion?: Date;
  version?: number;
  fase?: string;
  vigencia?: number;
  vigencia_id: string;
};

export type Plan = {
  _id: string;
  activo: boolean;
  aplicativo_id: string;
  dependencia_id: string;
  descripcion: string;
  estado_plan_id: string;
  formato: boolean;
  nombre: string;
  tipo_plan_id: string;
  vigencia?: string;
  reformulacion?: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  __v: number;
  padre_plan_id?: string;
  numero?: string;
};

export type PlanInteres = {
  _id: string;
  nombre: string;
};
