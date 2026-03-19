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
  AvatarComponent,
  DropdownModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'entreprise' | 'etudiant';
  statut: 'Actif' | 'Suspendu' | 'Vérification';
  avatar: string;
}

@Component({
  selector: 'app-utilisateurs',
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
    AvatarComponent,
    DropdownModule
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center" 
                       [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Gestion des Utilisateurs</h5>
            <button cButton color="primary" routerLink="nouveau" class="d-flex align-items-center shadow-sm">
              <svg cIcon name="cilPlus" class="me-2"></svg>
              Nouvel utilisateur
            </button>
          </c-card-header>
          <c-card-body class="p-0">
            <div class="table-responsive">
              <table [hover]="true" cTable class="mb-0" [class.table-dark]="isDark()">
                <thead>
                  <tr [class.text-white]="isDark()" [class.opacity-75]="isDark()">
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Utilisateur</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Rôle</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Statut</th>
                    <th class="py-3 px-4 border-bottom small text-uppercase text-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of users" [class.text-white]="isDark()">
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <div class="d-flex align-items-center">
                        <c-avatar [src]="user.avatar" class="me-3" size="md"></c-avatar>
                        <div>
                          <p class="mb-0 fw-semibold">{{ user.name }}</p>
                          <p class="mb-0 small opacity-50">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <span class="small fw-bold text-uppercase opacity-75">{{ user.role }}</span>
                    </td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <c-badge [color]="user.statut === 'Actif' ? 'success' : (user.statut === 'Suspendu' ? 'danger' : 'warning')" 
                               shape="rounded-pill" 
                               class="px-3 py-2">
                        {{ user.statut }}
                      </c-badge>
                    </td>
                    <td class="py-3 px-4 align-middle text-center border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <div class="d-flex justify-content-center gap-2">
                         <button cButton variant="ghost" color="primary" size="sm" class="rounded-pill p-2" title="Modifier" [class.text-white]="isDark()" [routerLink]="[user.id]">
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
export class UtilisateursComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  users: UserItem[] = [
    { id: 1, name: 'Admin Principal', email: 'admin@stageconnect.cm', role: 'admin', statut: 'Actif', avatar: 'assets/logo.jpeg' },
    { id: 2, name: 'InnovAfrica', email: 'entreprise@stageconnect.cm', role: 'entreprise', statut: 'Actif', avatar: 'assets/images/avatars/company-logo.png' },
    { id: 3, name: 'Manga Joseph', email: 'j.manga@mail.com', role: 'etudiant', statut: 'Actif', avatar: 'assets/images/avatars/student-1.png' },
    { id: 4, name: 'Nguema Marie', email: 'marie.n@mail.com', role: 'etudiant', statut: 'Actif', avatar: 'assets/images/avatars/student-2.png' },
    { id: 5, name: 'Utilisateur Suspendu', email: 'suspend@mail.com', role: 'etudiant', statut: 'Suspendu', avatar: 'assets/images/avatars/student-3.png' }
  ];
}
