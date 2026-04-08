import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ColorModeService,
  AvatarComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminAccountsService } from '../../../services/admin-accounts.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-create',
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
    FormSelectDirective,
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
            <h5 class="mb-0 fw-bold">Créer un nouveau compte utilisateur</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">
                {{ errorMessage }}
              </c-alert>
            }

            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" cForm>
              <div class="row g-4">
                <div class="col-12 text-center mb-3">
                  <c-avatar [src]="avatarPreview" 
                            size="xl" class="border shadow-sm mb-2" [class.border-white]="isDark()"></c-avatar>
                  <p class="small opacity-50 mt-1">Prévisualisation de l'avatar</p>
                </div>

                <div class="col-md-6">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Email <span class="text-danger">*</span></label>
                  <input cFormControl id="email" formControlName="email" type="email" 
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" 
                         [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2"
                         placeholder="exemple@email.com"
                         [class.is-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched" />
                  @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
                    <div class="invalid-feedback d-block">Veuillez entrer un email valide.</div>
                  }
                </div>

                <div class="col-md-6">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Rôle <span class="text-danger">*</span></label>
                  <select cSelect formControlName="role" id="role"
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                          [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                          class="py-2">
                    <option value="">Sélectionnez un rôle</option>
                    <option value="ADMIN_PLATFORM">Administrateur plateforme</option>
                    <option value="OPS_ADMIN">Admin opérations</option>
                    <option value="COMPANY_RECRUITER">Entreprise / Recruteur</option>
                    <option value="STUDENT">Étudiant</option>
                  </select>
                  @if (userForm.get('role')?.invalid && userForm.get('role')?.touched) {
                    <div class="text-danger small mt-1">Veuillez sélectionner un rôle.</div>
                  }
                </div>

                <div class="col-md-6">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Mot de passe <span class="text-danger">*</span></label>
                  <input cFormControl id="password" formControlName="password" type="password"
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" 
                         [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2"
                         placeholder="Minimum 8 caractères"
                         [class.is-invalid]="userForm.get('password')?.invalid && userForm.get('password')?.touched" />
                  @if (userForm.get('password')?.invalid && userForm.get('password')?.touched) {
                    <div class="invalid-feedback d-block">Le mot de passe doit contenir au moins 8 caractères.</div>
                  }
                </div>

                <div class="col-md-6">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Confirmer le mot de passe <span class="text-danger">*</span></label>
                  <input cFormControl id="confirmPassword" formControlName="confirmPassword" type="password"
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" 
                         [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2"
                         placeholder="Confirmez le mot de passe"
                         [class.is-invalid]="userForm.errors?.['mismatch'] && userForm.get('confirmPassword')?.touched" />
                  @if (userForm.errors?.['mismatch'] && userForm.get('confirmPassword')?.touched) {
                    <div class="invalid-feedback d-block">Les mots de passe ne correspondent pas.</div>
                  }
                </div>

                <div class="col-12">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Nom complet</label>
                  <input cFormControl id="name" formControlName="name" type="text"
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" 
                         [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2"
                         placeholder="Ex: Jean Dupont" />
                </div>

                <div class="col-12">
                  <div class="form-check">
                    <input cFormControl type="checkbox" id="sendEmail" formControlName="sendEmail" class="form-check-input" />
                    <label cLabel class="form-check-label" for="sendEmail">
                      Envoyer un email d'activation au nouvel utilisateur
                    </label>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end mt-5 pt-3 border-top" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <button cButton color="secondary" variant="ghost" class="me-3" [class.text-white]="isDark()" routerLink="..">Annuler</button>
                <button cButton color="primary" type="submit" [disabled]="isSubmitting || userForm.invalid" class="px-5 py-2 shadow-sm fw-bold">
                  {{ isSubmitting ? 'Création...' : 'Créer le compte' }}
                </button>
              </div>
            </form>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class UserCreateComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly #authService = inject(AuthService);
  readonly #accountsService = inject(AdminAccountsService);
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  userForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  avatarPreview = '';

  constructor() {
    this.userForm = this.#fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      name: [''],
      sendEmail: [true]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });

    this.userForm.get('email')?.valueChanges.subscribe(() => this.updateAvatarPreview());
    this.userForm.get('name')?.valueChanges.subscribe(() => this.updateAvatarPreview());
    this.updateAvatarPreview();
  }

  private passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  updateAvatarPreview(): void {
    const email = this.userForm.get('email')?.value || '';
    const name = this.userForm.get('name')?.value || '';
    const seed = name || email.split('@')[0] || 'U';
    this.avatarPreview = this.#authService.getAvatarUrl(seed);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password, role, name } = this.userForm.value as {
      email: string;
      password: string;
      role: string;
      name: string;
      confirmPassword: string;
      sendEmail: boolean;
    };

    this.#accountsService.createAccount({ email, password, role_code: role, name: name || null })
      .subscribe({
        next: () => {
          void Swal.fire({
            title: 'Compte créé',
            text: `Le compte ${email} a été créé avec succès.`,
            icon: 'success',
            confirmButtonColor: '#004a99'
          }).then(() => {
            void this.#router.navigate(['/dashboard/admin/utilisateurs']);
          });
        },
        error: (err: { error?: { detail?: string } }) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.detail ?? 'Une erreur est survenue lors de la création du compte.';
        }
      });
  }
}
