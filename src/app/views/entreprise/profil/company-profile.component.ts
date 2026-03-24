import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ColorModeService,
  RowComponent,
  FormControlDirective,
  FormLabelDirective
} from '@coreui/angular';

import { AuthService } from '../../../services/auth.service';
import {
  CompanyProfile,
  CompanyProfileService,
  CreateCompanyProfilePayload,
  CompanyRccmDocument
} from '../../../services/company-profile.service';
import { backendLabels } from '../../../core/backend-labels';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    BadgeComponent,
    AlertComponent,
    ButtonDirective,
    FormControlDirective,
    FormLabelDirective
  ],
  template: `
    @if (errorMessage) {
      <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
    }

    @if (successMessage) {
      <c-alert color="success" class="border-0 shadow-sm mb-4">{{ successMessage }}</c-alert>
    }

    @if (isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
            <span class="spinner-border spinner-border-sm"></span>
            <span>Chargement du profil...</span>
          </div>
        </c-col>
      </c-row>
    } @else if (profile) {
      <c-row>
        <c-col lg="8">
          <c-card class="border-0 shadow-sm mb-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">Profil entreprise</h5>
              <c-badge [color]="getVerificationColor()" shape="rounded-pill">
                {{ labels.verificationStatus(profile.verification_status) }}
              </c-badge>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <h4 class="mb-1 fw-bold">{{ profile.company_name }}</h4>
                  <p class="small opacity-75 mb-0">{{ profile.company_identifier }}</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <c-badge [color]="profile.is_active ? 'success' : 'danger'" shape="rounded-pill">
                    {{ profile.is_active ? 'Actif' : 'Inactif' }}
                  </c-badge>
                  <c-badge color="info" shape="rounded-pill">
                    {{ labels.rccmStatus(profile.rccm_document_status) }}
                  </c-badge>
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between small mb-2" [class.text-white]="isDark()" [class.text-muted]="!isDark()">
                  <span>Progression du profil</span>
                  <span>{{ profileCompletionRate }}%</span>
                </div>
                <div class="progress" style="height: 12px;" [style.backgroundColor]="isDark() ? '#1d2a39' : '#eef2f7'">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    [style.width.%]="profileCompletionRate"
                    [attr.aria-valuenow]="profileCompletionRate"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style="background-color: #004a99;"
                  ></div>
                </div>
                <div class="small mt-2 opacity-75">
                  {{ profileCompletionSummary }}
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
            </c-card-body>
          </c-card>
        </c-col>

        <c-col lg="4">
          <c-card class="border-0 shadow-sm mb-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Photo de profil</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <img
                  [src]="currentAvatarUrl"
                  alt="Avatar utilisateur"
                  class="rounded-circle border"
                  style="width: 72px; height: 72px; object-fit: cover; border-color: rgba(255,255,255,0.12);"
                />
                <div>
                  <div class="fw-semibold">{{ currentUserLabel }}</div>
                  <div class="small opacity-75">Photo par défaut: default.jpeg</div>
                </div>
              </div>

              <div class="mb-3">
                <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Nouvelle photo</label>
                <input
                  cFormControl
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  (change)="onAvatarFileSelected($event)"
                  [class.bg-dark]="isDark()"
                  [class.text-white]="isDark()"
                  [class.border-white]="isDark()"
                  [class.border-opacity-10]="isDark()"
                />
                @if (selectedAvatarFileName) {
                  <div class="small mt-2 opacity-75">{{ selectedAvatarFileName }}</div>
                }
              </div>

              <button
                cButton
                color="primary"
                type="button"
                class="w-100 mb-4"
                [disabled]="isUploadingAvatar || !selectedAvatarFile"
                (click)="uploadAvatar()"
              >
                {{ isUploadingAvatar ? 'Envoi...' : 'Déposer la photo' }}
              </button>
            </c-card-body>
          </c-card>

          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Document RCCM</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="mb-3">
                <p class="small opacity-75 mb-2">
                  Le backend autorise le dépôt et le remplacement du document RCCM.
                </p>
                <div class="d-flex gap-2 flex-wrap mb-3">
                  <c-badge [color]="profile.has_rccm_document ? 'success' : 'secondary'" shape="rounded-pill">
                    {{ profile.has_rccm_document ? 'Déposé' : 'Absent' }}
                  </c-badge>
                  <c-badge [color]="getVerificationColor()" shape="rounded-pill">
                    {{ labels.verificationStatus(profile.verification_status) }}
                  </c-badge>
                </div>
                <div class="small opacity-75">
                  {{ profile.rccm_last_uploaded_at ? ('Dernier dépôt: ' + (profile.rccm_last_uploaded_at | date:'medium')) : 'Aucun dépôt RCCM enregistré.' }}
                </div>
              </div>

              <div class="mb-3">
                <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Fichier RCCM</label>
                <input
                  cFormControl
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  (change)="onRccmFileSelected($event)"
                  [class.bg-dark]="isDark()"
                  [class.text-white]="isDark()"
                  [class.border-white]="isDark()"
                  [class.border-opacity-10]="isDark()"
                />
                @if (selectedRccmFileName) {
                  <div class="small mt-2 opacity-75">{{ selectedRccmFileName }}</div>
                }
              </div>

              <button
                cButton
                color="primary"
                type="button"
                class="w-100"
                [disabled]="isUploadingRccm || !selectedRccmFile"
                (click)="uploadRccm()"
              >
                {{ isUploadingRccm ? 'Envoi...' : 'Déposer le RCCM' }}
              </button>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (profileMissing) {
      <c-row>
        <c-col lg="8">
          <c-card class="border-0 shadow-sm mb-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">Créer le profil entreprise</h5>
            </c-card-header>
            <c-card-body class="p-4">
              <form [formGroup]="createForm" (ngSubmit)="createProfile()">
                <c-row class="g-4">
                  <c-col md="6">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Nom de l'entreprise</label>
                    <input cFormControl formControlName="company_name" placeholder="Ex: StageConnect SARL" />
                  </c-col>
                  <c-col md="6">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Numéro de registre</label>
                    <input cFormControl formControlName="registration_number" placeholder="Ex: RC/DLA/2026/001" />
                  </c-col>
                  <c-col md="6">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Identifiant fiscal</label>
                    <input cFormControl formControlName="tax_identifier" placeholder="Ex: NIU-000000000" />
                  </c-col>
                </c-row>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                  <button cButton color="primary" type="submit" [disabled]="isCreating" class="px-4">
                    {{ isCreating ? 'Création...' : 'Créer le profil' }}
                  </button>
                </div>
              </form>
            </c-card-body>
          </c-card>
        </c-col>

        <c-col lg="4">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Etat du dossier</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <p class="small opacity-75 mb-0">
                Aucun profil n'a encore été créé pour ce compte. Le backend accepte uniquement la création initiale et le dépôt du RCCM.
              </p>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (!isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="text-center py-5 opacity-75">
            <p>Aucun profil entreprise disponible.</p>
          </div>
        </c-col>
      </c-row>
    }
  `
})
export class CompanyProfileComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #companyProfileService = inject(CompanyProfileService);
  readonly #authService = inject(AuthService);
  readonly #fb = inject(FormBuilder);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  profile: CompanyProfile | null = null;
  isLoading = true;
  profileMissing = false;
  isCreating = false;
  isUploadingRccm = false;
  isUploadingAvatar = false;
  errorMessage = '';
  successMessage = '';
  createForm!: FormGroup;
  selectedRccmFile: File | null = null;
  selectedRccmFileName = '';
  selectedAvatarFile: File | null = null;
  selectedAvatarFileName = '';

  ngOnInit(): void {
    this.loadProfile();
    this.initCreateForm();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.#cdr.markForCheck();

    this.#companyProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
        this.profileMissing = false;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        if (error?.status === 404) {
          this.profile = null;
          this.profileMissing = true;
          this.errorMessage = '';
          this.#cdr.markForCheck();
          return;
        }
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger le profil entreprise.');
        this.#cdr.markForCheck();
      }
    });
  }

  private initCreateForm(): void {
    this.createForm = this.#fb.group({
      company_name: ['', [Validators.required, Validators.minLength(2)]],
      registration_number: ['', [Validators.required, Validators.minLength(4)]],
      tax_identifier: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  createProfile(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateCompanyProfilePayload = {
      company_name: this.createForm.get('company_name')?.value,
      registration_number: this.createForm.get('registration_number')?.value,
      tax_identifier: this.createForm.get('tax_identifier')?.value
    };

    this.#companyProfileService.createMyProfile(payload).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileMissing = false;
        this.isCreating = false;
        void Swal.fire({
          title: 'Profil créé',
          text: 'Le profil entreprise a été créé avec succès.',
          icon: 'success',
          confirmButtonColor: '#004a99'
        });
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isCreating = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de créer le profil entreprise.');
        this.#cdr.markForCheck();
      }
    });
  }

  onRccmFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedRccmFile = file;
    this.selectedRccmFileName = file?.name ?? '';
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedAvatarFile = file;
    this.selectedAvatarFileName = file?.name ?? '';
  }

  uploadRccm(): void {
    if (!this.selectedRccmFile || !this.profile) {
      return;
    }

    this.isUploadingRccm = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.#companyProfileService.uploadRccmDocument(this.selectedRccmFile).subscribe({
      next: (document: CompanyRccmDocument) => {
        this.isUploadingRccm = false;
        this.selectedRccmFile = null;
        this.selectedRccmFileName = '';
        this.successMessage = `Document RCCM déposé: ${document.original_filename}`;
        void Swal.fire({
          title: 'Document envoyé',
          text: 'Le document RCCM a été enregistré avec succès.',
          icon: 'success',
          confirmButtonColor: '#004a99'
        });
        this.loadProfile();
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isUploadingRccm = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de déposer le document RCCM.');
        this.#cdr.markForCheck();
      }
    });
  }

  uploadAvatar(): void {
    if (!this.selectedAvatarFile) {
      return;
    }

    const currentUser = this.#authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'Session introuvable pour déposer la photo de profil.';
      return;
    }

    this.isUploadingAvatar = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.#authService.uploadMyAvatar(this.selectedAvatarFile).subscribe({
      next: ({ avatar_url }) => {
        this.isUploadingAvatar = false;
        this.selectedAvatarFile = null;
        this.selectedAvatarFileName = '';
        this.#authService.setAvatarUrl(currentUser.id, avatar_url);
        this.successMessage = 'Photo de profil déposée avec succès.';
        void Swal.fire({
          title: 'Photo envoyée',
          text: 'La photo de profil a été enregistrée avec succès.',
          icon: 'success',
          confirmButtonColor: '#004a99'
        });
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isUploadingAvatar = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de déposer la photo de profil.');
        this.#cdr.markForCheck();
      }
    });
  }

  getVerificationColor(): string {
    const statusColors: Record<string, string> = {
      'VERIFIED': 'success',
      'PENDING_VERIFICATION': 'warning',
      'REJECTED': 'danger',
      'IN_REVIEW': 'info'
    };
    return statusColors[this.profile?.verification_status || ''] || 'secondary';
  }

  get profileCompletionRate(): number {
    if (!this.profile) {
      return 0;
    }

    const checks = [
      !!this.profile.company_name.trim(),
      !!this.profile.registration_number.trim(),
      !!this.profile.tax_identifier.trim(),
      this.profile.has_rccm_document
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  get profileCompletionSummary(): string {
    if (!this.profile) {
      return 'Aucune donnée de profil disponible.';
    }

    const missing: string[] = [];
    if (!this.profile.company_name.trim()) {
      missing.push("nom de l'entreprise");
    }
    if (!this.profile.registration_number.trim()) {
      missing.push('numéro de registre');
    }
    if (!this.profile.tax_identifier.trim()) {
      missing.push("identifiant fiscal");
    }
    if (!this.profile.has_rccm_document) {
      missing.push('document RCCM');
    }

    if (missing.length === 0) {
      return 'Profil prêt à l’emploi.';
    }

    return `À compléter: ${missing.join(', ')}.`;
  }

  get currentAvatarUrl(): string {
    return this.#authService.getCurrentUser()?.avatarUrl
      || this.#authService.getCurrentUser()?.avatar
      || 'assets/default.jpeg';
  }

  get currentUserLabel(): string {
    return this.#authService.getCurrentUser()?.name || 'Entreprise';
  }
}
