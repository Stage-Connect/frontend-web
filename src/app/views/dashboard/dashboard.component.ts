import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, OnboardingProfile, User } from '../../services/auth.service';
import { CompanyProfile, CompanyProfileService } from '../../services/company-profile.service';
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
  AvatarComponent,
  ButtonGroupModule
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
import { CompanyUsersService } from '../../services/company-users.service';
import { OffersService } from '../../services/offers.service';
import { forkJoin, Subject, distinctUntilChanged, takeUntil } from 'rxjs';
import { IChartProps } from './dashboard-charts-data';

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
    AlertComponent,
    BadgeComponent,
    AvatarComponent,
    ButtonDirective,
    ButtonGroupModule
  ],
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
  companyProfile: CompanyProfile | null = null;
  isLoadingCompanyProfile = false;
  isLoadingEnterpriseSummary = false;
  enterpriseUsersCount = 0;
  enterpriseOffersCount = 0;
  enterpriseSummaryError = '';

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

  enterpriseProgressChartData: ChartData<'doughnut'> = {
    labels: ['Complété', 'Reste à faire'],
    datasets: [
      {
        backgroundColor: ['#2eb85c', '#f7941e'],
        borderWidth: 0,
        data: [0, 100]
      }
    ]
  };

  enterpriseProgressChartOptions: ChartOptions<'doughnut'> = {};

  public mainChart: IChartProps = { type: 'line' };
  public chartVisible = false;
  public isLoadingChart = true;
  public activityPeriod: 'Day' | 'Month' | 'Year' = 'Month';

  readonly #colorModeService = inject(ColorModeService);
  readonly #adminDashboardService = inject(AdminDashboardService);
  readonly #companyUsersService = inject(CompanyUsersService);
  readonly #offersService = inject(OffersService);
  readonly #companyProfileService = inject(CompanyProfileService);
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

  private buildEnterpriseChartOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            color: this.isDark() ? '#8a99af' : '#64748b',
            usePointStyle: true,
            padding: 14
          }
        }
      }
    };
  }

  ngOnInit(): void {
    this.refreshAdminChartOptions();
    this.mainChart = this.buildActivityChart(this.activityPeriod);
    this.user = this.#auth.getCurrentUser();
    if (this.user?.role === 'student') {
      this.#router.navigate(['/dashboard/student/mes-candidatures']);
      return;
    }
    if (this.user?.role === 'institution') {
      this.#router.navigate(['/dashboard/institution/profil']);
      return;
    }
    this.refreshEnterpriseChartOptions();

    setTimeout(() => {
      this.chartVisible = true;
      this.isLoadingChart = false;
      this.#cdr.markForCheck();
    }, 200);

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
        this.user = user;

        if (user.role === 'student') {
          this.#router.navigate(['/dashboard/student/mes-candidatures']);
          return;
        }
        if (user.role === 'institution') {
          this.#router.navigate(['/dashboard/institution/profil']);
          return;
        }
        if (user.role === 'entreprise' && (roleChanged || !this.onboarding)) {
          this.loadOnboarding();
          this.loadCompanyProfile();
          this.loadEnterpriseSummary();
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
    return `Bienvenue, ${this.user?.name || 'Entreprise'}.`;
  }

  get currentOnboardingStep() {
    return this.onboarding?.steps.find((step) => step.code === this.onboarding?.current_step_code)
      ?? this.onboarding?.steps.find((step) => !step.completed)
      ?? null;
  }

  get currentOnboardingRemainingFields(): string[] {
    const step = this.currentOnboardingStep;
    if (!step) {
      return [];
    }

    return step.required_fields.filter((field) => !this.hasOnboardingFieldValue(step.field_values[field]));
  }

  get enterpriseStats() {
    return [
      { label: 'Progression', value: `${this.enterpriseCompletionRate}%`, icon: 'cilTask' },
      { label: 'Etapes restantes', value: `${this.remainingStepsCount}`, icon: 'cilClock' },
      { label: 'Offres', value: `${this.enterpriseOffersCount}`, icon: 'cilBriefcase' }
    ];
  }

  get adminStats() {
    return this.adminStatsSnapshot;
  }

  get activityPeriodOptions(): Array<'Day' | 'Month' | 'Year'> {
    return ['Day', 'Month', 'Year'];
  }

  get remainingStepsCount(): number {
    return this.onboarding?.steps.filter((step) => !step.completed).length ?? 0;
  }

  get enterpriseCompletionRate(): number {
    if (this.companyProfile) {
      const checks = [
        !!this.companyProfile.company_name.trim(),
        !!this.companyProfile.registration_number.trim(),
        !!this.companyProfile.tax_identifier.trim(),
        this.companyProfile.has_rccm_document
      ];
      return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }

    return Math.max(0, Math.min(100, this.onboarding?.completion_rate ?? 0));
  }

  get isEnterpriseProfileComplete(): boolean {
    return this.enterpriseCompletionRate >= 100;
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

  hasOnboardingFieldValue(value: unknown): boolean {
    if (Array.isArray(value)) {
      return value.some((item) => String(item ?? '').trim().length > 0);
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return value !== null && value !== undefined && String(value).trim().length > 0;
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
    void this.#router.navigate(['/dashboard/admin/validations', companyIdentifier]);
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
          this.refreshEnterpriseChartOptions();
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

  private loadCompanyProfile(): void {
    this.isLoadingCompanyProfile = true;

    this.#companyProfileService.getMyProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.companyProfile = profile;
          this.isLoadingCompanyProfile = false;
          this.refreshEnterpriseChartOptions();
          this.#cdr.markForCheck();
        },
        error: () => {
          this.companyProfile = null;
          this.isLoadingCompanyProfile = false;
          this.refreshEnterpriseChartOptions();
          this.#cdr.markForCheck();
        }
      });
  }

  private loadEnterpriseSummary(): void {
    this.isLoadingEnterpriseSummary = true;
    this.enterpriseSummaryError = '';

    forkJoin({
      users: this.#companyUsersService.listCompanyUsers(),
      offers: this.#offersService.listMyOffers()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ users, offers }) => {
          this.enterpriseUsersCount = users.users_count ?? users.users.length;
          this.enterpriseOffersCount = offers.total ?? offers.offers.length;
          this.isLoadingEnterpriseSummary = false;
          this.refreshEnterpriseChartOptions();
          this.#cdr.markForCheck();
        },
        error: (error) => {
          this.enterpriseSummaryError = this.#auth.getErrorMessage(error, 'Impossible de charger les compteurs de votre entreprise.');
          this.enterpriseUsersCount = 0;
          this.enterpriseOffersCount = 0;
          this.isLoadingEnterpriseSummary = false;
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
      dashboard: this.#adminDashboardService.getDashboard(5, 10),
      metrics: this.#adminDashboardService.getMetrics(),
      auditLogs: this.#adminDashboardService.listAudit(10)
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
          this.mainChart = this.buildActivityChart(this.activityPeriod);
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
    this.mainChart = this.buildActivityChart(this.activityPeriod);
  }

  private refreshEnterpriseChartOptions(): void {
    const completionRate = this.enterpriseCompletionRate;
    this.enterpriseProgressChartData = {
      labels: ['Complété', 'Reste à faire'],
      datasets: [
        {
          backgroundColor: ['#2eb85c', '#f7941e'],
          borderWidth: 0,
          data: [completionRate, 100 - completionRate]
        }
      ]
    };
    this.enterpriseProgressChartOptions = this.buildEnterpriseChartOptions();
  }

  setTrafficPeriod(value: string): void {
    const period = value as 'Day' | 'Month' | 'Year';
    this.activityPeriod = period;
    this.chartVisible = false;
    this.mainChart = this.buildActivityChart(period);
    setTimeout(() => {
      this.chartVisible = true;
      this.#cdr.markForCheck();
    }, 10);
  }

  getChartPeriodLabel(): string {
    switch (this.activityPeriod) {
      case 'Day':
        return '7 derniers jours';
      case 'Year':
        return '5 dernières années';
      case 'Month':
      default:
        return '12 derniers mois';
    }
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

  private buildActivityChart(period: 'Day' | 'Month' | 'Year'): IChartProps {
    const items = this.adminDashboard?.recent_activity.items ?? [];
    const buckets = this.buildActivityBuckets(period);

    for (const item of items) {
      const occurredAt = new Date(item.occurred_at);
      if (Number.isNaN(occurredAt.getTime())) {
        continue;
      }

      const index = this.getBucketIndex(period, occurredAt);
      if (index >= 0) {
        buckets.values[index] += 1;
      }
    }

    return {
      type: 'line',
      period,
      data: {
        labels: buckets.labels,
        datasets: [
          {
            label: 'Activités',
            data: buckets.values,
            borderColor: '#004a99',
            backgroundColor: 'rgba(0, 74, 153, 0.12)',
            pointBackgroundColor: '#004a99',
            pointBorderColor: '#004a99',
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: this.buildActivityChartOptions()
    };
  }

  private buildActivityBuckets(period: 'Day' | 'Month' | 'Year'): { labels: string[]; values: number[] } {
    if (period === 'Day') {
      const labels = this.getRecentDayLabels();
      return { labels, values: new Array(labels.length).fill(0) };
    }

    if (period === 'Year') {
      const labels = this.getRecentYearLabels();
      return { labels, values: new Array(labels.length).fill(0) };
    }

    const labels = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return { labels, values: new Array(labels.length).fill(0) };
  }

  private getBucketIndex(period: 'Day' | 'Month' | 'Year', date: Date): number {
    const now = new Date();
    if (period === 'Day') {
      const labelsByDate = this.getRecentDayLabels(true);
      const key = this.formatDateKey(date);
      return labelsByDate.indexOf(key);
    }

    if (period === 'Year') {
      const labelsByYear = this.getRecentYearLabels(true);
      return labelsByYear.indexOf(String(date.getFullYear()));
    }

    if (date.getFullYear() !== now.getFullYear()) {
      return -1;
    }
    return date.getMonth();
  }

  private buildActivityChartOptions(): ChartOptions {
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

  private getRecentDayLabels(asKey = false): string[] {
    const labels: string[] = [];
    const now = new Date();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - offset);
      labels.push(asKey ? this.formatDateKey(date) : this.formatDayLabel(date));
    }
    return labels;
  }

  private getRecentYearLabels(asKey = false): string[] {
    const labels: string[] = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 4; year <= currentYear; year += 1) {
      labels.push(asKey ? String(year) : String(year));
    }
    return labels;
  }

  private formatDateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  private formatDayLabel(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
