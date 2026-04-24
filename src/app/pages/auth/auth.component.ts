import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  images: string[] = [
    'assets/images/Posts-amico.png',
    'assets/images/Posts-cuate.png',
    //'assets/images/Writer\'s block-amico.png'
  ];

  currentIndex = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.startSlideshow();
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  startSlideshow(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 4000);
  }

  stopSlideshow(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.stopSlideshow();
    this.startSlideshow();
  }
}
