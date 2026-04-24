import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Categorie {
  id: number;
  titre: string;
  description?: string;
  icon?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryFilterService {

  private selectedCategoryIdSubject = new BehaviorSubject<number | null>(null);
  categoryId$ = this.selectedCategoryIdSubject.asObservable();

  private selectedCategorySubject = new BehaviorSubject<Categorie | null>(null);
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${environment.apiUrl}/categories`);
  }

  setCategory(id: number | null): void {
    this.selectedCategoryIdSubject.next(id);
  }

  setSelectedCategory(category: Categorie | null): void {
    this.selectedCategorySubject.next(category);
  }

  getSelectedCategory(): Categorie | null {
    return this.selectedCategorySubject.value;
  }

  addCategorie(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${environment.apiUrl}/categories`, categorie);
  }

  updateCategorie(id: number, categorie: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${environment.apiUrl}/categories/${id}`, categorie);
  }

  deleteCategorie(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/categories/${id}`);
  }
}