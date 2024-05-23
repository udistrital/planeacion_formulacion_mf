import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Actividad } from 'src/app/@core/models/actividad';
import { DataRequest } from 'src/app/@core/models/dataRequest';
import { Dependencia, DependenciaTipoDependencia, TipoDependencia } from 'src/app/@core/models/dependencia';
import { EstadoPlan } from 'src/app/@core/models/estadoPlan';
import { Paso } from 'src/app/@core/models/formato';
import { PeriodoSeguimiento } from 'src/app/@core/models/periodo';
import { Plan, PlanInteres, ResumenPlan } from 'src/app/@core/models/plan';
import { InfoTercero, TerceroFormulacion } from 'src/app/@core/models/tercero';
import { Vigencia } from 'src/app/@core/models/vigencia';
import { CodigosService, TIPO } from 'src/app/@core/services/codigosEstados.service';
import { RequestManager } from 'src/app/@core/services/requestManager';
import { environment } from 'src/environments/environment';
import { ServiceCookies, ImplicitAutenticationService } from '@udistrital/planeacion-utilidades-module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulacion',
  templateUrl: './formulacion.component.html',
  styleUrls: ['./formulacion.component.scss']
})
export class FormulacionComponent implements OnInit, OnDestroy {

  activedStep = 0;
  form!: FormGroup;
  planes!: (Plan | PlanInteres)[];
  unidades: Dependencia[] = [];
  auxUnidades: Dependencia[] = [];
  planesInteresArray: PlanInteres[] = []
  vigencias!: Vigencia[];
  planSelected: boolean;
  planAsignado!: boolean;
  unidadSelected: boolean;
  vigenciaSelected: boolean;
  addActividad: boolean;
  identContratistas: boolean;
  plan!: Plan;
  planAux!: Plan;
  unidad!: Dependencia;
  vigencia!: Vigencia;
  versionDesdeTabla!: number;
  steps!: Paso[];
  json: any;
  estado!: string;
  clonar: boolean;
  panelOpenState = true;
  dataT: boolean;
  banderaEdit!: boolean;
  rowActividad!: string;
  identRecursos: boolean;
  identDocentes: boolean;
  banderaIdentDocentes!: boolean;
  banderaUltimaVersion!: boolean;
  banderaEstadoDatos!: boolean;
  tipoPlanId!: string;
  idPadre!: string;
  tipoPlanIndicativo!: string;
  idPlanIndicativo!: string;
  planesDesarrollo!: Plan[];
  planesIndicativos!: Plan[];
  planDSelected!: boolean;
  dataArmonizacionPED: string[] = [];
  dataArmonizacionPI: string[] = [];
  estadoPlan!: string;
  iconEstado!: string;
  iconEditar!: string;
  versionPlan!: string;
  versiones!: Plan[];
  controlVersion = new FormControl();
  readonlyObs!: boolean;
  hiddenObs!: boolean;
  readOnlyAll!: boolean;
  ponderacionCompleta!: boolean;
  ponderacionActividades!: string;
  moduloVisible: boolean;
  rol!: string;
  isChecked: boolean
  defaultFilterPredicate = (data: Actividad, filterValue: string) => {
    return (data.activo ? "Activo" : "Inactivo") === filterValue;
  };

  formArmonizacion: FormGroup;
  formSelect: FormGroup;
  pendienteCheck: boolean;

  //Servicios Utilidades Module
  private serviceCookies = new ServiceCookies();
  private autenticationService = new ImplicitAutenticationService();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private codigosService: CodigosService,
    private activatedRoute: ActivatedRoute,
  ) {
    codigosService.cargarIdentificadores()
    this.loadPeriodos();
    this.formArmonizacion = this.formBuilder.group({
      selectPED: ['',],
      selectPI: ['',]
    });
    this.formSelect = this.formBuilder.group({
      selectUnidad: ['',],
      selectVigencia: ['',],
      selectPlan: ['',]
    });
    this.addActividad = false;
    this.planSelected = false;
    this.unidadSelected = false;
    this.vigenciaSelected = false;
    this.clonar = false;
    this.identRecursos = false;
    this.identContratistas = false;
    this.identDocentes = false;
    this.dataT = false;
    this.moduloVisible = false;
    this.isChecked = true;
    this.pendienteCheck = false;
  }

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = []
  dataSource!: MatTableDataSource<Actividad>;

  async ngOnInit() {
    await this.codigosService.cargarIdentificadores();
    await this.autenticationService.getRoles().then((roles: any) => {
      if (roles.find((x: any) => x == 'PLANEACION')) {
        this.rol = 'PLANEACION';
      } else if (roles.find((x: any) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
        this.rol = 'JEFE_DEPENDENCIA';
      } else if (roles.find((x: any) => x == 'JEFE_UNIDAD_PLANEACION')) {
        this.rol = "JEFE_UNIDAD_PLANEACION";
      }
    });

    if (this.rol == 'PLANEACION') {
      await this.loadUnidades();
    } else if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'JEFE_UNIDAD_PLANEACION') {
      await this.validarUnidad()
      //await this.verificarFechas();
    }
    const unidadCookie = this.serviceCookies.getCookie("unidad");
    const vigenciaCookie = this.serviceCookies.getCookie("vigencia");
    const planCookie = this.serviceCookies.getCookie("plan");
    if (unidadCookie != undefined || vigenciaCookie != undefined || planCookie != undefined) {
      this.pendienteCheck = true;
      this.onChangeU(JSON.parse(unidadCookie!));
      this.onChangeV(JSON.parse(vigenciaCookie!), this.pendienteCheck);
      this.onChangeP(JSON.parse(planCookie!));
    }

    // dependencia_id, vigencia_id, nombre, version
    this.activatedRoute.params.subscribe(async (prm) => {
      let dependencia_id = prm['dependencia_id'];
      let vigencia_id = prm['vigencia_id'];
      let nombre = prm['nombre'];
      let version = prm['version'];
      if (
        dependencia_id != undefined &&
        vigencia_id != undefined &&
        nombre != undefined &&
        version != undefined
      ) {
        await this.cargarPlan({
          dependencia_id,
          vigencia_id,
          nombre,
          version,
        } as ResumenPlan);
      }
    });
  }

  ngOnDestroy() {
    const unidadCookie = this.serviceCookies.getCookie("unidad");
    const vigenciaCookie = this.serviceCookies.getCookie("vigencia");
    const planCookie = this.serviceCookies.getCookie("plan");
    if (unidadCookie != undefined || vigenciaCookie != undefined || planCookie != undefined) {
      this.serviceCookies.deleteCookie("unidad");
      this.serviceCookies.deleteCookie("vigencia");
      this.serviceCookies.deleteCookie("plan");
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = this.defaultFilterPredicate;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterActive() {
    if (!this.isChecked) {
      this.dataSource.filterPredicate = this.defaultFilterPredicate;
      this.dataSource.filter = "Activo"
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    } else {
      this.dataSource.filter = ""
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  async verificarFechas(plan: Plan) {
    Swal.fire({
      title: 'Validando fechas de formulación para plan seleccionado...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    if (!this.existePlan(this.planesInteresArray, plan.nombre)) {
      this.moduloVisible = true;
      Swal.close()
    } else {
      var unidad_interes = { "Id": this.unidad.Id, "Nombre": this.unidad.Nombre }
      var plan_interes = plan as PlanInteres;
      var periodo_seguimiento: PeriodoSeguimiento = {
        unidades_interes: JSON.stringify([unidad_interes]),
        planes_interes: JSON.stringify([plan_interes]),
        periodo_id: this.vigencia.Id.toString(),
        tipo_seguimiento_id: this.codigosService.getId(TIPO.SeguimientoFormulacion)
      }
      await new Promise((resolve, reject) => {
        this.request
          .post(environment.PLANES_CRUD, `periodo-seguimiento/buscar-unidad-planes/3`, periodo_seguimiento)
          .subscribe(
            async (data: DataRequest) => {
              if (data?.Data.length != 0) {
                let seguimientoFormulacion = data.Data[0];
                let auxFecha = new Date();
                let auxFechaCol = auxFecha.toLocaleString('en-US', {
                  timeZone: 'America/Mexico_City',
                });
                let strFechaHoy = new Date(auxFechaCol).toISOString();
                let fechaHoy = new Date(strFechaHoy);
                let fechaInicio = new Date(
                  seguimientoFormulacion['fecha_inicio']
                );
                let fechaFin = new Date(seguimientoFormulacion['fecha_fin']);
                if (fechaHoy >= fechaInicio && fechaHoy <= fechaFin) {
                  // await this.validarUnidad();
                  this.moduloVisible = true;
                  Swal.close()
                  resolve(true);
                } else {
                  this.moduloVisible = false;
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `Está intentando acceder a la formulación por fuera de las fechas establecidas`,
                    icon: 'warning',
                    showConfirmButton: true,
                    timer: 10000,
                  });
                  reject();
                }
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se encontraron datos registrados ${JSON.stringify(
                  error
                )}`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500,
              });
            }
          );
      });
    }
    return
  }

  async validarUnidad() {
    return await new Promise<Dependencia[]>((resolve, reject) => {
      this.autenticationService.getDocumento().then((documento: any) => {
        this.request
          .get(
            environment.TERCEROS_SERVICE,
            `datos_identificacion/?query=Numero:${documento}`
          )
          .subscribe((datosInfoTercero: InfoTercero[]) => {
            this.request
              .get(
                environment.PLANEACION_FORMULACION_MID,
                `formulacion/tercero/${datosInfoTercero[0].TerceroId.Id}`
              )
              .subscribe((vinculacion: DataRequest) => {
                if (vinculacion.Data != null) {
                  const vinculaciones: TerceroFormulacion[] = vinculacion.Data;
                  for (let aux = 0; aux < vinculaciones.length; aux++) {
                    const vinculacion = vinculaciones[aux];
                    this.request
                      .get(
                        environment.OIKOS_SERVICE,
                        `dependencia_tipo_dependencia?query=DependenciaId:${vinculacion.DependenciaId}`
                      )
                      .subscribe((dataUnidad: DependenciaTipoDependencia[]) => {
                        if (dataUnidad) {
                          let unidad = dataUnidad[0].DependenciaId;
                          unidad.TipoDependencia =
                            dataUnidad[0].TipoDependenciaId.Id;
                          for (let i = 0; i < dataUnidad.length; i++) {
                            if (dataUnidad[i].TipoDependenciaId.Id === 2) {
                              unidad.TipoDependencia =
                                dataUnidad[i].TipoDependenciaId.Id;
                            }
                          }
                          if (!this.unidades.find((u) => u.Id === unidad.Id)) {
                            this.unidades.push(unidad);
                            this.auxUnidades.push(unidad);
                          }
                          this.moduloVisible = true;
                        }
                      });
                  }
                  this.unidades = this.unidades.sort((a, b) => (a.Id < b.Id ? -1 : 1));
                  resolve(this.unidades);
                } else {
                  this.moduloVisible = false;
                  Swal.fire({
                    title: "Error en la operación",
                    text: `No cuenta con los permisos requeridos para acceder a este módulo`,
                    icon: "warning",
                    showConfirmButton: false,
                    timer: 4000,
                  });
                  reject();
                }
              });
          });
      });
    });
  }

  async loadUnidades() {
    return await new Promise<Dependencia[]>((resolve, reject) => {
      this.request
        .get(environment.PLANEACION_FORMULACION_MID, `formulacion/unidades`)
        .subscribe(
          (data: DataRequest) => {
            if (data) {
              resolve(data.Data as Dependencia[]);
            }
          },
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados ${JSON.stringify(
                error
              )}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          }
        );
    }).then((unidades) => {
      this.unidades = unidades;
      this.auxUnidades = unidades;
      this.moduloVisible = true;
    });
  }

  loadPeriodos() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: DataRequest) => {
      if (data) {
        this.vigencias = data.Data as Vigencia[];
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  async loadPlanes() {
    Swal.fire({
      title: 'Cargando datos...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    return await new Promise<(Plan | PlanInteres)[]>((resolve, reject) => {
      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,dependencia_id:${this.unidad.Id},formato:false,vigencia:${this.vigencia.Id}`).subscribe(async (data: DataRequest) => {
        if (data) {
          // No se puede traer filtrado desde PLANES_CRUD, al parecer excede la cantidad de parametros
          let planes = (data.Data as Plan[]).filter(
            (p) => p.tipo_plan_id != this.codigosService.getId(TIPO.PlanProyecto)
          );
          this.planes = []
          planes.forEach(plan => {
            if (!this.existePlan(this.planes, plan.nombre)) {
              this.planes = [...this.planes, plan]
            }
          });
          await this.loadPlanesPeriodoSeguimiento();
          resolve(this.planes);
        }
      }, (error) => {
        Swal.close()
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        reject(error)
      })
    })
  }

  existePlan(arreglo: (Plan | PlanInteres)[], nombre: string): boolean {
    return arreglo.some((plan) => plan.nombre === nombre);
  }

  async loadPlanesPeriodoSeguimiento() {
    const unidad_interes = {
      "Id": this.unidad.Id,
      "Nombre": this.unidad.Nombre
    }
    const periodo_seguimiento = {
      unidades_interes: JSON.stringify([unidad_interes]),
      periodo_id: this.vigencia.Id.toString(),
      tipo_seguimiento_id: this.codigosService.getId(TIPO.SeguimientoFormulacion)
    }
    return await new Promise<(Plan | PlanInteres)[]>((resolve, reject) => {
      this.request
        .post(environment.PLANES_CRUD, `periodo-seguimiento/buscar-unidad-planes/3`, periodo_seguimiento)
        .subscribe((data: DataRequest) => {
          this.planesInteresArray = [];
          if (data?.Data != null && data.Data.length != 0) {
            data.Data.forEach((elemento: PeriodoSeguimiento) => {
              if (elemento.planes_interes) {
                try {
                  let planesInteresArray: PlanInteres[] = JSON.parse(elemento.planes_interes);

                  // Recorre los planes en Interes y solo agrega los que no existian
                  planesInteresArray.forEach(plan => {
                    if (!this.existePlan(this.planesInteresArray, plan.nombre)) {
                      this.planesInteresArray = [...this.planesInteresArray, plan]
                      if (this.existePlan(this.planes, plan.nombre)) {
                        this.planes = this.planes.filter((p) => p.nombre !== plan.nombre)
                      }
                    }
                  });
                } catch (error) {
                  console.error(
                    "Error al analizar JSON en planes_interes:",
                    error
                  );
                  reject(error);
                }
              } else {
                console.error(
                  "El elemento no tiene una cadena JSON en planes_interes:",
                  elemento
                );
                reject();
              }
            });
          }
          this.planes = [...this.planes, ...this.planesInteresArray];
          Swal.close();
          if (this.planes.length == 0) {
            Swal.fire({
              title: 'Planes no encontrados',
              html:
                'No tiene asignados planes/proyectos asociados para la dependencia <b>' +
                this.unidad.Nombre +
                '</b> y la <br> vigencia <b>' +
                this.vigencia.Nombre +
                '</b><br></br>',
              icon: 'warning',
              showConfirmButton: false,
              timer: 7000,
            });
          }
          resolve(this.planes);
        });
    });
  }

  onKey(value: Event) {
    const inputElement = value.target as HTMLInputElement;
    const inputValue = inputElement.value;
    if (inputValue === "") {
      this.auxUnidades = this.unidades;
    } else {
      this.auxUnidades = this.search(inputValue);
    }
  }

  search(value: string) {
    let filter = value.toLowerCase();
    if (this.unidades != undefined) {
      return this.unidades.filter(option => option.Nombre.toLowerCase().startsWith(filter));
    } else {
      return []
    }
  }

  prevStep(step: number) {
    this.activedStep = step - 1;
  }

  nextStep(step: number) {
    this.activedStep = step + 1;
  }

  submit() {
    if (!this.banderaEdit) { // ADD NUEVA ACTIVIDAD
      if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0) {

        var formValue = this.form.value;
        var actividad = {
          armo: this.dataArmonizacionPED.toString(),
          armoPI: this.dataArmonizacionPI.toString(),
          entrada: formValue
        }
        this.request.put(environment.PLANEACION_FORMULACION_MID, `formulacion/actividad`, actividad, this.plan._id).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Actividad agregada',
              text: 'La actividad se ha registrado satisfactoriamente',
              icon: 'success'
            }).then((result) => {
              if (result.value) {
                this.loadData()
                this.form.reset();
                this.addActividad = false;
                this.dataArmonizacionPED = [];
                this.dataArmonizacionPI = [];
                this.idPadre = '';
                this.tipoPlanId = '';
                this.tipoPlanIndicativo = '';
                this.idPlanIndicativo = '';
              }
            })
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No fue posible crear la actividad, por favor contactarse con el administrador del sistema',
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })

          this.addActividad = false;
          this.dataArmonizacionPED = [];
          this.dataArmonizacionPI = [];
        })
      } else {
        Swal.fire({
          title: 'Por favor complete la armonización para continuar',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }

    } else { // EDIT ACTIVIDAD
      if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0) {
        var aux = this.dataArmonizacionPED.toString();
        let aux2 = this.dataArmonizacionPI.toString();
        var formValue = this.form.value;
        var actividad = {
          armo: aux,
          armoPI: aux2,
          entrada: formValue
        }
        this.request.put(environment.PLANEACION_FORMULACION_MID, `formulacion/actividad`, actividad, `${this.plan._id}/${this.rowActividad}`).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Información de actividad actualizada',
              //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
              text: 'La actividad se ha actualizado satisfactoriamente',
              icon: 'success'
            }).then((result) => {
              if (result.value) {
                this.form.reset();
                this.addActividad = false;
                this.loadData();
                this.idPadre = '';
                this.tipoPlanId = '';
                this.idPlanIndicativo = '';
                this.tipoPlanIndicativo = '';
              }
            })
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No fue posible actualizar la actividad, por favor contactarse con el administrador del sistema`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })

          this.addActividad = false;
          this.dataArmonizacionPED = [];
          this.dataArmonizacionPI = [];
        })
      } else {
        Swal.fire({
          title: 'Por favor complete la armonización para continuar',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }

    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  async onChangeU(unidad: Dependencia) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.banderaIdentDocentes = this.mostrarIdentDocente(unidad);
      this.estadoPlan = '';
      this.iconEstado = '';
      this.versionPlan = '';
      if (this.vigenciaSelected && this.planSelected) {
        await this.busquedaPlanes(this.planAux);
      }
    }
  }
  // Verifica si la dependencia es de tipo 2
  mostrarIdentDocente(unidad: Dependencia): boolean {
    return unidad.Id === 67 || (unidad.TipoDependencia as TipoDependencia).Id === 2 || unidad.TipoDependencia === 2
  }

  async onChangeV(vigencia: Vigencia, planListo: boolean) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      if (!planListo) {
        await this.loadPlanes();
      }
      this.banderaEstadoDatos = false;
      this.planSelected = false;
      this.plan = {} as Plan;
      this.planAsignado = false;
      this.dataT = false;
      if (this.unidadSelected && this.planSelected) {
        await this.busquedaPlanes(this.planAux);
      }
    }
  }

  async onChangeP(plan: Plan) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planAux = plan;
      this.planSelected = true;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      this.banderaEstadoDatos = false;
      this.plan = plan;
      this.planAsignado = false;
      this.dataT = false;
      this.isChecked = true;
      await this.verificarFechas(plan);
      await this.busquedaPlanes(plan);
    }
  }

  onChangePD(planD: Plan) {
    if (planD == undefined) {
      this.idPadre = '';
      this.tipoPlanId = '';
    } else {
      this.idPadre = planD._id;
      this.tipoPlanId = planD.tipo_plan_id;
    }
  }

  onChangePI(planI: Plan) {
    if (planI == undefined) {
      this.idPlanIndicativo = '';
      this.tipoPlanIndicativo = '';
    } else {
      this.idPlanIndicativo = planI._id;
      this.tipoPlanIndicativo = planI.tipo_plan_id;
    }
  }

  onChangeVersion(version: Plan) {
    if (version._id == this.versiones[this.versiones.length - 1]._id) {
      this.banderaUltimaVersion = true;
    } else {
      this.banderaUltimaVersion = false;
    }
    this.plan = version;
    this.versionPlan = this.plan.numero!;
    this.controlVersion = new FormControl(this.plan);
    this.getEstado();
    this.planAsignado = true;
    this.clonar = false;
    this.loadData();
    this.addActividad = false;
  }


  visualizeObs() {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        if (this.versiones.length == 1) {
          this.hiddenObs = true;
        } else if (this.versiones.length > 1 && this.banderaEdit && this.addActividad) {
          this.hiddenObs = false;
        } else if (this.versiones.length > 1 && !this.banderaEdit && this.addActividad) {
          this.hiddenObs = true;
        }
        this.readonlyObs = true;
        this.readOnlyAll = false;
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = true;
      }
    }
    if (this.rol == 'PLANEACION' || this.rol == 'JEFE_UNIDAD_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'En revisión') {
        this.readOnlyAll = true;
        this.readonlyObs = false;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal' || this.estadoPlan == 'Revisión Verificada') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = true;
      }
    }
  }

  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/${this.plan.estado_plan_id}`).subscribe(
      (data: DataRequest) => {
        if (data) {
          this.estadoPlan = (data.Data as EstadoPlan).nombre;
          this.getIconEstado();
          this.visualizeObs();
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
    )
  }

  getIconEstado() {
    if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoEnFormulacion)) {
      this.iconEstado = "create";
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoFormulado)) {
      this.iconEstado = "assignment_turned_in";
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoEnRevision)) {
      this.iconEstado = "pageview";
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoRevisado)) {
      this.iconEstado = "assignment_return";
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoPreAval)) {
      this.iconEstado = "done";
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoAval)) {
      this.iconEstado = "done_all"
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoAjustePresupuestal)) {
      this.iconEstado = "build";
    } else if (this.plan.estado_plan_id == this.codigosService.getId(TIPO.EstadoRevisionVerificada)) {
      this.iconEstado = "spellcheck";
    }
  }

  getVersiones(planB: Plan, planRecienCreado = false) {
    let auxNombre = planB.nombre.replace(/ /g, "%20");
    this.request.get(environment.PLANEACION_FORMULACION_MID, `formulacion/plan/versiones/${this.unidad.Id}/${this.vigencia.Id}/${auxNombre}`).subscribe(
      (respuesta: DataRequest) => {
        if (respuesta) {
          let versiones = respuesta.Data as Plan[];
          versiones.forEach((_, i) => {
            versiones[i].numero = (i + 1).toString();
          });
          this.versiones = versiones;
          this.plan =
            this.versiones[
            this.versionDesdeTabla == undefined || this.versionDesdeTabla > this.versiones.length
              ? this.versiones.length - 1
              : this.versionDesdeTabla - 1
            ];
          this.planAsignado = true;
          this.clonar = false;
          this.banderaUltimaVersion = true;
          this.loadData(planRecienCreado);
          this.controlVersion = new FormControl(this.plan);
          this.versionPlan = this.plan.numero!;
          this.getEstado();
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        });
      }
    )
  }

  async busquedaPlanes(planB: Plan) {
    try {
      // Antes de cargar algún plan, hago la búsqueda del formato si tiene datos y la bandera "banderaEstadoDatos" se vuelve true o false.
      await this.cargaFormato(planB);
      //validación con bandera para el estado de los datos de los planes.
      if (this.banderaEstadoDatos) {
        this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:${this.unidad.Id},vigencia:${this.vigencia.Id},formato:false,nombre:${planB.nombre}`).subscribe(
          (data: DataRequest) => {
            if (data.Data.length > 0) {
              this.getVersiones(planB);
            } else if (data.Data.length == 0) {
              Swal.fire({
                title: 'Formulación nuevo plan',
                html: 'No existe plan <b>' + planB.nombre + '</b> <br>' +
                  'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
                  'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>' +
                  '<i>Deberá formular el plan</i>',
                icon: 'warning',
                showConfirmButton: false,
                timer: 7000
              })
              this.clonar = true;
              this.planAsignado = true;
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `${JSON.stringify(error)}`,
              showConfirmButton: false,
              timer: 7000
            })
            this.clonar = true;
            this.plan = planB;
          })
      } else {
        this.dataT = false;
        Swal.fire({
          title: 'No hay datos',
          html: 'No existen datos para el plan <b>' + planB.nombre + '</b> <br>' +
            'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
            'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>',
          icon: 'warning',
          showConfirmButton: false,
          timer: 7000
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error en la operación',
        text: `error de busquedaPlanes catch No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }

  loadData(planRecienCreado: boolean = false) {
    this.ajustarData(planRecienCreado);
  }

  ajustarData(planRecienCreado: boolean) {
    if (this.rol == 'PLANEACION' || this.rol == 'JEFE_UNIDAD_PLANEACION' || this.plan.estado_plan_id != this.codigosService.getId(TIPO.EstadoEnFormulacion)) {
      this.iconEditar = 'search'
    } else if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'JEFE_PLANEACION') {
      this.iconEditar = 'edit'
    }
    this.request.get(environment.PLANEACION_FORMULACION_MID, `formulacion/actividad/${this.plan._id}?order=asc&sortby=index`).subscribe((data: DataRequest) => {
      const { data_source, displayed_columns } = data.Data as {
        data_source: Actividad[];
        displayed_columns: string[];
      };
      if (data_source != null) {
        this.dataSource = new MatTableDataSource(data_source);
        this.displayedColumns = displayed_columns as string[];
        this.columnsToDisplay = this.displayedColumns.slice();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.defaultFilterPredicate;
        this.dataT = true;
        this.filterActive()
      } else if (!data_source && !displayed_columns) {
        this.dataT = false;
        Swal.fire({
          title: 'Atención en la operación',
          text: `No hay actividades registradas para el plan \n por favor agregue actividades`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 3500
        })
        if (!planRecienCreado) {
          Swal.fire({
            title: 'Atención en la operación',
            text: `No hay actividades registradas para el plan`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 3500
          })
        }
      }
    }, (error) => {
      console.error(error);
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  cargaFormato(plan: Plan) {
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (this.existePlan(this.planesInteresArray, plan.nombre)) {
      this.banderaEstadoDatos = true;
      Swal.close();
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        this.request.get(environment.PLANEACION_FORMATO_MID, `formato/${plan._id}`).subscribe((dataRes: DataRequest) => {
          const data = dataRes.Data;
          if (Array.isArray(data) && data[0] === null && Array.isArray(data[1]) &&
            data[1].length > 0 && Object.keys(data[1][0]).length === 0) {
            this.banderaEstadoDatos = false;
            Swal.close();
            reject();
          } else {
            this.banderaEstadoDatos = true;//bandera validacion de la data
            this.estado = plan.estado_plan_id;
            this.steps = data[0];
            this.json = data[1][0];
            this.form = this.formBuilder.group(this.json);
            Swal.close()
            resolve(data);
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          });
          reject();
        })
      });
    }
  }

  async editar(fila: Actividad) {
    if (!fila.activo) {
      Swal.fire({
        title: 'Actividad inactiva',
        text: `No puede editar una actividad en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 3500
      });
    } else {
      await this.cleanBeforeLoad();
      if (this.planesDesarrollo == undefined) {
        this.cargarPlanesDesarrollo();
      }
      if (this.planesIndicativos == undefined) {
        this.cargarPlanesIndicativos();
      }
      this.addActividad = true;
      this.banderaEdit = true;
      this.visualizeObs();
      this.rowActividad = fila.index;
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANEACION_FORMULACION_MID, `formulacion/plan/${this.plan._id}/${fila.index}`).subscribe((data: DataRequest) => {
        if (data) {
          Swal.close();
          this.onChangePD(this.planesDesarrollo[0]);
          this.onChangePI(this.planesIndicativos[0]);
          this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);

          let auxAmonizacion = data.Data[2][0]
          this.dataArmonizacionPED = (auxAmonizacion.armo as string).split(",").filter((item) => item != "")
          this.dataArmonizacionPI = (auxAmonizacion.armoPI as string).split(",").filter((item) => item != "")
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    }
  }

  cleanBeforeLoad(): Promise<void> {
    this.addActividad = false;
    this.dataArmonizacionPED = [];
    this.dataArmonizacionPI = [];
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  inhabilitar(fila: Actividad): void {
    if (!fila.activo) {
      Swal.fire({
        title: 'Actividad ya inactiva',
        text: `La actividad ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    } else {
      this.inactivar(fila);
    }
  }

  inactivar(fila: Actividad): void {
    Swal.fire({
      title: 'Inhabilitar actividad',
      text: `¿Está seguro de inhabilitar esta actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request
          .put(
            environment.PLANEACION_FORMULACION_MID,
            `formulacion/actividad`,
            `null`,
            `${this.plan._id}/${fila.index}/desactivar`
          )
          .subscribe(
            (data: DataRequest) => {
              if (data) {
                Swal.fire({
                  title: "Cambio realizado",
                  icon: "success",
                }).then((result) => {
                  if (result.value) {
                    this.loadData();
                  }
                });
              }
            },
            (error) => {
              Swal.fire({
                title: "Error en la operación",
                icon: "error",
                text: `${JSON.stringify(error)}`,
                showConfirmButton: false,
                timer: 2500,
              });
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  agregarActividad() {
    if (this.tipoPlanId === undefined && this.idPadre === undefined) {
      this.cargarPlanesDesarrollo();
    }
    if (this.tipoPlanIndicativo === undefined && this.idPlanIndicativo === undefined) {
      this.cargarPlanesIndicativos();
    }
    this.cargaFormato(this.plan);
    this.addActividad = true;
    this.banderaEdit = false;
    this.visualizeObs();
    this.dataArmonizacionPED = [];
    this.dataArmonizacionPI = [];
  }

  identificarContratistas() {
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:${this.plan._id},tipo_identificacion_id:${this.codigosService.getId(TIPO.IdentificacionContratistas)}`).subscribe((data: DataRequest) => {
      if ((data.Data as any[]).length == 0) {
        var str1 = 'Identificación de Contratistas ' + this.plan.nombre
        var str2 = 'Identificación de Contratistas ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": str1,
          "descripcion": str2,
          "plan_id": this.plan._id,
          "dato": "{}",
          "tipo_identificacion_id": this.codigosService.getId(TIPO.IdentificacionContratistas),
          "activo": true
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: DataRequest) => {
          if (dataP) {
            this.identContratistas = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identContratistas = true;
      }
    })
  }

  identificarRecursos() {
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:${this.plan._id},tipo_identificacion_id:${this.codigosService.getId(TIPO.IdentificacionRecursos)}`).subscribe((data: DataRequest) => {
      if ((data.Data as any[]).length == 0) {
        var str1 = 'Identificación de Recursos ' + this.plan.nombre
        var str2 = 'Identificación de Recursos ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": this.codigosService.getId(TIPO.IdentificacionRecursos),
          "activo": true
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: DataRequest) => {
          if (dataP) {
            this.identRecursos = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identRecursos = true;
      }
    })
  }

  identificarDocentes() {

    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:${this.plan._id},tipo_identificacion_id:${this.codigosService.getId(TIPO.IdentificacionDocentes)}`).subscribe((data: DataRequest) => {
      if ((data.Data as any[]).length == 0) {
        let datoIdenti = {
          "nombre": `Identificación de Docentes ${this.plan.nombre}`,
          "descripcion": `Identificación de Docentes ${this.plan.nombre} ${this.unidad.Nombre}`,
          "plan_id": this.plan._id,
          "dato": "{}",
          "tipo_identificacion_id": this.codigosService.getId(TIPO.IdentificacionDocentes),
          "activo": false
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: DataRequest) => {
          if (dataP) {
            this.identDocentes = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identDocentes = true;
      }
    })
  }

  cargarPlanesDesarrollo() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${this.codigosService.getId(TIPO.PlanDesarrolloEstrategico)}`).subscribe((data: DataRequest) => {
      if (data) {
        this.planesDesarrollo = data.Data;
        this.formArmonizacion.get('selectPED')!.setValue(this.planesDesarrollo[0])
        this.onChangePD(this.planesDesarrollo[0]);
      }
    })
  }

  cargarPlanesIndicativos() {
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:${this.codigosService.getId(TIPO.PlanIndicativo)}`).subscribe((data: DataRequest) => {
      if (data) {
        this.planesIndicativos = data.Data;
        this.formArmonizacion.get('selectPI')!.setValue(this.planesIndicativos[0])
        this.onChangePI(this.planesIndicativos[0]);
      }
    })
  }

  receiveMessage(event: { bandera: string; armonizacionIds: string[]; }) {
    if (event.bandera === 'armonizar') {
      this.dataArmonizacionPED = event.armonizacionIds;
    }
  }

  receiveMessagePI(event: { bandera: string; armonizacionIds: string[]; }) {
    if (event.bandera === 'armonizar') {
      this.dataArmonizacionPI = event.armonizacionIds;
    }
  }

  formularPlan() {
    Swal.fire({
      title: 'Formulando plan...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    let parametros = {
      "dependencia_id": String(this.unidad.Id),
      "vigencia": String(this.vigencia.Id)
    }
    this.request.post(environment.PLANEACION_FORMULACION_MID, `formulacion/formato/${this.plan._id}/clonar`, parametros).subscribe((data: DataRequest) => {
      if (data) {
        this.plan = data.Data;
        Swal.fire({
          title: 'Formulación nuevo plan',
          text: `Plan creado satisfactoriamente`,
          icon: 'success',
          showConfirmButton: false,
          timer: 4000
        })
        this.getVersiones(this.plan, true);

      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  ocultar() {
    Swal.fire({
      title: 'Registro de la actividad',
      text: `¿Desea cancelar el registro de la actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.addActividad = false;
        this.dataArmonizacionPED = [];
        this.dataArmonizacionPI = [];
        Swal.fire({
          title: 'Registro cancelado',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  messageIdentificacion(event: { accion: string; identi: string; }) {
    if (event.accion == 'ocultar') {
      Swal.fire({
        title: `Identificación de ${event.identi}`,
        text: `¿Desea cerrar la identificación de ${event.identi}?`,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then(
        (result) => {
          if (result.isConfirmed) {
            if (event.identi == "contratistas") {
              this.identContratistas = false;
            } else if (event.identi == "recursos") {
              this.identRecursos = false;
            } else if (event.identi == "docentes") {
              this.identDocentes = false;
            }
            Swal.fire({
              title: "Cierre exitoso.",
              icon: "warning",
              showConfirmButton: false,
              timer: 2500,
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        },
        (error) => {
          Swal.fire({
            title: "Error en la operación",
            icon: "error",
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500,
          });
        }
      );
    } else if (event.accion == 'guardar') {
      if (event.identi == 'contratistas') {
        this.identContratistas = false;
      } else if (event.identi == 'recursos') {
        this.identRecursos = false;
      } else if (event.identi == 'docentes') {
        this.identDocentes = false;
      }
    }
  }

  culminarPlan() {
    // Revisar si tiene actividades (!)
    this.getPoderacionActividades().then(() => {
      if (this.ponderacionCompleta != true) {
        Swal.fire({
          icon: 'error',
          title: 'Ponderación Incorrecta',
          html: this.ponderacionActividades
        })
      } else {
        this.request.get(environment.PLANEACION_FORMULACION_MID, `formulacion/identificacion/verificacion/${this.plan._id}`).subscribe((data: DataRequest) => {
          if (data?.Data) {
            Swal.fire({
              title: 'Culminar Plan',
              text: `¿Está seguro de enviar este Plan Culminado?`,
              icon: 'warning',
              confirmButtonText: `Si`,
              cancelButtonText: `No`,
              showCancelButton: true
            }).then((result) => {
              if (result.isConfirmed) {
                this.plan.estado_plan_id = this.codigosService.getId(TIPO.EstadoFormulado);
                this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: DataRequest) => {
                  if (data) {
                    Swal.fire({
                      title: 'Plan enviado',
                      icon: 'success',
                    }).then((result) => {
                      if (result.value) {
                        this.busquedaPlanes(data.Data as Plan);
                        this.loadData();
                        this.addActividad = false;
                      }
                    })
                  }
                })
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                  title: 'Envío cancelado',
                  icon: 'error',
                  showConfirmButton: false,
                  timer: 2500
                })
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                text: `${JSON.stringify(error)}`,
                showConfirmButton: false,
                timer: 2500
              })
            })
          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las identificaciones de contratistas y/o docentes para continuar`,
              showConfirmButton: false,
              timer: 2500
            })
          }
        })

      }
    })

  }

  getPoderacionActividades() {
    return new Promise<string>((resolve) => {
      this.request.get(environment.PLANEACION_FORMULACION_MID, `formulacion/actividad/ponderacion/${this.plan._id}`).subscribe((data: DataRequest) => {
        let message: string = "";
        if (data) {
          type Data = { [key: string]: any };
          let aux: Data = data.Data;
          let keys: string[];

          keys = Object.keys(aux);
          for (let key of keys) {
            message = message + key + " : " + aux[key] + "<br/>";
          }
          if (parseInt(data.Data.Total) === 100) {
            this.ponderacionCompleta = true;
          } else {
            this.ponderacionCompleta = false;
          }
          this.ponderacionActividades = message;
          resolve(message);
        } else {
          Swal.fire({
            title:
              "Error en solicitud de cálculo de ponderación, por favor contactarse con el administrador del sistema.",
            icon: "error",
            showConfirmButton: false,
            timer: 2500,
          });
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en solicitud de cálculo de ponderación, por favor contactarse con el administrador del sistema.',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      })
    });
  }

  iniciarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = this.codigosService.getId(TIPO.EstadoEnRevision);
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Plan En Revisión',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data as Plan);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
        Swal.fire({
          title: 'Estado actualizado (SIN CAMBIOS)',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Inicio de Revisión Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  enviarRevision() {
    Swal.fire({
      title: 'Enviar Revisión',
      text: `¿Desea enviar la revisión?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = this.codigosService.getId(TIPO.EstadoRevisado);
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Revisión Enviada',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data as Plan);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  verificarRevision() {
    Swal.fire({
      title: "Verificar Revisión",
      text: `¿Desea verificar la revisión?`,
      icon: "warning",
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true,
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.plan.estado_plan_id = this.codigosService.getId(TIPO.EstadoEnRevision);
          this.request
            .put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id)
            .subscribe((data: DataRequest) => {
              if (data) {
                Swal.fire({
                  title: "Revisión Verficada Enviada",
                  icon: "success",
                }).then((result) => {
                  if (result.value) {
                    this.busquedaPlanes(data.Data);
                    this.loadData();
                    this.addActividad = false;
                  }
                });
              }
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: "Envio de Revisión Verificada Cancelado",
            icon: "error",
            showConfirmButton: false,
            timer: 2500,
          });
        }
      },
      (error) => {
        Swal.fire({
          title: "Error en la operación",
          icon: "error",
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }

  realizarAjustes() {
    Swal.fire({
      title: 'Realizar Ajustes',
      text: `¿Desea realizar ajustes a el Plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.post(environment.PLANEACION_FORMULACION_MID, `formulacion/plan/${this.plan._id}/versionar`, this.plan).subscribe((data: DataRequest) => {
          if (data) {
            this.getVersiones(data.Data);
            Swal.fire({
              title: 'Nueva Versión',
              text: 'Nueva versión del plan creada, ya puede realizar los ajustes al plan.',
              icon: 'success',
            }).then(async (result) => {
              if (result.value) {
                await this.cleanBeforeLoad();
              }
            })
          } else {
            Swal.fire({
              title: 'Error al versionar el plan. Por favor intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  preAval() {
    Swal.fire({
      title: 'Pre Aval',
      text: `¿Desea darle pre aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = this.codigosService.getId(TIPO.EstadoPreAval);
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Plan pre avalado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
        Swal.fire({
          title: 'Revision Enviada (SIN CAMBIOS)',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Pre Aval Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }


  avalar() {
    Swal.fire<{ isConfirmed: boolean; dismiss: number }>({
      title: "Aval",
      text: `¿Desea darle Aval a este plan?`,
      icon: "warning",
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true,
    }).then(
      // @ts-ignore
      (result) => {
        if (result.isConfirmed) {
          this.mostrarMensajeCarga();
          return new Promise((resolve, reject) => {
            this.request
              .post(
                environment.PLANES_MID,
                `seguimiento/avalar/${this.plan._id}`,
                {}
              )
              .subscribe(
                (data: DataRequest) => {
                  Swal.close();
                  if (data.Success == true) {
                    Swal.fire({
                      title: "Plan Avalado",
                      icon: "success",
                      showConfirmButton: false,
                      timer: 2500,
                    });
                    this.plan.estado_plan_id = this.codigosService.getId(TIPO.EstadoAval);
                    this.busquedaPlanes(this.plan);
                    this.loadData();
                    this.addActividad = false;
                    resolve(data);
                  } else {
                    Swal.fire({
                      title: "Error en la operación",
                      icon: "error",
                      text: `Error creando reportes de seguimiento`,
                      showConfirmButton: false,
                      timer: 2500,
                    });
                    reject();
                  }
                },
                (error) => {
                  Swal.close();
                  const mensaje = error.error.Data
                    ? error.error.Data
                    : error.message;
                  Swal.fire({
                    title: "Error en la operación",
                    text: `${mensaje}, por favor diríjase al módulo de administración y diligencie las fechas correspondientes al periodo de seguimiento para la vigencia requerida.`,
                    icon: "warning",
                    showConfirmButton: false,
                    timer: 4000,
                  });
                  reject();
                }
              );
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: "Envio de Aval Cancelado",
            icon: "error",
            showConfirmButton: false,
            timer: 2500,
          });
        }
      },
      (error) => {
        Swal.fire({
          title: "Error en la operación",
          icon: "error",
          text: JSON.stringify(error),
          showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }
  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Procesando petición...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  async cargarPlan(planACargar: ResumenPlan) {
    // Se obtiene la unidad especificada para cargarla en los desplegables
    const unidad = this.auxUnidades.find(
      (unidad) => unidad.Id == Number(planACargar.dependencia_id)
    )!;
    this.formSelect.get('selectUnidad')!.setValue(unidad);
    await this.onChangeU(unidad);

    // Se obtiene la vigencia especificada para cargarla en los desplegables
    const vigencia = this.vigencias.find(
      (vigencia) => vigencia.Id == Number(planACargar.vigencia_id)
    )!;
    this.formSelect.get('selectVigencia')!.setValue(vigencia);
    await this.onChangeV(vigencia, false);

    // En este punto se deben haber cargado los planes por la función 'onChangeV'
    if (this.planes != undefined) {
      const plan = this.planes.find(
        (plan) => plan.nombre == planACargar.nombre
      )! as Plan;
      this.formSelect.get('selectPlan')!.setValue(plan);
      this.onChangeP(plan);
      this.versionDesdeTabla = planACargar.version!;
    } else {
      console.error('No se han cargado los planes');
    }
  }
}
