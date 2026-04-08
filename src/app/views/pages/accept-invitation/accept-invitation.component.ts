import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonDirective, CardBodyComponent, CardComponent, CardHeaderComponent } from '@coreui/angular';
import { CompanyUsersService } from '../../../services/company-users.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, RouterLink],
  template: `
    <div class="container py-5">
      <c-card class="border-0 shadow-sm mx-auto" style="max-width:640px;">
        <c-card-header class="bg-transparent py-3">
          <h4 class="mb-0">Invitation entreprise</h4>
        </c-card-header>
        <c-card-body class="p-4">
          @if (loading) {
            <div class="d-flex align-items-center gap-2">
              <span class="spinner-border spinner-border-sm"></span>
              <span>Validation de l'invitation...</span>
            </div>
          } @else if (success) {
            <div class="alert alert-success border-0">
              Invitation acceptee. Votre acces entreprise est maintenant actif.
            </div>
            <a cButton color="primary" routerLink="/dashboard">Aller au tableau de bord</a>
          } @else {
            <div class="alert alert-warning border-0">
              {{ message }}
            </div>
            @if (!isAuthenticated) {
              <a cButton color="primary" [routerLink]="['/login']">Se connecter</a>
            } @else {
              <button cButton color="primary" (click)="accept()">Reessayer</button>
            }
          }
        </c-card-body>
      </c-card>
    </div>
  `
})
export class AcceptInvitationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly companyUsersService = inject(CompanyUsersService);
  private readonly authService = inject(AuthService);
  loading = false;
  success = false;
  message = "Impossible de traiter l'invitation pour le moment.";
  isAuthenticated = this.authService.isAuthenticated();
  token = '';

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    if (!this.token) {
      this.message = "Lien d'invitation invalide.";
      return;
    }
    if (!this.isAuthenticated) {
      this.message = "Connecte-toi d'abord, puis reviens sur ce lien d'invitation.";
      return;
    }
    this.accept();
  }

  accept(): void {
    if (!this.token) {
      this.message = "Lien d'invitation invalide.";
      return;
    }
    this.loading = true;
    this.companyUsersService.acceptInvitation(this.token).subscribe({
      next: async () => {
        this.loading = false;
        this.success = true;
      },
      error: (error) => {
        this.loading = false;
        this.message = this.authService.getErrorMessage(error, "Ce lien d'invitation n'est plus valide.");
      }
    });
  }
}

