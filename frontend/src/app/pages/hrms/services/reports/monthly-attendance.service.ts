import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonthlyAttendanceService {
  private readonly apiUrl = `${environment.apiUrl}/api/userattendancereport`; // adjust base URL

  constructor(private http: HttpClient) {}

  // Monthly summary for all users
  getMonthlySummary(year: number, month: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/month/${year}/${month}`);
  }

  // Monthly detailed report for one user
  getMonthlyForUser(userId: string, year: number, month: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/${year}/${month}`);
  }
}
