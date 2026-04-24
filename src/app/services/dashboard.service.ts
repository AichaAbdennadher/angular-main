import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActivityData {
  name: string;
  posts: number;
  users: number;
}

export interface DashboardStats {
  users: number;
  categories: number;
  posts: number;
  moderateurs: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  constructor(private http: HttpClient) {}



  /**
   * GET /api/stats/dashboard-full — Toutes les données du dashboard consolidées
   */
  getDashboardFull(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/stats/dashboard-full`);
  }

  /**
   * GET /api/moderateurs — Liste des modérateurs
   */
  getModerateurs(): Observable<{count: number, moderateurs: any[]}> {
    return this.http.get<{count: number, moderateurs: any[]}>(`${environment.apiUrl}/moderateurs`);
  }

  addModerateur(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users`, data);
  }

  updateModerateur(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${id}`, data);
  }

  deleteModerateur(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${id}/suspend`, {});
  }
}
