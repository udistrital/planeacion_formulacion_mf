import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})

export class VerificarFormulario {
  getCookie(name: string): string | undefined {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');

    if (parts.length == 2) {
      return parts.pop()?.split(';').shift();
    }
    return undefined
  }

  deleteCookie(name: string) {
    const date = new Date();
    // Set the expiration date in the past
    date.setTime(date.getTime() - 1);
    document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
  }
}
