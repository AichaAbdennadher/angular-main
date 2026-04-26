import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CategoryFilterService } from './services/category-filter.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isLoggedIn = false;
  isAdminPage = false;
  showNavFooter = true;

  constructor(
    private auth: AuthService,
    private categoryFilter: CategoryFilterService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.isAdminPage = url.startsWith('/admin');
      this.showNavFooter = !this.isAdminPage && !url.startsWith('/moderateur') && !url.startsWith('/login') && !url.startsWith('/register') && !url.startsWith('/suppension');
    });
  }

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      this.isLoggedIn = !!u;
    });
  }

  onCategorySelected(categoryId: number | null): void {
    this.categoryFilter.setCategory(categoryId);
  }
}