import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export type OccurrenceResponse = { dates?: string[]; items?: Array<{ date: string; name?: string }> };
export type HolidayCheck = { isHoliday: boolean; name?: string };

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // ---------- Leave ----------
  submitLeave(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/leave`, payload, { headers: this.authHeaders() });
  }

  // ---------- Holidays ----------
  getMonthHolidays(year: number, month: number): Observable<OccurrenceResponse> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<OccurrenceResponse>(`${this.baseUrl}/holidays/occurrences`, {
      headers: this.authHeaders(),
      params
    });
  }

  checkHoliday(date: string): Observable<HolidayCheck> {
    const params = new HttpParams().set('date', date);
    return this.http.get<HolidayCheck>(`${this.baseUrl}/holidays/is-holiday`, {
      headers: this.authHeaders(),
      params
    });
  }
}
