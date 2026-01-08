import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl = `${environment.apiUrl}/api/user`;

  constructor(private http: HttpClient) { }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // -------- Users CRUD --------
  getUsers(page: number, limit: number, filterField?: string, searchText?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filterField && searchText) {
      params = params.set(filterField, searchText);
    }
    return this.http.get<any>(this.apiUrl, { params, headers: this.authHeaders() });
  }

   // ✅ for autocomplete (search by name/email/mobile)
  searchUsers(query: string, page = 1, limit = 10): Observable<any> {
    // Adjust filterField based on your backend
    // Example: search by user_name
    return this.getUsers(page, limit, 'user_name', query);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders()
    });
  }


  createUser(data: any, currentUser: string): Observable<any> {
    if (currentUser === '6884d238fbb2351b8786d26f') {
      return this.http.post(`${this.apiUrl}/superad`, data, { headers: this.authHeaders() });
    } else {
      return this.http.post(this.apiUrl, data, { headers: this.authHeaders() });
    }
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.authHeaders() });
  }

  // -------- Admin Dashboard --------
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/dashboard/stats`, { headers: this.authHeaders() });
  }

  // -------- Profile --------
  getProfile(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  getLeaveTiles(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/leave-type/${id}`, { headers: this.authHeaders() });
  }

  getPetrolBalance(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/petrol/totalApproved/${id}`, { headers: this.authHeaders() });
  }

  // -------- Attendance --------
  getAttendanceSummary(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/attendance/summary/${id}`, { headers: this.authHeaders() });
  }

  checkAttendance(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/attendance/present/check`, { headers: this.authHeaders() });
  }

  loginAttendance(payload: { lat: number; lon: number }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/attendance/present/login`, payload, { headers: this.authHeaders() });
  }

  logoutAttendance(payload: { lat: number; lon: number }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/attendance/present/logout`, payload, { headers: this.authHeaders() });
  }

  // -------- Password --------
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/user/change-password`,
      { currentPassword, newPassword },
      { headers: this.authHeaders() }
    );
  }

  uploadUserDocs(fd: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-docs/upload`, fd);
  }



  // 🔹 Get all deleted users
  getDeletedUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/deleted-users`, {
      headers: this.authHeaders()
    });
  }


  deleteUser(id: string, deletedBy: string, reason: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders(),
      body: { deletedBy, reason }
    });
  }


  // 🔹 Get uploaded documents by userId
  getUserDocsByUserId(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/user/upload-docs/userId/${userId}`, {
      headers: this.authHeaders()
    });
  }


  // 🔹 Restore user by ID
  restoreUser(deletedUserId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/user/restore/${deletedUserId}`,
      {}, // empty body
      { headers: this.authHeaders() }
    );
  }

}
