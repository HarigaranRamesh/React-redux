import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export type Policy = {
  _id?: string;
  role: string;
  label:
    | 'Sick Leave'
    | 'Casual Leave'
    | 'Planned Leave'
    | 'Maternity Leave'
    | 'Paternity Leave'
    | 'Compoff Leave';
  amount: number; // days
  accrualType: 'monthly' | 'annual' | 'fixed';
};

@Injectable({
  providedIn: 'root'
})
export class LeavePoliciesService {
  private readonly basePolicyUrl = `${environment.apiUrl}/api/leave-policies`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // --- Roles ---
  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.basePolicyUrl}/roles`, { headers: this.authHeaders() });
  }

  // --- Policies by role ---
  getPolicies(role: string): Observable<Policy[]> {
    const params = new HttpParams().set('role', role);
    return this.http.get<Policy[]>(this.basePolicyUrl, { params, headers: this.authHeaders() });
  }

  // --- Create ---
  createPolicy(body: Policy): Observable<{ data: Policy }> {
    return this.http.post<{ data: Policy }>(this.basePolicyUrl, body, { headers: this.authHeaders() });
  }

  // --- Update ---
  updatePolicy(id: string, body: Partial<Policy>): Observable<{ data: Policy }> {
    return this.http.put<{ data: Policy }>(`${this.basePolicyUrl}/${id}`, body, { headers: this.authHeaders() });
  }

  // --- Delete ---
  deletePolicy(id: string): Observable<any> {
    return this.http.delete(`${this.basePolicyUrl}/${id}`, { headers: this.authHeaders() });
  }
}
