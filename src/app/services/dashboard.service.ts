import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  users: number;
  categories: number;
  posts: number;
  moderateurs: number;
}

export interface ActivityData {
  name: string;
  posts: number;
  users: number;
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
}
