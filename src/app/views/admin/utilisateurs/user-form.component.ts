import { Component, OnInit, inject, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  RowComponent,
  TextColorDirective,
  ColorModeService,
  AvatarComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AdminAccountsService, AdminAccountState } from '../../../services/admin-accounts.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    AlertComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    AvatarComponent
  ],
  template: `
    <c-row>
      <c-col lg="8" class="mx-auto">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex align-items-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
             <button cButton variant="ghost" [class.text-white]="isDark()" routerLink=".." class="me-3 p-0 border-0">
               <svg cIcon name="cilArrowLeft"></svg>
            </button>
            <h5 class="mb-0 fw-bold">Détail du compte utilisateur</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">
                {{ errorMessage }}
              </c-alert>
            }

            @if (isLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement du compte...</span>
              </div>
            }

            @if (!accountState && !isLoading) {
              <c-alert color="warning" class="border-0 shadow-sm mb-0">
                Cet ecran consomme l'API backend de consultation/suspension. Fournis un identifiant d'utilisateur dans l'URL pour charger un compte.
              </c-alert>
            }

            @if (accountState) {
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" cForm>
              <div class="row g-4">
              <div class="col-12 text-center mb-3">
                  <c-avatar [src]="avatarPreview || 'assets/default.jpeg'" 
                            size="xl" class="border shadow-sm mb-2" [class.border-white]="isDark()"></c-avatar>
                  <p class="mb-0 fw-semibold">{{ displayName }}</p>
                  <p class="small opacity-75 mb-0">{{ accountState.email }}</p>
                  <p class="small opacity-50 mt-1">{{ accountState.account_identifier }}</p>
                </div>

                <div class="col-md-6">
                  <label cLabel for="email" class="form-label small fw-bold opacity-75 text-uppercase">Email</label>
                  <input cFormControl id="email" formControlName="email" type="email" readonly
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>

                <div class="col-md-6">
                  <label cLabel for="role" class="form-label small fw-bold opacity-75 text-uppercase">Rôle</label>
                  <input cFormControl id="role" formControlName="role" readonly
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                          class="py-2" />
                </div>

                <div class="col-md-6">
                  <label cLabel for="status" class="form-label small fw-bold opacity-75 text-uppercase">Statut</label>
                  <input cFormControl id="status" formControlName="status" readonly
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>

                <div class="col-md-6">
                  <label cLabel for="emailVerified" class="form-label small fw-bold opacity-75 text-uppercase">Email vérifié</label>
                  <input cFormControl id="emailVerified" formControlName="emailVerified" readonly
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>

                @if (!accountState.is_suspended && !isProtectedRole(accountState.role_code)) {
                  <div class="col-md-6">
                    <label cLabel for="reasonCode" class="form-label small fw-bold opacity-75 text-uppercase">Code motif</label>
                    <input cFormControl id="reasonCode" formControlName="reasonCode" placeholder="Ex: POLICY_VIOLATION"
                           [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                           class="py-2" />
                  </div>

                  <div class="col-md-12">
                    <label cLabel for="reasonDetails" class="form-label small fw-bold opacity-75 text-uppercase">Détail du motif</label>
                    <textarea cFormControl id="reasonDetails" formControlName="reasonDetails" rows="4"
                      [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                      placeholder="Explique la raison de la suspension."></textarea>
                  </div>
                } @else if (accountState.suspension) {
                  <div class="col-md-12">
                    <label cLabel for="suspensionDetails" class="form-label small fw-bold opacity-75 text-uppercase">Suspension active</label>
                    <textarea cFormControl id="suspensionDetails" formControlName="suspensionDetails" rows="4" readonly
                      [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
                  </div>
                }
              </div>

              <div class="d-flex justify-content-end mt-5 pt-3 border-top" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <button cButton color="secondary" variant="ghost" class="me-3" [class.text-white]="isDark()" routerLink="..">Annuler</button>
                <button cButton color="danger" type="submit" [disabled]="userForm.invalid || accountState.is_suspended || isProtectedRole(accountState.role_code) || isSubmitting" class="px-5 py-2 shadow-sm fw-bold">
                  {{ isSubmitting ? 'Suspension...' : 'Suspendre le compte' }}
                </button>
              </div>
            </form>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class UserFormComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #adminAccountsService = inject(AdminAccountsService);
  readonly #authService = inject(AuthService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');
  avatarPreview: string | null = null;

  userForm!: FormGroup;
  accountState: AdminAccountState | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }],
      emailVerified: [{ value: '', disabled: true }],
      reasonCode: ['', [Validators.required, Validators.minLength(3)]],
      reasonDetails: ['', [Validators.required, Validators.minLength(10)]],
      suspensionDetails: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.userForm.get('reasonCode')?.clearValidators();
      this.userForm.get('reasonDetails')?.clearValidators();
      this.userForm.get('reasonCode')?.updateValueAndValidity();
      this.userForm.get('reasonDetails')?.updateValueAndValidity();
      return;
    }

    this.loadAccount(id);
    this.#cdr.markForCheck();
  }

  onSubmit(): void {
    const accountIdentifier = this.accountState?.account_identifier;
    if (!accountIdentifier || this.userForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.#adminAccountsService.suspendAccount(accountIdentifier, {
      reason_code: this.userForm.get('reasonCode')?.value,
      reason_details: this.userForm.get('reasonDetails')?.value
    }).subscribe({
      next: (state) => {
        this.isSubmitting = false;
        this.applyAccountState(state);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de suspendre ce compte.');
        this.#cdr.markForCheck();
      }
    });
  }

  isProtectedRole(roleCode: string | null): boolean {
    return roleCode === 'ADMIN_PLATFORM' || roleCode === 'OPS_ADMIN' || roleCode === 'ADMIN';
  }

  private loadAccount(accountIdentifier: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.#adminAccountsService.getAccountState(accountIdentifier).subscribe({
      next: (state) => {
        this.isLoading = false;
        this.applyAccountState(state);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger ce compte utilisateur.');
        this.#cdr.markForCheck();
      }
    });
  }

  private applyAccountState(state: AdminAccountState): void {
    this.accountState = state;
    this.avatarPreview = state.avatar_url || this.#authService.getAvatarUrl(state.email);
    this.userForm.patchValue({
      email: state.email,
      role: this.mapRole(state.role_code),
      status: state.is_suspended ? 'Suspendu' : (state.is_active ? 'Actif' : 'Inactif'),
      emailVerified: state.is_email_verified ? 'Oui' : 'Non',
      suspensionDetails: state.suspension
        ? `${this.labels.reasonCode(state.suspension.reason_code)} - ${state.suspension.reason_details}`
        : ''
    });

    if (state.is_suspended || this.isProtectedRole(state.role_code)) {
      this.userForm.get('reasonCode')?.clearValidators();
      this.userForm.get('reasonDetails')?.clearValidators();
    } else {
      this.userForm.get('reasonCode')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.userForm.get('reasonDetails')?.setValidators([Validators.required, Validators.minLength(10)]);
    }

    this.userForm.get('reasonCode')?.updateValueAndValidity();
    this.userForm.get('reasonDetails')?.updateValueAndValidity();
    this.#cdr.markForCheck();
  }

  private mapRole(roleCode: string | null): string {
    switch (roleCode) {
      case 'ADMIN_PLATFORM':
      case 'OPS_ADMIN':
      case 'ADMIN':
        return 'Administrateur';
      case 'COMPANY_RECRUITER':
        return 'Entreprise';
      case 'STUDENT':
        return 'Etudiant';
      default:
        return roleCode || 'Inconnu';
    }
  }

  private pickAvatar(roleCode: string | null): string {
    return 'assets/default.jpeg';
  }

  get displayName(): string {
    if (!this.accountState) {
      return '';
    }

    if (this.accountState.name?.trim()) {
      return this.accountState.name.trim();
    }

    const roleCode = this.accountState.role_code;
    if (roleCode === 'ADMIN_PLATFORM' || roleCode === 'OPS_ADMIN' || roleCode === 'ADMIN') {
      return 'Administrateur StageConnect';
    }

    const localPart = this.accountState.email.split('@')[0] || 'Utilisateur';
    return localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
