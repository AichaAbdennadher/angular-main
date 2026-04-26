import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-suppension',
  templateUrl: './suppension.component.html',
  styleUrls: ['./suppension.component.css']
})
export class SuppensionComponent implements OnInit {
  reason = signal<string>('Violation des conditions d\'utilisation');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['reason']) {
        this.reason.set(params['reason']);
      }
    });
  }

  goToLogin() {
    this.authService.logout();
  }
}
