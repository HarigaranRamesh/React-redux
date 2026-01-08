import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export type FeedListResponse = {
  status: boolean;
  items: any[];
  meta: { skip: number; limit: number; total: number; hasMore: boolean; nextSkip: number };
};

@Injectable({ providedIn: 'root' })
export class FeedService {
  // change this to your env.apiBaseUrl
    private readonly baseUrl = `${environment.apiUrl}/api/feed`;

  constructor(private http: HttpClient) {}

  list(skip = 0, limit = 10): Observable<FeedListResponse> {
    const params = new HttpParams()
      .set('skip', String(skip))
      .set('limit', String(limit));
    return this.http.get<FeedListResponse>(this.baseUrl, { params });
  }

  create(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl, formData);
  }

    delete(postId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${postId}`);
  }
}
