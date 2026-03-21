import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlertComponent,
  BadgeComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  ColorModeService
} from '@coreui/angular';
import { CompanyUser, CompanyUsersService } from '../../../services/company-users.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-company-users',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    BadgeComponent,
    AlertComponent
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Utilisateurs d'entreprise</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
            }

            @if (companyIdentifier) {
              <p class="small opacity-75 mb-4">Entreprise: {{ companyIdentifier }} · {{ users.length }} utilisateur(s)</p>
            }

            @if (!users.length && !isLoading) {
              <div class="text-center py-5 opacity-75">Aucun utilisateur d'entreprise renvoyé par le backend.</div>
            }

            <div class="table-responsive">
              <table cTable [hover]="true" [class.table-dark]="isDark()">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Rôle interne</th>
                    <th>Statut</th>
                    <th>Compte lié</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of users">
                    <td>{{ user.email }}</td>
                    <td>{{ labels.internalRole(user.internal_role) }}</td>
                    <td>
                      <c-badge [color]="user.is_active ? 'success' : 'warning'" shape="rounded-pill">
                        {{ labels.membershipStatus(user.membership_status) }}
                      </c-badge>
                    </td>
                    <td>{{ user.account_identifier || 'Invitation en attente' }}</td>
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
export class CompanyUsersComponent {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #companyUsersService = inject(CompanyUsersService);
  readonly #authService = inject(AuthService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  users: CompanyUser[] = [];
  companyIdentifier = '';
  isLoading = true;
  errorMessage = '';

  constructor() {
    this.#companyUsersService.listCompanyUsers().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.companyIdentifier = response.company_identifier;
        this.users = response.users;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger les utilisateurs de l’entreprise.');
      }
    });
  }
}
