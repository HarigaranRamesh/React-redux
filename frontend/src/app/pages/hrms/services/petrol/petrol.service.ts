import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetrolService {
  private readonly baseUrl = `${environment.apiUrl}/api/petrol`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // -------- Bulk + Single (inline) --------
  getBulkPetrolCredits(page: number, limit: number, search: string): Observable<any> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit))
      .set('search', search || '');
    return this.http.get(`${this.baseUrl}/all/listforpetrolBulkApproval`, {
      headers: this.authHeaders(),
      params
    });
  }

  approveClaim(claimId: string, payload: { approveBy: string; remarks: string; approved: boolean }): Observable<any> {
    return this.http.put(`${this.baseUrl}/approve/${claimId}`, payload, {
      headers: this.authHeaders()
    });
  }

  approveAllClaims(userId: string, payload: { approveBy: string; remarks: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulkApprove`, { userId, ...payload }, {
      headers: this.authHeaders()
    });
  }
}
