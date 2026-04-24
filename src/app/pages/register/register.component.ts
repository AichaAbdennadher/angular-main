import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  pseudo = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = signal('');
  isSubmitting = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  handleSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.name || !this.pseudo || !this.email || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.error.set('');
    this.isSubmitting.set(true);

    const payload = {
      name: this.name,
      pseudo: this.pseudo,
      email: this.email,
      password: this.password,
      password_confirmation: this.confirmPassword
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err?.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          this.error.set(firstError[0]);
        } else {
          this.error.set(err?.error?.error || err?.error?.message || "Erreur lors de l'inscription");
        }
      }
    });
  }
}