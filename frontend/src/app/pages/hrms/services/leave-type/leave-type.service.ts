import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LeaveTypeApiService {
//   private apiUrl = 'http://localhost:8080/leavetype'; // change
  private readonly apiUrl = `${environment.apiUrl}/api/leave-type`;

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ✅ GET /leavetype/:id => retrievebyUserid
  getLeaveTypesByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`, { headers: this.authHeaders() });
  }

  // ✅ PUT /leavetype/:id => update by LeaveType document id
  updateLeaveType(leaveTypeDocId: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${leaveTypeDocId}`, payload, { headers: this.authHeaders() });
  }

  // ✅ POST create
createLeaveType(payload: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}`, payload, { headers: this.authHeaders() });
}

}
