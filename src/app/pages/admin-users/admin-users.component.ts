import { Component, signal, computed, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ModerateurService } from '../../services/moderateur.service';

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
export class AdminUsersComponent implements OnInit {

  // ─── Recherche & filtres ────────────────────────────────────────────────────
  searchQuery   = signal('');
  statusFilter  = signal('');
  isFilterOpen  = signal(false);
  currentPage   = signal(1);
  itemsPerPage  = 4;

  // ─── Données ────────────────────────────────────────────────────────────────
  moderateurs = signal<any[]>([]);
  suspensions = signal<any[]>([]);

  // ─── Profil ─────────────────────────────────────────────────────────────────
  selectedStudent = signal<any | null>(null);

  // ─── Modal CRUD modérateur ───────────────────────────────────────────────────
  isModalOpen   = signal(false);
  isEditMode    = signal(false);
  moderateurForm = signal<any>({
    id: null, name: '', email: '', pseudo: '', password: '', role: 'moderateur', status: 'actif'
  });

  // ─── Modal suppression ───────────────────────────────────────────────────────
  isDeleteModalOpen    = signal(false);
  moderateurIdToDelete = signal<number | null>(null);

  // ─── Modal suspension ────────────────────────────────────────────────────────
  suspendModalOpen = signal(false);
  modToSuspend     = signal<any | null>(null);
  suspendReason    = signal('');
  suspendLoading   = signal(false);

  constructor(private moderateurService: ModerateurService) {}

  // ─── Cycle de vie ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadModerateurs();
    this.loadSuspensions();
  }

  // ─── Chargement ──────────────────────────────────────────────────────────────

  loadModerateurs(): void {
    this.moderateurService.getAll().subscribe({
      next: (data) => this.moderateurs.set(data.moderateurs),
      error: (err) => console.error('Erreur chargement modérateurs', err)
    });
  }

  loadSuspensions(): void {
    this.moderateurService.getSuspensions().subscribe({
      next: (data) => this.suspensions.set(data.suspensions || []),
      error: (err) => console.error('Erreur chargement suspensions', err)
    });
  }

  // ─── Pagination ──────────────────────────────────────────────────────────────

  filteredStudents = computed(() => {
    const q      = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    return this.moderateurs().filter(s => {
      const matchesSearch = s.name?.toLowerCase().includes(q)
        || s.pseudo?.toLowerCase().includes(q)
        || s.email?.toLowerCase().includes(q);
      const matchesStatus = !status || s.status?.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  });

  filteredCount   = computed(() => this.filteredStudents().length);
  totalPages      = computed(() => Math.ceil(this.filteredCount() / this.itemsPerPage));
  startIndex      = computed(() => (this.currentPage() - 1) * this.itemsPerPage);
  endIndex        = computed(() => Math.min(this.startIndex() + this.itemsPerPage, this.filteredCount()));
  paginatedStudents = computed(() => {
    const start = this.startIndex();
    return this.filteredStudents().slice(start, start + this.itemsPerPage);
  });
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ─── Filtres ─────────────────────────────────────────────────────────────────

  toggleFilter()               { this.isFilterOpen.update(v => !v); }
  onSearchQueryChange(v: string) { this.searchQuery.set(v); this.currentPage.set(1); }
  onStatusFilterChange(v: string){ this.statusFilter.set(v); this.currentPage.set(1); }
  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('');
    this.isFilterOpen.set(false);
    this.currentPage.set(1);
  }
  onPageChanged(page: number)  { this.currentPage.set(page); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(v => v - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(v => v + 1); }
  goToPage(p: number)          { this.currentPage.set(p); }

  // ─── Profil ──────────────────────────────────────────────────────────────────

  viewProfile(student: any): void {
    this.selectedStudent.set(student);
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const student = this.selectedStudent();
        if (student) this.selectedStudent.set({ ...student, avatar: e.target.result });
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // ─── CRUD modérateur ─────────────────────────────────────────────────────────

  openAddModal(): void {
    this.isEditMode.set(false);
    this.moderateurForm.set({ id: null, name: '', email: '', pseudo: '', password: '', role: 'moderateur', status: 'actif' });
    this.isModalOpen.set(true);
  }

  openEditModal(mod: any): void {
    this.isEditMode.set(true);
    this.moderateurForm.set({ id: mod.id, name: mod.name, email: mod.email, pseudo: mod.pseudo, password: '', role: mod.role, status: mod.status });
    this.isModalOpen.set(true);
  }

  saveModerateur(): void {
    const data = this.moderateurForm();
    const call = this.isEditMode()
      ? this.moderateurService.update(data.id, data)
      : this.moderateurService.create(data);

    call.subscribe({
      next: () => { this.isModalOpen.set(false); this.loadModerateurs(); },
      error: (err) => console.error('Erreur sauvegarde', err)
    });
  }

  openDeleteModal(id: number): void {
    this.moderateurIdToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeleteModerateur(id: number): void {
    this.moderateurService.delete(id).subscribe({
      next: () => {
        this.loadModerateurs();
        this.isDeleteModalOpen.set(false);
        this.moderateurIdToDelete.set(null);
      },
      error: (err) => {
        console.error('Erreur suppression', err);
        this.isDeleteModalOpen.set(false);
        this.moderateurIdToDelete.set(null);
      }
    });
  }

  // ─── Suspension ──────────────────────────────────────────────────────────────

  /** Ouvre le modal suspension ou réactive directement */
  toggleStatus(mod: any): void {
    if (mod.status === 'suspendu') {
      this.unsuspend(mod);
    } else {
      this.openSuspendModal(mod);
    }
  }

  openSuspendModal(mod: any): void {
    this.modToSuspend.set(mod);
    this.suspendReason.set('');
    this.suspendModalOpen.set(true);
  }

  confirmSuspend(): void {
    const mod    = this.modToSuspend();
    const reason = this.suspendReason().trim();
    if (!mod || !reason) return;

    this.suspendLoading.set(true);
    this.moderateurService.suspend(mod.id, reason).subscribe({
      next: () => {
        this.suspendLoading.set(false);
        this.suspendModalOpen.set(false);
        this.modToSuspend.set(null);
        this.loadModerateurs();
        this.loadSuspensions();
      },
      error: (err) => {
        console.error('Erreur suspension', err);
        this.suspendLoading.set(false);
      }
    });
  }

  unsuspend(mod: any): void {
    const suspId = this.findSuspensionId(mod.id);
    if (!suspId) {
      // Fallback : toggle simple si aucune entrée en BD
      this.moderateurService.toggleStatusFallback(mod.id).subscribe({
        next: () => { this.loadModerateurs(); this.loadSuspensions(); },
        error: (err) => console.error('Erreur réactivation', err)
      });
      return;
    }
    this.moderateurService.unsuspend(suspId).subscribe({
      next: () => { this.loadModerateurs(); this.loadSuspensions(); },
      error: (err) => console.error('Erreur réactivation', err)
    });
  }

  private findSuspensionId(userId: number): number | null {
    const s = this.suspensions().find((s: any) => s.user_id === userId);
    return s ? s.id : null;
  }
}
