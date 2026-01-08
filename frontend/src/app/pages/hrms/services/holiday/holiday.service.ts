import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export type HolidayRule = {
  id?: string;
  _id?: string;
  name: string;
  color?: string;
  isEnabled: boolean;
  isGovernment?: boolean;
  date?: string;  // YYYY-MM-DD
  recurrence?: {
    kind: 'nth-weekday-monthly' | 'weekly' | 'annual-fixed';
    nths?: number[];
    weekdays?: number[];
    months?: number[];
    startDate?: string;
    endDate?: string;
  };
};

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private readonly baseUrl = `${environment.apiUrl}/api/holidays`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // ===== Rules =====
  getRules(): Observable<HolidayRule[]> {
    return this.http.get<HolidayRule[]>(`${this.baseUrl}/rules`, { headers: this.authHeaders() });
  }

  createRule(rule: HolidayRule): Observable<HolidayRule> {
    return this.http.post<HolidayRule>(`${this.baseUrl}/rules`, rule, { headers: this.authHeaders() });
  }

  createRulesBulk(rules: HolidayRule[]): Observable<{ inserted: number; items: HolidayRule[] }> {
    return this.http.post<{ inserted: number; items: HolidayRule[] }>(
      `${this.baseUrl}/rules/bulk`,
      { rules },
      { headers: this.authHeaders() }
    );
  }

  deleteRule(ruleId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rules/${ruleId}`, { headers: this.authHeaders() });
  }

  setEnabled(ruleId: string, enabled: boolean): Observable<HolidayRule> {
    return this.http.patch<HolidayRule>(
      `${this.baseUrl}/rules/${ruleId}/enabled`,
      { isEnabled: enabled },
      { headers: this.authHeaders() }
    );
  }

  // ===== Bulk Import =====
  importBulkFile(file: File): Observable<{ inserted: number; items: HolidayRule[] }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ inserted: number; items: HolidayRule[] }>(
      `${this.baseUrl}/import-bulk`,
      fd,
      { headers: this.authHeaders() }
    );
  }
}
