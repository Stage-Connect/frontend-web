import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  AlertComponent,
} from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ColorModeService } from '@coreui/angular';

const INSTITUTION_TYPES = [
  { value: 'UNIVERSITY', label: 'Université' },
  { value: 'SCHOOL', label: 'Grande école / École supérieure' },
  { value: 'INSTITUTE', label: 'Institut' },
  { value: 'TRAINING_CENTER', label: 'Centre de formation' },
  { value: 'VOCATIONAL_CENTER', label: 'Centre de formation professionnelle' },
];

const REGION_CODES = [
  { value: 'CE', label: 'Centre' },
  { value: 'LT', label: 'Littoral' },
  { value: 'OU', label: 'Ouest' },
  { value: 'NO', label: 'Nord' },
  { value: 'AD', label: 'Adamaoua' },
  { value: 'EN', label: 'Extrême-Nord' },
  { value: 'NW', label: 'Nord-Ouest' },
  { value: 'SW', label: 'Sud-Ouest' },
  { value: 'SU', label: 'Sud' },
  { value: 'ES', label: 'Est' },
];

@Component({
  selector: 'app-register-institution',
  template: `
    <div class="vh-100 d-flex flex-row align-items-stretch overflow-hidden"
         [style.backgroundColor]="colorMode() === 'dark' ? '#1a222c' : '#f8f9fa'">
      <!-- Left: Illustration -->
      <div class="flex-grow-1 d-none d-lg-block position-relative overflow-hidden"
           style="background: linear-gradient(rgba(26,34,44,0.45), rgba(26,34,44,0.65)), url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&q=80&w=1600') center/cover no-repeat;">
        <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center px-5 text-white">
          <img src="assets/logo.png" class="mb-4 shadow-lg" style="width:130px;height:130px;object-fit:contain;" alt="StageConnect">
          <h2 class="display-5 fw-bold mb-3">Inscrivez votre établissement</h2>
          <p class="lead mb-5 opacity-75" style="max-width:460px;">
            Suivez vos étudiants en stage, gérez vos superviseurs académiques et générez des rapports de suivi.
          </p>
          <div class="d-flex gap-3 flex-wrap justify-content-center">
            <div class="bg-white bg-opacity-10 p-3 rounded-4 border border-white border-opacity-10">
              <h5 class="fw-bold mb-0">Suivi</h5>
              <p class="small mb-0 opacity-75">Stages en temps réel</p>
            </div>
            <div class="bg-white bg-opacity-10 p-3 rounded-4 border border-white border-opacity-10">
              <h5 class="fw-bold mb-0">Évaluation</h5>
              <p class="small mb-0 opacity-75">Rapports superviseurs</p>
            </div>
            <div class="bg-white bg-opacity-10 p-3 rounded-4 border border-white border-opacity-10">
              <h5 class="fw-bold mb-0">Export</h5>
              <p class="small mb-0 opacity-75">Données CSV</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="flex-grow-1 d-flex flex-column justify-content-center px-4 px-md-5 overflow-auto"
           [style.backgroundColor]="colorMode() === 'dark' ? '#24303f' : '#ffffff'"
           style="max-width:580px; z-index:10;">
        <div class="mx-auto w-100 py-4" style="max-width:440px;">
          <form cForm (ngSubmit)="onRegister()">
            <div class="mb-4 text-center">
              <img src="assets/logo.png" alt="StageConnect" style="height:48px;object-fit:contain;" class="mb-3 d-lg-none">
              <h3 class="fw-bold mb-1" [class.text-white]="colorMode() === 'dark'">Créer un espace institution</h3>
              <p class="small opacity-75" [class.text-white]="colorMode() === 'dark'">
                Déjà inscrit ?
                <a routerLink="/login" class="text-primary fw-semibold text-decoration-none">Se connecter</a>
              </p>
            </div>

            @if (errorMessage) {
              <c-alert color="danger" class="border-0 small py-2 mb-3 shadow-sm">{{ errorMessage }}</c-alert>
            }
            @if (successMessage) {
              <c-alert color="success" class="border-0 small py-2 mb-3 shadow-sm">{{ successMessage }}</c-alert>
            }

            <div class="mb-3">
              <label class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="colorMode() === 'dark'">
                Nom de l'établissement
              </label>
              <input cFormControl
                     type="text"
                     [(ngModel)]="institutionName"
                     name="institution_name"
                     placeholder="Ex: Université de Yaoundé I"
                     [class.bg-dark]="colorMode() === 'dark'"
                     [class.text-white]="colorMode() === 'dark'" />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="colorMode() === 'dark'">
                Type d'établissement
              </label>
<<<<<<< HEAD
              <select cFormControl
                      class="register-select"
=======
              <select class="form-control" cFormControl
>>>>>>> 968d797 (Integration complete avec le backend en prod)
                      [(ngModel)]="institutionType"
                      name="institution_type"
                      [class.bg-dark]="colorMode() === 'dark'"
                      [class.text-white]="colorMode() === 'dark'">
                <option value="">-- Sélectionner --</option>
                @for (t of institutionTypes; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="colorMode() === 'dark'">
                Région
              </label>
<<<<<<< HEAD
              <select cFormControl
                      class="register-select"
=======
              <select class="form-control" cFormControl
>>>>>>> 968d797 (Integration complete avec le backend en prod)
                      [(ngModel)]="regionCode"
                      name="region_code"
                      [class.bg-dark]="colorMode() === 'dark'"
                      [class.text-white]="colorMode() === 'dark'">
                <option value="">-- Sélectionner --</option>
                @for (r of regionCodes; track r.value) {
                  <option [value]="r.value">{{ r.label }}</option>
                }
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="colorMode() === 'dark'">
                Adresse email
              </label>
              <input cFormControl
                     type="email"
                     [(ngModel)]="email"
                     name="email"
                     placeholder="directeur@universite.cm"
                     [class.bg-dark]="colorMode() === 'dark'"
                     [class.text-white]="colorMode() === 'dark'" />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="colorMode() === 'dark'">
                Mot de passe
              </label>
              <c-input-group>
                <input cFormControl
                       [type]="showPassword ? 'text' : 'password'"
                       [(ngModel)]="password"
                       name="password"
                       placeholder="Min. 8 caractères"
                       [class.bg-dark]="colorMode() === 'dark'"
                       [class.text-white]="colorMode() === 'dark'" />
                <button cButton color="secondary" variant="outline" type="button" (click)="showPassword = !showPassword">
                  <svg cIcon [name]="showPassword ? 'cilLowVision' : 'cilLockUnlocked'" size="sm"></svg>
                </button>
              </c-input-group>
              @if (password) {
                <div class="mt-2">
                  <div class="progress" style="height:4px;">
                    <div class="progress-bar" [style.width.%]="passwordStrengthPercent" [style.backgroundColor]="passwordStrengthColor"></div>
                  </div>
                  <small class="opacity-75" [style.color]="passwordStrengthColor">{{ passwordStrengthLabel }}</small>
                </div>
              }
              <div class="mt-2 small" [class.text-white]="colorMode() === 'dark'">
                <div [class.text-success]="passwordChecks[0]" [class.opacity-75]="!passwordChecks[0]">- Au moins 8 caracteres</div>
                <div [class.text-success]="passwordChecks[1]" [class.opacity-75]="!passwordChecks[1]">- Une lettre minuscule</div>
                <div [class.text-success]="passwordChecks[2]" [class.opacity-75]="!passwordChecks[2]">- Une lettre majuscule</div>
                <div [class.text-success]="passwordChecks[3]" [class.opacity-75]="!passwordChecks[3]">- Un chiffre</div>
                <div [class.text-success]="passwordChecks[4]" [class.opacity-75]="!passwordChecks[4]">- Un caractere special</div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="colorMode() === 'dark'">
                Confirmer le mot de passe
              </label>
              <c-input-group>
                <input cFormControl
                       [type]="showConfirmPassword ? 'text' : 'password'"
                       [(ngModel)]="confirmPassword"
                       name="confirmPassword"
                       placeholder="Répéter le mot de passe"
                       [class.bg-dark]="colorMode() === 'dark'"
                       [class.text-white]="colorMode() === 'dark'" />
                <button cButton color="secondary" variant="outline" type="button" (click)="showConfirmPassword = !showConfirmPassword">
                  <svg cIcon [name]="showConfirmPassword ? 'cilLowVision' : 'cilLockUnlocked'" size="sm"></svg>
                </button>
              </c-input-group>
              @if (confirmPassword && !passwordsMatch) {
                <small class="text-danger">Les mots de passe ne correspondent pas.</small>
              }
            </div>

            <button cButton color="primary" type="submit" class="w-100 py-2 shadow-sm fw-bold"
                    [disabled]="isSubmitting || !canSubmit">
              {{ isSubmitting ? 'Création...' : 'Créer mon espace institution' }}
            </button>

            <p class="text-center small opacity-75 mt-3" [class.text-white]="colorMode() === 'dark'">
              Vous êtes une entreprise ?
              <a routerLink="/register-company" class="text-primary fw-semibold text-decoration-none">Inscription entreprise</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IconDirective,
    ButtonDirective,
    FormControlDirective,
    FormDirective,
    InputGroupComponent,
    AlertComponent,
  ],
  styles: [`
    :host ::ng-deep .register-select {
      display: block;
      width: 100%;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: var(--cui-body-color);
      appearance: none;
      background-color: var(--cui-body-bg);
      background-clip: padding-box;
      border: var(--cui-border-width) solid var(--cui-border-color);
      border-radius: var(--cui-border-radius);
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    :host ::ng-deep .register-select:focus {
      color: var(--cui-body-color);
      background-color: var(--cui-body-bg);
      border-color: #86b7fe;
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    :host ::ng-deep .register-select option {
      color: var(--cui-body-color);
      background-color: var(--cui-body-bg);
    }
  `],
})
export class RegisterInstitutionComponent {
  email = '';
  password = '';
  confirmPassword = '';
  institutionName = '';
  institutionType = '';
  regionCode = '';

  showPassword = false;
  showConfirmPassword = false;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly institutionTypes = INSTITUTION_TYPES;
  readonly regionCodes = REGION_CODES;

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  get passwordChecks(): boolean[] {
    return [
      this.password.length >= 8,
      /[a-z]/.test(this.password),
      /[A-Z]/.test(this.password),
      /\d/.test(this.password),
      /[^A-Za-z0-9]/.test(this.password),
    ];
  }

  get passwordStrengthScore(): number {
    return this.passwordChecks.filter(Boolean).length;
  }

  get passwordStrengthPercent(): number {
    return (this.passwordStrengthScore / 5) * 100;
  }

  get passwordStrengthLabel(): string {
    if (!this.password) return 'Saisis un mot de passe';
    if (this.passwordStrengthScore <= 2) return 'Faible';
    if (this.passwordStrengthScore <= 4) return 'Moyen';
    return 'Fort';
  }

  get passwordStrengthColor(): string {
    if (this.passwordStrengthScore <= 2) return '#dc3545';
    if (this.passwordStrengthScore <= 4) return '#f7941e';
    return '#198754';
  }

  get passwordsMatch(): boolean {
    return this.confirmPassword.length > 0 && this.password === this.confirmPassword;
  }

  get isPasswordStrong(): boolean {
    return this.passwordStrengthScore === 5;
  }

  get canSubmit(): boolean {
    return (
      !!this.email &&
      !!this.password &&
      !!this.confirmPassword &&
      !!this.institutionName.trim() &&
      !!this.institutionType &&
      !!this.regionCode &&
      this.passwordsMatch &&
      this.isPasswordStrong
    );
  }

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly alerts: AlertService,
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.canSubmit) {
      this.errorMessage = 'Veuillez remplir tous les champs, utiliser un mot de passe fort et confirmer le mot de passe.';
      void this.alerts.error('Champs invalides', this.errorMessage);
      return;
    }

    this.isSubmitting = true;
    this.auth.registerInstitution({
      email: this.email.trim(),
      password: this.password,
      institution_name: this.institutionName.trim(),
      institution_type: this.institutionType,
      region_code: this.regionCode,
    }).subscribe({
      next: (response) => {
        const token = response.email_verification.token;
        if (token) {
          this.auth.verifyEmail(token).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.successMessage = 'Espace institution créé et vérifié. Vous pouvez maintenant vous connecter.';
              void this.alerts.success('Compte créé !', this.successMessage);
              setTimeout(() => this.router.navigate(['/login']), 1400);
            },
            error: () => {
              this.isSubmitting = false;
              this.successMessage = 'Espace institution créé. Vérifiez votre email pour activer votre compte.';
              void this.alerts.success('Compte créé !', this.successMessage);
              setTimeout(() => this.router.navigate(['/login']), 1400);
            }
          });
        } else {
          this.isSubmitting = false;
          this.successMessage = 'Espace institution créé. Vérifiez votre email pour activer votre compte.';
          void this.alerts.success('Compte créé !', this.successMessage);
          setTimeout(() => this.router.navigate(['/login']), 1400);
        }
      },
      error: (err: HttpErrorResponse | Error) => {
        this.isSubmitting = false;
        this.errorMessage = this.auth.getErrorMessage(err, "Impossible de créer l'espace institution.");
        void this.alerts.error('Inscription impossible', this.errorMessage);
      }
    });
  }
}
