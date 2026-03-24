import { ChangeDetectorRef, Component, computed, inject } from '@angular/core';
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
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CompanyUser, CompanyUsersService } from '../../../services/company-users.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-company-users',
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
    BadgeComponent,
    AlertComponent,
    ButtonDirective,
    IconDirective
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <div>
              <h5 class="mb-0 fw-bold">Utilisateurs d'entreprise</h5>
              @if (companyIdentifier) {
                <p class="small mb-0 opacity-75">{{ companyIdentifier }} · {{ users.length }} utilisateur(s)</p>
              }
            </div>
            <button cButton color="primary" size="sm" class="d-flex align-items-center shadow-sm">
              <svg cIcon name="cilPlus" class="me-2"></svg>
              Inviter
            </button>
          </c-card-header>
          <c-card-body class="p-0">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm m-4">{{ errorMessage }}</c-alert>
            }

            @if (isLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des utilisateurs...</span>
              </div>
            } @else if (!users.length) {
              <div class="text-center py-5 opacity-75">Aucun utilisateur d'entreprise renvoyé par le backend.</div>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Rôle interne</th>
                      <th>Statut</th>
                      <th>Compte lié</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of users">
                      <td class="py-3 px-4 align-middle">
                        <div class="fw-semibold">{{ user.email }}</div>
                      </td>
                      <td class="py-3 px-4 align-middle">
                        <c-badge [color]="getRoleColor(user.internal_role)" shape="rounded-pill" class="px-3 py-2">
                          {{ labels.internalRole(user.internal_role) }}
                        </c-badge>
                      </td>
                      <td class="py-3 px-4 align-middle">
                        <c-badge [color]="user.is_active ? 'success' : 'warning'" shape="rounded-pill" class="px-3 py-2">
                          {{ labels.membershipStatus(user.membership_status) }}
                        </c-badge>
                      </td>
                      <td class="py-3 px-4 align-middle">
                        {{ user.account_identifier || 'Invitation en attente' }}
                      </td>
                      <td class="py-3 px-4 align-middle text-center">
                        <a [routerLink]="[user.user_identifier]" cButton variant="ghost" color="primary" size="sm" class="rounded-pill p-2" title="Voir détails">
                          <svg cIcon name="cilFindInPage" size="sm"></svg>
                        </a>
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
export class CompanyUsersComponent {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #companyUsersService = inject(CompanyUsersService);
  readonly #authService = inject(AuthService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  users: CompanyUser[] = [];
  companyIdentifier = '';
  isLoading = true;
  errorMessage = '';

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.#cdr.markForCheck();

    this.#companyUsersService.listCompanyUsers().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.companyIdentifier = response.company_identifier;
        this.users = response.users;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger les utilisateurs de l\'entreprise.');
        this.#cdr.markForCheck();
      }
    });
  }

  getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      'OWNER': 'primary',
      'ADMIN': 'info',
      'RECRUITER': 'success',
      'MEMBER': 'secondary'
    };
    return roleColors[role] || 'secondary';
  }
}
