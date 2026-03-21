import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy, NgZone, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, OnboardingProfile, User } from '../../services/auth.service';
import { backendLabels } from '../../core/backend-labels';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  RowComponent,
  ColorModeService,
  AlertComponent,
  BadgeComponent,
  AvatarComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import {
  AdminDashboardActivityItem,
  AdminDashboardAuditLog,
  AdminDashboardCompanyItem,
  AdminDashboardMetricsResponse,
  AdminDashboardOfferItem,
  AdminDashboardReportItem,
  AdminDashboardResponse,
  AdminDashboardService,
  AdminDashboardSuspendedAccountItem
} from '../../services/admin-dashboard.service';
import { forkJoin, Subject, distinctUntilChanged, takeUntil } from 'rxjs';

Chart.register(...registerables);

@Component({
  templateUrl: 'dashboard.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    RowComponent,
    ColComponent,
    IconDirective,
    ChartjsComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    ButtonDirective,
    AlertComponent,
    BadgeComponent,
    AvatarComponent
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly labels = backendLabels;
  user: User | null = null;
  onboarding: OnboardingProfile | null = null;
  onboardingFormValues: Record<string, string> = {};
  onboardingError = '';
  onboardingSuccess = '';
  isSubmittingOnboarding = false;
  isLoadingOnboarding = false;

  adminDashboard: AdminDashboardResponse | null = null;
  adminAuditLogs: AdminDashboardAuditLog[] = [];
  adminStatsSnapshot: Array<{ label: string; value: number; icon: string; color: string; route: string }> = [];
  companiesToVerifySnapshot: AdminDashboardCompanyItem[] = [];
  openReportsSnapshot: AdminDashboardReportItem[] = [];
  suspendedOffersSnapshot: AdminDashboardOfferItem[] = [];
  suspendedAccountsSnapshot: AdminDashboardSuspendedAccountItem[] = [];
  recentActivitySnapshot: AdminDashboardActivityItem[] = [];
  adminError = '';
  isLoadingAdmin = false;
  adminMetrics: AdminDashboardMetricsResponse | null = null;
  adminChartsViewModel: {
    overviewData: ChartData<'bar'>;
    overviewOptions: ChartOptions<'bar'>;
    distributionData: ChartData<'doughnut'>;
    distributionOptions: ChartOptions<'doughnut'>;
  } | null = null;

  adminOverviewChartData: ChartData<'bar'> = {
    labels: ['Entreprises', 'Signalements', 'Comptes suspendus', 'Offres suspendues'],
    datasets: [
      {
        label: 'Volume',
        backgroundColor: ['#f7941e', '#dc3545', '#004a99', '#198754'],
        borderRadius: 8,
        data: [0, 0, 0, 0]
      }
    ]
  };

  adminDistributionChartData: ChartData<'doughnut'> = {
    labels: ['Entreprises', 'Signalements', 'Comptes', 'Offres'],
    datasets: [
      {
        backgroundColor: ['#f7941e', '#dc3545', '#004a99', '#198754'],
        borderWidth: 0,
        data: [0, 0, 0, 0]
      }
    ]
  };

  adminOverviewChartOptions: ChartOptions<'bar'> = {};
  adminDistributionChartOptions: ChartOptions<'doughnut'> = {};

  readonly #colorModeService = inject(ColorModeService);
  readonly #adminDashboardService = inject(AdminDashboardService);
  readonly #router = inject(Router);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #auth = inject(AuthService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  private readonly destroy$ = new Subject<void>();

  get cardBg() {
    return this.isDark() ? '#24303f' : '#ffffff';
  }

  get textColor() {
    return this.isDark() ? '#ffffff' : '#1a222c';
  }

  get subTextColor() {
    return this.isDark() ? '#8a99af' : '#64748b';
  }

  private buildChartOptions(): ChartOptions<'bar'> {
    const textColor = this.isDark() ? '#8a99af' : '#64748b';
    const gridColor = this.isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
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
  }

  private buildDoughnutOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: this.isDark() ? '#8a99af' : '#64748b',
            usePointStyle: true,
            padding: 16
          }
        }
      }
    };
  }

  ngOnInit(): void {
    this.refreshAdminChartOptions();
    this.user = this.#auth.getCurrentUser();

    this.#auth.user$
      .pipe(
        distinctUntilChanged((prev: User | null, curr: User | null) => 
          prev?.id === curr?.id && prev?.role === curr?.role
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((user: User | null) => {
        if (!user) {
          this.user = null;
          this.#cdr.markForCheck();
          return;
        }

        const roleChanged = this.user?.role !== user.role;
        const previousUser = this.user;
        this.user = user;

        if (user.role === 'entreprise' && (roleChanged || !this.onboarding)) {
          this.loadOnboarding();
        }
        if (user.role === 'admin' && (roleChanged || !this.adminDashboard)) {
          this.loadAdminDashboard();
        }
        this.#cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get welcomeMessage(): string {
    if (this.user?.role === 'admin') {
      return 'Vue d\'ensemble de supervision et de modération de StageConnect.';
    }
    return `Bienvenue, ${this.user?.name || 'Partenaire'}.`;
  }

  get currentOnboardingStep() {
    return this.onboarding?.steps.find((step) => step.code === this.onboarding?.current_step_code)
      ?? this.onboarding?.steps.find((step) => !step.completed)
      ?? null;
  }

  get enterpriseStats() {
    return [
      { label: 'Progression', value: `${this.onboarding?.completion_rate ?? 0}%`, icon: 'cilTask' },
      { label: 'Etapes restantes', value: `${this.remainingStepsCount}`, icon: 'cilClock' },
      { label: 'Offres', value: '0', icon: 'cilBriefcase' }
    ];
  }

  get adminStats() {
    return this.adminStatsSnapshot;
  }

  get remainingStepsCount(): number {
    return this.onboarding?.steps.filter((step) => !step.completed).length ?? 0;
  }

  getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      company_name: "Nom de l'entreprise",
      sector_code: 'Secteur',
      contact_phone: 'Telephone de contact',
      target_profiles: 'Profils recherches',
      hiring_regions: 'Regions ciblees',
      internship_modes: 'Modalites de stage',
      public_description: 'Description publique'
    };
    return labels[field] ?? field.replace(/_/g, ' ');
  }

  getFieldPlaceholder(field: string): string {
    const placeholders: Record<string, string> = {
      company_name: 'Ex: MTN Cameroon',
      sector_code: 'Ex: TELECOM',
      contact_phone: 'Ex: +237 6XXXXXXXX',
      target_profiles: 'Ex: Developpeur, Marketing',
      hiring_regions: 'Ex: Littoral, Centre',
      internship_modes: 'Ex: presentiel, hybride',
      public_description: "Presentez brievement l'entreprise"
    };
    return placeholders[field] ?? '';
  }

  isTextareaField(field: string): boolean {
    return field === 'public_description';
  }

  onSubmitCurrentStep(): void {
    const step = this.currentOnboardingStep;
    if (!step) {
      return;
    }

    this.onboardingError = '';
    this.onboardingSuccess = '';
    this.isSubmittingOnboarding = true;

    const payload = step.required_fields.reduce<Record<string, unknown>>((acc, field) => {
      const rawValue = this.onboardingFormValues[field] ?? '';
      if (field === 'target_profiles' || field === 'hiring_regions' || field === 'internship_modes') {
        acc[field] = rawValue
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      } else {
        acc[field] = rawValue.trim();
      }
      return acc;
    }, {});

    this.#auth.updateMyOnboardingStep(step.code, payload).subscribe({
      next: (onboarding) => {
        this.onboarding = onboarding;
        this.seedCurrentStepFields();
        this.isSubmittingOnboarding = false;
        this.onboardingSuccess = 'Informations enregistrées.';
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmittingOnboarding = false;
        this.onboardingError = this.#auth.getErrorMessage(error, "Impossible d'enregistrer cette étape.");
        this.#cdr.markForCheck();
      }
    });
  }

  trackByAccount(_: number, item: AdminDashboardSuspendedAccountItem): string {
    return item.account_identifier;
  }

  trackByCompany(_: number, item: AdminDashboardCompanyItem): string {
    return item.company_identifier;
  }

  trackByOffer(_: number, item: AdminDashboardOfferItem): string {
    return item.offer_identifier;
  }

  trackByReport(_: number, item: AdminDashboardReportItem): string {
    return item.report_identifier;
  }

  trackByActivity(_: number, item: AdminDashboardActivityItem): string {
    return `${item.source_kind}-${item.reference_identifier}-${item.occurred_at}`;
  }

  trackByAudit(_: number, item: AdminDashboardAuditLog): number {
    return item.id;
  }

  formatActivitySummary(item: AdminDashboardActivityItem): string {
    if (item.source_kind === 'AUTH_AUDIT') {
      const [emailPart] = item.summary.split(' - ');
      return `${emailPart} - ${this.translateAuthEvent(item.event_type)}`;
    }

    if (item.source_kind === 'COMPANY_PROFILE_AUDIT') {
      return this.translateCompanyActivity(item.summary, item.event_type);
    }

    return item.summary;
  }

  formatActivitySource(sourceKind: string): string {
    return this.labels.sourceKind(sourceKind);
  }

  formatActivityActor(actorAccountIdentifier: string | null): string {
    return actorAccountIdentifier || 'Système';
  }

  openValidationCompany(companyIdentifier: string): void {
    void this.#router.navigate(['/dashboard/admin/validations'], {
      queryParams: { company: companyIdentifier }
    });
  }

  openReport(reportIdentifier: string): void {
    void this.#router.navigate(['/dashboard/admin/reports'], {
      queryParams: { report: reportIdentifier }
    });
  }

  openOffer(offerIdentifier: string): void {
    void this.#router.navigate(['/dashboard/admin/offres'], {
      queryParams: { offer: offerIdentifier }
    });
  }

  openAccount(accountIdentifier: string): void {
    void this.#router.navigate(['/dashboard/admin/utilisateurs', accountIdentifier]);
  }

  private loadOnboarding(): void {
    this.isLoadingOnboarding = true;
    this.#auth.getMyOnboarding()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (onboarding) => {
          this.onboarding = onboarding;
          this.seedCurrentStepFields();
          this.isLoadingOnboarding = false;
          this.#cdr.markForCheck();
        },
        error: (error) => {
          this.onboardingError = this.#auth.getErrorMessage(error, "Impossible de charger l'avancement de l'inscription.");
          this.isLoadingOnboarding = false;
          this.#cdr.markForCheck();
        }
      });
  }

  private loadAdminDashboard(): void {
    this.isLoadingAdmin = true;
    this.adminError = '';
    this.adminChartsViewModel = null;
    this.companiesToVerifySnapshot = [];
    this.openReportsSnapshot = [];
    this.suspendedOffersSnapshot = [];
    this.suspendedAccountsSnapshot = [];
    this.recentActivitySnapshot = [];

    forkJoin({
      dashboard: this.#adminDashboardService.getDashboard(5, 5),
      metrics: this.#adminDashboardService.getMetrics(),
      auditLogs: this.#adminDashboardService.listAudit()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ dashboard, metrics, auditLogs }) => {
          this.adminDashboard = dashboard;
          this.adminMetrics = metrics;
          this.companiesToVerifySnapshot = dashboard.companies_to_verify.items.slice(0, 5);
          this.openReportsSnapshot = dashboard.open_reports.items.slice(0, 5);
          this.suspendedOffersSnapshot = dashboard.suspended_offers.items.slice(0, 5);
          this.suspendedAccountsSnapshot = dashboard.suspended_accounts.items.slice(0, 5);
          this.recentActivitySnapshot = dashboard.recent_activity.items.slice(0, 5);
          this.adminStatsSnapshot = [
            {
              label: 'Entreprises à vérifier',
              value: metrics.summary.companies_pending_verification,
              icon: 'cilCheckCircle',
              color: '#f7941e',
              route: '/dashboard/admin/validations'
            },
            {
              label: 'Signalements ouverts',
              value: metrics.summary.open_reports,
              icon: 'cilWarning',
              color: '#dc3545',
              route: '/dashboard/admin/reports'
            },
            {
              label: 'Comptes suspendus',
              value: metrics.summary.suspended_accounts,
              icon: 'cilPeople',
              color: '#004a99',
              route: '/dashboard/admin/utilisateurs'
            },
            {
              label: 'Offres suspendues',
              value: metrics.summary.suspended_offers,
              icon: 'cilBriefcase',
              color: '#198754',
              route: '/dashboard/admin/offres'
            }
          ];
          this.adminOverviewChartData = {
            labels: metrics.overview.labels,
            datasets: [
              {
                label: 'Volume',
                backgroundColor: ['#f7941e', '#dc3545', '#004a99', '#198754'],
                borderRadius: 8,
                data: metrics.overview.values
              }
            ]
          };
          this.adminDistributionChartData = {
            labels: metrics.distribution.labels,
            datasets: [
              {
                backgroundColor: ['#f7941e', '#dc3545', '#004a99', '#198754'],
                borderWidth: 0,
                data: metrics.distribution.values
              }
            ]
          };
          this.adminAuditLogs = auditLogs;
          this.refreshAdminChartOptions();
          this.adminChartsViewModel = {
            overviewData: this.adminOverviewChartData,
            overviewOptions: this.adminOverviewChartOptions,
            distributionData: this.adminDistributionChartData,
            distributionOptions: this.adminDistributionChartOptions
          };
          this.isLoadingAdmin = false;
          this.#cdr.markForCheck();
        },
        error: (error) => {
          this.adminError = this.#auth.getErrorMessage(error, 'Impossible de charger le dashboard administrateur.');
          this.isLoadingAdmin = false;
          this.adminChartsViewModel = null;
          this.adminAuditLogs = [];
          this.#cdr.markForCheck();
        }
      });
  }

  private seedCurrentStepFields(): void {
    const step = this.currentOnboardingStep;
    if (!step) {
      this.onboardingFormValues = {};
      return;
    }

    this.onboardingFormValues = step.required_fields.reduce<Record<string, string>>((acc, field) => {
      const value = step.field_values[field];
      acc[field] = Array.isArray(value) ? value.join(', ') : String(value ?? '');
      return acc;
    }, {});
  }

  private refreshAdminChartOptions(): void {
    this.adminOverviewChartOptions = this.buildChartOptions();
    this.adminDistributionChartOptions = this.buildDoughnutOptions();
  }

  private translateAuthEvent(eventType: string): string {
    const translations: Record<string, string> = {
      'LOGIN': 'Connexion',
      'LOGIN_SUCCEEDED': 'Connexion réussie',
      'LOGOUT': 'Déconnexion',
      'LOGOUT_SUCCEEDED': 'Déconnexion réussie',
      'LOGIN_FAILED': 'Échec de connexion',
      'ACCOUNT_CREATED': 'Compte créé',
      'PASSWORD_RESET': 'Mot de passe réinitialisé',
      'AUTHORIZATION_DENIED': 'Accès refusé (Autorisation)'
    };
    return translations[eventType] || eventType;
  }

  getActivityIcon(item: AdminDashboardActivityItem): string {
    if (item.source_kind === 'AUTH_AUDIT') {
      switch (item.event_type) {
        case 'LOGIN':
        case 'LOGIN_SUCCEEDED': return 'cilUser';
        case 'LOGOUT': return 'cilAccountLogout';
        case 'LOGIN_FAILED': return 'cilWarning';
        case 'ACCOUNT_CREATED': return 'cilUserPlus';
        case 'PASSWORD_RESET': return 'cilLockLocked';
        default: return 'cilHistory';
      }
    }
    if (item.source_kind === 'COMPANY_PROFILE_AUDIT') {
      return 'cilInstitution';
    }
    return 'cilBell';
  }

  getAvatarForActivity(item: AdminDashboardActivityItem): string {
    return this.#auth.getAvatarUrl(item.actor_account_identifier || item.reference_identifier || 'SC');
  }

  private translateCompanyActivity(summary: string, eventType: string): string {
    return `${summary} (${eventType})`;
  }
}
