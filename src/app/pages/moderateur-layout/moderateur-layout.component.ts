import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-moderateur-layout',
  templateUrl: './moderateur-layout.component.html',
  styleUrls: ['./moderateur-layout.component.css']
})
export class ModerateurLayoutComponent {
  isProfileOpen = signal(false);
  isMobileMenuOpen = signal(false);

  navItems = signal([
    { label: 'Postes', path: '/moderateur/postes', icon: 'visibility' },
  ]);

  constructor(private authService: AuthService, private router: Router) { }

  user = computed(() => this.authService.user());

  initials = computed(() => {
    const user = this.user();
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    const pseudo = user?.pseudo || 'Mod';
    return pseudo.substring(0, 2).toUpperCase();
  });

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
