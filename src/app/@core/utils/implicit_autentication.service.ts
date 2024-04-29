import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserSubscriber } from "../models/usuario";

@Injectable({
  providedIn: "root",
})
export class ImplicitAutenticationService {
  logoutUrl: any;
  params: any;
  payload: any;
  timeActiveAlert: number = 4000;
  isLogin = false;

  private userSubject = new BehaviorSubject({} as UserSubscriber);
  public user$ = this.userSubject.asObservable();

  private menuSubject = new BehaviorSubject({});
  public menu$ = this.menuSubject.asObservable();

  constructor() {
    const user = localStorage.getItem("user")!;
    this.userSubject.next(JSON.parse(atob(user)));
  }

  public getRoles() {
    return new Promise<string[]>((resolve) => {
      this.user$.subscribe(({ user, userService }) => {
        const roleUser = typeof user.role !== "undefined" ? user.role : [];
        const roleUserService =
          typeof userService.role !== "undefined" ? userService.role : [];
        const roles = roleUser
          .concat(roleUserService)
          .filter((data) => data.indexOf("/") === -1);
        resolve(roles);
      });
    });
  }

  public getDocumento() {
    return new Promise<string>((resolve) => {
      this.user$.subscribe(({ userService }) => {
        resolve(userService.documento);
      });
    });
  }
}
