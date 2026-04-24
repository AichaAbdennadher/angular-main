import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { animate, style, transition, trigger, state } from '@angular/animations';



import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ transform: 'scale(0.95) translateY(20px)', opacity: 0 }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'scale(1) translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.95) translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class AdminUsersComponent {
  searchQuery = signal('');
  statusFilter = signal('');
  isFilterOpen = signal(false);
  selectedStudent = signal<any | null>(null);
  currentPage = signal(1);
  itemsPerPage = 5;

  // CRUD Signals
  isModalOpen = signal(false);
  isEditMode = signal(false);
  moderateurForm = signal<any>({
    id: null,
    name: '',
    email: '',
    pseudo: '',
    password: '',
    role: 'moderateur',
    status: 'actif'
  });

  moderateurs = signal<any[]>([]);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadModerateurs();
  }

  loadModerateurs() {
    this.dashboardService.getModerateurs().subscribe({
      next: (data) => {
        this.moderateurs.set(data.moderateurs);
      },
      error: (err) => console.error('Erreur lors du chargement des modérateurs', err)
    });
  }

  filteredStudents = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();

    return this.moderateurs().filter(s => {
      const matchesSearch = (s.name?.toLowerCase().includes(q) || s.pseudo?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
      const matchesStatus = !status || s.status?.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  });

  filteredCount = computed(() => this.filteredStudents().length);
  totalPages = computed(() => Math.ceil(this.filteredCount() / this.itemsPerPage));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage);
  endIndex = computed(() => Math.min(this.startIndex() + this.itemsPerPage, this.filteredCount()));
  
  paginatedStudents = computed(() => {
    const start = this.startIndex();
    return this.filteredStudents().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  toggleFilter() { this.isFilterOpen.update(v => !v); }
  
  onSearchQueryChange(val: string) {
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  onStatusFilterChange(val: string) {
    this.statusFilter.set(val);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('');
    this.isFilterOpen.set(false);
    this.currentPage.set(1);
  }

  onPageChanged(page: number) {
    this.currentPage.set(page);
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(v => v - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(v => v + 1); }
  goToPage(p: number) { this.currentPage.set(p); }
  
  viewProfile(student: any) {
    this.selectedStudent.set(student);
  }

  // CRUD Methods
  openAddModal() {
    this.isEditMode.set(false);
    this.moderateurForm.set({
      id: null,
      name: '',
      email: '',
      pseudo: '',
      password: '',
      role: 'moderateur',
      status: 'actif'
    });
    this.isModalOpen.set(true);
  }

  openEditModal(mod: any) {
    this.isEditMode.set(true);
    this.moderateurForm.set({
      id: mod.id,
      name: mod.name,
      email: mod.email,
      pseudo: mod.pseudo,
      password: '', // On ne pré-remplit pas le mot de passe
      role: mod.role,
      status: mod.status
    });
    this.isModalOpen.set(true);
  }

  saveModerateur() {
    const data = this.moderateurForm();
    if (this.isEditMode()) {
      this.dashboardService.updateModerateur(data.id, data).subscribe({
        next: () => {
          this.isModalOpen.set(false);
          this.loadModerateurs();
        },
        error: (err) => console.error('Erreur update', err)
      });
    } else {
      this.dashboardService.addModerateur(data).subscribe({
        next: () => {
          this.isModalOpen.set(false);
          this.loadModerateurs();
        },
        error: (err) => console.error('Erreur add', err)
      });
    }
  }

  deleteModerateur(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modérateur ?')) {
      this.dashboardService.deleteModerateur(id).subscribe({
        next: () => this.loadModerateurs(),
        error: (err) => console.error('Erreur delete', err)
      });
    }
  }

  toggleStatus(mod: any) {
    this.dashboardService.toggleStatus(mod.id).subscribe({
      next: (res) => {
        mod.status = res.status;
        this.loadModerateurs();
      },
      error: (err) => console.error('Erreur toggle status', err)
    });
  }
}
