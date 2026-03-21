import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  ColorModeService,
  FormControlDirective,
  FormDirective,
  InputGroupComponent
} from '@coreui/angular';

import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FormDirective,
    InputGroupComponent,
    FormControlDirective,
    ButtonDirective,
    IconDirective
  ]
})
export class ForgotPasswordComponent {
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  isRequesting = false;
  isResetting = false;
  errorMessage = '';
  successMessage = '';
  resetRequested = false;

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly currentIcon = computed(() => this.colorMode() === 'dark' ? 'cilSun' : 'cilMoon');
  readonly hasToken = computed(() => this.token.trim().length > 0);

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alerts: AlertService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  toggleTheme() {
    const nextMode = this.colorMode() === 'dark' ? 'light' : 'dark';
    this.#colorModeService.colorMode.set(nextMode);
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRequestReset(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Saisis ton adresse email.';
      void this.alerts.error('Email requis', this.errorMessage);
      return;
    }

    this.isRequesting = true;

    this.auth.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isRequesting = false;
        this.resetRequested = true;
        this.successMessage = 'Si cette adresse existe, les instructions de réinitialisation ont été envoyées.';
        void this.alerts.success('Demande envoyée', this.successMessage);
      },
      error: (error) => {
        this.isRequesting = false;
        this.errorMessage = this.auth.getErrorMessage(error, 'Impossible de générer la réinitialisation du mot de passe.');
        void this.alerts.error('Réinitialisation impossible', this.errorMessage);
      }
    });
  }

  onConfirmReset(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.token || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Complète le token et le nouveau mot de passe.';
      void this.alerts.error('Champs requis', this.errorMessage);
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      void this.alerts.error('Mot de passe invalide', this.errorMessage);
      return;
    }

    if (!/[a-z]/.test(this.newPassword) || !/[A-Z]/.test(this.newPassword) || !/\d/.test(this.newPassword) || !/[^A-Za-z0-9]/.test(this.newPassword)) {
      this.errorMessage = 'Le nouveau mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caractere special.';
      void this.alerts.error('Mot de passe trop faible', this.errorMessage);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      void this.alerts.error('Confirmation invalide', this.errorMessage);
      return;
    }

    this.isResetting = true;

    this.auth.confirmPasswordReset(this.token, this.newPassword).subscribe({
      next: () => {
        this.isResetting = false;
        this.successMessage = 'Mot de passe réinitialisé. Tu peux maintenant te reconnecter.';
        void this.alerts.success('Mot de passe réinitialisé', this.successMessage);
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (error) => {
        this.isResetting = false;
        this.errorMessage = this.auth.getErrorMessage(error, 'La réinitialisation du mot de passe a échoué.');
        void this.alerts.error('Échec de réinitialisation', this.errorMessage);
      }
    });
  }
}
