import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormulacionComponent } from './pages/formulacion/formulacion.component';
import { getSingleSpaExtraProviders } from 'single-spa-angular';

const routes: Routes = [
  { path: '', component: FormulacionComponent },
  {
    path: ':dependencia_id/:nombre/:vigencia_id',
    component: FormulacionComponent,
  },
  {
    path: ':dependencia_id/:nombre/:vigencia_id/:version',
    component: FormulacionComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/formulacion/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch())]
})
export class AppRoutingModule { }
