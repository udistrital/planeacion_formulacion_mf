import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { RequestManager } from 'src/app/services/requestManager';
import { environment } from '../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { isNumeric } from 'rxjs/internal-compatibility';
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { rubros_aux } from '../recursos/rubros';
import { FloatLabelType } from '@angular/material/form-field';

@Component({
  selector: 'app-docentes',
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.scss']
})
export class DocentesComponent implements OnInit {

  floatLabelValue: FloatLabelType = 'auto';
  steps!: any[];
  rubros!: any[];
  displayedColumns!: string[];
  displayedHeaders!: string[];
  activedStep = 0;
  dataSourceRHF!: MatTableDataSource<any>;
  dataSourceRHVPRE!: MatTableDataSource<any>;
  dataSourceRHVPOS!: MatTableDataSource<any>;
  dataSourceRubrosPre!: MatTableDataSource<any>;
  dataSourceRubrosPos!: MatTableDataSource<any>;
  vigenciaConsulta: any;
  banderaCerrar: boolean = false;

  accionBoton!: string;
  tipoIdenti!: string;
  Plan: any;
  estadoPlan!: string;
  readonlyObs!: boolean;
  readonlyTable: boolean = false;
  mostrarObservaciones!: boolean;
  nivel: any;
  data: any;

  incrementoInput = new FormControl('10.22');
  incremento: number = 0.0;
  incrementoAnterior: number = 0.0;
  niveles: string[] = ["Pregrado", "Posgrado"]

  @ViewChild(MatPaginator) paginatorRHF!: MatPaginator;
  @ViewChild(MatPaginator) paginatorRHVPRE!: MatPaginator;
  @ViewChild(MatPaginator) paginatorRHVPOS!: MatPaginator;
  @ViewChild(MatSort) sortRHF!: MatSort;
  @ViewChild(MatSort) sortRHVPRE!: MatSort;
  @ViewChild(MatSort) sortRHVPOS!: MatSort;
  @Input() dataTabla!: boolean;
  @Input() plan!: string;
  @Input() rol!: string;
  @Input() versiones!: any[];
  @Input() vigencia: any;
  @Output() acciones = new EventEmitter<any>();
  constructor(private request: RequestManager) {
    this.loadRubros();
  }

  ngOnInit(): void {
    this.dataSourceRHF = new MatTableDataSource<any>();
    this.dataSourceRHVPRE = new MatTableDataSource<any>();
    this.dataSourceRHVPOS = new MatTableDataSource<any>();
    this.dataSourceRubrosPre = new MatTableDataSource<any>();
    this.dataSourceRubrosPos = new MatTableDataSource<any>();
    this.loadPlan();
    this.loadVigenciaConsulta();
    this.loadTabla();
  }

  loadRubros() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.rubros = rubros_aux
    Swal.close();
  }

  loadTabla() {
    if (this.dataTabla) {
      this.dataSourceRubrosPre.data = [
        {
          "categoria": "Prima de Servicios",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de navidad",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de vacaciones",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Salario básico",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Intereses cesantías",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte cesantías público",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte cesantías privado",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte salud",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Fondo pensiones público",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Fondo pensiones privado",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte ARL",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte CCF",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte ICBF",
          "rubro": "",
          "codigo": ""
        }];
      this.dataSourceRubrosPos.data = [
        {
          "categoria": "Prima de Servicios",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de navidad",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de vacaciones",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Salario básico",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Intereses cesantías",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte cesantías público",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte cesantías privado",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte salud",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Fondo pensiones público",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Fondo pensiones privado",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte ARL",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte CCF",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte ICBF",
          "rubro": "",
          "codigo": ""
        }];
      this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:` + this.plan + `,tipo_identificacion_id:61897518f6fc97091727c3c3`).subscribe((data: any) => {
        if (data) {
          let identificacion = data.Data[0];
          if (identificacion.activo === false) {
            this.dataSourceRHF.data = [];
            this.dataSourceRHVPRE.data = [];
            this.dataSourceRHVPOS.data = [];
            this.steps = [
              {
                "nombre": "Docentes V.E Ocasionales",
                "tipo": "RHF",
                "descripcion": "Administración de valores pregrado",
                "nivel": "Pregrado",
                "data": this.dataSourceRHF,
                "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Completo" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Docentes V.E Hora Cátedra",
                "tipo": 'RHVPRE',
                "descripcion": 'Administración de valores pregrado',
                "nivel": "Pregrado",
                "data": this.dataSourceRHVPRE,
                "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Docentes V.E Hora Cátedra",
                "tipo": "RHVPOS",
                "descripcion": "Administración de valores posgrado",
                "nivel": "Posgrado",
                "data": this.dataSourceRHVPOS,
                "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                "categorias": [{ "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }, { "nombre": "Asistente UD" }, { "nombre": "Asociado UD" }, { "nombre": "Titular UD" }]
              },
              {
                "nombre": "Selección de rubros",
                "tipo": "rubros",
                "data": this.dataSourceRubrosPre,
              }
            ];
            if (this.nivel != "pregrado") {
              this.steps[3].data = this.dataSourceRubrosPos;
            }
            let datoIdenti = {
              "activo": true
            }
            this.request.put(environment.PLANES_CRUD, `identificacion`, datoIdenti, identificacion._id).subscribe();
          } else {
            this.dataSourceRubrosPre.data = JSON.parse(JSON.stringify(dataRubros));
            this.dataSourceRubrosPos.data = JSON.parse(JSON.stringify(dataRubros));
            this.getData().then(() => {
              if (this.data != "") {
                if (this.data.rhf != "{}") {
                  this.dataSourceRHF.data = this.data.rhf;
                  this.dataSourceRHF.data.sort((a: any, b: any) => {
                    if (parseInt(a.index) < parseInt(b.index)) {
                      return -1;
                    } else if (parseInt(a.index) > parseInt(b.index)) {
                      return 1;
                    }
                    return 0;
                  })
                  this.checkIncremento(this.data.rhf);

                  this.dataSourceRHF.data.forEach(recurso => {
                    if (recurso.cantidad == undefined) {
                      recurso.cantidad = 1;
                    }
                  });
                }
                if (this.data.rhv_pre != "{}") {
                  this.dataSourceRHVPRE.data = this.data.rhv_pre;
                  this.dataSourceRHVPRE.data.sort((a: any, b: any) => {
                    if (parseInt(a.index) < parseInt(b.index)) {
                      return -1;
                    } else if (parseInt(a.index) > parseInt(b.index)) {
                      return 1;
                    }
                    return 0;
                  })

                  this.dataSourceRHVPRE.data.forEach(recurso => {
                    if (recurso.cantidad == undefined) {
                      recurso.cantidad = 1;
                    }
                  });
                }
                if (this.data.rhv_pos != "{}") {
                  this.dataSourceRHVPOS.data = this.data.rhv_pos;
                  this.dataSourceRHVPOS.data.sort((a: any, b: any) => {
                    if (parseInt(a.index) < parseInt(b.index)) {
                      return -1;
                    } else if (parseInt(a.index) > parseInt(b.index)) {
                      return 1;
                    }
                    return 0;
                  })

                  this.dataSourceRHVPOS.data.forEach(recurso => {
                    if (recurso.cantidad == undefined) {
                      recurso.cantidad = 1;
                    }
                  });
                }
                if (this.data.rubros != "{}" && this.data.rubros != null) {
                  let filtradoManual = this.data.rubros.filter((rubro: any) => !rubro.hasOwnProperty('bonificacion'));
                  this.dataSourceRubrosPre.data = filtradoManual;
                }
                if (this.data.rubros_pos != "{}" && this.data.rubros_pos != null) {
                  this.dataSourceRubrosPos.data = this.data.rubros_pos;
                }
              }
              this.steps = [
                {
                  "nombre": "Docentes V.E Ocasionales",
                  "tipo": "RHF",
                  "descripcion": "Administración de valores pregrado",
                  "nivel": "Pregrado",
                  "data": this.dataSourceRHF,
                  "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Completo" }],
                  "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
                },
                {
                  "nombre": "Docentes V.E Hora Cátedra",
                  "tipo": 'RHVPRE',
                  "descripcion": 'Administración de valores pregrado',
                  "nivel": "Pregrado",
                  "data": this.dataSourceRHVPRE,
                  "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                  "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
                },
                {
                  "nombre": "Docentes V.E Hora Cátedra",
                  "tipo": "RHVPOS",
                  "descripcion": "Administración de valores posgrado",
                  "nivel": "Posgrado",
                  "data": this.dataSourceRHVPOS,
                  "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                  "categorias": [{ "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }, { "nombre": "Asistente UD" }, { "nombre": "Asociado UD" }, { "nombre": "Titular UD" }]
                },
                {
                  "nombre": "Selección de rubros",
                  "tipo": "Rubros",
                  "data": this.dataSourceRubrosPre,
                }
              ];

              if (this.nivel != "pregrado") {
                this.steps[3].data = this.dataSourceRubrosPos;
              }

              let sueldo = true;
              this.dataSourceRubrosPre.data.forEach(rubro => {
                if (rubro.categoria == 'Salario básico') {
                  sueldo = false
                }
              });
              if (sueldo) {
                let datos = this.dataSourceRubrosPre.data;
                datos.push({
                  "activo": true,
                  "categoria": "Salario básico",
                  "rubro": "",
                  "codigo": ""
                });
                this.dataSourceRubrosPre.data = datos;
              }
              this.OnPageChangeRHF({ length: 0, pageIndex: 0, pageSize: 10 });
              this.OnPageChangeRHVPOS({ length: 0, pageIndex: 0, pageSize: 10 });
              this.OnPageChangeRHVPRE({ length: 0, pageIndex: 0, pageSize: 10 });
            })
          }
        }
      })
    }
  }

  getDataSource(tipo: any) {
    switch (tipo) {
      case "RHF":
        return this.dataSourceRHF.data;
      case "RHVPRE":
        return this.dataSourceRHVPRE.data;
      case "RHVPOS":
        return this.dataSourceRHVPOS.data;
      default:
        return null;
    }
  }

  loadVigenciaConsulta() {
    let aux: number = + this.vigencia.Nombre;
    this.vigenciaConsulta = aux
  }

  formatData(data: any) {
    const clavesExcluidas = ["totalHoras", "meses", "totalHorasIndividual"];
    for (let clave in data) {
      if (data[clave] !== "N/A" && !clavesExcluidas.includes(clave)) {
        data[clave] = formatCurrency(parseInt(data[clave]), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
    return data;
  }

  limpiarPublicosyPrivados(data: any) {
    if (data.cesantias != "N/A") {
      data.cesantiasPrivado = ""
      data.cesantiasPublico = ""
    }
    if (data.totalPensiones != "N/A") {
      data.pensionesPrivado = ""
      data.pensionesPublico = ""
    }
  }

  getCalculosDocentes(element: any, rowIndex: any, tipo: any) {
    //Recrear body
    let data = {
      "tipoDocente": tipo,
      "tipo": element.tipo,
      "categoria": element.categoria,
      "cantidad": element.cantidad,
      "semanas": element.semanas,
      "horas": element.horas,
      "incremento": this.incremento,
      "vigencia": this.vigenciaConsulta
    }

    if (data.tipo != "" && data.categoria != "" && data.cantidad != 0 && data.semanas != 0 && data.horas != 0) {
      this.banderaCerrar = true
      this.request.post(environment.PLANES_MID, "formulacion/calculos_docentes", data).subscribe((response: any) => {
        if (response) {
          let dataResponse = this.formatData(response.Data)
          this.limpiarPublicosyPrivados(dataResponse)
          const dataSource = this.getDataSource(tipo);
          Object.assign(dataSource?.[rowIndex], dataResponse);
          this.banderaCerrar = false
        } else {
          this.readonlyTable = true;
          Swal.fire({
            title: 'Error al obtener calculos',
            icon: 'error',
            text: `No se pudieron obtener los calculos para la identificación de recursos docente`,
            showConfirmButton: false,
            timer: 2500
          })
        }
      })
    }
  }

  getData(): Promise<any> {
    let message: any;
    let resolveRef: any;
    let rejectRef;

    let dataPromise: Promise<any> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    this.request.get(environment.PLANES_MID, `formulacion/get_all_identificacion/` + this.plan + `/61897518f6fc97091727c3c3`).subscribe((data: any) => {
      if (data) {
        let aux: object = data.Data;
        this.data = aux;
        resolveRef(message)
      }
    })
    return dataPromise
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.plan).subscribe((data: any) => {
      if (data.Data != null) {
        this.Plan = data.Data;
        this.getEstado();
      }
    })
  }

  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.Plan.estado_plan_id).subscribe((data: any) => {
      if (data) {
        this.estadoPlan = data.Data.nombre;
        this.displayedColumns = this.visualizarColumnas();
        this.displayedHeaders = this.visualizarHeaders();
      }
    }),
      (error: any) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  visualizarColumnas(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        if (this.readonlyTable != true) { //Se tiene en cuenta vigencia para la consulta --  loadVigenciaConsulta()
          this.readonlyTable = this.verificarVersiones();
        }
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones) {
          return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total', 'observaciones'];
        } else {
          return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total'];
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total'];
      }
    }

    if (this.rol == 'PLANEACION' || this.rol == 'JEFE_UNIDAD_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'cantidad', 'semanas', 'horas', 'totalHorasIndividual', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoBasicoIndividual', 'sueldoMensual', 'sueldoMensualIndividual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantiasIndividual', 'totalCesantias', 'totalSaludIndividual', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensionesIndividual', 'totalPensiones', 'totalArlIndividual', 'totalArl', 'caja', 'icbf', 'totalBasicoIndividual', 'totalBasico', 'totalAportesIndividual', 'totalAportes', 'totalIndividual', 'total'];
      }
    }
    return []
  }

  visualizarHeaders(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = this.verificarVersiones();
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones) {
          return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
        } else {
          return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
      }
    }

    if (this.rol == 'PLANEACION' || this.rol == 'JEFE_UNIDAD_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'CantidadP', 'semanasP', 'horasP', 'totalHorasIndividualP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoBasicoIndividualP', 'sueldoMensualP', 'sueldoMensualIndividualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
      }
    }
    return []
  }

  verificarVersiones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b4401c7a222052fac05'));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  verificarObservaciones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b1e01c7a265372fac03'));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  prevStep(step: any) {
    this.activedStep = step - 1;
  }

  nextStep(step: any) {
    this.activedStep = step + 1;
  }

  addElement(tipo: any) {
    if (tipo === 'RHF') {
      this.dataSourceRHF.data.unshift({
        nivel: 'Pregrado',
        tipo: '',
        categoria: '',
        cantidad: 1,
        semanas: 0,
        horas: 0,
        totalHoras: 0,
        totalHorasIndividual: 0,
        meses: 0,
        sueldoBasico: '',
        sueldoBasicoIndividual: '',
        sueldoMensual: '',
        sueldoMensualIndividual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        vacaciones: '',
        bonificacion: 'N/A',
        cesantiasPublico: '',
        cesantiasPrivado: '',
        interesesCesantias: '',
        cesantias: '',
        totalCesantias: '',
        totalCesantiasIndividual: '',
        totalSalud: '',
        totalSaludIndividual: '',
        pensionesPublico: '',
        pensionesPrivado: '',
        totalPensiones: '',
        totalPensionesIndividual: '',
        totalArl: '',
        totalArlIndividual: '',
        caja: '',
        icbf: '',
        totalBasico: '',
        totalBasicoIndividual: '',
        totalAportes: '',
        totalAportesIndividual: '',
        total: '',
        totalIndividual: ''
      });

      for (let index = 0; index < this.dataSourceRHF.data.length; index++) {
        this.dataSourceRHF.data[index].index = index + 1;
      }

      this.dataSourceRHF.paginator = this.paginatorRHF;
      this.dataSourceRHF.sort = this.sortRHF;
      this.OnPageChangeRHF({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
    } else if (tipo == 'RHVPRE') {
      this.dataSourceRHVPRE.data.unshift({
        nivel: 'Pregrado',
        tipo: '',
        categoria: '',
        cantidad: 1,
        semanas: 0,
        horas: 0,
        totalHoras: 0,
        totalHorasIndividual: 0,
        meses: 0,
        sueldoBasico: '',
        sueldoBasicoIndividual: '',
        sueldoMensual: '',
        sueldoMensualIndividual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        vacaciones: '',
        bonificacion: 'N/A',
        cesantiasPublico: '',
        cesantiasPrivado: '',
        interesesCesantias: '',
        cesantias: '',
        totalCesantias: '',
        totalCesantiasIndividual: '',
        totalSalud: '',
        totalSaludIndividual: '',
        pensionesPublico: '',
        pensionesPrivado: '',
        totalPensiones: '',
        totalPensionesIndividual: '',
        totalArl: '',
        totalArlIndividual: '',
        caja: '',
        icbf: '',
        totalBasico: '',
        totalBasicoIndividual: '',
        totalAportes: '',
        totalAportesIndividual: '',
        total: '',
        totalIndividual: ''
      });

      for (let index = 0; index < this.dataSourceRHVPRE.data.length; index++) {
        this.dataSourceRHVPRE.data[index].index = index + 1;
      }

      this.dataSourceRHVPRE.paginator = this.paginatorRHVPRE;
      this.dataSourceRHVPRE.sort = this.sortRHVPRE;
      this.OnPageChangeRHVPRE({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
    } else if (tipo == 'RHVPOS') {
      this.dataSourceRHVPOS.data.unshift({
        nivel: 'Posgrado',
        tipo: '',
        categoria: '',
        cantidad: 1,
        semanas: 0,
        horas: 0,
        totalHoras: 0,
        totalHorasIndividual: 0,
        meses: 0,
        sueldoBasico: '',
        sueldoBasicoIndividual: '',
        sueldoMensual: '',
        sueldoMensualIndividual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        vacaciones: '',
        bonificacion: 'N/A',
        cesantiasPublico: '',
        cesantiasPrivado: '',
        interesesCesantias: '',
        cesantias: '',
        totalCesantias: '',
        totalCesantiasIndividual: '',
        totalSalud: '',
        totalSaludIndividual: '',
        pensionesPublico: '',
        pensionesPrivado: '',
        totalPensiones: '',
        totalPensionesIndividual: '',
        totalArl: '',
        totalArlIndividual: '',
        caja: '',
        icbf: '',
        totalBasico: '',
        totalBasicoIndividual: '',
        totalAportes: '',
        totalAportesIndividual: '',
        total: '',
        totalIndividual: ''
      });

      for (let index = 0; index < this.dataSourceRHVPOS.data.length; index++) {
        this.dataSourceRHVPOS.data[index].index = index + 1;
      }

      this.dataSourceRHVPOS.paginator = this.paginatorRHVPOS;
      this.dataSourceRHVPOS.sort = this.sortRHVPOS;
      this.OnPageChangeRHVPOS({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
    }
  }

  deleteElement(index: any, tipo: any) {
    Swal.fire({
      title: 'Eliminar recurso',
      text: `¿Está seguro de eliminar este recurso?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this._deleteElemento(index, tipo);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    });
  }

  private _deleteElemento(index: any, tipo: any) {
    if (tipo === 'RHF') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHF.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginatorRHF.pageIndex * this.paginatorRHF.pageSize) + indices[i], 1);
        }

        for (let index = 0; index < data.length; index++) {
          data[index].index = index + 1;
        }

        this.dataSourceRHF.data = data;
        this.dataSourceRHF.paginator = this.paginatorRHF;
        this.dataSourceRHF.sort = this.sortRHF;
        this.OnPageChangeRHF({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
      }
    } else if (tipo == 'RHVPRE') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHVPRE.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginatorRHVPRE.pageIndex * this.paginatorRHVPRE.pageSize) + indices[i], 1);
        }

        for (let index = 0; index < data.length; index++) {
          data[index].index = index + 1;
        }

        this.dataSourceRHVPRE.data = data;
        this.dataSourceRHVPRE.paginator = this.paginatorRHF;
        this.dataSourceRHVPRE.sort = this.sortRHF;
        this.OnPageChangeRHVPRE({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
      }
    } else if (tipo == 'RHVPOS') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHVPOS.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginatorRHVPOS.pageIndex * this.paginatorRHVPOS.pageSize) + indices[i], 1);
        }

        for (let index = 0; index < data.length; index++) {
          data[index].index = index + 1;
        }

        this.dataSourceRHVPOS.data = data;
        this.dataSourceRHVPOS.paginator = this.paginatorRHF;
        this.dataSourceRHVPOS.sort = this.sortRHF;
        this.OnPageChangeRHVPOS({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
      }
    }
  }

  onChangeRubro(event: any, rowIndex: any) {
    if (this.nivel == "pregrado") {
      if (event == undefined) {
        this.dataSourceRubrosPre.data[rowIndex].codigo = '';
      } else {
        this.dataSourceRubrosPre.data[rowIndex].codigo = event.value;
      }
    } else {
      if (event == undefined) {
        this.dataSourceRubrosPos.data[rowIndex].codigo = '';
      } else {
        this.dataSourceRubrosPos.data[rowIndex].codigo = event.value;
      }
    }
  }

  onChangeincremento() {
    let value = parseFloat(this.incrementoInput.value ?? "0");
    if (value) {
      this.incremento = value / 100.0;
    } else {
      this.incremento = 0.0;
    }
    this.banderaCerrar = false;
  }

  loadIncremento() {
    this.onChangeincremento()
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < this.steps[i].data.length; j++) {
        let element = this.steps[i].data[j];
        let tipo = this.steps[i].tipo
        this.getCalculosDocentes(element, j, tipo)
      }
    }
    Swal.fire({
      icon: 'info',
      title: 'Identificación de Recurso Docente',
      text: 'El porcentaje de incremento asociado a la vigencia en cuestión ha sido aplicado a los valores presupuestados. Sin embargo, revisar que los valores tanto de cesantias como pensiones coincidan con los totales.',
      showConfirmButton: true
    })
  }

  onChangeNivel(event: any) {
    this.nivel = String(event).toLowerCase();
    if (this.nivel == "pregrado") {
      this.steps[3].data = this.dataSourceRubrosPre;
    } else {
      this.steps[3].data = this.dataSourceRubrosPos;
    }
  }

  checkIncremento(incrementoFromDB: any) {
    this.incrementoAnterior = incrementoFromDB[0].incremento ? parseFloat(incrementoFromDB[0].incremento) : 0.0;
    if (this.incrementoAnterior > 0.0) {
      this.incrementoInput.setValue((this.incrementoAnterior * 100.0).toString());
      this.onChangeincremento();
      Swal.fire({
        icon: 'info',
        title: 'Identificación de Recurso Docente',
        text: 'El porcentaje de incremento asociado a la vigencia en cuestión ya se encuentra aplicado a los valores presupuestados. Sin embargo, revisar que los valores tanto de cesantias como pensiones coincidan con los totales.',
        showConfirmButton: true
      })
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Identificación de Recurso Docente',
        text: 'Por favor ingrese el porcentaje de incremento asociado a la vigencia en cuestión presionando el botón "Aplicar Incremento". Al ingresar este porcentaje se vera reflejado en todos los valores presupuestados para cada docente.',
        showConfirmButton: true
      })
    }
  }

  onChangeTipo(element: any, rowIndex: any, tipo: any) {
    if (element.tipo != "H. Catedra Honorarios") {
      Swal.fire({
        icon: 'warning',
        title: 'Por favor complete los campos de cesantias y pensiones',
        timer: 3500,
        showConfirmButton: false
      })
      if (tipo === 'RHF') {
        if (element.tipo === "Medio Tiempo") {
          this.dataSourceRHF.data[rowIndex].horas = 20;
        } else if (element.tipo === "Tiempo Completo") {
          this.dataSourceRHF.data[rowIndex].horas = 40;
        }
      }
    }
    this.getCalculosDocentes(element, rowIndex, tipo)
  }

  onChangeCategoria(element: any, rowIndex: any, tipo: any) {
    this.getCalculosDocentes(element, rowIndex, tipo)
  }

  mostrarMensajeValorInvalido() {
    Swal.fire({
      title: 'El valor ingresado no es válido',
      icon: 'error',
      showConfirmButton: false,
      timer: 2500
    })
  }

  onChangeCantidad(element: any, rowIndex: any, tipo: any) {
    if (element.cantidad < 1 || !Number.isInteger(element.cantidad)) {
      this.mostrarMensajeValorInvalido()
      const dataSource = this.getDataSource(tipo)!
      dataSource[rowIndex].cantidad = "";
    } else {
      this.getCalculosDocentes(element, rowIndex, tipo)
    }
  }

  onChangeSemanas(element: any, rowIndex: any, tipo: any) {
    if (element.semanas < 1 || !Number.isInteger(element.semanas)) {
      this.mostrarMensajeValorInvalido()
      const dataSource = this.getDataSource(tipo)!
      dataSource[rowIndex].semanas = "";
    } else {
      this.getCalculosDocentes(element, rowIndex, tipo)
    }
  }

  onChangeHoras(element: any, rowIndex: any, tipo: any) {
    if (tipo === "RHF") {
      if (element.tipo === "Medio Tiempo") {
        this.dataSourceRHF.data[rowIndex].horas = 20;
      } else if (element.tipo === "Tiempo Completo") {
        this.dataSourceRHF.data[rowIndex].horas = 40;
      }
    }
    if (tipo === "RHVPRE") {
      if (element.tipo === "H. Catedra Honorarios") {
        if (element.horas < 1)
          this.dataSourceRHVPRE.data[rowIndex].horas = 1;
        else if (element.horas > 8)
          this.dataSourceRHVPRE.data[rowIndex].horas = 8;
      } else if (element.tipo === "H. Catedra Prestacional") {
        if (element.horas < 1)
          this.dataSourceRHVPRE.data[rowIndex].horas = 1;
        else if (element.horas > 16)
          this.dataSourceRHVPRE.data[rowIndex].horas = 16;
      }
    }
    if (tipo === "RHVPOS") {
      if (element.tipo === "H. Catedra Honorarios") {
        if (element.horas < 1)
          this.dataSourceRHVPOS.data[rowIndex].horas = 1;
        else if (element.horas > 8)
          this.dataSourceRHVPOS.data[rowIndex].horas = 8;
      } else if (element.tipo === "H. Catedra Prestacional") {
        if (element.horas < 1)
          this.dataSourceRHVPOS.data[rowIndex].horas = 1;
        else if (element.horas > 16)
          this.dataSourceRHVPOS.data[rowIndex].horas = 16;
      }
    }
    this.getCalculosDocentes(element, rowIndex, tipo)
  }

  checkGeneral_TotalCesantiasPensiones() {
    let modals: any[] = [];
    const checkData = (dataSource: any, title: any) => {
      dataSource.forEach((data: any, i: any) => {
        const sumaC = (parseFloat(data.cesantiasPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.cesantiasPublico.replace(/\$|,/g, '')) || 0.0);
        const totalC = (parseFloat(data.totalCesantias.replace(/\$|,/g, '')) || 0.0);
        if (sumaC !== totalC) {
          this.banderaCerrar = true;
          modals.push({ icon: 'warning', title, text: `${i + 1}. ${data.tipo} ${data.categoria} incongruencia en cesantias` });
        }
        const sumaP = (parseFloat(data.pensionesPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.pensionesPublico.replace(/\$|,/g, '')) || 0.0);
        const totalP = (parseFloat(data.totalPensiones.replace(/\$|,/g, '')) || 0.0);
        if (sumaP !== totalP) {
          this.banderaCerrar = true;
          modals.push({ icon: 'warning', title, text: `${i + 1}. ${data.tipo} ${data.categoria} incongruencia en pensiones` });
        }
      });
    };

    checkData(this.dataSourceRHF.data, 'Docentes V.E Ocasionales Pregrado');
    checkData(this.dataSourceRHVPRE.data, 'Docentes V.E Hora Cátedra Pregrado');
    checkData(this.dataSourceRHVPOS.data, 'Docentes V.E Hora Cátedra Posgrado');

    Swal.queue(modals);
    return this.banderaCerrar;
  }

  guardarRecursos() {
    if (this.checkGeneral_TotalCesantiasPensiones()) {
      // Swal.fire({
      //   icon: 'warning',
      //   title: 'Algunos aportes de cesantias o pensiones no coinciden con los totales, revise detenidamente cada uno de los campos.',
      //   showConfirmButton: true
      // })
    } else if (this.incremento == 0.0) {
      Swal.fire({
        icon: 'warning',
        text: 'El porcentaje de incremento asociado a la vigencia en cuestión aún no ha sido aplicado, por favor presione el botón "Aplicar Incremento" para actualizar los valores.',
        showConfirmButton: true
      })
    } else {
      if (this.verificarTablas()) {
        let arreglo: string[] = [];
        this.accionBoton = 'guardar';
        this.tipoIdenti = 'docentes';
        let accion = this.accionBoton;
        let identi = this.tipoIdenti;
        var identificaciones: any;

        let aux1 = this.dataSourceRHF.data;
        for (var i in aux1) {
          var obj = aux1[i];
          obj["activo"] = true;
          obj["incremento"] = this.incremento;
          var num = +i + 1;
          obj["index"] = num;
        }
        let dataStrRHF = JSON.stringify(Object.assign({}, aux1));

        let aux2 = this.dataSourceRHVPRE.data
        for (var i in aux2) {
          var obj = aux2[i];
          obj["activo"] = true;
          var num = +i + 1;
          obj["index"] = num;
        }
        let dataStrRHVPRE = JSON.stringify(Object.assign({}, aux2));


        let aux3 = this.dataSourceRHVPOS.data
        for (var i in aux3) {
          var obj = aux3[i];
          obj["activo"] = true;
          var num = +i + 1;
          obj["index"] = num;
        }
        let dataStrRHVPOS = JSON.stringify(Object.assign({}, aux3));

        let aux4 = this.dataSourceRubrosPre.data
        for (var i in aux4) {
          var obj = aux4[i];
          obj["activo"] = true;
          var num = +i + 1;
        }
        let dataRubros = JSON.stringify(Object.assign({}, aux4))

        let aux5 = this.dataSourceRubrosPos.data
        for (var i in aux5) {
          var obj = aux5[i];
          obj["activo"] = true;
          var num = +i + 1;
        }
        let dataRubrosPos = JSON.stringify(Object.assign({}, aux5))
        identificaciones = {
          "rhf": dataStrRHF,
          "rhv_pre": dataStrRHVPRE,
          "rhv_pos": dataStrRHVPOS,
          "rubros": dataRubros,
          "rubros_pos": dataRubrosPos
        }
        let aux = JSON.stringify(Object.assign({}, identificaciones));
        this.request.put(environment.PLANES_MID, `formulacion/guardar_identificacion`, aux, this.plan + `/61897518f6fc97091727c3c3`).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Guardado exitoso',
              icon: 'success',
              showConfirmButton: false,
              timer: 3500
            })
            if (!this.banderaCerrar) {
              this.acciones.emit({ aux, accion, identi });
            }
          }
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Por favor complete todos los campos antes de continuar',
          timer: 3500,
        })
      }
    }
  }

  ocultarRecursos() {
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'docentes';
    let data = this.dataSourceRHF.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({ data, accion, identi });
  }

  verificarCesantias(element: any, rowIndex: any, tipo: any) {
    const dataSource = this.getDataSource(tipo)!

    if (element.cesantias === "N/A") {
      dataSource[rowIndex].cesantiasPrivado = "N/A"
      dataSource[rowIndex].cesantiasPublico = "N/A"
    }

    if (element.tipo != "H. Catedra Honorarios")
      if (element.cesantiasPrivado != "" && element.cesantiasPublico != "") {
        let cesantiasPublico = parseInt(element.cesantiasPublico.replace(/\$|,/g, ''));
        let cesantiasPrivado = parseInt(element.cesantiasPrivado.replace(/\$|,/g, ''));
        let cesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));

        dataSource[rowIndex].cesantiasPrivado = formatCurrency(cesantiasPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
        dataSource[rowIndex].cesantiasPublico = formatCurrency(cesantiasPublico, 'en-US', getCurrencySymbol('USD', 'wide'));

        if (cesantiasPublico + cesantiasPrivado == cesantias) {
          this.banderaCerrar = false;
        } else {
          this.banderaCerrar = true;
          Swal.fire({
            icon: 'warning',
            title: 'Por favor verifique los campos de cesantias',
            showConfirmButton: true,
            timer: 2500,
          })
        }
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Por favor complete los campos de cesantias',
          showConfirmButton: false,
          timer: 2500,
        })
      }
  }

  verificarPensiones(element: any, rowIndex: any, tipo: any) {
    const dataSource = this.getDataSource(tipo)!

    if (element.cesantias === "N/A") {
      dataSource[rowIndex].pensionesPrivado = "N/A"
      dataSource[rowIndex].pensionesPublico = "N/A"
    }

    if (element.tipo != "H. Catedra Honorarios")
      if (element.pensionesPrivado != "" && element.pensionesPublico != "") {
        let pensionesPublico = parseInt(element.pensionesPublico.replace(/\$|,/g, ''));
        let pensionesPrivado = parseInt(element.pensionesPrivado.replace(/\$|,/g, ''));
        let pensiones = parseInt(element.totalPensiones.replace(/\$|,/g, ''));

        dataSource[rowIndex].pensionesPrivado = formatCurrency(pensionesPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
        dataSource[rowIndex].pensionesPublico = formatCurrency(pensionesPublico, 'en-US', getCurrencySymbol('USD', 'wide'));

        if (pensionesPublico + pensionesPrivado == pensiones) {
          this.banderaCerrar = false;
        } else {
          this.banderaCerrar = true;
          Swal.fire({
            icon: 'warning',
            title: 'Por favor verifique los campos de pensiones',
            showConfirmButton: true,
            timer: 2500,
          })
        }
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Por favor complete los campos de pensiones',
          showConfirmButton: false,
          timer: 2500,
        })
      }
  }

  verificarTablas(): boolean {
    const checkData = (data: any[]) => {
      for (const item of data) {
        if (
          item.pensionesPublico === "" ||
          item.pensionesPrivado === "" ||
          item.cesantiasPublico === "" ||
          item.cesantiasPrivado === "" ||
          item.cantidad === "" ||
          item.semanas === ""
        ) {
          return false;
        }
      }
      return true;
    };

    return (
      checkData(this.dataSourceRHF.data) &&
      checkData(this.dataSourceRHVPRE.data) &&
      checkData(this.dataSourceRHVPOS.data)
    );
  }

  OnPageChangeRHF(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.dataSourceRHF.data.length) {
      endIndex = this.dataSourceRHF.data.length;
    }
    this.steps[0].data = this.dataSourceRHF.data.slice(startIndex, endIndex);
  }

  OnPageChangeRHVPRE(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.dataSourceRHVPRE.data.length) {
      endIndex = this.dataSourceRHVPRE.data.length;
    }
    this.steps[1].data = this.dataSourceRHVPRE.data.slice(startIndex, endIndex);
  }

  OnPageChangeRHVPOS(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.dataSourceRHVPOS.data.length) {
      endIndex = this.dataSourceRHVPOS.data.length;
    }
    this.steps[2].data = this.dataSourceRHVPOS.data.slice(startIndex, endIndex);
  }
}

var dataRubros: any[] = [
  {
    "categoria": "Prima de Servicios",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Prima de navidad",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Prima de vacaciones",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Salario básico",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Intereses cesantías",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Aporte cesantías público",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Aporte cesantías privado",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Aporte salud",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Fondo pensiones público",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Fondo pensiones privado",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Aporte ARL",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Aporte CCF",
    "rubro": "",
    "codigo": ""
  },
  {
    "categoria": "Aporte ICBF",
    "rubro": "",
    "codigo": ""
  }];
