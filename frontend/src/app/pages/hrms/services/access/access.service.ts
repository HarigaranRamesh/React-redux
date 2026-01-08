import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.prod';

type BackendNode = {
  label: string;
  data: {
    userId: string;
    roleId: string;
    name: string;
    rolename: string;
    access: string[];
    photo?: string;
  };
  expanded?: boolean;
  children?: BackendNode[];
  draggable?: boolean;
  droppable?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private apiUrl = `${environment.apiUrl}/api/access`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** Load org hierarchy */
  getHierarchy(viewerId?: string): Observable<{ orgData: BackendNode[]; treeData: BackendNode[] }> {
    const url = viewerId ? `${this.apiUrl}/hierarchy?viewerId=${viewerId}` : `${this.apiUrl}/hierarchy`;
    return this.http.get<{ orgData: BackendNode[]; treeData: BackendNode[] }>(url, { headers: this.authHeaders() });
  }

  /** Assign an Employee to a Role */
  assignMember(userId: string, parentRoleId: string): Observable<any> {
    const body = { userId, parentRoleId };
    return this.http.post(`${this.apiUrl}/assignMember`, body, { headers: this.authHeaders() });
  }

  /** Update role hierarchy */
  updateRoleAccess(roleId: string, newParentRoleId: string): Observable<any> {
    const body = { roleId, newParentRoleId };
    return this.http.post(`${this.apiUrl}/updateRoleAccess`, body, { headers: this.authHeaders() });
  }

  /** Get all roles */
  getRoles(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.authHeaders() });
  }

  /** Get leave policies mapped to roles */
  getLeavePoliciesByRolesStrings(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/api/leave-policies/roles`, { headers: this.authHeaders() });
  }
}
