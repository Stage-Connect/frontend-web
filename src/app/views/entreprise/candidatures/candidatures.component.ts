import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  ColorModeService,
  AvatarComponent,
  FormControlDirective,
  InputGroupComponent,
  FormSelectDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CompanyProfileService } from '../../../services/company-profile.service';
import { ApplicationsService } from '../../../services/applications.service';
import { OffersService } from '../../../services/offers.service';

interface Candidature {
  applicationIdentifier: string;
  candidat: string;
  email: string;
  offre: string;
  offerIdentifier: string;
  dateCandidature: string;
  statut: 'En attente' | 'En revue' | 'Accepté' | 'Refusé';
  avatar: string;
  statusCode: string;
  telephone?: string;
  niveau?: string;
  message?: string;
}

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    BadgeComponent,
    AvatarComponent,
    FormControlDirective,
    InputGroupComponent,
    FormSelectDirective,
    FormsModule
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-body class="p-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div>
                <h4 class="mb-1 fw-bold">Candidatures Reçues</h4>
                <p class="mb-0 opacity-50 small">{{ candidatures.length }} candidature(s) au total</p>
              </div>
              <div class="d-flex gap-2 w-100 w-md-auto">
                <c-input-group>
                  <span class="input-group-text border-0" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()">
                    <svg cIcon name="cilMagnifyingGlass" [class.text-white]="isDark()"></svg>
                  </span>
                  <input cFormControl placeholder="Rechercher..." [(ngModel)]="searchTerm" 
                         class="border-0 py-2" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()" 
                         [class.text-white]="isDark()">
                </c-input-group>
                <select cSelect class="border-0 py-2 w-auto" [(ngModel)]="statusFilter"
                        [class.bg-light]="!isDark()" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">Tous les statuts</option>
                  <option value="En attente">En attente</option>
                  <option value="En revue">En revue</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                </select>
              </div>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <c-row>
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-body class="p-0">
            @if (loadError) {
              <div class="alert alert-danger m-4 mb-0" role="alert">{{ loadError }}</div>
            }
            @if (isLoading) {
              <div class="text-center py-5 opacity-75">Chargement des candidatures…</div>
            }
            @if (!isLoading && !loadError && filteredCandidatures.length === 0) {
              <div class="text-center py-5 opacity-75">
                <svg cIcon name="cilInbox" size="xl" class="mb-3 opacity-25"></svg>
                <p class="mb-0">Aucune candidature ne correspond à vos critères.</p>
              </div>
            } @else if (!isLoading && filteredCandidatures.length > 0) {
              <div class="table-responsive">
                <table [hover]="true" cTable class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr [class.text-white]="isDark()" [class.opacity-75]="isDark()">
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Candidat</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Offre</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Date</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Statut</th>
                      <th class="py-3 px-4 border-bottom small text-uppercase text-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let cand of filteredCandidatures" [class.text-white]="isDark()">
                      <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <div class="d-flex align-items-center">
                          <c-avatar [src]="cand.avatar" class="me-3" size="md"></c-avatar>
                          <div>
                            <span class="fw-semibold">{{ cand.candidat }}</span>
                            <div class="small opacity-50">{{ cand.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <div class="fw-semibold">{{ cand.offre }}</div>
                      </td>
                      <td class="py-3 px-4 align-middle small border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        {{ cand.dateCandidature }}
                      </td>
                      <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <c-badge [color]="getStatusColor(cand.statut)" 
                                 shape="rounded-pill" 
                                 class="px-3 py-2">
                          {{ cand.statut }}
                        </c-badge>
                      </td>
                      <td class="py-3 px-4 align-middle text-center border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <div class="d-flex justify-content-center gap-2">
                          <a [routerLink]="[cand.applicationIdentifier]" cButton variant="ghost" [color]="isDark() ? 'info' : 'primary'" size="sm" 
                                  class="rounded-pill p-2" title="Voir détails">
                            <svg cIcon name="cilFindInPage" size="sm"></svg>
                          </a>
                          @if (cand.statut === 'En attente' || cand.statut === 'En revue') {
                            <button cButton variant="ghost" color="success" size="sm" 
                                    class="rounded-pill p-2" (click)="accepterCandidature(cand)" title="Accepter">
                              <svg cIcon name="cilCheck" size="sm"></svg>
                            </button>
                            <button cButton variant="ghost" color="danger" size="sm" 
                                    class="rounded-pill p-2" (click)="refuserCandidature(cand)" title="Refuser">
                              <svg cIcon name="cilX" size="sm"></svg>
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
export class CandidaturesComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');
  private readonly companyProfileService = inject(CompanyProfileService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly offersService = inject(OffersService);

  searchTerm = '';
  statusFilter = '';
  isLoading = false;
  loadError = '';

  candidatures: Candidature[] = [];

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.companyProfileService.getMyProfile().subscribe({
      next: (profile) => {
        forkJoin({
          dashboard: this.applicationsService.getCompanyDashboard(profile.company_identifier),
          offers: this.offersService.listMyOffers().pipe(
            catchError(() => of({ company_identifier: profile.company_identifier, offers: [], total: 0 }))
          )
        })
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: ({ dashboard, offers }) => {
              const titleByOffer = new Map(offers.offers.map((o) => [o.offer_identifier, o.title]));
              this.candidatures = dashboard.applications.map((app) => ({
                applicationIdentifier: app.application_identifier,
                candidat: this.formatStudentName(app.student_account_identifier),
                email: app.student_account_identifier,
                offre: titleByOffer.get(app.offer_identifier) ?? app.offer_identifier,
                offerIdentifier: app.offer_identifier,
                dateCandidature: this.formatDate(app.created_at),
                statut: this.mapStatutLabel(app.status_code) as Candidature['statut'],
                statusCode: app.status_code,
                avatar: 'assets/default.jpeg'
              }));
            },
            error: () => {
              this.loadError = 'Impossible de charger les candidatures.';
            }
          });
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Profil entreprise introuvable. Complétez votre fiche entreprise.';
      }
    });
  }

  private formatStudentName(accountId: string): string {
    const short = accountId.replace(/^USR-/, '').slice(0, 8);
    return `Étudiant ${short || accountId}`;
  }

  private formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  private mapStatutLabel(code: string): 'En attente' | 'En revue' | 'Accepté' | 'Refusé' {
    const c = code.toUpperCase();
    if (c === 'APP-ACCEPTED') {
      return 'Accepté';
    }
    if (c === 'APP-REJECTED') {
      return 'Refusé';
    }
    if (c === 'APP-WITHDRAWN') {
      return 'Refusé';
    }
    if (c === 'APP-UNDER_REVIEW') {
      return 'En revue';
    }
    return 'En attente';
  }

  get filteredCandidatures(): Candidature[] {
    return this.candidatures.filter(cand => {
      const matchesSearch = !this.searchTerm || 
        cand.candidat.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cand.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cand.offre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || cand.statut === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusColor(statut: string): string {
    const statusColors: Record<string, string> = {
      'Accepté': 'success',
      'Refusé': 'danger',
      'En attente': 'warning',
      'En revue': 'info'
    };
    return statusColors[statut] || 'secondary';
  }

  accepterCandidature(cand: Candidature): void {
    void Swal.fire({
      title: 'Accepter la candidature ?',
      text: `Voulez-vous accepter la candidature de ${cand.candidat} ?`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Accepter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        const nextStatus =
          cand.statusCode === 'APP-SUBMITTED' ? 'APP-UNDER_REVIEW' : 'APP-ACCEPTED';
        this.applicationsService.changeApplicationStatus(cand.applicationIdentifier, nextStatus).subscribe({
          next: () => {
            cand.statusCode = nextStatus;
            cand.statut = this.mapStatutLabel(nextStatus);
            void Swal.fire({
              title: nextStatus === 'APP-UNDER_REVIEW' ? 'Passage en revue' : 'Candidature acceptée',
              text:
                nextStatus === 'APP-UNDER_REVIEW'
                  ? `La candidature de ${cand.candidat} est marquée en revue.`
                  : `La candidature de ${cand.candidat} a été acceptée.`,
              icon: 'success',
              confirmButtonColor: '#004a99'
            });
          },
          error: () => {
            void Swal.fire({
              title: 'Erreur',
              text: 'Impossible de mettre à jour le statut. Vérifiez les droits et le workflow.',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  refuserCandidature(cand: Candidature): void {
    void Swal.fire({
      title: 'Refuser la candidature ?',
      text: `Voulez-vous refuser la candidature de ${cand.candidat} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Refuser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.applicationsService.changeApplicationStatus(cand.applicationIdentifier, 'APP-REJECTED').subscribe({
          next: () => {
            cand.statut = 'Refusé';
            cand.statusCode = 'APP-REJECTED';
            void Swal.fire({
              title: 'Candidature refusée',
              text: `La candidature de ${cand.candidat} a été refusée.`,
              icon: 'info',
              confirmButtonColor: '#004a99'
            });
          },
          error: () => {
            void Swal.fire({
              title: 'Erreur',
              text: 'Impossible de mettre à jour le statut.',
              icon: 'error'
            });
          }
        });
      }
    });
  }
}
