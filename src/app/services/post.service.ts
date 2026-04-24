import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) { }

  getPosts(userId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('user_id', userId.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleLock(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/toggle-lock`, {});
  }

  toggleHide(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/toggle-hide`, {});
  }
}
