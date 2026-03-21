import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserAccount, UsersListService } from '../../services/users-list.service';
import { AlertService } from '../../services/alert.service';
import {
  ButtonDirective,
  FormControlDirective,
  TableDirective,
  PageLinkDirective,
  PageItemDirective,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormControlDirective,
    ButtonDirective,
    IconDirective,
    TableDirective,
    PageLinkDirective,
    PageItemDirective,
    SpinnerComponent
  ],
  template: `
    <div class="container-lg">
      <div class="page-header d-print-none mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="page-title">Gestion des utilisateurs</h2>
          </div>
          <div class="col-auto ms-auto">
            <button
              type="button"
              cButton
              color="primary"
              (click)="exportList()"
              [disabled]="isLoading || users.length === 0"
            >
              <svg cIcon name="cilCloudDownload" class="me-1"></svg>
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Erreur!</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Filters Card -->
      <div class="card mb-3">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3 align-items-end">
            <div class="col-md-4">
              <label cFormLabel>Recherche (Email)</label>
              <input
                type="text"
                cFormControl
                formControlName="search"
                placeholder="Rechercher par email..."
              />
            </div>
            <div class="col-md-3">
              <label cFormLabel>Rôle</label>
              <select cFormSelect formControlName="role_code">
                <option value="">Tous les rôles</option>
                <option value="student">Étudiant</option>
                <option value="entreprise">Entreprise</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="col-md-3">
              <label cFormLabel>Statut</label>
              <select cFormSelect formControlName="status">
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
            <div class="col-md-2">
              <button type="button" cButton color="secondary" (click)="resetFilters()">
                <svg cIcon name="cilReload" class="me-1"></svg>
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <c-spinner color="primary" class="mb-2"></c-spinner>
        <p>Chargement des utilisateurs...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && users.length === 0" class="alert alert-info text-center py-5">
        <svg cIcon name="cilPeople" size="xl" class="mb-2"></svg>
        <p class="mb-0">Aucun utilisateur trouvé</p>
      </div>

      <!-- Users Table -->
      <div *ngIf="!isLoading && users.length > 0" class="card">
        <table cTable hover responsive class="mb-0">
          <thead class="table-light">
            <tr>
              <th class="bg-light">
                <div class="py-2">Email</div>
              </th>
              <th class="bg-light">
                <div class="py-2">Rôle</div>
              </th>
              <th class="bg-light">
                <div class="py-2">Statut</div>
              </th>
              <th class="bg-light">
                <div class="py-2">Vérifié</div>
              </th>
              <th class="bg-light">
                <div class="py-2">Créé</div>
              </th>
              <th class="bg-light w-25">
                <div class="py-2">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users; let i = index">
              <td>
                <div class="d-flex flex-column">
                  <strong>{{ user.email }}</strong>
                  <small class="text-muted">{{ user.account_identifier }}</small>
                </div>
              </td>
              <td>
                <span class="badge" [ngClass]="getRoleBadgeColor(user.role_code)">
                  {{ getRoleLabel(user.role_code) }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  [ngClass]="
                    user.is_suspended
                      ? 'bg-danger'
                      : user.is_active
                        ? 'bg-success'
                        : 'bg-warning'
                  "
                >
                  {{ user.is_suspended ? 'Suspendu' : user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>
                <svg
                  cIcon
                  [attr.name]="user.is_email_verified ? 'cilCheckAlt' : 'cilX'"
                  [class.text-success]="user.is_email_verified"
                  [class.text-danger]="!user.is_email_verified"
                ></svg>
              </td>
              <td>
                <small class="text-muted">{{ user.created_at | date: 'short' }}</small>
              </td>
              <td>
                <div class="btn-list gap-2">
                  <button
                    type="button"
                    cButton
                    color="info"
                    size="sm"
                    (click)="viewDetails(user)"
                    title="Voir les détails"
                  >
                    <svg cIcon name="cilEye"></svg>
                  </button>
                  <button
                    type="button"
                    cButton
                    color="warning"
                    size="sm"
                    (click)="toggleStatus(user, i)"
                    [disabled]="isTogglingStatus.has(user.account_identifier)"
                    [title]="user.is_active ? 'Désactiver' : 'Activer'"
                  >
                    <svg cIcon [attr.name]="user.is_active ? 'cilLockLocked' : 'cilCheckAlt'"></svg>
                  </button>
                  <button
                    *ngIf="!user.is_suspended"
                    type="button"
                    cButton
                    color="danger"
                    size="sm"
                    (click)="suspendUser(user, i)"
                    [disabled]="isSuspending.has(user.account_identifier)"
                    title="Suspendre"
                  >
                    <svg cIcon name="cilBan"></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <nav *ngIf="totalPages > 1" class="d-flex justify-content-center mt-3" aria-label="Pagination des utilisateurs">
          <ul cPagination>
            <li cPageItem [disabled]="currentPage === 1">
              <a cPageLink (click)="goToPage(currentPage - 1)">Précédent</a>
            </li>
            <li
              *ngFor="let page of getPageNumbers()"
              cPageItem
              [active]="page === currentPage"
              [disabled]="page === null"
            >
              <a cPageLink (click)="page !== null && goToPage(page)">
                {{ page ?? '...' }}
              </a>
            </li>
            <li cPageItem [disabled]="currentPage === totalPages">
              <a cPageLink (click)="goToPage(currentPage + 1)">Suivant</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Suspend Modal -->
    <div *ngIf="showSuspendModal" class="modal d-block" style="background-color: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Suspendre le compte</h5>
            <button type="button" class="btn-close" (click)="showSuspendModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir suspendre <strong>{{ suspendUserEmail }}</strong>?</p>
            <textarea
              [(ngModel)]="suspendReason"
              class="form-control"
              placeholder="Motif de la suspension"
              rows="3"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              cButton
              color="secondary"
              (click)="showSuspendModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              cButton
              color="danger"
              (click)="confirmSuspend()"
              [disabled]="!suspendReason.trim()"
            >
              Confirmer la suspension
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal.d-block {
      display: block;
      z-index: 1050;
    }

    .btn-list {
      display: flex;
      gap: 0.25rem;
    }
  `]
})
export class UsersListComponent implements OnInit, OnDestroy {
  private readonly usersListService = inject(UsersListService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly filterSubject$ = new Subject<void>();

  users: UserAccount[] = [];
  isLoading = false;
  isTogglingStatus = new Set<string>();
  isSuspending = new Set<string>();
  error = '';

  currentPage = 1;
  pageSize = 20;
  total = 0;
  totalPages = 0;

  filterForm!: FormGroup;

  showSuspendModal = false;
  suspendUserEmail = '';
  suspendReason = '';
  suspendUserToDelete: UserAccount | null = null;
  suspendUserIndex = -1;

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();

    // Setup filter debounce
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      role_code: [''],
      status: ['']
    });
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.error = '';

    const formValue = this.filterForm.value;
    const filters = {
      page: this.currentPage,
      page_size: this.pageSize,
      search: formValue.search || undefined,
      role_code: formValue.role_code || undefined,
      is_active: formValue.status === 'active' ? true : formValue.status === 'inactive' ? false : undefined,
      is_suspended: formValue.status === 'suspended' ? true : undefined
    };

    this.usersListService.getAllUsers(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.users = response.items;
          this.total = response.total;
          this.totalPages = Math.ceil(this.total / this.pageSize);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.error = 'Échec du chargement des utilisateurs';
          this.cdr.markForCheck();
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    const maxPages = 5;
    const halfWindow = Math.floor(maxPages / 2);

    let startPage = Math.max(1, this.currentPage - halfWindow);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(null);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push(null);
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  toggleStatus(user: UserAccount, index: number): void {
    this.isTogglingStatus.add(user.account_identifier);

    this.usersListService.updateUserStatus(user.account_identifier, !user.is_active)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isTogglingStatus.delete(user.account_identifier);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (updatedUser) => {
          this.users[index] = updatedUser;
          this.alertService.success(
            'Succès',
            `Utilisateur ${updatedUser.is_active ? 'activé' : 'désactivé'} avec succès`
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          this.alertService.error('Erreur', 'Impossible de mettre à jour le statut');
          this.cdr.markForCheck();
        }
      });
  }

  suspendUser(user: UserAccount, index: number): void {
    this.suspendUserEmail = user.email;
    this.suspendUserToDelete = user;
    this.suspendUserIndex = index;
    this.suspendReason = '';
    this.showSuspendModal = true;
  }

  confirmSuspend(): void {
    if (!this.suspendUserToDelete) {
      return;
    }

    const user = this.suspendUserToDelete;
    this.isSuspending.add(user.account_identifier);

    this.usersListService.suspendUser(user.account_identifier, this.suspendReason)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSuspending.delete(user.account_identifier);
        })
      )
      .subscribe({
        next: (updatedUser) => {
          this.users[this.suspendUserIndex] = updatedUser;
          this.showSuspendModal = false;
          this.alertService.success('Success', 'User suspended successfully');
        },
        error: (error) => {
          console.error('Error suspending user:', error);
          this.alertService.error('Error', 'Failed to suspend user');
        }
      });
  }

  viewDetails(user: UserAccount): void {
    // TODO: Navigate to user detail page when ready
    this.alertService.info('View Details', `Viewing details for ${user.email}`);
  }

  exportList(): void {
    const formValue = this.filterForm.value;
    const filters = {
      role_code: formValue.role_code || undefined
    };

    this.usersListService.exportUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `users-${new Date().getTime()}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.alertService.success('Success', 'Users exported successfully');
        },
        error: (error) => {
          console.error('Error exporting users:', error);
          this.alertService.error('Error', 'Failed to export users');
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadUsers();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'student': 'Étudiant',
      'entreprise': 'Entreprise',
      'admin': 'Administrateur',
      'institution': 'Institution'
    };
    return labels[role] || role;
  }

  getRoleBadgeColor(role: string): string {
    const colors: Record<string, string> = {
      'student': 'bg-info',
      'entreprise': 'bg-primary',
      'admin': 'bg-danger',
      'institution': 'bg-success'
    };
    return colors[role] || 'bg-secondary';
  }
}
