import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { CategoryFilterService } from '../../services/category-filter.service';
import { environment } from '../../../environments/environment';

interface Categorie {
  id: number;
  titre: string;
  description?: string;
  icon?: string;
  color?: string;
  couleur?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: any = null;
  posts: any[] = [];
  filteredPosts: any[] = [];
  categories: Categorie[] = [];

  loadingPosts = false;
  posting = false;
  error = '';
  showPostForm = false;
  activeCategoryId: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 3;

  // empêche les doubles clics rapides
  reactingPosts = new Set<number | string>();

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private categoryFilter: CategoryFilterService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((u) => {
      this.user = u;
    });

    this.loadPosts();
    this.loadCategories();

    this.categoryFilter.categoryId$.subscribe((id) => {
      this.activeCategoryId = id;
      this.currentPage = 1;
      this.applyFilter();
    });
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.showPostForm) {
      this.closePostModal();
    }
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getToken()}`
      })
    };
  }

  // =========================
  // UTILITAIRES
  // =========================
  private normalizeReactions(reactions: any[] = []): any[] {
    const map = new Map<string, any>();

    reactions.forEach((reaction: any, index: number) => {
      const key = String(
        reaction?.user_id ??
        reaction?.user?.id ??
        `idx-${index}`
      );

      map.set(key, reaction);
    });

    return Array.from(map.values());
  }

  private normalizeComment(comment: any): any {
    if (!comment) return null;

    const derivedName =
      comment?.user_name ||
      comment?.auteur ||
      comment?.author_name ||
      comment?.name ||
      '';

    return {
      ...comment,
      contenu: comment?.contenu || '',
      created_at: comment?.created_at || '',
      user: comment?.user
        ? {
            ...comment.user,
            pseudo: comment.user?.pseudo || '',
            name: comment.user?.name || ''
          }
        : derivedName
          ? {
              id: comment?.user_id ?? null,
              pseudo: '',
              name: derivedName
            }
          : undefined
    };
  }

  private getCurrentUserForComment(): any {
    return {
      id: this.user?.id ?? null,
      pseudo: this.user?.pseudo || '',
      name: this.user?.name || ''
    };
  }

  // =========================
  // POSTS
  // =========================
  loadPosts(): void {
    this.loadingPosts = true;

    this.http.get<any[]>(`${environment.apiUrl}/posts`, this.getHeaders())
      .subscribe({
        next: (res: any[]) => {
          this.posts = (res || []).map((post: any) => ({
            ...post,
            commentaires: Array.isArray(post.commentaires)
              ? post.commentaires.map((c: any) => this.normalizeComment(c))
              : [],
            reactions: this.normalizeReactions(
              Array.isArray(post.reactions) ? post.reactions : []
            ),
            showComment: false,
            comment: ''
          }));

          this.loadingPosts = false;
          this.applyFilter();
        },
        error: (err: any) => {
          console.error('Erreur chargement posts', err);
          this.posts = [];
          this.filteredPosts = [];
          this.loadingPosts = false;
        }
      });
  }

  // =========================
  // FILTER
  // =========================
  applyFilter(): void {
    if (this.activeCategoryId === null) {
      this.filteredPosts = this.posts;
    } else {
      this.filteredPosts = this.posts.filter((p: any) =>
        p.categorie?.id === this.activeCategoryId ||
        p.categorie_id === this.activeCategoryId
      );
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // =========================
  // PAGINATION
  // =========================
  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.pageSize) || 1;
  }

  get paginatedPosts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPosts.slice(start, end);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // =========================
  // FORMATAGE / AFFICHAGE
  // =========================
  formatPseudo(pseudo: string | null | undefined): string {
    if (!pseudo || !pseudo.trim()) return 'Utilisateur';
    const cleaned = pseudo.trim();
    return cleaned.length > 22 ? cleaned.slice(0, 22) + '...' : cleaned;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitial(name: string | null | undefined): string {
    if (!name || !name.trim()) return 'U';
    return name.trim().charAt(0).toUpperCase();
  }

  // =========================
  // COMMENTAIRES
  // =========================
  loadComments(post: any): void {
    this.http.get<any[]>(
      `${environment.apiUrl}/posts/${post.id}/comments`,
      this.getHeaders()
    ).subscribe({
      next: (res: any[]) => {
        post.commentaires = Array.isArray(res)
          ? res.map((c: any) => this.normalizeComment(c))
          : [];
        post.showComment = true;
      },
      error: (err: any) => {
        console.error('Erreur chargement commentaires', err);
      }
    });
  }

  comment(post: any, content: string): void {
    const message = (content || '').trim();
    if (!message) return;

    this.http.post<any>(
      `${environment.apiUrl}/posts/${post.id}/comments`,
      { contenu: message },
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        post.comment = '';

        if (!Array.isArray(post.commentaires)) {
          post.commentaires = [];
        }

        const rawComment = res?.commentaire ?? res ?? null;

        const normalizedComment = rawComment
          ? {
              ...this.normalizeComment(rawComment),
              user: rawComment?.user
                ? this.normalizeComment(rawComment).user
                : this.getCurrentUserForComment(),
              contenu: rawComment?.contenu || message,
              created_at: rawComment?.created_at || new Date().toISOString()
            }
          : {
              contenu: message,
              created_at: new Date().toISOString(),
              user: this.getCurrentUserForComment()
            };

        post.commentaires.push(normalizedComment);
        post.showComment = true;
      },
      error: (err: any) => {
        console.error('Erreur commentaire', err);
      }
    });
  }

  toggleComments(post: any): void {
    post.showComment = !post.showComment;

    if (post.showComment && (!post.commentaires || post.commentaires.length === 0)) {
      this.loadComments(post);
    }
  }

  // =========================
  // CATEGORIES
  // =========================
  loadCategories(): void {
    this.http.get<Categorie[]>(`${environment.apiUrl}/categories`, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.categories = (res || []).map((c: any) => ({
            id: Number(c.id),
            titre: c.titre || '',
            description: c.description || '',
            icon: c.icon || '',
            color: c.color || c.couleur || '',
            couleur: c.couleur || c.color || ''
          }));
        },
        error: (err: any) => {
          console.error('Erreur chargement catégories', err);
          this.categories = [];
        }
      });
  }

  selectCategory(categoryId: number | null): void {
    this.activeCategoryId = categoryId;
    this.currentPage = 1;
    this.applyFilter();
  }

  // =========================
  // CATEGORY HELPERS
  // =========================
  getSafeColor(color?: string | null): string {
    if (!color || color.trim() === '') {
      return '#f59e0b'; // orange par défaut
    }

    const c = color.trim();

    if (
      c.startsWith('#') ||
      c.startsWith('rgb') ||
      c.startsWith('hsl')
    ) {
      return c;
    }

    return `#${c}`;
  }

  getCategoryById(id: number | null | undefined): Categorie | null {
    if (id === null || id === undefined) return null;
    return this.categories.find(c => c.id === id) || null;
  }

  getPostCategory(post: any): Categorie | null {
    if (post?.categorie?.id) {
      return {
        id: Number(post.categorie.id),
        titre: post.categorie.titre || '',
        description: post.categorie.description || '',
        icon: post.categorie.icon || '',
        color: post.categorie.color || post.categorie.couleur || ''
      };
    }

    if (post?.categorie_id) {
      return this.getCategoryById(Number(post.categorie_id));
    }

    return null;
  }

  getPostCategoryColor(post: any): string {
    const cat = this.getPostCategory(post);
    return this.getSafeColor(cat?.color || cat?.couleur || null);
  }

  getPostCategoryTitle(post: any): string {
    const cat = this.getPostCategory(post);
    return cat?.titre || '';
  }

  getPostCategoryIcon(post: any): string {
    const cat = this.getPostCategory(post);
    return cat?.icon || 'label';
  }

  getTextColor(bgColor?: string | null): string {
    const color = this.getSafeColor(bgColor);

    if (!color.startsWith('#')) {
      return '#ffffff';
    }

    const hex = color.replace('#', '');

    const fullHex = hex.length === 3
      ? hex.split('').map(x => x + x).join('')
      : hex;

    if (fullHex.length !== 6) {
      return '#ffffff';
    }

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 160 ? '#111827' : '#ffffff';
  }

  // =========================
  // CREATE POST
  // =========================
  createPost(postData: {
    titre: string;
    contenu: string;
    categorie_id: number;
    image: File | null;
  }): void {
    if (!postData.titre.trim() || !postData.contenu.trim()) {
      this.error = 'Le titre et le contenu sont obligatoires.';
      return;
    }

    this.error = '';
    this.posting = true;

    const formData = new FormData();
    formData.append('titre', postData.titre);
    formData.append('contenu', postData.contenu);
    formData.append('categorie_id', postData.categorie_id.toString());

    if (postData.image) {
      formData.append('image', postData.image);
    }

    this.http.post(`${environment.apiUrl}/posts`, formData, this.getHeaders())
      .subscribe({
        next: () => {
          this.posting = false;
          this.showPostForm = false;
          this.error = '';
          this.loadPosts();
        },
        error: (err: any) => {
          this.posting = false;
          console.error('Erreur création post', err);

          if (err?.error?.errors) {
            const firstError = Object.values(err.error.errors)[0] as string[];
            this.error = firstError[0];
          } else {
            this.error =
              err?.error?.error ||
              err?.error?.message ||
              'Erreur lors de la publication';
          }
        }
      });
  }

  // =========================
  // REACTIONS
  // =========================
  react(post: any, type: 'like' | 'dislike'): void {
    if (!this.user?.id || !post?.id) return;

    if (this.reactingPosts.has(post.id)) return;

    if (!Array.isArray(post.reactions)) {
      post.reactions = [];
    }

    post.reactions = this.normalizeReactions(post.reactions);

    const currentReaction = post.reactions.find(
      (r: any) => r.user_id === this.user.id
    );

    const isSameReaction = currentReaction?.type === type;
    const previousReactions = post.reactions.map((r: any) => ({ ...r }));

    post.reactions = post.reactions.filter(
      (r: any) => r.user_id !== this.user.id
    );

    if (!isSameReaction) {
      post.reactions.push({
        user_id: this.user.id,
        type
      });
    }

    this.reactingPosts.add(post.id);

    this.http.post(
      `${environment.apiUrl}/posts/${post.id}/reactions`,
      { type },
      this.getHeaders()
    ).subscribe({
      next: () => {
        post.reactions = this.normalizeReactions(post.reactions);
        this.reactingPosts.delete(post.id);
      },
      error: (err: any) => {
        console.error('Erreur réaction', err);
        post.reactions = previousReactions;
        this.reactingPosts.delete(post.id);
      }
    });
  }

  // =========================
  // COMPTEURS
  // =========================
  countLikes(post: any): number {
    const reactions = this.normalizeReactions(
      Array.isArray(post?.reactions) ? post.reactions : []
    );
    return reactions.filter((r: any) => r.type === 'like').length;
  }

  countDislikes(post: any): number {
    const reactions = this.normalizeReactions(
      Array.isArray(post?.reactions) ? post.reactions : []
    );
    return reactions.filter((r: any) => r.type === 'dislike').length;
  }

  countComments(post: any): number {
    if (Array.isArray(post.commentaires)) {
      return post.commentaires.length;
    }
    return post.comments_count ?? 0;
  }

  // =========================
  // MODAL
  // =========================
  openPostModal(): void {
    this.showPostForm = true;
    this.error = '';
  }

  closePostModal(): void {
    this.showPostForm = false;
    this.error = '';
  }

  // =========================
  // REACTION UTILISATEUR CONNECTÉ
  // =========================
  userReactionType(post: any): 'like' | 'dislike' | null {
    if (!this.user) return null;

    const reactions = this.normalizeReactions(
      Array.isArray(post?.reactions) ? post.reactions : []
    );

    const reaction = reactions.find(
      (r: any) => r.user_id === this.user.id
    );

    return reaction ? reaction.type : null;
  }
}
