import { Component, inject, computed, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  TextColorDirective,
  ColorModeService,
  AvatarComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  DropdownModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AdminAccountsService, AdminAccountState } from '../../../services/admin-accounts.service';
import { AuthService } from '../../../services/auth.service';

interface UserItem extends AdminAccountState {
  display_role: string;
  display_status: 'Actif' | 'Suspendu' | 'Inactif';
  avatar: string;
}

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    AlertComponent,
    BadgeComponent,
    AvatarComponent,
    FormDirective,
    FormControlDirective,
    InputGroupComponent,
    DropdownModule
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center" 
                       [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Gestion des Utilisateurs</h5>
          </c-card-header>
          <c-card-body class="p-4">
            <div class="mb-4">
              <p class="small mb-3 opacity-75">
                Gère les comptes utilisateurs de la plateforme. Tu peux rechercher par identifiant, email ou nom, et filtrer par rôle ou statut.
              </p>
              <form cForm (ngSubmit)="onSearch()">
                <div class="row g-3">
                  <div class="col-md-8">
                    <c-input-group class="shadow-sm">
                      <span class="input-group-text border-0" [style.backgroundColor]="isDark() ? '#1d2a39' : '#f0f2f5'">
                        <svg cIcon name="cilMagnifyingGlass" [class.text-white]="isDark()"></svg>
                      </span>
                      <input
                        cFormControl
                        name="accountIdentifier"
                        [(ngModel)]="lookupIdentifier"
                        placeholder="Rechercher par identifiant, email ou nom..."
                        class="border-0"
                        [style.backgroundColor]="isDark() ? '#1d2a39' : '#f0f2f5'"
                        [style.color]="isDark() ? 'white' : 'black'" />
                      <button cButton color="primary" type="submit" [disabled]="isLoadingLookup">
                        {{ isLoadingLookup ? 'Mise à jour...' : 'Filtrer' }}
                      </button>
                    </c-input-group>
                  </div>
                  <div class="col-md-4 d-flex gap-2">
                    <select class="form-select border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                            [style.backgroundColor]="isDark() ? '#1d2a39' : '#f0f2f5'"
                            [(ngModel)]="filterRole" name="filterRole" (change)="onSearch()">
                      <option value="">Tous les rôles</option>
                      <option value="ADMIN_PLATFORM">Administrateurs</option>
                      <option value="COMPANY_RECRUITER">Entreprises</option>
                      <option value="STUDENT">Étudiants</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">
                {{ errorMessage }}
              </c-alert>
            }

            @if (!users.length) {
              <div class="text-center py-5 opacity-75">
                Aucun compte charge. Recherche un identifiant backend pour afficher son etat.
              </div>
            }

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
                  @for (user of users; track user.account_identifier) {
                  <tr [class.text-white]="isDark()">
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <div class="d-flex align-items-center">
                        <c-avatar [src]="user.avatar" class="me-3 border shadow-sm" size="md"></c-avatar>
                        <div>
                          <p class="mb-0 fw-semibold">{{ user.account_identifier }}</p>
                          <p class="mb-0 small opacity-50">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <span class="small fw-bold text-uppercase opacity-75">{{ user.display_role }}</span>
                    </td>
                    <td class="py-3 px-4 align-middle border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <c-badge [color]="user.display_status === 'Actif' ? 'success' : (user.display_status === 'Suspendu' ? 'danger' : 'warning')" 
                               shape="rounded-pill" 
                               class="px-3 py-2">
                        {{ user.display_status }}
                      </c-badge>
                    </td>
                    <td class="py-3 px-4 align-middle text-center border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <div class="d-flex justify-content-center gap-2">
                        <button cButton variant="ghost" color="primary" size="sm" class="rounded-pill p-2" title="Voir le compte" [class.text-white]="isDark()" [routerLink]="[user.account_identifier]">
                          <svg cIcon name="cilMagnifyingGlass" size="sm"></svg>
                        </button>
                        <button
                          cButton
                          variant="ghost"
                          color="danger"
                          size="sm"
                          class="rounded-pill p-2"
                          title="Suspendre"
                          [disabled]="user.is_suspended || isProtectedRole(user.role_code)"
                          (click)="openSuspendForm(user.account_identifier)">
                          <svg cIcon name="cilTrash" size="sm"></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class UtilisateursComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly #adminAccountsService = inject(AdminAccountsService);
  readonly #authService = inject(AuthService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  lookupIdentifier = '';
  filterRole = '';
  isLoadingLookup = false;
  errorMessage = '';
  currentPage = 1;
  totalItems = 0;

  users: UserItem[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingLookup = true;
    this.errorMessage = '';

    this.#adminAccountsService.listAccounts({
      page: this.currentPage,
      page_size: 20,
      search: this.lookupIdentifier.trim() || undefined,
      role_code: this.filterRole || undefined
    }).subscribe({
      next: (response) => {
        this.users = response.items.map(acc => this.mapAccount(acc));
        this.totalItems = response.total;
        this.isLoadingLookup = false;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isLoadingLookup = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger la liste des utilisateurs.');
        this.#cdr.markForCheck();
      }
    });
  }

  // Keep compatibility for direct lookup if needed by other components via router navigation would happen here
  lookupAccount(): void {
    this.onSearch();
  }

  openSuspendForm(accountIdentifier: string): void {
    this.lookupIdentifier = accountIdentifier;
  }

  isProtectedRole(roleCode: string | null): boolean {
    return roleCode === 'ADMIN_PLATFORM' || roleCode === 'OPS_ADMIN' || roleCode === 'ADMIN';
  }

  private mapAccount(account: AdminAccountState): UserItem {
    return {
      ...account,
      display_role: this.mapRole(account.role_code),
      display_status: account.is_suspended ? 'Suspendu' : (account.is_active ? 'Actif' : 'Inactif'),
      avatar: this.#authService.getAvatarUrl(account.account_identifier)
    };
  }

  private mapRole(roleCode: string | null): string {
    switch (roleCode) {
      case 'ADMIN_PLATFORM':
      case 'OPS_ADMIN':
      case 'ADMIN':
        return 'Admin';
      case 'COMPANY_RECRUITER':
        return 'Entreprise';
      case 'STUDENT':
        return 'Étudiant';
      default:
        return roleCode ? (roleCode.charAt(0) + roleCode.slice(1).toLowerCase()) : 'Inconnu';
    }
  }

  private pickAvatar(roleCode: string | null): string {
    return 'assets/images/avatars/8.jpg'; // Deprecated since using dynamic avatars in mapAccount
  }
}
