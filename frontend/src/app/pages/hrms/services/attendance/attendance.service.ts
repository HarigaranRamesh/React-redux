import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiUrl = `${environment.apiUrl}/api/attendance`;
  private readonly holidaysUrl = `${environment.apiUrl}/api/holidays`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // ---------- Leave ----------
  applyLeave(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leaverequest`, payload, { headers: this.authHeaders() });
  }

  getLeaveRequests(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/${userId}`, { headers: this.authHeaders() });
  }

  // ---------- Holidays ----------
  getMonthHolidays(year: number, month: number): Observable<any> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<any>(`${this.holidaysUrl}/occurrences`, { headers: this.authHeaders(), params });
  }

  checkHoliday(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    return this.http.get<any>(`${this.holidaysUrl}/is-holiday`, { headers: this.authHeaders(), params });
  }

  // ---------- Reports ----------
  getDailyReport(page: number, limit: number, searchText?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (searchText) params = params.set('attendanceType', searchText);
    return this.http.get<any>(`${this.apiUrl}/dailyReports`, { params, headers: this.authHeaders() });
  }

  getMonthlyReport(page: number, limit: number, searchText?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (searchText) params = params.set('attendanceType', searchText);
    return this.http.get<any>(`${this.apiUrl}/monthlyReports`, { params, headers: this.authHeaders() });
  }

  getPendingAttendance(page: number, limit: number, searchText?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (searchText) params = params.set('attendanceType', searchText);
    return this.http.get<any>(`${this.apiUrl}/pendinglist`, { params, headers: this.authHeaders() });
  }

  approveAttendance(id: string, approved: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/approval/${id}`, { approved }, { headers: this.authHeaders() });
  }

  // ---------- My Attendance ----------
  getMyAttendance(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/allmyattendance`, { headers: this.authHeaders() });
  }

  getMonthlyPivot(year: number, month: number): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/api/userattendancereport/pivot/month/${year}/${month}`, {
    headers: this.authHeaders()
  });
}

}
