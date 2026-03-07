import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  templateUrl: 'dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    IconDirective,
    ChartjsComponent
  ]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  get cardBg() {
    return this.isDark() ? '#24303f' : '#ffffff';
  }

  get textColor() {
    return this.isDark() ? '#ffffff' : '#1a222c';
  }

  get subTextColor() {
    return this.isDark() ? '#8a99af' : '#64748b';
  }

  brandBordeaux = '#cf2f4c';

  public chartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Candidatures reçues',
        backgroundColor: 'rgba(207, 47, 76, 0.1)',
        borderColor: '#cf2f4c',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#cf2f4c',
        pointHoverBackgroundColor: '#cf2f4c',
        pointHoverBorderColor: '#fff',
        fill: true,
        tension: 0.4,
        data: [15, 30, 25, 40, 50, 45, 65]
      }
    ]
  };

  public barChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Profil visité',
        backgroundColor: '#cf2f4c',
        borderRadius: 4,
        data: [1200, 1500, 2200, 1800, 2800, 3500]
      }
    ]
  };

  public doughnutChartData = {
    labels: ['Informatique', 'Marketing', 'RH', 'Finance'],
    datasets: [
      {
        backgroundColor: ['#cf2f4c', '#3c50e0', '#f9b115', '#2eb85c'],
        borderWidth: 0,
        data: [45, 25, 20, 10]
      }
    ]
  };

  readonly chartOptions = computed(() => {
    const isDark = this.colorMode() === 'dark';
    const textColor = isDark ? '#8a99af' : '#4f5d73';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: isDark ? '#1a222c' : '#fff',
          titleColor: isDark ? '#fff' : '#000',
          bodyColor: isDark ? '#8a99af' : '#4f5d73',
          padding: 12,
          cornerRadius: 8,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor }
        }
      }
    };
  });

  readonly doughnutOptions = computed(() => {
    const isDark = this.colorMode() === 'dark';
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            color: isDark ? '#8a99af' : '#64748b',
            usePointStyle: true,
            padding: 15
          }
        }
      }
    };
  });

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
  }

  get welcomeMessage(): string {
    if (this.user?.role === 'admin') {
      return 'Bienvenue dans votre espace administrateur StageConnect.';
    }
    return `Bienvenue, ${this.user?.name || 'Partenaire'}. Suivez vos offres de stage et candidatures en temps réel.`;
  }
}
