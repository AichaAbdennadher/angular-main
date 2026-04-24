import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  // IMPORTANT :
  // ton HTML commence par *ngIf="user"
  // donc user doit exister pour afficher la page
  user: any = { guest: true };

  posts: any[] = [];
  filteredPosts: any[] = [];
  categories: Categorie[] = [];

  loadingPosts = false;
  posting = false;
  error = '';
  showPostForm = false;

  // Pagination
  currentPage = 1;
  pageSize = 3;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.showPostForm) {
      this.closePostModal();
    }
  }

  // =========================
  // NORMALISATION
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

  // =========================
  // POSTS
  // =========================
  loadPosts(): void {
    this.loadingPosts = true;

    this.http.get<any[]>(`${environment.apiUrl}/posts`)
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

          this.filteredPosts = this.posts;
          this.loadingPosts = false;

          if (this.currentPage > this.totalPages) {
            this.currentPage = 1;
          }
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
  // CATEGORIES
  // =========================
  loadCategories(): void {
    this.http.get<Categorie[]>(`${environment.apiUrl}/categories`)
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

  // =========================
  // COMMENTAIRES
  // =========================
  loadComments(post: any): void {
    this.http.get<any[]>(`${environment.apiUrl}/posts/${post.id}/comments`)
      .subscribe({
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

  toggleComments(post: any): void {
    post.showComment = !post.showComment;

    if (post.showComment && (!post.commentaires || post.commentaires.length === 0)) {
      this.loadComments(post);
    }
  }

  // =========================
  // ACTIONS => LOGIN
  // =========================
  goLogin(categoryId?: number | null): void {
    this.router.navigate(['/login'], {
      queryParams: categoryId ? { category: categoryId } : {}
    });
  }

  // catégorie du post
  selectCategory(categoryId: number | null): void {
    this.goLogin(categoryId);
  }

  // like
  react(post: any, type: 'like' | 'dislike'): void {
    const categoryId =
      post?.categorie?.id ??
      post?.categorie_id ??
      null;

    this.goLogin(categoryId);
  }

  // envoyer commentaire => login
  comment(post: any, content: string): void {
    const message = (content || '').trim();
    if (!message) return;

    const categoryId =
      post?.categorie?.id ??
      post?.categorie_id ??
      null;

    this.goLogin(categoryId);
  }

  // bouton créer publication => login
  openPostModal(): void {
    this.goLogin();
  }

  closePostModal(): void {
    this.showPostForm = false;
    this.error = '';
  }

  createPost(postData: {
    titre: string;
    contenu: string;
    categorie_id: number;
    image: File | null;
  }): void {
    this.goLogin(postData?.categorie_id ?? null);
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

  // IMPORTANT :
  // même format que HOME
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
  // HELPERS CATEGORIES
  // =========================
  getSafeColor(color?: string | null): string {
    if (!color || color.trim() === '') {
      return '#f59e0b';
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
        color: post.categorie.color || post.categorie.couleur || '',
        couleur: post.categorie.couleur || post.categorie.color || ''
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

  // sur index il n'y a pas de user connecté
  userReactionType(post: any): 'like' | 'dislike' | null {
    return null;
  }
}
