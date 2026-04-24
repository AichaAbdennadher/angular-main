import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isProfileOpen = signal(false);
  isMobileMenuOpen = signal(false);

  navItems = computed(() => {
    const role = this.user()?.role;
    const items = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
      { label: 'Catégories', path: '/admin/categories', icon: 'account_tree' },
      { label: 'Modérateurs', path: '/admin/users', icon: 'people' },
    ];

    return items;
  });

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
    const pseudo = user?.pseudo || 'Admin';
    return pseudo.substring(0, 2).toUpperCase();
  });

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.isProfileOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
