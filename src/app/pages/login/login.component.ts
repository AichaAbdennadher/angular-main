import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  isSubmitting = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.error.set('');
    this.isSubmitting.set(true);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.user && res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        }
        else if (res.user && res.user.role === 'moderateur') {
          this.router.navigate(['/moderateur/postes']);
        }
        else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.error?.error || err?.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }
}