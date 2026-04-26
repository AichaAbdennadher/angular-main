import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.auth.user(); // signal value
    if (user?.status === 'suspendu' && user?.role === 'moderateur') {
      this.router.navigate(['/suppension'], { queryParams: { reason: 'Compte suspendu' } });
      return false;
    }

    return true;
  }
}