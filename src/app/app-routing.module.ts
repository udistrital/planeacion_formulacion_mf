import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormulacionComponent } from './components/formulacion/formulacion.component';
import { getSingleSpaExtraProviders } from 'single-spa-angular';

const routes: Routes = [{ path: '', component: FormulacionComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // providers: [{ provide: APP_BASE_HREF, useValue: '/datos/' }],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/formulacion/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch())]
})
export class AppRoutingModule { }
