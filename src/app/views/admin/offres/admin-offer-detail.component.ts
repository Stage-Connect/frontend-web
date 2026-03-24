import { ChangeDetectorRef, Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, combineLatest, distinctUntilChanged, map, takeUntil } from 'rxjs';
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
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AdminOffersService, AdminOfferState } from '../../../services/admin-offers.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-admin-offer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    BadgeComponent,
    AlertComponent,
    ButtonDirective,
    IconDirective,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <div class="d-flex align-items-center gap-3 mb-3">
          <button cButton color="secondary" variant="ghost" routerLink=".." class="p-2 rounded-pill">
            <svg cIcon name="cilArrowLeft" size="sm"></svg>
          </button>
          <div>
            <h4 class="mb-0 fw-bold" [class.text-white]="isDark()">Détails de l'offre</h4>
            <div class="small opacity-75" [class.text-white]="isDark()">Vue de modération et de suspension</div>
          </div>
        </div>
      </c-col>
    </c-row>

    @if (errorMessage) {
      <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
    }

    @if (isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
            <span class="spinner-border spinner-border-sm"></span>
            <span>Chargement des détails...</span>
          </div>
        </c-col>
      </c-row>
    } @else if (!offer) {
      <c-row>
        <c-col xs="12">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.75rem;">
            <c-card-body class="p-5 text-center">
              <div class="mb-3">
                <span class="badge rounded-pill px-3 py-2" [style.backgroundColor]="isDark() ? 'rgba(220,53,69,0.18)' : 'rgba(220,53,69,0.12)'" style="color: #dc3545;">
                  Chargement impossible
                </span>
              </div>
              <h5 class="fw-bold mb-2">Impossible de charger les détails de l'offre</h5>
              <p class="opacity-75 mb-4">La page n'a pas pu récupérer l'offre demandée depuis le backend.</p>
              <div class="d-flex justify-content-center gap-2">
                <button cButton color="primary" type="button" (click)="reload()">Réessayer</button>
                <button cButton color="secondary" variant="outline" routerLink="..">Retour à la liste</button>
              </div>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (offer) {
      <c-row>
        <c-col lg="8">
          <c-card class="mb-4 border-0 shadow-sm overflow-hidden" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.75rem;">
            <c-card-header class="py-4 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <div class="small text-uppercase opacity-50 mb-1">Offre</div>
                  <h5 class="mb-1 fw-bold">{{ offer.title }}</h5>
                  <div class="small opacity-75 text-break">{{ offer.offer_identifier }}</div>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <c-badge [color]="offer.suspension ? 'danger' : 'success'" shape="rounded-pill" class="px-3 py-2">
                    {{ offer.suspension ? 'Suspendue' : 'Active' }}
                  </c-badge>
                  <c-badge [color]="offer.is_public ? 'primary' : 'secondary'" shape="rounded-pill" class="px-3 py-2">
                    {{ offer.is_public ? 'Publique' : 'Privée' }}
                  </c-badge>
                  <c-badge color="info" shape="rounded-pill" class="px-3 py-2">
                    {{ labels.status(offer.status_code) }}
                  </c-badge>
                </div>
              </div>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="rounded-4 p-4 mb-4" [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.03)' : 'rgba(0,74,153,0.04)'">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <div class="small text-uppercase opacity-50 mb-1">Dernière modification</div>
                    <div class="fw-semibold">{{ offer.updated_at | date:'dd/MM/yyyy HH:mm' }}</div>
                  </div>
                  <div>
                    <div class="small text-uppercase opacity-50 mb-1 text-center">Statut actuel</div>
                    <div class="d-flex gap-2 flex-wrap">
                      <c-badge [color]="offer.suspension ? 'danger' : 'success'" shape="rounded-pill">
                        {{ offer.suspension ? 'Suspendue' : 'Active' }}
                      </c-badge>
                      <c-badge [color]="offer.is_public ? 'primary' : 'secondary'" shape="rounded-pill">
                        {{ offer.is_public ? 'Publique' : 'Privée' }}
                      </c-badge>
                    </div>
                  </div>
                </div>

                <c-row class="g-4">
                  <c-col md="6">
                    <div class="small text-uppercase opacity-50 mb-1">Identifiant de l'offre</div>
                    <div class="fw-semibold text-break">{{ offer.offer_identifier }}</div>
                  </c-col>
                  <c-col md="6">
                    <div class="small text-uppercase opacity-50 mb-1">Entreprise</div>
                    <div class="fw-semibold">{{ offer.company_name || 'Entreprise inconnue' }}</div>
                    <div class="small opacity-75 text-break">{{ offer.company_identifier || 'Non renseigné' }}</div>
                  </c-col>
                  <c-col md="6">
                    <div class="small text-uppercase opacity-50 mb-1">Visibilité</div>
                    <div class="fw-semibold">{{ offer.is_public ? 'Publique' : 'Privée' }}</div>
                  </c-col>
                  <c-col md="6">
                    <div class="small text-uppercase opacity-50 mb-1">Statut métier</div>
                    <div class="fw-semibold">{{ labels.status(offer.status_code) }}</div>
                  </c-col>
                </c-row>
              </div>

              @if (offer.suspension) {
                <hr [class.border-white]="isDark()" [class.border-opacity-10]="isDark()" class="my-4" />
                <c-alert color="danger" class="border-0 mb-0">
                  <div class="mb-2">
                    <strong>Offre suspendue</strong>
                  </div>
                  <div class="mb-1">
                    <strong>Motif:</strong> {{ labels.reasonCode(offer.suspension.reason_code) }}
                  </div>
                  <div class="mb-1">
                    <strong>Détails:</strong> {{ offer.suspension.reason_details }}
                  </div>
                  <div class="mb-0 small opacity-75">
                    Suspendue le {{ offer.suspension.suspended_at | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </c-alert>
              }
            </c-card-body>
          </c-card>

          @if (!offer.suspension) {
            <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.75rem;">
              <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex align-items-center justify-content-between" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <div>
                  <h5 class="mb-0 fw-bold">Suspendre l'offre</h5>
                  <div class="small opacity-75">Bloc de modération administrateur</div>
                </div>
                <c-badge color="warning" shape="rounded-pill">Action sensible</c-badge>
              </c-card-header>
              <c-card-body class="p-4">
                <form [formGroup]="suspensionForm" (ngSubmit)="onSuspend()">
                  <div class="alert alert-warning border-0 small mb-4 d-flex align-items-center gap-2">
                    <svg cIcon name="cilWarning" class="me-2"></svg>
                    La suspension d'une offre la rend invisible pour les candidats.
                  </div>

                  <div class="mb-3">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Code du motif</label>
                    <select cSelect formControlName="reasonCode"
                            [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                            class="py-2">
                      <option value="">Sélectionnez un motif</option>
                      <option value="POLICY_VIOLATION">Violation de politique</option>
                      <option value="INAPPROPRIATE_CONTENT">Contenu inapproprié</option>
                      <option value="SPAM">Spam</option>
                      <option value="FRAUD_SUSPECTED">Fraude suspectée</option>
                      <option value="ABUSE">Abus</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Détails du motif</label>
                    <textarea cFormControl formControlName="reasonDetails" rows="4" 
                              placeholder="Décrivez pourquoi cette offre doit être suspendue..."
                              [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                              [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
                  </div>

                  <div class="d-flex flex-wrap gap-2">
                    <button cButton color="danger" type="submit" [disabled]="isSubmitting || suspensionForm.invalid" class="px-4 shadow-sm">
                      <svg cIcon name="cilBan" class="me-2"></svg>
                      {{ suspensionButtonLabel }}
                    </button>
                    <button cButton color="secondary" variant="outline" routerLink=".." class="px-4">
                      Annuler
                    </button>
                  </div>
                </form>
              </c-card-body>
            </c-card>
          }
        </c-col>

        <c-col lg="4">
          <c-card class="border-0 shadow-sm mb-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.75rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Résumé rapide</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="rounded-4 p-3 mb-3" [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.03)' : 'rgba(0,74,153,0.05)'">
                <div class="d-flex align-items-center gap-3">
                  <img [src]="companyAvatarUrl" class="rounded-circle shadow-sm flex-shrink-0" 
                       style="width: 64px; height: 64px; object-fit: cover;" 
                       alt="Logo entreprise"
                       (error)="onAvatarError($event)">
                  <div class="min-w-0">
                    <div class="small text-uppercase opacity-50 mb-1">Entreprise</div>
                    <div class="fw-bold text-break">{{ offer.company_name || 'Entreprise inconnue' }}</div>
                    <div class="small opacity-75 text-break">{{ offer.company_identifier || 'Non renseigné' }}</div>
                  </div>
                </div>
              </div>

              <div class="d-grid gap-2">
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="opacity-50">Visibilité</span>
                  <span class="fw-semibold">{{ offer.is_public ? 'Publique' : 'Privée' }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="opacity-50">Statut</span>
                  <span class="fw-semibold">{{ labels.status(offer.status_code) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="opacity-50">Modification</span>
                  <span class="fw-semibold text-end">{{ offer.updated_at | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </c-card-body>
          </c-card>

          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.75rem;">
            <c-card-body class="p-4">
              <div class="d-grid gap-2">
                <button cButton color="primary" [routerLink]="['modifier', offer.offer_identifier]" class="shadow-sm">
                  <svg cIcon name="cilPencil" class="me-2"></svg>
                  Modifier l'offre
                </button>
                <button cButton color="secondary" variant="outline" routerLink=".." class="shadow-sm">
                  Retour aux offres
                </button>
              </div>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (!isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="text-center py-5 opacity-75">
            <p>Aucune offre trouvée.</p>
            <button cButton color="primary" routerLink="..">Retour à la liste</button>
          </div>
        </c-col>
      </c-row>
    }
  `
})
export class AdminOfferDetailComponent implements OnInit, OnDestroy {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #offersService = inject(AdminOffersService);
  readonly #authService = inject(AuthService);
  readonly #alerts = inject(AlertService);
  readonly #route = inject(ActivatedRoute);
  readonly #fb = inject(FormBuilder);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');
  private readonly destroy$ = new Subject<void>();

  offer: AdminOfferState | null = null;
  companyAvatarUrl = 'assets/default.jpeg';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  suspensionForm!: FormGroup;

  get suspensionButtonLabel(): string {
    return this.isSubmitting ? 'Suspension...' : 'Suspendre l\'offre';
  }

  ngOnInit(): void {
    this.suspensionForm = this.#fb.group({
      reasonCode: ['', Validators.required],
      reasonDetails: ['', [Validators.required, Validators.minLength(10)]]
    });

    combineLatest([this.#route.paramMap, this.#route.queryParamMap])
      .pipe(
        map(([paramMap, queryParamMap]) => paramMap.get('identifier') ?? queryParamMap.get('offer')),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((identifier) => {
        if (identifier) {
          this.loadOffer(identifier);
          return;
        }

        this.offer = null;
        this.errorMessage = 'Identifiant de l\'offre non trouvé.';
        this.isLoading = false;
        this.#cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOffer(identifier: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.offer = null;
    this.#cdr.markForCheck();

    this.#offersService.getOfferState(identifier).subscribe({
      next: (offer) => {
        this.offer = offer;
        this.companyAvatarUrl = this.getAvatarUrl();
        this.isLoading = false;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.offer = null;
        this.companyAvatarUrl = 'assets/default.jpeg';
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger cette offre.');
        this.isLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  reload(): void {
    const identifier = this.#route.snapshot.paramMap.get('identifier')
      ?? this.#route.snapshot.queryParamMap.get('offer');
    if (identifier) {
      this.loadOffer(identifier);
    }
  }

  getAvatarUrl(): string {
    return this.#authService.getAvatarUrl(this.offer?.company_identifier || 'OF');
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#6c757d" width="100" height="100" rx="50"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="40">OF</text></svg>');
  }

  onSuspend(): void {
    if (this.suspensionForm.invalid || !this.offer) {
      return;
    }

    this.isSubmitting = true;
    this.#offersService.suspendOffer(this.offer.offer_identifier, {
      reason_code: this.suspensionForm.value.reasonCode,
      reason_details: this.suspensionForm.value.reasonDetails
    }).subscribe({
      next: (offer) => {
        this.offer = offer;
        this.isSubmitting = false;
        void this.#alerts.success('Offre suspendue', 'La suspension de l\'offre a été enregistrée.');
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de suspendre cette offre.');
      }
    });
  }
}
