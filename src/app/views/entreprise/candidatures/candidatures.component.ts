import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  ColorModeService,
  AvatarComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

interface Candidature {
  id: number;
  candidat: string;
  offre: string;
  dateCandidature: string;
  statut: 'En attente' | 'Accepté' | 'Refusé';
  avatar: string;
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
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    BadgeComponent,
    AvatarComponent
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold" [class.text-white]="isDark()">Candidatures Reçues</h5>
          </c-card-header>
          <c-card-body class="p-0">
            <div class="table-responsive">
              <table [hover]="true" cTable class="mb-0" [class.table-dark]="isDark()">
                <thead>
                  <tr [class.text-white]="isDark()" [class.opacity-75]="isDark()">
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Candidat</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Offre</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Date d'envoi</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Statut</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase text-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let cand of candidatures" [class.text-white]="isDark()">
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <div class="d-flex align-items-center">
                        <c-avatar [src]="cand.avatar" class="me-3" size="md"></c-avatar>
                        <span class="fw-semibold">{{ cand.candidat }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ cand.offre }}</td>
                    <td class="py-3 px-4 align-middle small border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ cand.dateCandidature }}</td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <c-badge [color]="cand.statut === 'Accepté' ? 'success' : (cand.statut === 'Refusé' ? 'danger' : 'warning')" 
                               shape="rounded-pill" 
                               class="px-3 py-2">
                        {{ cand.statut }}
                      </c-badge>
                    </td>
                    <td class="py-3 px-4 align-middle text-center border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <button cButton variant="ghost" color="primary" size="sm" class="rounded-pill p-2" [routerLink]="[cand.id]" title="Détails" [class.text-white]="isDark()">
                        <svg cIcon name="cilMagnifyingGlass" size="sm"></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

  candidatures: Candidature[] = [
    { id: 101, candidat: 'Manga Joseph', offre: 'Développeur Angular', dateCandidature: '19 Mars 2026', statut: 'En attente', avatar: 'assets/images/avatars/student-1.png' },
    { id: 102, candidat: 'Nguema Marie', offre: 'Comptable Junior', dateCandidature: '18 Mars 2026', statut: 'Accepté', avatar: 'assets/images/avatars/student-2.png' },
    { id: 103, candidat: 'Bella Samuel', offre: 'Marketing Digital', dateCandidature: '17 Mars 2026', statut: 'Refusé', avatar: 'assets/images/avatars/student-3.png' }
  ];
}
