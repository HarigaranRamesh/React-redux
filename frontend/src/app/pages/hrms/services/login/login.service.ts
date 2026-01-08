import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  username: string = '';
  password: string = '';

  private apiUrls = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  loginUser(username: string, password: string): Observable<any> {
    const payload = {
      mobileNo: username,
      password: password
    };
    return this.http.post(`${this.apiUrls}/login`, payload);
  }

  saveToken(token: string) {
    localStorage.setItem('authToken', token);

    // Decode and extract role and id
    const decoded = this.decodeToken(token);
    if (decoded) {
      localStorage.setItem('user_name',decoded.user_name);
      localStorage.setItem('position',decoded.position);
      localStorage.setItem('userRole', decoded.roleName);
      localStorage.setItem('userId', decoded.id);
      localStorage.setItem('userAccess', JSON.stringify(decoded.access))// or decoded._id depending on backend
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }

  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (e) {
      console.error('Token decoding failed:', e);
      return null;
    }
  }
}
