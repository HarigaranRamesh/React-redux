import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DailyAttendanceService {
  private readonly apiUrl = `${environment.apiUrl}/api/userattendancereport`;

  constructor(private http: HttpClient) {}

  // Daily Live Report
  getDayReport(date: string, page: number, limit: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/day/${date}`, { params });
  }

  // Append Daily Snapshot (create if missing)
  appendDayReport(date: string, page: number, limit: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.post<any>(`${this.apiUrl}/generate/day/${date}`, {}, { params });
  }

  // Persisted Monthly Report
  getPersistedMonthlyReport(year: number, month: number, page: number, limit: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/persisted/month/${year}/${month}`, { params });
  }

  // Approve/reject attendance
  approveAttendance(reportId: string, approved: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${reportId}`, {
      approved,
      changedRemarks: approved ? 'Approved by manager' : 'Rejected by manager'
    });
  }

  overridePresent(reportId: string, remarks: string) {
  return this.http.put<any>(
    `${this.apiUrl}/override/present/${reportId}`,
    { remarks }
  );
}

}
