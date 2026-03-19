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
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

interface Offre {
  id: number;
  titre: string;
  domaine: string;
  datePublication: string;
  statut: 'Actif' | 'Expiré' | 'Brouillon';
}

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
    BadgeComponent
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
            <div class="table-responsive">
              <table [hover]="true" cTable class="mb-0" [class.table-dark]="isDark()">
                <thead>
                  <tr [class.text-white]="isDark()" [class.opacity-75]="isDark()">
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Titre de l'offre</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Domaine</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Publication</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Statut</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase text-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let offre of offres" [class.text-white]="isDark()">
                    <td class="py-3 px-4 align-middle fw-semibold border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ offre.titre }}</td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ offre.domaine }}</td>
                    <td class="py-3 px-4 align-middle small border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">{{ offre.datePublication }}</td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <c-badge [color]="offre.statut === 'Actif' ? 'success' : (offre.statut === 'Expiré' ? 'secondary' : 'warning')" 
                               shape="rounded-pill" 
                               class="px-3 py-2">
                        {{ offre.statut }}
                      </c-badge>
                    </td>
                    <td class="py-3 px-4 align-middle text-center border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <div class="d-flex justify-content-center gap-2">
                        <button cButton variant="ghost" [color]="isDark() ? 'info' : 'primary'" size="sm" class="rounded-pill p-2" [routerLink]="['modifier', offre.id]" title="Modifier">
                          <svg cIcon name="cilPencil" size="sm"></svg>
                        </button>
                        <button cButton variant="ghost" color="danger" size="sm" class="rounded-pill p-2" title="Supprimer">
                          <svg cIcon name="cilTrash" size="sm"></svg>
                        </button>
                      </div>
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
export class OffresComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  offres: Offre[] = [
    {
      id: 1,
      titre: 'Développeur Fullstack Angular/Spring',
      domaine: 'Informatique',
      datePublication: '15 Mars 2026',
      statut: 'Actif'
    },
    {
      id: 2,
      titre: 'Assistant Marketing Digital',
      domaine: 'Marketing & Com',
      datePublication: '10 Mars 2026',
      statut: 'Actif'
    },
    {
      id: 3,
      titre: 'Comptable Junior',
      domaine: 'Finance',
      datePublication: '01 Mars 2026',
      statut: 'Expiré'
    },
    {
      id: 4,
      titre: 'Community Manager',
      domaine: 'Communication',
      datePublication: '18 Mars 2026',
      statut: 'Brouillon'
    }
  ];
}
