import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<any>(null);
  user = signal<any>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);
    if (token) this.fetchProfile(token);
  }

register(data: any): Observable<any> {
  return this.http.post(`${environment.apiUrl}/register`, data)
    .pipe(tap((res: any) => this.saveToken(res.token))); // assure-toi que res.token existe
}

login(data: any): Observable<any> {
  return this.http.post(`${environment.apiUrl}/login`, data)
    .pipe(tap((res: any) => this.saveToken(res.token))); // assure-toi que res.token existe
}

 private saveToken(token: string) {
  localStorage.setItem(this.tokenKey, token);
  this.fetchProfile(token); // 🔥 important
}

  private fetchProfile(token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`${environment.apiUrl}/profile`, { headers })
      .subscribe(user => {
        this.userSubject.next(user);
        this.user.set(user);
      });
  }

logout() {
  localStorage.removeItem(this.tokenKey);
  this.userSubject.next(null);
  this.user.set(null);
  window.location.href = '/login'; // redirection
}

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/profile`, data)
      .pipe(tap((res: any) => {
        if (res.user) {
          this.user.set(res.user);
          this.userSubject.next(res.user);
        }
      }));
  }

  get user$() { return this.userSubject.asObservable(); }
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  isLoggedIn(): boolean { return !!this.getToken(); }
}