import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PayloadService {
  // ✅ Base API URL (consistent with backend: /api/payloads)
  private apiUrl = `${environment.apiUrl.replace(/\/+$/, '')}/api/payloads`;

  constructor(private http: HttpClient) { }

  /**
   * ✅ Utility: Attach auth headers (with token from localStorage)
   */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      // Normalize token: remove existing 'Bearer ' prefix, then re-add
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      headers = headers.set('Authorization', `Bearer ${cleanToken}`);
    }

    return headers;
  }

  /**
   * ✅ Create a new Payload (POST)
   */
  createPayload(data: any): Observable<any> {
    const payloadData = {
      ...data // attach logged-in user
    };

    return this.http.post<any>(this.apiUrl, payloadData, {
      headers: this.authHeaders(),
    });
  }


  downloadPayslip(userId: string, year: number, month: number) {
    const url = `${this.apiUrl}/salary-pdf/${userId}/${year}/${month}`;
    return this.http.get(url, {
      headers: this.authHeaders(),
      responseType: 'blob' // ✅ Important for PDF download
    });
  }

  /**
   * ✅ Get all payloads (GET)
   */
  getPayloads(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.authHeaders(),
    });
  }

  /**
   * ✅ Get all payloads for current logged-in user
   */
  getPayloadsByUser(): Observable<any[]> {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      throw new Error('user_id not found in localStorage');
    }

    const url = `${this.apiUrl}?user_id=${encodeURIComponent(userId)}`;
    return this.http.get<any[]>(url, { headers: this.authHeaders() });
  }

  /**
   * ✅ Get payload by User ID (for Admin View)
   */
  getPayloadByUserId(userId: string): Observable<any[]> {
    const url = `${this.apiUrl}?user_id=${encodeURIComponent(userId)}`;
    return this.http.get<any[]>(url, { headers: this.authHeaders() });
  }

  /**
   * ✅ Get a specific payload by ID (GET)
   */
  getPayloadById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  /**
   * ✅ Update existing payload (PUT)
   */
  updatePayload(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, {
      headers: this.authHeaders(),
    });
  }

  /**
   * ✅ Delete payload (DELETE)
   */
  deletePayload(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }
}
