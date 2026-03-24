import { Component, inject, computed } from '@angular/core';
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

interface Candidature {
  id: number;
  candidat: string;
  email: string;
  offre: string;
  offreId: number;
  dateCandidature: string;
  statut: 'En attente' | 'Accepté' | 'Refusé';
  avatar: string;
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
            @if (filteredCandidatures.length === 0) {
              <div class="text-center py-5 opacity-75">
                <svg cIcon name="cilInbox" size="xl" class="mb-3 opacity-25"></svg>
                <p class="mb-0">Aucune candidature ne correspond à vos critères.</p>
              </div>
            } @else {
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
                          <a [routerLink]="[cand.id]" cButton variant="ghost" [color]="isDark() ? 'info' : 'primary'" size="sm" 
                                  class="rounded-pill p-2" title="Voir détails">
                            <svg cIcon name="cilFindInPage" size="sm"></svg>
                          </a>
                          @if (cand.statut === 'En attente') {
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
export class CandidaturesComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  searchTerm = '';
  statusFilter = '';

  candidatures: Candidature[] = [
    { 
      id: 101, 
      candidat: 'Manga Joseph', 
      email: 'joseph.manga@email.com',
      offre: 'Développeur Fullstack Angular/Spring', 
      offreId: 1,
      dateCandidature: '19 Mars 2026', 
      statut: 'En attente', 
      avatar: 'assets/images/avatars/student-1.png',
      telephone: '+237 6XX XXX XXX',
      niveau: 'Master 1',
      message: 'Je suis très intéressé par cette opportunité de stage...'
    },
    { 
      id: 102, 
      candidat: 'Nguema Marie', 
      email: 'marie.nguema@email.com',
      offre: 'Développeur Fullstack Angular/Spring', 
      offreId: 1,
      dateCandidature: '18 Mars 2026', 
      statut: 'Accepté', 
      avatar: 'assets/images/avatars/student-2.png',
      telephone: '+237 6XX XXX XXX',
      niveau: 'Licence 3'
    },
    { 
      id: 103, 
      candidat: 'Bella Samuel', 
      email: 'samuel.bella@email.com',
      offre: 'Assistant Marketing Digital', 
      offreId: 2,
      dateCandidature: '17 Mars 2026', 
      statut: 'Refusé', 
      avatar: 'assets/images/avatars/student-3.png',
      telephone: '+237 6XX XXX XXX',
      niveau: 'Master 2'
    },
    { 
      id: 104, 
      candidat: 'Tamo Claire', 
      email: 'claire.tamo@email.com',
      offre: 'Comptable Junior', 
      offreId: 3,
      dateCandidature: '16 Mars 2026', 
      statut: 'En attente', 
      avatar: 'assets/images/avatars/student-4.png',
      telephone: '+237 6XX XXX XXX',
      niveau: 'BTS'
    },
    { 
      id: 105, 
      candidat: 'Fotso Patrick', 
      email: 'patrick.fotso@email.com',
      offre: 'Community Manager', 
      offreId: 4,
      dateCandidature: '15 Mars 2026', 
      statut: 'En attente', 
      avatar: 'assets/images/avatars/student-1.png',
      telephone: '+237 6XX XXX XXX',
      niveau: 'Master 1'
    }
  ];

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
      'En attente': 'warning'
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
        cand.statut = 'Accepté';
        void Swal.fire({
          title: 'Candidature acceptée',
          text: `La candidature de ${cand.candidat} a été acceptée.`,
          icon: 'success',
          confirmButtonColor: '#004a99'
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
        cand.statut = 'Refusé';
        void Swal.fire({
          title: 'Candidature refusée',
          text: `La candidature de ${cand.candidat} a été refusée.`,
          icon: 'info',
          confirmButtonColor: '#004a99'
        });
      }
    });
  }
}
