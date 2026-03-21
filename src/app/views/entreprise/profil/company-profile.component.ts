import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  AlertComponent,
  BadgeComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ColorModeService,
  RowComponent
} from '@coreui/angular';

import { AuthService } from '../../../services/auth.service';
import { CompanyProfile, CompanyProfileService } from '../../../services/company-profile.service';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    BadgeComponent,
    AlertComponent
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Profil entreprise</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
            }

            @if (profile) {
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <h4 class="mb-1 fw-bold">{{ profile.company_name }}</h4>
                  <p class="small opacity-75 mb-0">{{ profile.company_identifier }}</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <c-badge [color]="profile.is_active ? 'success' : 'danger'" shape="rounded-pill">
                    {{ profile.is_active ? 'Actif' : 'Inactif' }}
                  </c-badge>
                  <c-badge color="warning" shape="rounded-pill">
                    {{ labels.verificationStatus(profile.verification_status) }}
                  </c-badge>
                </div>
              </div>

              <c-row class="g-4">
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Compte lié</div>
                  <div class="fw-semibold">{{ profile.account_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Propriétaire</div>
                  <div class="fw-semibold">{{ profile.owner_account_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">RCCM / Registre</div>
                  <div class="fw-semibold">{{ profile.registration_number }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Identifiant fiscal</div>
                  <div class="fw-semibold">{{ profile.tax_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Visibilité publique</div>
                  <div class="fw-semibold">{{ labels.visibility(profile.public_visibility_level) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Document RCCM</div>
                  <div class="fw-semibold">
                    {{ profile.has_rccm_document ? 'Présent' : 'Absent' }} · {{ labels.rccmStatus(profile.rccm_document_status) }}
                  </div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Créé le</div>
                  <div class="fw-semibold">{{ profile.created_at | date:'medium' }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Mis à jour le</div>
                  <div class="fw-semibold">{{ profile.updated_at | date:'medium' }}</div>
                </c-col>
              </c-row>
            } @else if (!isLoading) {
              <div class="text-center py-5 opacity-75">Aucun profil entreprise n’a été renvoyé par le backend.</div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class CompanyProfileComponent {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #companyProfileService = inject(CompanyProfileService);
  readonly #authService = inject(AuthService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  profile: CompanyProfile | null = null;
  isLoading = true;
  errorMessage = '';

  constructor() {
    this.#companyProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger le profil entreprise.');
        this.isLoading = false;
      }
    });
  }
}
