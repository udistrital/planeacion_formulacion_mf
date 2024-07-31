import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataRequest } from 'src/app/@core/models/dataRequest';
import { ResumenPlan } from 'src/app/@core/models/plan';
import { RequestManager } from 'src/app/@core/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tabla-resumen',
  templateUrl: './tabla-resumen.component.html',
  styleUrls: ['./tabla-resumen.component.scss'],
})
export class TablaResumenComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'version',
    'estado',
    'acciones',
  ];
  informacionTabla!: MatTableDataSource<ResumenPlan>;
  inputsFiltros!: NodeListOf<HTMLInputElement>;
  planes!: ResumenPlan[];

  @Output() mostrarPlan: EventEmitter<ResumenPlan> =
    new EventEmitter<ResumenPlan>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private request: RequestManager) { }

  async ngOnInit() {
    await this.cargarPlanes();
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre?.toLowerCase(),
        plan.vigencia?.toString(),
        plan.nombre.toLowerCase(),
        plan.version?.toString(),
        plan.estado?.toLowerCase(),
      ];
      this.inputsFiltros.forEach((input, posicion) => {
        if (valoresAComparar[posicion]?.includes(input.value.toLowerCase())) {
          filtrosPasados++;
        }
      });
      return filtrosPasados === valoresAComparar.length;
    };
    this.informacionTabla.paginator = this.paginator;
  }

  ngAfterViewInit(): void {
    this.inputsFiltros = document.querySelectorAll('th input');
  }

  aplicarFiltro(event: Event): void {
    let filtro: string = (event.target as HTMLInputElement).value;

    if (filtro === '') {
      this.inputsFiltros.forEach((input) => {
        if (input.value !== '') {
          filtro = input.value;
          return;
        }
      });
    }
    // Se debe poner algún valor que no sea vacio  para que se accione el filtro la tabla
    this.informacionTabla.filter = filtro.trim().toLowerCase();
  }

  async cargarPlanes() {
    Swal.fire({
      title: 'Cargando planes en formulación',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    return await new Promise<ResumenPlan[]>((resolve, reject) => {
      this.request
        .get(environment.PLANEACION_FORMULACION_MID, `formulacion/planes_formulacion`)
        .subscribe(
          (data: DataRequest) => {
            if ((data.Data as ResumenPlan[]).length != 0) {
              Swal.close();
            } else {
              Swal.close();
              Swal.fire({
                title: 'No existen registros',
                icon: 'info',
                text: 'No hay planes en formulación',
                showConfirmButton: false,
                timer: 2500,
              });
            }
            resolve(data.Data as ResumenPlan[]);
          },
          (error) => {
            Swal.close();
            this.planes = [];
            console.error(error);
            Swal.fire({
              title: 'Error al intentar obtener los últimos planes',
              icon: 'error',
              text: 'Ingresa más tarde',
              showConfirmButton: false,
              timer: 2500,
            });
            reject();
          }
        );
    }).then((planes) => {
      this.planes = planes;
    });
  }

  consultar(plan: ResumenPlan): void {
    this.mostrarPlan.emit(plan);
  }
}
