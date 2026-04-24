import { Component, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  showToast = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  activeTab = signal<string>('informations');
  avatarImage = signal<string>('');
  initials = signal<string>('');
  userPosts = signal<any[]>([]);
  loadingPosts = signal<boolean>(false);

  tabs = [
    { id: 'informations', label: 'Informations' },
    { id: 'publications', label: 'Publications' }
  ];

  profileData = signal<{
    name: string;
    pseudo: string;
    email: string;
  }>({
    name: '',
    pseudo: '',
    email: ''
  });

  editForm: any = {
    value: {
      name: '',
      pseudo: '',
      email: ''
    }
  };

  constructor(public authService: AuthService, private postService: PostService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.profileData.set({
        name: user.name || '',
        pseudo: user.pseudo || '',
        email: user.email || ''
      });
      this.avatarImage.set(user.avatar || '');
      this.updateInitials(user);
      this.loadUserPosts(user.id);
    }
  }

  loadUserPosts(userId: number): void {
    this.loadingPosts.set(true);
    this.postService.getPosts(userId).subscribe({
      next: (posts: any[]) => {
        this.userPosts.set(posts);
        this.loadingPosts.set(false);
      },
      error: (err: any) => {
        console.error('Erreur chargement posts', err);
        this.loadingPosts.set(false);
      }
    });
  }

  setActiveTab(id: string): void {
    this.activeTab.set(id);
  }

  private updateInitials(user: any): void {
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        this.initials.set((parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase());
        return;
      }
      this.initials.set(user.name.substring(0, 2).toUpperCase());
      return;
    }
    const pseudo = user?.pseudo || 'U';
    this.initials.set(pseudo.substring(0, 2).toUpperCase());
  }

  startEdit(): void {
    const data = this.profileData();
    this.editForm.value = { ...data };
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  handleSave(): void {
    this.authService.updateProfile(this.editForm.value).subscribe({
      next: (res: any) => {
        this.profileData.set({
          name: res.user.name || '',
          pseudo: res.user.pseudo || '',
          email: res.user.email || ''
        });
        this.updateInitials(res.user);
        this.isEditing.set(false);
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
      },
      error: (err: any) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarImage.set(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
