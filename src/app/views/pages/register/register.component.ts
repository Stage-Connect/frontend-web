import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  ColorModeService
} from '@coreui/angular';
import { computed, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormDirective,
    InputGroupComponent,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    RouterLink,
    FormsModule
  ]
})
export class RegisterComponent {
  companyName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly currentIcon = computed(() => {
    return this.colorMode() === 'dark' ? 'cilSun' : 'cilMoon';
  });

  get passwordChecks(): boolean[] {
    return [
      this.password.length >= 8,
      /[a-z]/.test(this.password),
      /[A-Z]/.test(this.password),
      /\d/.test(this.password),
      /[^A-Za-z0-9]/.test(this.password)
    ];
  }

  get passwordStrengthScore(): number {
    return this.passwordChecks.filter(Boolean).length;
  }

  get passwordStrengthPercent(): number {
    return (this.passwordStrengthScore / 5) * 100;
  }

  get passwordStrengthLabel(): string {
    if (!this.password) {
      return 'Saisis un mot de passe';
    }
    if (this.passwordStrengthScore <= 2) {
      return 'Faible';
    }
    if (this.passwordStrengthScore <= 4) {
      return 'Moyen';
    }
    return 'Fort';
  }

  get passwordStrengthColor(): string {
    if (this.passwordStrengthScore <= 2) {
      return '#dc3545';
    }
    if (this.passwordStrengthScore <= 4) {
      return '#f7941e';
    }
    return '#198754';
  }

  get passwordsMatch(): boolean {
    return this.confirmPassword.length > 0 && this.password === this.confirmPassword;
  }

  get isPasswordStrong(): boolean {
    return this.passwordStrengthScore === 5;
  }

  get canSubmit(): boolean {
    return !!this.companyName && !!this.email && this.isPasswordStrong && this.passwordsMatch;
  }

  toggleTheme() {
    const nextMode = this.colorMode() === 'dark' ? 'light' : 'dark';
    this.#colorModeService.colorMode.set(nextMode);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly alerts: AlertService
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.companyName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      void this.alerts.error('Champs requis', this.errorMessage);
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      void this.alerts.error('Mot de passe invalide', this.errorMessage);
      return;
    }

    if (!this.isPasswordStrong) {
      this.errorMessage = 'Le mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caractere special.';
      void this.alerts.error('Mot de passe trop faible', this.errorMessage);
      return;
    }

    if (!this.passwordsMatch) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      void this.alerts.error('Confirmation invalide', this.errorMessage);
      return;
    }

    this.isSubmitting = true;

    this.auth.registerCompany({
      company_name: this.companyName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.auth.verifyEmail(response.email_verification.token).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.successMessage = 'Compte entreprise créé et vérifié. Vous pouvez maintenant vous connecter.';
            void this.alerts.success('Compte créé', this.successMessage);
            setTimeout(() => this.router.navigate(['/login']), 1200);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.errorMessage = this.auth.getErrorMessage(error, 'Le compte a été créé, mais la vérification de l’email a échoué.');
            void this.alerts.error('Vérification email échouée', this.errorMessage);
          }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.auth.getErrorMessage(error, 'Impossible de créer le compte entreprise.');
        void this.alerts.error('Inscription impossible', this.errorMessage);
      }
    });
  }
}
