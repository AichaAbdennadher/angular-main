import { Component, OnInit } from '@angular/core';
import { CategoryFilterService, Categorie } from '../../services/category-filter.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  searchQuery: string = '';
  iconSearchQuery: string = '';
  
  isModalOpen = false;
  isEditing = false;
  isIconDropdownOpen = false;

  availableIcons = [
    'label', 'star', 'favorite', 'home', 'work', 'school', 'science', 'computer',
    'language', 'public', 'bolt', 'eco', 'pets', 'restaurant', 'movie', 'music_note',
    'sports_soccer', 'directions_car', 'shopping_cart', 'account_balance', 'article',
    'campaign', 'celebration', 'chat', 'contact_support', 'event', 'forum', 'groups',
    'help', 'lightbulb', 'local_fire_department', 'menu_book', 'notifications',
    'payments', 'person', 'phone', 'place', 'psychology', 'search', 'settings',
    'share', 'thumb_up', 'verified', 'videogame_asset', 'visibility', 'warning'
  ];

  availableColors = [
    '#1d4b99', '#00b1ba', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', 
    '#ec4899', '#64748b', '#22c55e', '#3b82f6', '#f43f5e', '#a855f7', '#06b6d4'
  ];

  currentPage = 1;
  pageSize = 5;

  get totalPages() {
    return Math.ceil(this.filteredCategoriesCount / this.pageSize);
  }

  get filteredCategoriesCount() {
    return this.categories.filter(cat => 
      cat.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (cat.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false)
    ).length;
  }

  get paginatedCategories() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.categories
      .filter(cat => 
        cat.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (cat.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false)
      )
      .slice(start, start + this.pageSize);
  }

  onPageChanged(page: number) {
    this.currentPage = page;
  }

  get filteredIcons() {
    return this.availableIcons.filter(icon => 
      icon.toLowerCase().includes(this.iconSearchQuery.toLowerCase())
    );
  }
  
  categoryForm: Categorie = {
    id: 0,
    titre: '',
    description: '',
    icon: '',
    color: '#1d4b99'
  };



  constructor(private categoryService: CategoryFilterService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur lors du chargement des catégories', err)
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.categoryForm = {
      id: 0,
      titre: '',
      description: '',
      icon: '',
      color: '#1d4b99'
    };
    this.isModalOpen = true;
  }

  openEditModal(category: Categorie) {
    this.isEditing = true;
    this.categoryForm = { ...category };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  selectIcon(icon: string) {
    this.categoryForm.icon = icon;
    this.isIconDropdownOpen = false;
  }

  selectColor(color: string) {
    this.categoryForm.color = color;
  }

  toggleIconDropdown() {
    this.isIconDropdownOpen = !this.isIconDropdownOpen;
  }

  submitForm() {
    if (this.isEditing) {
      this.categoryService.updateCategorie(this.categoryForm.id, this.categoryForm).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => console.error('Erreur lors de la mise à jour', err)
      });
    } else {
      // Pour l'ajout, on peut omettre l'ID si le backend le génère
      const { id, ...newCategory } = this.categoryForm;
      this.categoryService.addCategorie(newCategory as Categorie).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => console.error('Erreur lors de l\'ajout', err)
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categoryService.deleteCategorie(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Erreur lors de la suppression', err)
      });
    }
  }
}



