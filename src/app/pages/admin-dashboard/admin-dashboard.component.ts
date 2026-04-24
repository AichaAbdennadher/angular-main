import { Component, OnInit, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  fill?: boolean;
}

interface ChartData {
  name: string;
  inscrits: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AdminDashboardComponent implements OnInit {
  chartTab = signal<'semaine' | 'mois'>('semaine');

  loading = true;
  error = false;

  stats: Stat[] = [
    { label: 'Utilisateurs', value: '0', icon: 'users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Posts', value: '0', icon: 'newspaper', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Catégories', value: '0', icon: 'folder-tree', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Modérateurs', value: '0', icon: 'users', color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  weeklyData: ChartData[] = [];
  monthlyData: ChartData[] = [];
  activityData: { name: string, posts: number }[] = [];

  moderateurs: any[] = [];


  categories: {name: string, percent: number, color: string}[] = [];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getDashboardFull().subscribe({
      next: (data) => {
        // 1. Summary Stats
        this.stats[0].value = data.summary.users.toLocaleString();
        this.stats[1].value = data.summary.posts.toLocaleString();
        this.stats[2].value = data.summary.categories.toLocaleString();
        this.stats[3].value = data.summary.moderateurs.toLocaleString();

        // 2. Charts
        this.weeklyData = data.usersChart.semaine;
        this.monthlyData = data.usersChart.mois;
        this.activityData = data.postsChart.semaine;

        // 3. Categories
        this.categories = data.categoriesPercent;

        // 4. Moderators
        this.moderateurs = data.moderateurs;

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données consolidées', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  activeData() {
    return this.chartTab() === 'semaine' ? this.weeklyData : this.monthlyData;
  }

  chartMax(): number {
    const data = this.activeData();
    if (!data || data.length === 0) return 4;
    const maxVal = Math.max(...data.map(d => d.inscrits), 0);
    if (maxVal === 0) return 4;
    // Calculate a nice max value (e.g., nearest multiple of 4 or 10 above the actual max)
    const power = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const fraction = maxVal / power;
    let niceFraction = 1;
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
    
    let niceMax = niceFraction * power;
    if (niceMax < 4) niceMax = 4;
    
    // Ensure it's easily divisible by 4 for the 5 labels
    return Math.ceil(niceMax / 4) * 4;
  }

  yAxisLabels(): number[] {
    const max = this.chartMax();
    return [max, max * 0.75, max * 0.5, max * 0.25, 0];
  }

  chartAreaPath(): string {
    const data = this.activeData();
    if (!data || data.length < 2) return '';
    const width = 800, height = 250;
    const max = this.chartMax();
    let path = '';
    
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.inscrits / max) * height;
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = ((i - 1) / (data.length - 1)) * width;
        const prevY = height - (data[i - 1].inscrits / max) * height;
        const cp1x = (prevX + x) / 2;
        const cp2x = (prevX + x) / 2;
        path += ` C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
      }
    });
    
    return `${path} L 800 250 L 0 250 Z`;
  }

  chartPath(): string {
    const data = this.activeData();
    if (!data || data.length < 2) return '';
    const width = 800, height = 250;
    const max = this.chartMax();
    let path = '';
    
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.inscrits / max) * height;
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = ((i - 1) / (data.length - 1)) * width;
        const prevY = height - (data[i - 1].inscrits / max) * height;
        const cp1x = (prevX + x) / 2;
        const cp2x = (prevX + x) / 2;
        path += ` C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
      }
    });
    
    return path;
  }

  setChartTab(tab: 'semaine' | 'mois') {
    this.chartTab.set(tab);
  }

  getBarHeight(posts: number): number {
    const max = this.barChartMax();
    const height = (posts / max) * 100;
    return height < 5 && posts > 0 ? 5 : height;
  }

  barChartMax(): number {
    if (!this.activityData || this.activityData.length === 0) return 40;
    const maxVal = Math.max(...this.activityData.map(d => d.posts), 0);
    if (maxVal === 0) return 40; // default max if no posts
    
    const power = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const fraction = maxVal / power;
    let niceFraction = 1;
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
    
    let niceMax = niceFraction * power;
    if (niceMax < 4) niceMax = 4;
    
    return Math.ceil(niceMax / 4) * 4;
  }

  barYAxisLabels(): number[] {
    const max = this.barChartMax();
    return [max, max * 0.75, max * 0.5, max * 0.25, 0];
  }
}
