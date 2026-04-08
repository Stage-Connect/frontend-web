import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { OffersService, OfferResponse, CloseStageOfferResponse } from '../../../services/offers.service';
import { AuthService } from '../../../services/auth.service';
import { CompanyUsersService } from '../../../services/company-users.service';
import { backendLabels } from '../../../core/backend-labels';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    BadgeComponent,
    AlertComponent
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="d-flex justify-content-between align-items-center py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold" [class.text-white]="isDark()">Mes Offres de Stage</h5>
            <button cButton color="primary" routerLink="nouveau" class="d-flex align-items-center shadow-sm">
              <svg cIcon name="cilPlus" class="me-2"></svg>
              Publier une offre
            </button>
          </c-card-header>
          <c-card-body class="p-0">
            <div class="px-4 pt-4">
              <c-row class="g-3">
                <c-col md="6">
                  <div class="rounded-4 p-3 h-100 d-flex align-items-center justify-content-between"
                    [style.backgroundColor]="isDark() ? 'rgba(0,74,153,0.12)' : 'rgba(0,74,153,0.06)'">
                    <div>
                      <div class="small text-uppercase opacity-75" [class.text-white]="isDark()">Utilisateurs de l'entreprise</div>
                      <div class="fw-bold" [class.text-white]="isDark()" style="font-size: 1.6rem;">{{ companyUsersCount }}</div>
                    </div>
                    <svg cIcon name="cilPeople" height="28" [style.color]="'#004a99'"></svg>
                  </div>
                </c-col>
                <c-col md="6">
                  <div class="rounded-4 p-3 h-100 d-flex align-items-center justify-content-between"
                    [style.backgroundColor]="isDark() ? 'rgba(46,184,92,0.12)' : 'rgba(46,184,92,0.08)'">
                    <div>
                      <div class="small text-uppercase opacity-75" [class.text-white]="isDark()">Offres soumises</div>
                      <div class="fw-bold" [class.text-white]="isDark()" style="font-size: 1.6rem;">{{ offersCount }}</div>
                    </div>
                    <svg cIcon name="cilBriefcase" height="28" [style.color]="'#2eb85c'"></svg>
                  </div>
                </c-col>
              </c-row>
            </div>

            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm m-4">{{ errorMessage }}</c-alert>
            }

            @if (isLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des offres...</span>
              </div>
            } @else if (!offres.length) {
              <div class="text-center py-5 opacity-75">
                <p class="mb-3">Vous n'avez pas encore publié d'offres de stage.</p>
                <button cButton color="primary" routerLink="nouveau" class="shadow-sm">
                  <svg cIcon name="cilPlus" class="me-2"></svg>
                  Publier ma première offre
                </button>
              </div>
            } @else {
              <div class="table-responsive">
                <table [hover]="true" cTable class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr [class.text-white]="isDark()" [class.opacity-75]="isDark()">
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Titre de l'offre</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Domaine</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Localisation</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Publication</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Statut</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase text-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let offre of offres" [class.text-white]="isDark()">
                      <td class="py-3 px-4 align-middle fw-semibold border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ offre.title }}</td>
                      <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ labels.sector(offre.sector_code) }}</td>
                      <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ labels.location(offre.location_code) }}</td>
                      <td class="py-3 px-4 align-middle small border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ offre.created_at | date:'dd/MM/yyyy' }}</td>
                      <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <c-badge [color]="getStatusColor(offre.status_code)" 
                                 shape="rounded-pill" 
                                 class="px-3 py-2">
                          {{ labels.offerStatus(offre.status_code) }}
                        </c-badge>
                      </td>
                      <td class="py-3 px-4 align-middle text-center border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <div class="d-flex justify-content-center gap-2">
                          <button cButton variant="ghost" [color]="isDark() ? 'info' : 'primary'" size="sm" class="rounded-pill p-2" [routerLink]="[offre.offer_identifier]" title="Voir détails">
                            <svg cIcon name="cilFindInPage" size="sm"></svg>
                          </button>
                          <button cButton variant="ghost" [color]="isDark() ? 'info' : 'primary'" size="sm" class="rounded-pill p-2" [routerLink]="['modifier', offre.offer_identifier]" title="Modifier">
                            <svg cIcon name="cilPencil" size="sm"></svg>
                          </button>
                          @if (offre.status_code === 'ACTIVE' || offre.status_code === 'DRAFT') {
                            <button cButton variant="ghost" color="danger" size="sm" class="rounded-pill p-2" (click)="confirmClose(offre)" title="Fermer l'offre">
                              <svg cIcon name="cilBan" size="sm"></svg>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class OffresComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #offersService = inject(OffersService);
  readonly #companyUsersService = inject(CompanyUsersService);
  readonly #authService = inject(AuthService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  offres: OfferResponse[] = [];
  companyUsersCount = 0;
  offersCount = 0;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      offers: this.#offersService.listMyOffers(),
      users: this.#companyUsersService.listCompanyUsers()
    }).subscribe({
      next: ({ offers, users }) => {
        this.offres = offers.offers;
        this.offersCount = offers.total ?? offers.offers.length;
        this.companyUsersCount = users.users_count ?? users.users.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = '';
        this.offres = [];
        this.offersCount = 0;
        this.companyUsersCount = 0;
        this.isLoading = false;
        console.warn('Impossible de charger les offres ou les utilisateurs depuis le backend:', error);
      }
    });
  }

  getStatusColor(statusCode: string): string {
    const statusColors: Record<string, string> = {
      'ACTIVE': 'success',
      'DRAFT': 'warning',
      'EXPIRED': 'secondary',
      'SUSPENDED': 'danger',
      'CLOSED': 'info'
    };
    return statusColors[statusCode] || 'secondary';
  }

  confirmClose(offre: OfferResponse): void {
    void Swal.fire({
      title: 'Fermer cette offre ?',
      text: `Êtes-vous sûr de vouloir fermer l'offre "${offre.title}" ? Les candidatures existantes resteront accessibles.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: "Fermer l'offre",
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.closeOffer(offre);
      }
    });
  }

  private closeOffer(offre: OfferResponse): void {
    this.#offersService.closeOffer(offre.offer_identifier).subscribe({
      next: (response: CloseStageOfferResponse) => {
        const idx = this.offres.findIndex(o => o.offer_identifier === offre.offer_identifier);
        if (idx !== -1) {
          this.offres[idx] = response.offer;
          this.offres = [...this.offres];
        }
        void Swal.fire({
          title: 'Offre fermée',
          text: "L'offre a été fermée avec succès.",
          icon: 'success',
          confirmButtonColor: '#004a99'
        });
      },
      error: () => {
        void Swal.fire({
          title: 'Erreur',
          text: 'Impossible de fermer cette offre.',
          icon: 'error',
          confirmButtonColor: '#004a99'
        });
      }
    });
  }
}