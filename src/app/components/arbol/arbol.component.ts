import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs'
import { MatSort } from '@angular/material/sort';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { RequestManager } from 'src/app/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

interface Subgrupo {
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  children?: Subgrupo[];
}

// Objeto fila

interface Nodo {
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
}

const Checked: string = 'done';
const Unchecked: string = 'compare_arrows';
const No_Aplica: string = "no aplica"

@Component({
  selector: 'app-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.scss'],
})
export class ArbolComponent implements OnInit {

  selectedFiles: any;
  dataRow: any;
  formConstruirPUI!: FormGroup;
  displayedColumns: string[] = ['nombre', 'descripcion', 'activo', 'actions'];
  displayedColumnsView: string[] = ['nombre', 'descripcion', 'activo'];
  mostrar: boolean = false;
  planActual: string = "";
  icon: string = "";
  idIcon: string = "";
  rol: string = "";

  private transformer = (node: Subgrupo, level: number) => {
    if (this.armonizacionPED || this.armonizacionPI) {
      return {
        expandable: !!node.children && node.children.length > 0,
        activo: node.activo,
        nombre: node.nombre,
        descripcion: node.descripcion,
        id: node.id,
        level: level,
        icon: this.iconArmonizacion(node.id)
      };
    } else {
      return {
        expandable: !!node.children && node.children.length > 0,
        activo: node.activo,
        nombre: node.nombre,
        descripcion: node.descripcion,
        id: node.id,
        level: level,
      };
    }

  };

  treeControl = new FlatTreeControl<Nodo>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() tipoPlanId: string = "";
  @Input() idPlan: string = "";
  @Input() consulta: boolean = false;
  @Input() armonizacionPED: boolean = false;
  @Input() armonizacionPI: boolean = false;
  @Input() dataArmonizacion: any[] = [];
  @Input() estado: string = "";
  @Input() updateSignal!: Observable<String[]>;
  @Output() grupo = new EventEmitter<any>();
  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService

  ) {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x: any) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find((x: any) => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  ngOnChanges(changes: any) {
    if (this.tipoPlanId !== '611af8464a34b3599e3799a2') {
      if (this.idPlan !== this.planActual) {
        this.loadArbolMid();
        this.planActual = this.idPlan;
      }
    }
    if (changes['updateSignal'] && this.updateSignal) {
      this.updateSignal.subscribe(() => {
        this.loadArbolMid();
      });
    }
  }

  loadArbolMid() {
    this.mostrar = false;
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `arbol/` + this.idPlan).subscribe((data: any) => {
      Swal.close();
      if (data.Data !== null) {
        this.mostrar = true;
        this.dataSource.data = data.Data;
        if (this.armonizacionPED || this.armonizacionPI) {
          this.linksArbol()
          this.expandNodes()
        }
      } else {
        this.dataSource.data = [];
      }
    }, (error) => {
      this.dataSource.data = [];
      Swal.fire({
        title: 'Error en la operación',
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  linksArbol() {
    let deepLevelIxd: number[] = [-1, -1, -1];
    let pastdeepLevelIxd: number[] = deepLevelIxd;
    this.treeControl.dataNodes.forEach((element, i) => {
      element.idx = i;
      deepLevelIxd[element.level] = i;
      element.padre_idx = pastdeepLevelIxd[element.level - 1];
      pastdeepLevelIxd = deepLevelIxd;
    })
    this.treeControl.dataNodes.forEach((elementp, i) => {
      const idsHijos = this.treeControl.dataNodes.filter(elementh => elementh.padre_idx == i).map((e) => { return e.idx });
      elementp.hijos_idx = idsHijos;
    })
  }

  selectFile(event: any) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length == 0) {
      return this.selectedFiles = false;
    }
    return
  }


  editar(fila: any, bandera: any) {
    this.grupo.emit({ fila, bandera })
  }

  agregar(fila: any, bandera: any) {
    this.grupo.emit({ fila, bandera })
  }

  async armonizar(fila: any, bandera: any) {
    let planIs: string = "";
    if (this.armonizacionPED) {
      await this.changeIcon(fila)
      planIs = "PED";
    } else if (this.armonizacionPI) {
      await this.changeIcon(fila)
      planIs = "PI";
    }
    const idsArmo = this.treeControl.dataNodes.filter(elements => elements.icon == Checked).map(element => { return element.id })
    this.grupo.emit({ fila, bandera, plan: planIs, armonizacionIds: idsArmo })
  }

  iconArmonizacion(id: any): string {
    if (this.dataArmonizacion.length != 0) {
      const found = this.dataArmonizacion.find(element => element === id);
      if (id === found) {
        return Checked
      } else {
        return Unchecked
      }
    } else {
      return Unchecked
    }
  }

  async changeIcon(fila: Nodo) {
    if (fila.icon == Unchecked) {
      if (fila.activo != "inactivo") {
        const accion = new Promise<number>(resolve => {
          if (fila.nombre.toLowerCase().includes(No_Aplica)) {
            Swal.fire({
              title: `Ha elegido: ` + fila.nombre,
              text: `Si hay más opciones seleccionadas para el nivel actual se quitarán ¿Desea continuar?`,
              icon: 'warning',
              confirmButtonText: `Sí`,
              cancelButtonText: `No`,
              showCancelButton: true
            }).then((result) => {
              if (result.isConfirmed) {
                resolve(1); // confirma dejar no aplica, quitar resto del nivel
              } else {
                resolve(0); // No confirma dejar no aplica, aquí no se hace nada
              }
            })
          } else {
            resolve(-1); // es un caso normal, no es No aplica
          }
        });
        const response = await accion;
        const uncheckNoAplicaOnly = (response != 1);
        if (response != 0) {
          if (fila.padre_idx != undefined) {
            this.uncheckHijos(this.treeControl.dataNodes[fila.padre_idx].hijos_idx as number[], uncheckNoAplicaOnly);
          } else {
            this.treeControl.dataNodes.filter(ef => ef.padre_idx == undefined).forEach(e => {
              if (uncheckNoAplicaOnly) {
                if (e.nombre.toLowerCase().includes(No_Aplica)) {
                  e.icon = Unchecked;
                }
              } else {
                e.icon = Unchecked;
                this.uncheckHijos(e.hijos_idx as number[]);
              }
            })
          }
          fila.icon = Checked;
          this.checkPadres(fila.padre_idx!);
          const idxs = this.treeControl.dataNodes.filter(ef => ef.level == 0).map(e => { return e.idx });
          this.unCheckNoAplicaHijosIfMulti(idxs as number[]);
        }
      }
    } else {
      fila.icon = Unchecked;
      this.uncheckHijos(fila.hijos_idx as number[]);
      this.uncheckPadres(fila.padre_idx!);
    }
  }

  checkPadres(idPadre: number) {
    let listPadres: number[] = [];
    while (idPadre != undefined) {
      listPadres.push(idPadre);
      this.treeControl.dataNodes[idPadre].icon = Checked;
      idPadre = this.treeControl.dataNodes[idPadre].padre_idx!;
    }
  }

  uncheckHijos(idHijos: number[], justForNoAplica?: boolean) {
    justForNoAplica = justForNoAplica || false;
    idHijos.forEach(id => {
      if (!justForNoAplica) {
        this.treeControl.dataNodes[id].icon = Unchecked;
      } else if (this.treeControl.dataNodes[id].nombre.toLowerCase().includes(No_Aplica)) {
        this.treeControl.dataNodes[id].icon = Unchecked;
      }
      this.uncheckHijos(this.treeControl.dataNodes[id].hijos_idx as number[], justForNoAplica);
    })
  }

  uncheckPadres(idPadre: number) {
    let thereIsMoreChecked = this.isAnotherChecked(this.treeControl.dataNodes[idPadre]?.hijos_idx as number[]);
    while (idPadre != undefined && !thereIsMoreChecked) {
      this.treeControl.dataNodes[idPadre].icon = Unchecked;
      idPadre = this.treeControl.dataNodes[idPadre].padre_idx!;
      thereIsMoreChecked = this.isAnotherChecked(this.treeControl.dataNodes[idPadre]?.hijos_idx as number[]);
    }
  }

  isAnotherChecked(idxs: number[]): boolean {
    let checked: boolean = false;
    if (idxs != undefined) {
      for (let i = 0; i < idxs.length; i++) {
        if (this.treeControl.dataNodes[idxs[i]].icon == Checked) {
          checked = true;
          break;
        }
      }
    }
    return checked;
  }

  unCheckNoAplicaHijosIfMulti(idxs: number[]) {
    let count: number = 0;
    let idNoAplica: any = undefined;
    for (let i = 0; i < idxs.length; i++) {
      if (this.treeControl.dataNodes[idxs[i]].icon == Checked) {
        this.unCheckNoAplicaHijosIfMulti(this.treeControl.dataNodes[idxs[i]].hijos_idx as number[]);
        count++;
        if (this.treeControl.dataNodes[idxs[i]].nombre.toLowerCase().includes(No_Aplica)) {
          idNoAplica = idxs[i];
        }
      }
    }
    if ((count > 1) && (idNoAplica != undefined)) {
      this.treeControl.dataNodes[idNoAplica].icon = Unchecked;
    }
  }

  expandNodes() {
    for (let nodo of this.dataArmonizacion) {
      let found = this.treeControl.dataNodes.find(element => element.id == nodo)!;
      let index = this.treeControl.dataNodes.indexOf(found);
      let level = found.level;

      for (let i = index; level >= 0; i--) {
        const element = this.treeControl.dataNodes[i];
        if (element.level == level) {
          this.treeControl.expand(element);
          level--;
        }
      }
    }
  }

  hasChild = (_: number, node: Nodo) => node.expandable;

  ngOnInit(): void {
    this.formConstruirPUI = this.formBuilder.group({
      infoControl: ['', Validators.required],
      requiredfile: ['', Validators.required]
    });
    this.planActual = '';
  }
}
