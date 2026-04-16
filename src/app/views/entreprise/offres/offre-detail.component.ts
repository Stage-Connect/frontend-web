import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { OffersService, OfferDetailResponse, StageOfferPublishResponse, CloseStageOfferResponse } from '../../../services/offers.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-offre-detail',
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
    TextColorDirective,
    BadgeComponent,
    AlertComponent
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <div class="d-flex align-items-center gap-3 mb-3">
          <button cButton color="secondary" variant="ghost" routerLink=".." class="p-2">
            <svg cIcon name="cilArrowLeft" size="sm"></svg>
          </button>
          <h4 class="mb-0 fw-bold" [class.text-white]="isDark()">Détails de l'offre</h4>
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
            <span>Chargement des détails de l'offre...</span>
          </div>
        </c-col>
      </c-row>
    } @else if (!offerDetail) {
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
              <p class="opacity-75 mb-4">L'offre demandée n'a pas pu être récupérée depuis le backend.</p>
              <div class="d-flex justify-content-center gap-2">
                <button cButton color="primary" type="button" (click)="reload()">Réessayer</button>
                <button cButton color="secondary" variant="outline" routerLink="..">Retour aux offres</button>
              </div>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (offerDetail) {
      <c-row>
        <c-col lg="8">
              <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
                <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0 fw-bold" [class.text-white]="isDark()">{{ offerDetail.offer.title }}</h5>
                    <c-badge [color]="getStatusColor(offerDetail.offer.status_code)" shape="rounded-pill" class="px-3 py-2">
                  {{ labels.offerStatus(offerDetail.offer.status_code) }}
                </c-badge>
              </div>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="mb-4">
                <h6 class="text-uppercase opacity-50 small mb-2">Description</h6>
                <p class="mb-0" [style.white-space]="'pre-wrap'">{{ offerDetail.offer.description }}</p>
              </div>

              <hr [class.border-white]="isDark()" [class.border-opacity-10]="isDark()" />

              <c-row class="g-4 mt-2">
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Secteur</div>
                  <div class="fw-semibold">{{ labels.sector(offerDetail.offer.sector_code) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Localisation</div>
                  <div class="fw-semibold">{{ labels.location(offerDetail.offer.location_code) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Type de stage</div>
                  <div class="fw-semibold">{{ labels.internshipType(offerDetail.offer.internship_type_code) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Visibilité</div>
                  <div class="fw-semibold">{{ offerDetail.offer.is_public ? 'Publique' : 'Masquée' }}</div>
                </c-col>
              </c-row>
              </c-card-body>
            </c-card>

            @if (offerDetail.requirements.length) {
              <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
                <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                  <h6 class="mb-0 fw-bold" [class.text-white]="isDark()">Compétences requises</h6>
                </c-card-header>
                <c-card-body class="p-4">
                  <div class="d-flex flex-wrap gap-2">
                    @for (requirement of offerDetail.requirements; track requirement.competence_code) {
                      <span class="badge rounded-pill px-3 py-2 bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                        {{ requirement.competence_code }} · {{ requirement.expected_level_code }}
                      </span>
                    }
                  </div>
                </c-card-body>
              </c-card>
            }
          </c-col>

        <c-col lg="4">
          @if (offerDetail.company_name) {
            <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
              <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <h6 class="mb-0 fw-bold" [class.text-white]="isDark()">Entreprise</h6>
              </c-card-header>
              <c-card-body class="p-4">
                <div class="small text-uppercase opacity-50 mb-1">Nom</div>
                <div class="fw-semibold mb-3">{{ offerDetail.company_name }}</div>
              </c-card-body>
            </c-card>
          }

          <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold" [class.text-white]="isDark()">Informations</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="small text-uppercase opacity-50 mb-1">ID Offre</div>
              <div class="fw-semibold mb-3 text-break">{{ offerDetail.offer.offer_identifier }}</div>
              
              <div class="small text-uppercase opacity-50 mb-1">Crée le</div>
              <div class="fw-semibold mb-3">{{ offerDetail.offer.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
              
              <div class="small text-uppercase opacity-50 mb-1">Modifié le</div>
              <div class="fw-semibold">{{ offerDetail.offer.updated_at | date:'dd/MM/yyyy HH:mm' }}</div>
            </c-card-body>
          </c-card>

          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-body class="p-4">
              @if (actionError) {
                <div class="alert alert-danger small py-2 mb-3 border-0">{{ actionError }}</div>
              }
              @if (actionSuccess) {
                <div class="alert alert-success small py-2 mb-3 border-0">{{ actionSuccess }}</div>
              }
              <div class="d-grid gap-2">
                @if (offerDetail.offer.status_code === 'OFF-DRAFT' || offerDetail.offer.status_code === 'DRAFT') {
                  <button cButton type="button" color="success" [disabled]="isActing" (click)="publishOffer()" class="shadow-sm">
                    <svg cIcon name="cilCloudUpload" class="me-2"></svg>
                    {{ isActing ? 'Publication...' : 'Publier l\'offre' }}
                  </button>
                }
                @if (offerDetail.offer.status_code === 'OFF-PUBLISHED' || offerDetail.offer.status_code === 'ACTIVE') {
                  <button cButton type="button" color="warning" [disabled]="isActing" (click)="closeOffer()" class="shadow-sm">
                    <svg cIcon name="cilBan" class="me-2"></svg>
                    {{ isActing ? 'Fermeture...' : 'Fermer l\'offre' }}
                  </button>
                }
                <button cButton color="primary" [routerLink]="['modifier', offerDetail.offer.offer_identifier]" class="shadow-sm">
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
    }
  `
})
export class OffreDetailComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #offersService = inject(OffersService);
  readonly #authService = inject(AuthService);
  readonly #route = inject(ActivatedRoute);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  offerDetail: OfferDetailResponse | null = null;
  isLoading = true;
  isActing = false;
  errorMessage = '';
  actionError = '';
  actionSuccess = '';

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id') ?? this.#route.snapshot.queryParamMap.get('offer');
    if (id) {
      this.loadOfferDetail(id);
    } else {
      this.errorMessage = 'Identifiant de l\'offre non trouvé.';
      this.isLoading = false;
      this.#cdr.markForCheck();
    }
  }

  private loadOfferDetail(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.offerDetail = null;
    this.#cdr.markForCheck();

    this.#offersService.getOfferDetail(id).subscribe({
      next: (response) => {
        this.offerDetail = response;
        this.isLoading = false;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger les détails de cette offre.');
        this.isLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  reload(): void {
    const id = this.#route.snapshot.paramMap.get('id') ?? this.#route.snapshot.queryParamMap.get('offer');
    if (id) {
      this.loadOfferDetail(id);
    }
  }

  publishOffer(): void {
    if (!this.offerDetail) return;
    this.isActing = true;
    this.actionError = '';
    this.actionSuccess = '';
    this.#offersService.publishOffer(this.offerDetail.offer.offer_identifier).subscribe({
      next: (res: StageOfferPublishResponse) => {
        this.offerDetail = { ...this.offerDetail!, offer: res.offer };
        this.actionSuccess = 'Offre publiee avec succes.';
        this.isActing = false;
        this.reload();
        this.#cdr.markForCheck();
      },
      error: (err) => {
        this.actionError = this.#authService.getErrorMessage(err, 'Impossible de publier cette offre.');
        this.isActing = false;
        this.#cdr.markForCheck();
      }
    });
  }

  closeOffer(): void {
    if (!this.offerDetail) return;
    this.isActing = true;
    this.actionError = '';
    this.actionSuccess = '';
    this.#offersService.closeOffer(this.offerDetail.offer.offer_identifier).subscribe({
      next: (res: CloseStageOfferResponse) => {
        this.offerDetail = { ...this.offerDetail!, offer: res.offer };
        this.actionSuccess = 'Offre fermee avec succes.';
        this.isActing = false;
        this.reload();
        this.#cdr.markForCheck();
      },
      error: (err) => {
        this.actionError = this.#authService.getErrorMessage(err, 'Impossible de fermer cette offre.');
        this.isActing = false;
        this.#cdr.markForCheck();
      }
    });
  }

  getStatusColor(statusCode: string): string {
    const statusColors: Record<string, string> = {
      'ACTIVE': 'success',
      'DRAFT': 'warning',
      'EXPIRED': 'secondary',
      'SUSPENDED': 'danger',
      'CLOSED': 'info',
      'OFF-PUBLISHED': 'success',
      'OFF-DRAFT': 'warning',
      'OFF-SUSPENDED': 'danger',
      'OFF-CLOSED': 'info'
    };
    return statusColors[statusCode] || 'secondary';
  }
}
