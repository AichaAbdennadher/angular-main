import { Component, OnInit, signal, computed } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { CommentService } from '../../services/comment.service';
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
  itemsPerPage = 10;

  isFilterOpen = signal(false);
  statusFilter = signal<'all' | 'visible' | 'hidden'>('all');
  lockFilter = signal<'all' | 'locked' | 'unlocked'>('all');
  dateSort = signal<'recent' | 'ancien'>('recent');
  specificDateFilter = signal<string | null>(null);

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
    private commentService: CommentService
  ) { }

  ngOnInit(): void {
    this.loadPosts();
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
    this.dateSort.set('recent');
    this.specificDateFilter.set(null);
    this.currentPage.set(1);
    this.isFilterOpen.set(false);
  }

  openAddModal() {
    this.showNotification('Fonctionnalité d\'ajout de post bientôt disponible', 'info');
  }

  deletePost(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.posts.update(p => p.filter(item => item.id !== id));
          this.showNotification('Post supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          this.showNotification('Erreur lors de la suppression', 'error');
        }
      });
    }
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

  viewPost(postId: number): void {
    const post = this.posts().find(p => p.id === postId);
    if (post) {
      this.selectedPost.set(post);
      this.isViewModalOpen.set(true);
    }
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    setTimeout(() => this.selectedPost.set(null), 200);
  }

  toggleStatus(post: any): void {
    if (!post.user?.id) return;

    this.dashboardService.toggleStatus(post.user.id).subscribe({
      next: (res) => {
        // Mettre à jour le statut de l'utilisateur pour tous les posts de cet utilisateur
        this.posts.update(allPosts =>
          allPosts.map(p => {
            if (p.user?.id === post.user.id) {
              return { ...p, user: { ...p.user, status: res.status } };
            }
            return p;
          })
        );
        this.showNotification(`Statut de l'utilisateur mis à jour : ${res.status}`);
      },
      error: (err) => {
        console.error('Erreur toggle status', err);
        this.showNotification('Erreur lors de la mise à jour du statut', 'error');
      }
    });
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

  deleteComment(commentId: number): void {
    if (confirm('Supprimer ce commentaire ?')) {
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
        },
        error: (err) => {
          console.error('Erreur suppression commentaire', err);
          this.showNotification('Erreur lors de la suppression', 'error');
        }
      });
    }
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
}
