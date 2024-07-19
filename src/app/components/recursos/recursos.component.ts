import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { isNumeric } from 'rxjs/internal-compatibility';
import { DataRequest } from 'src/app/@core/models/dataRequest';
import { RequestManager } from 'src/app/@core/services/requestManager';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { rubros_aux } from './rubros';
import { Plan } from 'src/app/@core/models/plan';
import { Tipo } from 'src/app/@core/models/tipo';
import { CodigosService, TIPO } from 'src/app/@core/services/codigosEstados.service';
import { Actividad } from 'src/app/@core/models/actividad';

@Component({
  selector: 'app-recursos',
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.scss']
})
export class RecursosComponent implements OnInit {

  displayedColumns!: string[];
  columnsToDisplay!: string[];
  dataSource!: MatTableDataSource<any>;
  total!: number;
  actividades!: Actividad[];
  accionBoton!: string;
  selectedActividades: any;
  tipoIdenti!: string;
  errorDataSource: boolean = false;
  contador: number = 0;
  infoPlan!: Plan;
  estadoPlan!: string;
  readonlyObs!: boolean;
  readonlyTable: boolean = false;
  mostrarObservaciones: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() dataSourceActividades!: MatTableDataSource<Actividad>;
  @Input() dataTabla!: boolean;
  @Input() plan!: string;
  @Input() rol!: string;
  @Input() versiones!: Plan[];

  @Output() acciones = new EventEmitter<any>();
  constructor(private request: RequestManager, private codigosService: CodigosService) {
  }

  rubros!: any[];

  async ngOnInit() {
    await this.codigosService.cargarIdentificadores();
    this.loadPlan();
    this.loadRubros();
    this.dataSource = new MatTableDataSource();
    this.actividades = this.dataSourceActividades.data;
    this.loadTabla();

  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/${this.plan}`).subscribe((data: DataRequest) => {
      if (data.Data != null) {
        this.infoPlan = data.Data;
        this.getEstado();
      }
    })
  }


  getEstado() {
    this.request
      .get(environment.PLANES_CRUD, `estado-plan/${this.infoPlan.estado_plan_id}`)
      .subscribe((data: DataRequest) => {
        if (data) {
          this.estadoPlan = (data.Data as Tipo).nombre;
          this.displayedColumns = this.visualizarColumnas();
        }
      }, (error) => {
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

  visualizarColumnas(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'ASISTENTE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = false;
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones && !this.readonlyTable) {
          return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades', 'observaciones'];
        } else {
          return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades'];
        }
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Revisión Verificada' || this.estadoPlan == 'Pre Aval') {
        this.readonlyObs = true;
        this.readonlyTable = false;
        return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades', 'observaciones'];
      }
      if (this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades'];
      }
    }

    if (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Revisión Verificada') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'codigo', 'Nombre', 'valor', 'descripcion', 'actividades'];
      }
    }
    return []
  }

  verificarVersiones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match(this.codigosService.getId(TIPO.EstadoPreAval)));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  verificarObservaciones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match(this.codigosService.getId(TIPO.EstadoRevisado)));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  loadRubros() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.rubros = rubros_aux
    Swal.close();
  }

  loadTabla() {
    if (this.dataTabla) {
      this.request.get(environment.PLANEACION_FORMULACION_MID, `formulacion/identificacion/${this.plan}/${this.codigosService.getId(TIPO.IdentificacionRecursos)}`).subscribe((dataG: DataRequest) => {
        if (dataG.Data != null) {
          this.dataSource.data = dataG.Data
        }
      })
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateValue(element: any, rowIndex: number) {
    let val = parseInt(element.valor, 10);
    if (Number.isNaN(val)) {
      let auxVal = element.valor.replace(/\$|,/g, '')
      let aux2 = parseInt(auxVal, 10);
      this.dataSource.data[rowIndex].valor = formatCurrency(aux2, 'en-US', getCurrencySymbol('USD', 'wide'));
    } else {
      this.dataSource.data[rowIndex].valor = formatCurrency(val, 'en-US', getCurrencySymbol('USD', 'wide'));
    }
  }


  getValorTotal() {
    if (this.dataSource.data.length !== 0) {
      let acc = 0;
      for (let i = 0; i < this.dataSource.data.length; i++) {
        let aux = this.dataSource.data[i].valor.toString();
        let strValTotal = aux.replace(/\$|,/g, '');
        acc = acc + parseFloat(strValTotal)
      }
      this.total = acc; if (this.total >> 0.00) {
        return this.total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  addElement() {
    if (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION') {
      this.dataSource.data.unshift({
        codigo: '',
        Nombre: '',
        valor: 0,
        descripcion: '',
        actividades: '',
        observaciones: ''
      });
    } else {
      this.dataSource.data.unshift({
        codigo: '',
        Nombre: '',
        valor: 0,
        descripcion: '',
        actividades: ''
      });
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteElement(index: any) {
    Swal.fire({
      title: 'Eliminar recurso',
      text: `¿Está seguro de eliminar este recurso?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this._deleteElemento(index);
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

  private _deleteElemento(index: any) {
    const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
    if (indices) {
      const data = this.dataSource.data;
      indices.sort((a, b) => b - a);
      for (let i = 0; i < indices.length; i++) {
        data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
      }
      this.dataSource.data = data;
    }
  }

  onChange(event: any) {

  }

  onSelected(event: any, rowIndex: number) {
    if (event == undefined) {
      this.dataSource.data[rowIndex].codigo = '';
    } else {
      let elemento = this.rubros.find(el => el.Nombre === event.value);
      this.dataSource.data[rowIndex].codigo = elemento.Codigo;
    }
  }

  ocultarRecursos() {
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'recursos';
    let data = this.dataSource.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({ data, accion, identi });
  }

  guardarRecursos() {
    this.accionBoton = 'guardar';
    this.tipoIdenti = 'recursos';
    let data = this.dataSource.data;
    this.validarDataSource(data);
    if (this.errorDataSource) {
      Swal.fire({
        title: 'Tiene datos sin completar. Por favor verifique',
        icon: 'error',
        showConfirmButton: false,
        timer: 3500
      })
    } else if (!this.errorDataSource) {
      let accion = this.accionBoton;
      let identi = this.tipoIdenti;
      for (var i in data) {
        var obj = data[i];
        obj["activo"] = true;
        var num = +i + 1;
        obj["index"] = num.toString();
      }
      let dataS = JSON.stringify(Object.assign({}, data))
      this.request.put(environment.PLANEACION_FORMULACION_MID, `formulacion/identificacion`, dataS, `${this.plan}/${this.codigosService.getId(TIPO.IdentificacionRecursos)}`).subscribe((data: DataRequest) => {
        if (data) {
          Swal.fire({
            title: 'Guardado exitoso',
            icon: 'success',
            showConfirmButton: false,
            timer: 3500
          })
          this.acciones.emit({ dataS, accion, identi });
        }
      })
    }
  }

  submit(data: any) {

  }

  validarDataSource(data: any) {
    this.contador = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].codigo == '' || data[i].Nombre == '' || data[i].valor == null || data[i].descripcion == '' || data[i].actividades == ""
        || data[i].actividades == null) {
        this.contador++;
      }
    }
    if (this.contador > 0) {
      this.errorDataSource = true;
    }
    else {
      this.errorDataSource = false;
    }
  }
}
