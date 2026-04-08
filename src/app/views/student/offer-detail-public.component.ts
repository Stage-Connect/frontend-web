import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  ColorModeService,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { OffersService, OfferDetailResponse } from '../../services/offers.service';
import { ApplicationsService, ApplicationPreconditionResponse } from '../../services/applications.service';
import { AuthService } from '../../services/auth.service';
import { backendLabels } from '../../core/backend-labels';

@Component({
  selector: 'app-offer-detail-public',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    IconDirective,
    BadgeComponent,
    AlertComponent,
    SpinnerComponent
  ],
  template: `
    <div class="py-4 px-3 px-md-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="min-height:100vh;">

      <div style="max-width:960px; margin:0 auto;">
        <!-- Back button -->
        <div class="d-flex align-items-center gap-3 mb-4">
          <button cButton color="secondary" variant="ghost" class="p-2" (click)="goBack()">
            <svg cIcon name="cilArrowLeft" size="sm"></svg>
          </button>
          <span class="small opacity-75">Retour aux offres</span>
        </div>

        @if (errorMessage) {
          <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
        }

        @if (isLoading) {
          <div class="d-flex justify-content-center py-5">
            <c-spinner color="primary"></c-spinner>
          </div>
        } @else if (offerDetail) {
          <c-row class="g-4">
            <!-- Main content -->
            <c-col lg="8">
              <c-card class="border-0 shadow-sm mb-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius:0.75rem;">
                <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                  <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <h4 class="fw-bold mb-1" [class.text-white]="isDark()">{{ offerDetail.offer.title }}</h4>
                      @if (offerDetail.company_name) {
                        <p class="small opacity-75 mb-0">{{ offerDetail.company_name }}</p>
                      }
                    </div>
                    <c-badge [color]="getStatusColor(offerDetail.offer.status_code)" shape="rounded-pill" class="px-3 py-2">
                      {{ labels.offerStatus(offerDetail.offer.status_code) }}
                    </c-badge>
                  </div>
                </c-card-header>
                <c-card-body class="p-4">
                  <div class="d-flex flex-wrap gap-2 mb-4">
                    <c-badge color="primary" shape="rounded-pill">{{ labels.sector(offerDetail.offer.sector_code) }}</c-badge>
                    <c-badge color="secondary" shape="rounded-pill">
                      <svg cIcon name="cilLocationPin" size="sm" class="me-1"></svg>
                      {{ labels.location(offerDetail.offer.location_code) }}
                    </c-badge>
                    <c-badge color="info" shape="rounded-pill">{{ labels.internshipType(offerDetail.offer.internship_type_code) }}</c-badge>
                  </div>

                  <h6 class="fw-bold mb-2 text-uppercase small opacity-75">Description du poste</h6>
                  <p style="white-space:pre-wrap; line-height:1.7;">{{ offerDetail.offer.description }}</p>

                  @if (offerDetail.requirements.length) {
                    <hr [class.border-white]="isDark()" [class.border-opacity-10]="isDark()" />
                    <h6 class="fw-bold mb-3 text-uppercase small opacity-75">Compétences requises</h6>
                    <div class="d-flex flex-wrap gap-2">
                      @for (req of offerDetail.requirements; track req.competence_code) {
                        <span class="badge rounded-pill px-3 py-2 bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                          {{ req.competence_code }} · {{ req.expected_level_code }}
                        </span>
                      }
                    </div>
                  }
                </c-card-body>
              </c-card>
            </c-col>

            <!-- Sidebar: Apply -->
            <c-col lg="4">
              <c-card class="border-0 shadow-sm sticky-top mb-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius:0.75rem; top:80px;">
                <c-card-body class="p-4">
                  @if (!isAuthenticated) {
                    <p class="small opacity-75 mb-3">Connectez-vous pour postuler à cette offre.</p>
                    <button cButton color="primary" class="w-100 mb-2 shadow-sm" routerLink="/login">
                      Se connecter
                    </button>
                    <p class="small opacity-75 mb-2">
                      Inscription étudiant disponible sur l'application mobile.
                    </p>
                    <button cButton color="secondary" variant="outline" class="w-100" routerLink="/home">
                      Voir l'application
                    </button>
                  } @else if (isStudent) {
                    @if (applySuccess) {
                      <div class="alert alert-success border-0 small py-2 mb-3">
                        <svg cIcon name="cilCheck" size="sm" class="me-1"></svg>
                        Candidature envoyée avec succès !
                      </div>
                    } @else {
                      @if (applyError) {
                        <div class="alert alert-danger border-0 small py-2 mb-3">{{ applyError }}</div>
                      }

                      @if (preconditions) {
                        @if (!preconditions.is_eligible) {
                          <div class="mb-3">
                            <p class="small fw-bold text-danger mb-2">Conditions non remplies :</p>
                            @for (reason of preconditions.blocking_reasons; track reason) {
                              <div class="small text-danger d-flex align-items-start gap-1 mb-1">
                                <svg cIcon name="cilX" size="sm" class="flex-shrink-0 mt-1"></svg>
                                {{ reason }}
                              </div>
                            }
                          </div>
                        }
                      }

                      <button cButton color="success" class="w-100 shadow-sm fw-bold py-2"
                              [disabled]="isApplying || (preconditions !== null && !preconditions.is_eligible) || offerDetail.offer.status_code !== 'ACTIVE'"
                              (click)="apply()">
                        <svg cIcon name="cilSend" class="me-2"></svg>
                        {{ isApplying ? 'Envoi...' : 'Postuler à cette offre' }}
                      </button>

                      @if (offerDetail.offer.status_code !== 'ACTIVE') {
                        <p class="small text-center opacity-75 mt-2">Cette offre n'accepte plus de candidatures.</p>
                      }
                    }
                  } @else {
                    <p class="small opacity-75">Cette section est réservée aux étudiants.</p>
                  }
                </c-card-body>
              </c-card>

              <!-- Info card -->
              <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius:0.75rem;">
                <c-card-body class="p-4">
                  <h6 class="fw-bold mb-3 text-uppercase small opacity-75">Informations</h6>
                  @if (offerDetail.company_name) {
                    <div class="mb-2">
                      <div class="small opacity-50">Entreprise</div>
                      <div class="fw-semibold">{{ offerDetail.company_name }}</div>
                    </div>
                  }
                  <div class="mb-2">
                    <div class="small opacity-50">Publié le</div>
                    <div class="fw-semibold">{{ offerDetail.offer.created_at | date:'dd MMMM yyyy':'':'fr' }}</div>
                  </div>
                  <div>
                    <div class="small opacity-50">Mis à jour</div>
                    <div class="fw-semibold">{{ offerDetail.offer.updated_at | date:'dd MMMM yyyy':'':'fr' }}</div>
                  </div>
                </c-card-body>
              </c-card>
            </c-col>
          </c-row>
        }
      </div>
    </div>
  `
})
export class OfferDetailPublicComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #offersService = inject(OffersService);
  readonly #applicationsService = inject(ApplicationsService);
  readonly #authService = inject(AuthService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  offerDetail: OfferDetailResponse | null = null;
  preconditions: ApplicationPreconditionResponse | null = null;
  isLoading = true;
  isApplying = false;
  applySuccess = false;
  errorMessage = '';
  applyError = '';

  get isAuthenticated(): boolean {
    return this.#authService.isAuthenticated();
  }

  get isStudent(): boolean {
    return this.#authService.getUserRole() === 'student';
  }

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOffer(id);
    } else {
      this.errorMessage = "Identifiant de l'offre non trouvé.";
      this.isLoading = false;
    }
  }

  private loadOffer(id: string): void {
    this.#offersService.getOfferDetail(id).subscribe({
      next: (response) => {
        this.offerDetail = response;
        this.isLoading = false;
        this.#cdr.markForCheck();
        if (this.isStudent && response.offer.status_code === 'ACTIVE') {
          this.checkPreconditions(id);
        }
      },
      error: (err) => {
        this.errorMessage = this.#authService.getErrorMessage(err, "Impossible de charger les détails de cette offre.");
        this.isLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  private checkPreconditions(offerId: string): void {
    this.#applicationsService.checkPreconditions(offerId).subscribe({
      next: (p) => {
        this.preconditions = p;
        this.#cdr.markForCheck();
      },
      error: () => { /* non-bloquant */ }
    });
  }

  apply(): void {
    if (!this.offerDetail) return;
    this.isApplying = true;
    this.applyError = '';

    this.#applicationsService.initiateApplication({
      offer_identifier: this.offerDetail.offer.offer_identifier
    }).subscribe({
      next: () => {
        this.isApplying = false;
        this.applySuccess = true;
        this.#cdr.markForCheck();
      },
      error: (err) => {
        this.isApplying = false;
        this.applyError = this.#authService.getErrorMessage(err, "Impossible d'envoyer la candidature.");
        this.#cdr.markForCheck();
      }
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.#router.navigate(['/recherche']);
    }
  }

  getStatusColor(statusCode: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'success', 'DRAFT': 'warning', 'CLOSED': 'info', 'SUSPENDED': 'danger'
    };
    return map[statusCode] || 'secondary';
  }
}
