import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormulacionComponent } from './components/formulacion/formulacion.component';
import { TablaResumenComponent } from './components/formulacion/tabla-resumen/tabla-resumen.component';
import { ArbolComponent } from './components/arbol/arbol.component';

import { MatTableModule } from '@angular/material/table'
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { DocentesComponent } from './components/formulacion/docentes/docentes.component';
import { RecursosComponent } from './components/formulacion/recursos/recursos.component';
import { ContratistasComponent } from './components/formulacion/contratistas/contratistas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    DocentesComponent,
    RecursosComponent,
    ContratistasComponent,
    FormulacionComponent,
    TablaResumenComponent,
    ArbolComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatRadioModule,
    MatListModule,
    MatButtonModule,
    MatDatepickerModule,
    MatStepperModule,
    MatGridListModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDialogModule,
    MatSortModule,
    MatCardModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
