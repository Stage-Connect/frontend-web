import { ChangeDetectorRef, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
            <button cButton color="primary" size="sm" class="d-flex align-items-center shadow-sm" (click)="openInviteModal()">
              <svg cIcon name="cilPlus" class="me-2"></svg>
              Inviter
            </button>
          </c-card-header>
          <c-card-body class="p-0">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm m-4">{{ errorMessage }}</c-alert>
            }
            @if (successMessage) {
              <c-alert color="success" class="border-0 shadow-sm m-4">{{ successMessage }}</c-alert>
            }

            @if (isLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des utilisateurs...</span>
              </div>
            } @else if (!users.length) {
              <div class="text-center py-5 opacity-75">Aucun collaborateur n'est encore associe a cette entreprise.</div>
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
                    @for (user of users; track user.user_identifier) {
                      <tr>
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
                          <button cButton variant="ghost" color="primary" size="sm" class="me-1" title="Modifier le rôle"
                            (click)="openEditModal(user)">
                            <svg cIcon name="cilPencil" size="sm"></svg>
                          </button>
                          @if (user.is_active) {
                            <button cButton variant="ghost" color="danger" size="sm" title="Désactiver"
                              (click)="deactivate(user)">
                              <svg cIcon name="cilTrash" size="sm"></svg>
                            </button>
                          }
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

    <!-- Modal invitation -->
    @if (showInviteModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <div class="modal-header">
              <h5 class="modal-title">Inviter un utilisateur</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="isDark()" (click)="closeModals()"></button>
            </div>
            <div class="modal-body">
              @if (modalError) {
                <div class="alert alert-danger small" role="alert">{{ modalError }}</div>
              }
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input class="form-control" [(ngModel)]="inviteForm.email" placeholder="utilisateur@exemple.com"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Rôle</label>
                <select class="form-select" [(ngModel)]="inviteForm.internal_role"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">-- Sélectionner --</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="MEMBER">Membre</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button cButton color="secondary" (click)="closeModals()">Annuler</button>
              <button cButton color="primary" [disabled]="submitting || !inviteForm.email || !inviteForm.internal_role"
                (click)="submitInvite()">
                {{ submitting ? 'Envoi…' : 'Inviter' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal édition rôle -->
    @if (showEditModal && editTarget) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <div class="modal-header">
              <h5 class="modal-title">Modifier le rôle — {{ editTarget.email }}</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="isDark()" (click)="closeModals()"></button>
            </div>
            <div class="modal-body">
              @if (modalError) {
                <div class="alert alert-danger small" role="alert">{{ modalError }}</div>
              }
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nouveau rôle</label>
                <select class="form-select" [(ngModel)]="editRoleCode"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="MEMBER">Membre</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button cButton color="secondary" (click)="closeModals()">Annuler</button>
              <button cButton color="primary" [disabled]="submitting" (click)="submitEdit()">
                {{ submitting ? 'Sauvegarde…' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
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
  successMessage = '';

  showInviteModal = false;
  showEditModal = false;
  submitting = false;
  modalError = '';
  editTarget: CompanyUser | null = null;
  editRoleCode = '';
  inviteForm = { email: '', internal_role: '' };

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
        this.errorMessage = this.#authService.getErrorMessage(error, 'La liste des utilisateurs est indisponible pour le moment.');
        this.#cdr.markForCheck();
      }
    });
  }

  openInviteModal(): void {
    this.inviteForm = { email: '', internal_role: '' };
    this.modalError = '';
    this.showInviteModal = true;
  }

  openEditModal(user: CompanyUser): void {
    this.editTarget = user;
    this.editRoleCode = user.internal_role;
    this.modalError = '';
    this.showEditModal = true;
  }

  closeModals(): void {
    this.showInviteModal = false;
    this.showEditModal = false;
    this.editTarget = null;
  }

  submitInvite(): void {
    if (!this.inviteForm.email || !this.inviteForm.internal_role) return;
    this.submitting = true;
    this.modalError = '';
    this.#companyUsersService.inviteUser(this.inviteForm).subscribe({
      next: (user) => {
        this.users = [...this.users, user];
        this.submitting = false;
        this.showInviteModal = false;
        this.successMessage = `Les identifiants de connexion ont ete envoyes par email a ${user.email}.`;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.modalError = this.#authService.getErrorMessage(error, 'Invitation indisponible pour le moment.');
        this.submitting = false;
        this.#cdr.markForCheck();
      }
    });
  }

  submitEdit(): void {
    if (!this.editTarget) return;
    this.submitting = true;
    this.modalError = '';
    this.#companyUsersService.updateUser(this.editTarget.user_identifier, {
      internal_role: this.editRoleCode,
      membership_status: this.editTarget.membership_status
    }).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.user_identifier === updated.user_identifier);
        if (idx >= 0) this.users[idx] = updated;
        this.submitting = false;
        this.showEditModal = false;
        this.editTarget = null;
        this.successMessage = 'Rôle mis à jour.';
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.modalError = this.#authService.getErrorMessage(error, 'Mise à jour du rôle indisponible.');
        this.submitting = false;
        this.#cdr.markForCheck();
      }
    });
  }

  deactivate(user: CompanyUser): void {
    if (!confirm(`Désactiver ${user.email} ?`)) return;
    this.#companyUsersService.deactivateUser(user.user_identifier).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.user_identifier !== user.user_identifier);
        this.successMessage = `${user.email} désactivé.`;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Désactivation indisponible pour le moment.');
        this.#cdr.markForCheck();
      }
    });
  }

  getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      'OWNER': 'primary',
      'ADMIN': 'info',
      'MANAGER': 'success',
      'MEMBER': 'secondary'
    };
    return roleColors[role] || 'secondary';
  }
}
