import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetrolReimbursmentService {
  private readonly baseUrl = `${environment.apiUrl}/api/petrol`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  /** Get current month claims for a user */
  getClaims(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/mypetrolcredits?userId=${userId}`, {
      headers: this.authHeaders()
    });
  }

  /** Bulk upload claims for a user */
  addBulkClaims(userId: string, records: any[]): Observable<any> {
    const payload = { userId, records };
    return this.http.post(`${this.baseUrl}/bulk-upload`, payload, {
      headers: this.authHeaders()
    });
  }
}
