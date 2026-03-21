import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ColorModeService,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';

import { AlertService } from '../../../services/alert.service';
import { AdminOfferState, AdminOffersService } from '../../../services/admin-offers.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    AlertComponent,
    BadgeComponent,
    FormDirective,
    FormControlDirective,
    InputGroupComponent,
    ButtonDirective,
    TableDirective
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center"
            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Toutes les offres</h5>
            <c-badge color="primary" shape="rounded-pill">{{ totalOffers }}</c-badge>
          </c-card-header>
          <c-card-body class="p-0">
             @if (isLoadingList) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des offres...</span>
              </div>
            } @else if (!offers.length) {
              <div class="text-center py-5 opacity-75">Aucune offre trouvée dans le système.</div>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" [class.table-dark]="isDark()" class="mb-0">
                  <thead>
                    <tr>
                      <th class="border-0 px-4 py-3 small text-uppercase opacity-75">Identifiant</th>
                      <th class="border-0 px-4 py-3 small text-uppercase opacity-75">Titre</th>
                      <th class="border-0 px-4 py-3 small text-uppercase opacity-75">Compagnie</th>
                      <th class="border-0 px-4 py-3 small text-uppercase opacity-75">Statut</th>
                      <th class="border-0 px-4 py-3 small text-uppercase opacity-75 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of offers; track item.offer_identifier) {
                      <tr [class.table-active]="offer?.offer_identifier === item.offer_identifier">
                        <td class="px-4 py-3 align-middle fw-semibold">{{ item.offer_identifier }}</td>
                        <td class="px-4 py-3 align-middle">{{ item.title }}</td>
                        <td class="px-4 py-3 align-middle">{{ item.company_identifier || 'N/A' }}</td>
                        <td class="px-4 py-3 align-middle">
                          <c-badge [color]="item.suspension ? 'danger' : 'success'" shape="rounded-pill">
                            {{ item.suspension ? 'Suspendue' : 'Active' }}
                          </c-badge>
                        </td>
                        <td class="px-4 py-3 align-middle text-center">
                          <button cButton variant="ghost" color="primary" size="sm" (click)="selectOffer(item.offer_identifier)">
                            Gérer
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <c-row>
      <c-col xs="12" lg="5">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Recherche ciblée</h5>
          </c-card-header>
          <c-card-body class="p-4">
            <form cForm (ngSubmit)="lookupOffer()">
              <div class="mb-3">
                <label class="form-label small fw-bold text-uppercase opacity-75">Identifiant de l'offre</label>
                <c-input-group>
                  <input cFormControl name="offerIdentifier" [(ngModel)]="offerIdentifier" placeholder="Ex: OFF-2025-0001" />
                  <button cButton type="submit" color="primary" [disabled]="!offerIdentifier.trim() || isLoading">
                    {{ isLoading ? 'Recherche...' : 'Rechercher' }}
                  </button>
                </c-input-group>
              </div>
            </form>

            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-0">{{ errorMessage }}</c-alert>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <c-col xs="12" lg="7" id="offer-detail">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Détails de modération</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (isLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement de l’offre...</span>
              </div>
            } @else if (offer) {
              <div class="mb-4">
                <h4 class="mb-1 fw-bold">{{ offer.title }}</h4>
                <div class="small opacity-75">{{ offer.offer_identifier }} · {{ offer.company_identifier || 'Entreprise inconnue' }}</div>
              </div>

              <div class="d-flex gap-2 flex-wrap mb-4">
                <c-badge [color]="offer.suspension ? 'danger' : 'success'" shape="rounded-pill">
                  {{ offer.suspension ? 'Suspendue' : 'Active' }}
                </c-badge>
                <c-badge color="info" shape="rounded-pill">
                  {{ labels.status(offer.status_code) }}
                </c-badge>
                <c-badge [color]="offer.is_public ? 'primary' : 'secondary'" shape="rounded-pill">
                  {{ offer.is_public ? 'Publique' : 'Privée' }}
                </c-badge>
              </div>

              @if (offer.suspension) {
                <c-alert color="warning" class="border-0 shadow-sm mb-4">
                  <strong>Offre suspendue</strong><br/>
                  Motif: {{ labels.reasonCode(offer.suspension.reason_code) }}<br/>
                  Détails: {{ offer.suspension.reason_details }}
                </c-alert>
              }

              <form cForm (ngSubmit)="suspendOffer()">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase opacity-75">Code du motif</label>
                  <input cFormControl name="reasonCode" [(ngModel)]="reasonCode" placeholder="Ex: POLICY_VIOLATION" />
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase opacity-75">Détails du motif</label>
                  <textarea cFormControl name="reasonDetails" rows="3" [(ngModel)]="reasonDetails"
                    placeholder="Décris pourquoi cette offre doit être modérée"></textarea>
                </div>
                <button cButton type="submit" color="danger"
                  [disabled]="!offer || !!offer.suspension || !reasonCode.trim() || reasonDetails.trim().length < 5 || isSuspending">
                  {{ isSuspending ? 'Action en cours...' : 'Suspendre l’offre' }}
                </button>
              </form>
            } @else {
              <div class="text-center py-5 opacity-75">Sélectionne ou recherche une offre pour agir.</div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class AdminOffersComponent implements OnInit {
  public offerIdentifier = '';
  public offer: AdminOfferState | null = null;
  public offers: AdminOfferState[] = [];
  public totalOffers = 0;
  public errorMessage = '';
  public reasonCode = '';
  public reasonDetails = '';
  public isLoading = false;
  public isLoadingList = false;
  public isSuspending = false;

  public readonly labels = backendLabels;
  private readonly colorModeService = inject(ColorModeService);
  private readonly offersService = inject(AdminOffersService);
  private readonly authService = inject(AuthService);
  private readonly alerts = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  
  public readonly colorMode = this.colorModeService.colorMode;
  public readonly isDark = computed(() => this.colorMode() === 'dark');

  ngOnInit(): void {
    this.loadOffers();
    this.route.queryParamMap.subscribe((params) => {
      const offerIdentifier = params.get('offer');
      if (offerIdentifier) {
        this.offerIdentifier = offerIdentifier;
        queueMicrotask(() => this.loadOfferState(offerIdentifier));
      }
    });
  }

  public loadOffers(): void {
    this.isLoadingList = true;
    this.offersService.listOffers(1, 10).subscribe({
      next: (response) => {
        this.offers = response.items;
        this.totalOffers = response.total;
        this.isLoadingList = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingList = false;
        this.cdr.markForCheck();
      }
    });
  }

  public selectOffer(identifier: string): void {
    this.offerIdentifier = identifier;
    this.lookupOffer();
    
    setTimeout(() => {
      document.getElementById('offer-detail')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  public lookupOffer(): void {
    const identifier = this.offerIdentifier.trim().toUpperCase();
    if (!identifier) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { offer: identifier },
      queryParamsHandling: 'merge'
    });
  }

  private loadOfferState(identifier: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.offersService.getOfferState(identifier).subscribe({
      next: (offer) => {
        this.offer = offer;
        this.reasonCode = '';
        this.reasonDetails = '';
        this.errorMessage = '';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.offer = null;
        this.errorMessage = this.authService.getErrorMessage(error, 'Impossible de récupérer cette offre.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  public suspendOffer(): void {
    if (!this.offer) {
      return;
    }

    this.isSuspending = true;
    this.offersService.suspendOffer(this.offer.offer_identifier, {
      reason_code: this.reasonCode.trim(),
      reason_details: this.reasonDetails.trim()
    }).subscribe({
      next: async (offer) => {
        this.offer = offer;
        this.isSuspending = false;
        this.cdr.markForCheck();
        await this.alerts.success('Offre suspendue', 'La suspension de l’offre a été enregistrée.');
      },
      error: async (error) => {
        this.errorMessage = this.authService.getErrorMessage(error, 'Impossible de suspendre cette offre.');
        this.isSuspending = false;
        this.cdr.markForCheck();
        await this.alerts.error('Suspension impossible', this.errorMessage);
      }
    });
  }
}
