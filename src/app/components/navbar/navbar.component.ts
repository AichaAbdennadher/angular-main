import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  user: any = null;
  notifications: any[] = [];
  notifOpen = false;
  intervalId: any;

  constructor(
    public auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      this.user = u;

      if (u) {
        this.loadNotifications();

        if (!this.intervalId) {
          this.intervalId = setInterval(() => {
            this.loadNotifications();
          }, 5000);
        }
      } else {
        this.notifications = [];
        this.notifOpen = false;

        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // ✅ FIX 1 : template string pour Authorization
  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getToken()}`
      })
    };
  }

  toggleNotifMenu(): void {
  this.notifOpen = !this.notifOpen;

  if (this.notifOpen) {
    this.loadNotifications();
  }
}

  // ✅ FIX 2 : backticks pour URL
  loadNotifications(): void {
    this.http.get<any>(`${environment.apiUrl}/notifications`, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.notifications = res.notifications || [];
        },
        error: (err) => {
          console.error('Erreur chargement notifications', err);
        }
      });
  }

  // ✅ FIX 3 : backticks pour delete URL
  deleteNotif(id: number): void {
    this.http.delete(`${environment.apiUrl}/notifications/${id}`, this.getHeaders())
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression notification', err);
        }
      });
  }

  logout(): void {
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // ✅ FIX 4 : correspond au HTML (.notif-box)
    if (!target.closest('.notif-box')) {
      this.notifOpen = false;
    }
  }
}