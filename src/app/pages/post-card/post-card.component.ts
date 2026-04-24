import { Component, Input, signal } from '@angular/core';
import { Post, Category } from '../mock-data';
import { categories } from '../mock-data';
import { Role } from '../services/auth.service';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() role: Role = 'user';

  showComments = signal<boolean>(false);

  get category(): Category | undefined {
    return categories.find(c => c.id === this.post.categorieId);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  get accentText(): string {
    if (this.role === 'user') return 'text-[#00b1ba]';
    if (this.role === 'moderateur') return 'text-amber-600';
    return 'text-purple-600';
  }

  get accentBg(): string {
    if (this.role === 'user') return 'bg-[#00b1ba] hover:bg-[#008e96]';
    if (this.role === 'moderateur') return 'bg-amber-600 hover:bg-amber-700';
    return 'bg-purple-600 hover:bg-purple-700';
  }

  get accentBorder(): string {
    if (this.role === 'user') return 'focus:border-[#00b1ba] focus:ring-[#00b1ba]';
    if (this.role === 'moderateur') return 'focus:border-amber-500 focus:ring-amber-500';
    return 'focus:border-purple-500 focus:ring-purple-500';
  }

  get accentHoverText(): string {
    if (this.role === 'user') return 'hover:text-[#00b1ba]';
    if (this.role === 'moderateur') return 'hover:text-amber-600';
    return 'hover:text-purple-600';
  }

  toggleComments(): void {
    this.showComments.update(v => !v);
  }

  onLike(): void {
    if (this.post.userVote === 'like') {
      this.post.userVote = 'none';
      this.post.likes--;
    } else {
      if (this.post.userVote === 'dislike') this.post.dislikes--;
      this.post.userVote = 'like';
      this.post.likes++;
    }
  }

  onDislike(): void {
    if (this.post.userVote === 'dislike') {
      this.post.userVote = 'none';
      this.post.dislikes--;
    } else {
      if (this.post.userVote === 'like') this.post.likes--;
      this.post.userVote = 'dislike';
      this.post.dislikes++;
    }
  }
}
