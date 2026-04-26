import { Component, OnInit, signal, computed } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { CommentService } from '../../services/comment.service';
import { ModerateurService } from '../../services/moderateur.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-postes-m',
  templateUrl: './postes-m.component.html',
  styleUrls: ['./postes-m.component.css'],
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
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class PostesMComponent implements OnInit {
  posts = signal<any[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  selectedPost = signal<any | null>(null);
  isViewModalOpen = signal(false);
  notification = signal<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Pagination & Filtering Signals
  currentPage = signal(1);
  itemsPerPage = 4;

  isFilterOpen = signal(false);
  statusFilter = signal<'all' | 'visible' | 'hidden'>('all');
  lockFilter = signal<'all' | 'locked' | 'unlocked'>('all');
  dateSort = signal<'recent' | 'ancien'>('ancien');
  specificDateFilter = signal<string | null>(null);

  // Delete Modal Signals
  isDeleteModalOpen = signal(false);
  postIdToDelete = signal<number | null>(null);

  isDeleteCommentModalOpen = signal(false);
  commentIdToDelete = signal<number | null>(null);

  isCommentsExpanded = signal(false);
  suspensions = signal<any[]>([]);

  // Get all posts matching search and filters
  getFilteredPosts = computed(() => {
    let results = this.posts();

    // 1. Search Query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      results = results.filter(post =>
        post.titre?.toLowerCase().includes(query) ||
        post.user?.pseudo?.toLowerCase().includes(query) ||
        post.categorie?.titre?.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter
    if (this.statusFilter() === 'visible') {
      results = results.filter(post => !post.is_hidden);
    } else if (this.statusFilter() === 'hidden') {
      results = results.filter(post => post.is_hidden);
    }

    // 3. Lock Filter
    if (this.lockFilter() === 'locked') {
      results = results.filter(post => post.is_locked);
    } else if (this.lockFilter() === 'unlocked') {
      results = results.filter(post => !post.is_locked);
    }

    // 4. Date Sorting
    results = [...results].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.dateSort() === 'recent' ? dateB - dateA : dateA - dateB;
    });

    // 5. Specific Date Filter
    if (this.specificDateFilter()) {
      results = results.filter(post => {
        if (!post.created_at) return false;
        const postDate = new Date(post.created_at).toISOString().split('T')[0];
        return postDate === this.specificDateFilter();
      });
    }

    return results;
  });

  filteredCount = computed(() => this.getFilteredPosts().length);
  totalPages = computed(() => Math.ceil(this.filteredCount() / this.itemsPerPage));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage);
  endIndex = computed(() => Math.min(this.startIndex() + this.itemsPerPage, this.filteredCount()));

  // Current page of posts
  filteredPosts = computed(() => {
    return this.getFilteredPosts().slice(this.startIndex(), this.endIndex());
  });

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private commentService: CommentService,
    private moderateurService: ModerateurService
  ) { }

  ngOnInit(): void {
    this.loadPosts();
    this.loadSuspensions();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.postService.getPosts().subscribe({
      next: (data) => {
        // En supposant que l'API retourne un tableau directement ou un objet avec une clé posts
        this.posts.set(Array.isArray(data) ? data : (data as any).posts || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des posts', err);
        this.isLoading.set(false);
      }
    });
  }


  // ─── Modal suspension ────────────────────────────────────────────────────────
  suspendModalOpen = signal(false);
  userToSuspend    = signal<any | null>(null);
  suspendReason    = signal('');
  suspendLoading   = signal(false);

 loadSuspensions(): void {
    this.moderateurService.getSuspensions().subscribe({
      next: (data) => this.suspensions.set(data.suspensions || []),
      error: (err) => console.error('Erreur chargement suspensions', err)
    });
  }
  onPageChanged(page: number) {
    this.currentPage.set(page);
  }

  onSearchQueryChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  onStatusFilterChange(value: any) {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  onLockFilterChange(value: any) {
    this.lockFilter.set(value);
    this.currentPage.set(1);
  }

  onDateSortChange(value: any) {
    this.dateSort.set(value);
    this.currentPage.set(1);
  }

  onSpecificDateFilterChange(value: string) {
    this.specificDateFilter.set(value || null);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.lockFilter.set('all');
    this.dateSort.set('ancien');
    this.specificDateFilter.set(null);
    this.currentPage.set(1);
    this.isFilterOpen.set(false);
  }

  openAddModal() {
    this.showNotification('Fonctionnalité d\'ajout de post bientôt disponible', 'info');
  }

  openDeleteModal(id: number): void {
    this.postIdToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeletePost(id: number): void {
    this.postService.deletePost(id).subscribe({
      next: () => {
        this.posts.update(p => p.filter(item => item.id !== id));
        this.showNotification('Post supprimé avec succès');
        this.isDeleteModalOpen.set(false);
        this.postIdToDelete.set(null);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        this.showNotification('Erreur lors de la suppression', 'error');
        this.isDeleteModalOpen.set(false);
        this.postIdToDelete.set(null);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('fr-FR', { day: 'numeric' });
    const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year}, ${time}`;
  }

  getCategoryStyles(category: any) {
    if (!category || !category.color) return {};
    const color = category.color;
    return {
      'background-color': color + '15',
      'color': color,
      'border-color': color + '30'
    };
  }

  getRoleStyles(role: string) {
    let color = '#64748b'; // default slate
    if (role === 'admin') color = '#7c3aed'; // purple
    if (role === 'moderateur') color = '#d97706'; // amber/orange

    return {
      'background-color': color + '15',
      'color': color,
      'border-color': color + '30'
    };
  }

  viewPost(id: number) {
    const post = this.posts().find(p => p.id === id);
    if (post) {
      this.selectedPost.set(post);
      this.isCommentsExpanded.set(false);
      this.isViewModalOpen.set(true);
    }
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    setTimeout(() => this.selectedPost.set(null), 200);
  }

  /** Ouvre le modal suspension ou réactive directement */
  toggleUserStatus(user: any): void {
    if (!user?.id) return;
    
    if (user.status === 'suspendu') {
      this.unsuspend(user);
    } else {
      this.openSuspendModal(user);
    }
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  countLikes(post: any): number {
    return post.reactions?.filter((r: any) => r.type === 'like').length || 0;
  }

  countDislikes(post: any): number {
    return post.reactions?.filter((r: any) => r.type === 'dislike').length || 0;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Si le chemin commence par storage/, on ne le rajoute pas
    const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;
    return `http://localhost:8000/storage/${cleanPath}`;
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 3000);
  }

  openDeleteCommentModal(id: number) {
    this.commentIdToDelete.set(id);
    this.isDeleteCommentModalOpen.set(true);
  }

  confirmDeleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        if (this.selectedPost()) {
          this.selectedPost.update(p => ({
            ...p,
            commentaires: p.commentaires.filter((c: any) => c.id !== commentId)
          }));
        }
        // Update in main list too
        this.posts.update(all => all.map(p => {
          if (p.commentaires) {
            return { ...p, commentaires: p.commentaires.filter((c: any) => c.id !== commentId) };
          }
          return p;
        }));
        this.showNotification('Commentaire supprimé');
        this.isDeleteCommentModalOpen.set(false);
        this.commentIdToDelete.set(null);
      },
      error: (err) => {
        console.error('Erreur suppression commentaire', err);
        this.showNotification('Erreur lors de la suppression', 'error');
        this.isDeleteCommentModalOpen.set(false);
        this.commentIdToDelete.set(null);
      }
    });
  }

  toggleLock(postId: number): void {
    this.postService.toggleLock(postId).subscribe({
      next: (res) => {
        this.updatePostStatus(postId, { is_locked: res.is_locked });
        this.showNotification(res.message);
      },
      error: (err) => {
        console.error('Erreur toggle lock', err);
        this.showNotification('Erreur lors de la modification', 'error');
      }
    });
  }

  // Retiré car remplacé par toggleUserStatus unifié

  toggleHide(postId: number): void {
    this.postService.toggleHide(postId).subscribe({
      next: (res) => {
        this.updatePostStatus(postId, { is_hidden: res.is_hidden });
        this.showNotification(res.message);
      },
      error: (err) => {
        console.error('Erreur toggle hide', err);
        this.showNotification('Erreur lors de la modification', 'error');
      }
    });
  }

  private updatePostStatus(postId: number, updates: any): void {
    this.posts.update(all => all.map(p => p.id === postId ? { ...p, ...updates } : p));
    if (this.selectedPost()?.id === postId) {
      this.selectedPost.update(p => ({ ...p, ...updates }));
    }
  }
    // ─── Suspension ──────────────────────────────────────────────────────────────
  
  openSuspendModal(user: any): void {
    this.userToSuspend.set(user);
    this.suspendReason.set('');
    this.suspendModalOpen.set(true);
  }

  confirmSuspend(): void {
    const user    = this.userToSuspend();
    const reason = this.suspendReason().trim();
    if (!user || !reason) return;

    this.suspendLoading.set(true);
    this.moderateurService.suspend(user.id, reason).subscribe({
      next: (res: any) => {
        this.suspendLoading.set(false);
        this.suspendModalOpen.set(false);
        this.userToSuspend.set(null);
        
        // Mettre à jour le statut local
        this.updateUserInPosts(user.id, 'suspendu');
        this.loadSuspensions();
        this.showNotification('Utilisateur suspendu avec succès');
      },
      error: (err) => {
        console.error('Erreur suspension', err);
        this.suspendLoading.set(false);
        this.showNotification('Erreur lors de la suspension', 'error');
      }
    });
  }

  unsuspend(user: any): void {
    const suspId = this.findSuspensionId(user.id);
    if (!suspId) {
      // Fallback : toggle simple si aucune entrée en BD
      this.moderateurService.toggleStatusFallback(user.id).subscribe({
        next: (res: any) => { 
          this.updateUserInPosts(user.id, res.status);
          this.loadSuspensions(); 
          this.showNotification('Utilisateur réactivé');
        },
        error: (err) => console.error('Erreur réactivation', err)
      });
      return;
    }
    this.moderateurService.unsuspend(suspId).subscribe({
      next: () => { 
        this.updateUserInPosts(user.id, 'actif');
        this.loadSuspensions(); 
        this.showNotification('Utilisateur réactivé');
      },
      error: (err) => console.error('Erreur réactivation', err)
    });
  }

  private updateUserInPosts(userId: number, status: string): void {
    this.posts.update(all => all.map(p => {
      if (p.user?.id === userId) {
        return { ...p, user: { ...p.user, status: status } };
      }
      return p;
    }));
    
    if (this.selectedPost()?.user?.id === userId) {
      this.selectedPost.update(p => ({
        ...p,
        user: { ...p.user, status: status }
      }));
    }
  }

  private findSuspensionId(userId: number): number | null {
    const s = this.suspensions().find((s: any) => s.user_id === userId);
    return s ? s.id : null;
  }
}
