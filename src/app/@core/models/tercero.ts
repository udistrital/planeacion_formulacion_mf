export type InfoTercero = {
  Id: number;
  TipoDocumentoId: TipoContribuyente;
  TerceroId: Tercero;
  Numero: string;
  DigitoVerificacion: number;
  CiudadExpedicion: number;
  FechaExpedicion: Date;
  Activo: boolean;
  DocumentoSoporte: number;
  FechaCreacion: string;
  FechaModificacion: string;
};

export type TerceroFormulacion = {
  Id: number;
  TerceroPrincipalId: Tercero;
  TerceroRelacionadoId?: Tercero;
  TipoVinculacionId: number;
  CargoId: number;
  DependenciaId: number;
  Soporte: number;
  PeriodoId: number;
  FechaInicioVinculacion: string;
  FechaFinVinculacion: string;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
  Alternancia: boolean;
};

export type Tercero = {
  Id: number;
  NombreCompleto: string;
  PrimerNombre: string;
  SegundoNombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  LugarOrigen: number;
  FechaNacimiento: Date;
  Activo: boolean;
  TipoContribuyenteId?: TipoContribuyente;
  FechaCreacion: string;
  FechaModificacion: string;
  UsuarioWSO2: string;
};

export type TipoContribuyente = {
  Id: number;
  Nombre: string;
  Descripcion: string;
  CodigoAbreviacion: string;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
  NumeroOrden?: number;
};
