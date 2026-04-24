import { Component, OnInit, signal, computed } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
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
  
  // Get all posts matching the search query (without pagination)
  getFilteredPosts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.posts();
    return this.posts().filter(post => 
      post.titre?.toLowerCase().includes(query) || 
      post.contenu?.toLowerCase().includes(query) ||
      post.user?.pseudo?.toLowerCase().includes(query)
    );
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
    private dashboardService: DashboardService
  ) {}

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
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month}., ${time}`;
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
}
