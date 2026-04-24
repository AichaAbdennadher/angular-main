import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CategoryFilterService } from '../../services/category-filter.service';

export interface Categorie {
  id: number;
  titre: string;
  description?: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-category-bar',
  templateUrl: './CategoryBarComponent.html',
  styleUrls: ['./CategoryBarComponent.css']
})
export class CategoryBarComponent implements OnInit {

  categories: Categorie[] = [];
  selectedCategoryId: number | null = null;

  @Output() categorySelected = new EventEmitter<number | null>();

  constructor(private categoryService: CategoryFilterService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res: Categorie[]) => {
        this.categories = res || [];
        console.log('CATEGORIES =>', this.categories);
      },
      error: (err) => console.error('ERROR CATEGORIES', err)
    });
  }

  selectCategory(cat: Categorie | null): void {
    this.selectedCategoryId = cat ? cat.id : null;
    this.categoryService.setCategory(this.selectedCategoryId);
    this.categorySelected.emit(this.selectedCategoryId);
  }

  isActive(catId: number | null): boolean {
    return this.selectedCategoryId === catId;
  }

  getColor(color?: string): string {
    if (!color || color.trim() === '') {
      return '#2563eb';
    }

    const c = color.trim();

    if (c.startsWith('#') || c.startsWith('rgb') || c.startsWith('hsl')) {
      return c;
    }

    return `#${c}`;
  }

  trackByCategory(index: number, cat: Categorie): number {
    return cat.id;
  }
}