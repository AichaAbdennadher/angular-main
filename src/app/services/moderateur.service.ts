import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModerateurService {

  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── MODÉRATEURS ────────────────────────────────────────────────────────────

  /** GET /api/moderateurs */
  getAll(): Observable<{ count: number; moderateurs: any[] }> {
    return this.http.get<{ count: number; moderateurs: any[] }>(`${this.base}/moderateurs`);
  }

  /** POST /api/users */
  create(data: any): Observable<any> {
    return this.http.post(`${this.base}/users`, data);
  }

  /** PUT /api/users/{id} */
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/users/${id}`, data);
  }

  /** DELETE /api/users/{id} */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/users/${id}`);
  }

  // ─── SUSPENSIONS ────────────────────────────────────────────────────────────

  /** GET /api/suspensions */
  getSuspensions(): Observable<{ count: number; suspensions: any[] }> {
    return this.http.get<{ count: number; suspensions: any[] }>(`${this.base}/suspensions`);
  }

  /**
   * POST /api/suspensions
   * Crée une suspension + met à jour le statut + envoie une notification auto (via SuspensionController)
   */
  suspend(userId: number, reason: string): Observable<any> {
    return this.http.post(`${this.base}/suspensions`, { user_id: userId, reason });
  }

  /**
   * DELETE /api/suspensions/{id}
   * Lève la suspension et réactive l'utilisateur
   */
  unsuspend(suspensionId: number): Observable<any> {
    return this.http.delete(`${this.base}/suspensions/${suspensionId}`);
  }

  /**
   * PUT /api/users/{id}/suspend — fallback simple (toggle statut sans enregistrement)
   */
  toggleStatusFallback(userId: number): Observable<any> {
    return this.http.put(`${this.base}/users/${userId}/suspend`, {});
  }
}
