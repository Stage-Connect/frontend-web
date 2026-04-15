import { Component, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { Observable } from 'rxjs';
import {
  ButtonDirective,
  ColorModeService,
  FormControlDirective,
  FormDirective,
  InputGroupComponent
} from '@coreui/angular';

import { AuthService, RequestPasswordResetResponse, ResetPasswordByEmailResponse } from '../../../services/auth.service';
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
  recoveryMode: 'link' | 'email' = 'link';
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
  resetToken = '';
  resetLinkUrl = '';

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly currentIcon = computed(() => this.colorMode() === 'dark' ? 'cilSun' : 'cilMoon');
  readonly hasToken = computed(() => this.token.trim().length > 0);

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alerts: AlertService,
    private readonly cdr: ChangeDetectorRef
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

    const request$: Observable<RequestPasswordResetResponse | ResetPasswordByEmailResponse> = this.recoveryMode === 'email'
      ? this.auth.resetPasswordByEmail(this.email)
      : this.auth.requestPasswordReset(this.email);

    request$.subscribe({
      next: (response) => {
        this.isRequesting = false;
        this.resetRequested = true;
        this.cdr.markForCheck(); // Mets à jour le template immédiatement

        console.log('Response:', response); // DEBUG

        if (this.recoveryMode === 'email') {
          this.successMessage = 'Si cette adresse existe, un nouveau mot de passe a ete genere et envoye par email.';
          void this.alerts.success(
            'Nouveau mot de passe envoye',
            this.successMessage
          );
        } else {
          // Pour le mode lien, on reçoit le token dans la réponse
          const resetResponse = response as RequestPasswordResetResponse;
          console.log('Reset Response:', resetResponse); // DEBUG
          console.log('Token:', resetResponse.token); // DEBUG
          if (resetResponse.token) {
            this.resetToken = resetResponse.token;
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            this.resetLinkUrl = `${baseUrl}/forgot-password?token=${encodeURIComponent(this.resetToken)}`;
            this.successMessage = 'Lien de reinitialisation genere. Copiez-le et envoyez-le a votre adresse email.';
            this.cdr.markForCheck(); // Force Angular à mettre à jour le template
            void this.alerts.success(
              'Demande envoyee',
              this.successMessage
            );
          } else {
            console.error('No token in response!'); // DEBUG
          }
        }
      },
      error: (error: unknown) => {
        this.isRequesting = false;
        this.errorMessage = this.auth.getErrorMessage(
          error,
          this.recoveryMode === 'email'
            ? "Impossible d'envoyer un nouveau mot de passe par email."
            : 'Impossible de generer la reinitialisation du mot de passe.'
        );
        void this.alerts.error(
          this.recoveryMode === 'email' ? "Envoi impossible" : 'Reinitialisation impossible',
          this.errorMessage
        );
      }
    });
  }

  copyLinkToClipboard(): void {
    if (!this.resetLinkUrl) {
      return;
    }
    navigator.clipboard.writeText(this.resetLinkUrl).then(() => {
      void this.alerts.success('Copie réussie', 'Le lien a ete copie dans le presse-papiers.');
    }).catch(() => {
      void this.alerts.error('Erreur', 'Impossible de copier le lien.');
    });
  }

  openResetLink(): void {
    if (this.resetLinkUrl) {
      window.open(this.resetLinkUrl, '_self');
    }
  }

  goBackToRequest(): void {
    this.resetRequested = false;
    this.resetToken = '';
    this.resetLinkUrl = '';
    this.email = '';
    this.errorMessage = '';
    this.successMessage = '';
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
        this.successMessage = 'Mot de passe reinitialise. Tu peux maintenant te reconnecter.';
        void this.alerts.success('Mot de passe reinitialise', this.successMessage);
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (error) => {
        this.isResetting = false;
        this.errorMessage = this.auth.getErrorMessage(error, 'La réinitialisation du mot de passe a échoué.');
        void this.alerts.error('Échec de réinitialisation', this.errorMessage);
      }
    });
  }

  setRecoveryMode(mode: 'link' | 'email'): void {
    this.recoveryMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetRequested = false;
  }
}
