import { Component, signal, OnInit, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  showToast = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  user = computed(() => this.authService.user());

  // this code 
  coverImage = computed(() => {
    const role = this.user()?.role?.toLowerCase();
    if (role === 'admin') return 'assets/images/admin.png';
    if (role === 'moderateur') return 'assets/images/moderateur.png';
    return 'assets/images/utilisateur.png'; // Fallback
  });


  editForm: any = {
    value: {
      name: '',
      pseudo: '',
      email: ''
    }
  };

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    // Initial load handled by AuthService
  }

  startEdit(): void {
    const user = this.authService.user();
    if (user) {
      this.editForm.value = {
        name: user.name || '',
        pseudo: user.pseudo || '',
        email: user.email || ''
      };
      this.isEditing.set(true);
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  handleSave(): void {
    this.authService.updateProfile(this.editForm.value).subscribe({
      next: (res: any) => {
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
        const base64 = e.target.result;
        const currentUser = this.authService.user();
        if (currentUser) {
          this.authService.user.set({ ...currentUser, avatar: base64 });
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

}

