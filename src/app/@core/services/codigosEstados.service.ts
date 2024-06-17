import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { DataRequest } from "../models/dataRequest";
import { RequestManager } from "./requestManager";

export enum TIPO {
  SeguimientoFormulacion,
  IdentificacionContratistas,
  IdentificacionRecursos,
  IdentificacionDocentes,
  PlanProyecto,
  PlanDesarrolloEstrategico,
  PlanIndicativo,
  EstadoEnFormulacion,
  EstadoFormulado,
  EstadoEnRevision,
  EstadoRevisado,
  EstadoPreAval,
  EstadoAval,
  EstadoAjustePresupuestal,
  EstadoRevisionVerificada,
  ParametroPerfilContratistas,
}
@Injectable({
  providedIn: "root",
})
export class CodigosService {
  private CONSULTAS = [
    { path: "planes", endpoint: "tipo-seguimiento", query: "codigo_abreviacion:F_SP,activo:true", },
    { path: "planes", endpoint: "tipo-identificacion", query: "codigo_abreviacion:IC_SP,activo:true", },
    { path: "planes", endpoint: "tipo-identificacion", query: "codigo_abreviacion:IR_SP,activo:true", },
    { path: "planes", endpoint: "tipo-identificacion", query: "codigo_abreviacion:ID_SP,activo:true", },
    { path: "planes", endpoint: "tipo-plan", query: "codigo_abreviacion:PR_SP,activo:true", },
    { path: "planes", endpoint: "tipo-plan", query: "codigo_abreviacion:PD_SP,activo:true", },
    { path: "planes", endpoint: "tipo-plan", query: "codigo_abreviacion:PLI_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:EF_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:F_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:ER_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:R_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:PA_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:A_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:AP_SP,activo:true", },
    { path: "planes", endpoint: "estado-plan", query: "codigo_abreviacion:RV_SP,activo:true", },
    { path: "parametros", endpoint: "tipo_parametro", query: "CodigoAbreviacion:PC,Activo:true", },
  ];
  private codigos: string[] = [];

  private constructor(private request: RequestManager) { }

  public async cargarIdentificadores() {
    const promesas = this.CONSULTAS.map(async (abr, pos) => {
      return new Promise<string>((resolve) => {
        const path = abr.path.match("planes")
          ? environment.PLANES_CRUD
          : environment.PARAMETROS_SERVICE;
        const endpoint = `${abr.endpoint}?query=${abr.query}`;
        this.request.get(path, endpoint).subscribe({
          next: (data: DataRequest) => {
            if (data.Data[0]) {
              if (abr.path === "planes") {
                resolve(data.Data[0]._id);
              } else if (abr.path.match("parametros")) {
                resolve((data.Data[0].Id as Number).toString());
              }
            } else {
              console.error(
                "No existe un codigo para la consulta",
                `${path}${endpoint}`
              );
              resolve("");
            }
          },
        });
      }).then((codigo: string) => {
        this.codigos[pos] = codigo;
      });
    });
    await Promise.all(promesas);
  }

  public getId(posicion: number) {
    return this.codigos[posicion];
  }
}
