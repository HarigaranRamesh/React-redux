import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.prod';

type RoleOption = { _id: string; role: string };
type Submenu = { submenuName: string };
type Menu = { menuName: string; children: Submenu[] };

@Injectable({
  providedIn: 'root'
})
export class AccessdefineService {
  private accessBase = `${environment.apiUrl}/api/access`;
  private stdMenuBase = `${environment.apiUrl}/api/standardmenu`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  /** Load all roles */
  getRoles(): Observable<RoleOption[]> {
    return this.http.get<RoleOption[]>(this.accessBase, {
      headers: this.authHeaders()
    });
  }

  /** Load current main menus for a role */
  getRoleMain(roleId: string): Observable<{ role: string; main: Menu[] }> {
    const params = new HttpParams().set('roleId', roleId);
    return this.http.get<{ role: string; main: Menu[] }>(`${this.accessBase}/main`, {
      params,
      headers: this.authHeaders()
    });
  }

  /** Load standard menu for a given role (Admin/Employee/Intern) */
  getStandardMenu(role: string): Observable<{ role: string; main: Menu[] }> {
    const params = new HttpParams().set('role', role);
    return this.http.get<{ role: string; main: Menu[] }>(this.stdMenuBase, {
      params,
      headers: this.authHeaders()
    });
  }

  /** Save main menus for a role */
  saveRoleMain(roleId: string, main: Menu[]): Observable<any> {
    const body = { roleId, main };
    return this.http.post(`${this.accessBase}/main`, body, {
      headers: this.authHeaders()
    });
  }
}
