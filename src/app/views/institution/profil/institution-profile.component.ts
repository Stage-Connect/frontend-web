import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  ColorModeService,
  ButtonDirective,
  AlertComponent
} from '@coreui/angular';
import {
  InstitutionService,
  InstitutionProfileResponse,
  CreateInstitutionProfileRequest
} from '../../../services/institution.service';

@Component({
  selector: 'app-institution-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    AlertComponent
  ],
  template: `
    <c-row class="g-4">
      @if (errorMessage) {
        <c-col xs="12">
          <c-alert color="danger">{{ errorMessage }}</c-alert>
        </c-col>
      }
      @if (successMessage) {
        <c-col xs="12">
          <c-alert color="success">{{ successMessage }}</c-alert>
        </c-col>
      }

      @if (isLoading) {
        <c-col xs="12">
          <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
            <span class="spinner-border spinner-border-sm"></span>
            <span>Chargement du profil…</span>
          </div>
        </c-col>
      } @else if (profile) {
        <!-- Profil existant -->
        <c-col lg="8">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center"
              [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">{{ profile.institution_name }}</h5>
              <div class="d-flex gap-2">
                <span class="badge"
                  [class.bg-success]="profile.profile_status === 'VERIFIED'"
                  [class.bg-warning]="profile.profile_status === 'PENDING'"
                  [class.bg-secondary]="profile.profile_status !== 'VERIFIED' && profile.profile_status !== 'PENDING'">
                  {{ profile.profile_status }}
                </span>
                <span class="badge"
                  [class.bg-primary]="profile.partnership_status === 'ACTIVE'"
                  [class.bg-secondary]="profile.partnership_status !== 'ACTIVE'">
                  {{ profile.partnership_status }}
                </span>
              </div>
            </c-card-header>
            <c-card-body class="p-4">
              <c-row class="g-3">
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Identifiant</div>
                  <div class="fw-semibold small">{{ profile.institution_id }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Type</div>
                  <div class="fw-semibold">{{ profile.institution_type }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Région</div>
                  <div class="fw-semibold">{{ profile.region_code }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Compte</div>
                  <div class="fw-semibold small">{{ profile.account_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Créé le</div>
                  <div class="fw-semibold">{{ profile.created_at | slice:0:10 }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Mis à jour le</div>
                  <div class="fw-semibold">{{ profile.updated_at | slice:0:10 }}</div>
                </c-col>
              </c-row>
            </c-card-body>
          </c-card>
        </c-col>

        <c-col lg="4">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom"
              [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Vérification</h6>
            </c-card-header>
            <c-card-body class="p-4">
              @if (profile.profile_status === 'VERIFIED') {
                <div class="alert alert-success small mb-0" role="alert">Établissement vérifié.</div>
              } @else {
                <p class="small opacity-75 mb-3">
                  Demandez la vérification pour activer votre partenariat avec StageConnect.
                </p>
                <button cButton color="primary" class="w-100" [disabled]="requestingVerification"
                  (click)="requestVerification()">
                  {{ requestingVerification ? 'Envoi…' : 'Demander la vérification' }}
                </button>
              }
            </c-card-body>
          </c-card>
        </c-col>

      } @else {
        <!-- Formulaire de création -->
        <c-col lg="8">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom"
              [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">Créer le profil établissement</h5>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nom de l'établissement</label>
                <input class="form-control" [(ngModel)]="createForm.institution_name"
                  placeholder="Ex: Université de Douala"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Type</label>
                <select class="form-select" [(ngModel)]="createForm.institution_type"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">-- Sélectionner --</option>
                  <option value="UNIVERSITY">Université</option>
                  <option value="SCHOOL">École</option>
                  <option value="INSTITUTE">Institut</option>
                  <option value="TRAINING_CENTER">Centre de formation</option>
                  <option value="VOCATIONAL_CENTER">Centre de formation professionnelle</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Région</label>
                <select class="form-select" [(ngModel)]="createForm.region_code"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">-- Sélectionner --</option>
                  <option value="CM-CE">Centre</option>
                  <option value="CM-LT">Littoral</option>
                  <option value="CM-OU">Ouest</option>
                  <option value="CM-NO">Nord</option>
                  <option value="CM-AD">Adamaoua</option>
                  <option value="CM-EN">Extrême-Nord</option>
                  <option value="CM-NW">Nord-Ouest</option>
                  <option value="CM-SW">Sud-Ouest</option>
                  <option value="CM-SU">Sud</option>
                  <option value="CM-ES">Est</option>
                </select>
              </div>
              <button cButton color="primary"
                [disabled]="creating || !createForm.institution_name || !createForm.institution_type || !createForm.region_code"
                (click)="createProfile()">
                {{ creating ? 'Création…' : 'Créer le profil' }}
              </button>
            </c-card-body>
          </c-card>
        </c-col>
      }
    </c-row>
  `
})
export class InstitutionProfileComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly svc = inject(InstitutionService);

  profile: InstitutionProfileResponse | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  creating = false;
  requestingVerification = false;

  createForm: CreateInstitutionProfileRequest = {
    institution_name: '',
    institution_type: '',
    region_code: ''
  };

  ngOnInit(): void {
    this.svc.getMyProfile().subscribe({
      next: (p) => { this.profile = p; this.isLoading = false; },
      error: (err) => {
        if (err?.status === 404) {
          this.profile = null;
        } else {
          this.errorMessage = 'Impossible de charger le profil établissement.';
        }
        this.isLoading = false;
      }
    });
  }

  createProfile(): void {
    if (!this.createForm.institution_name || !this.createForm.institution_type || !this.createForm.region_code) return;
    this.creating = true;
    this.errorMessage = '';
    this.svc.createProfile(this.createForm).subscribe({
      next: (p) => {
        this.profile = p;
        this.creating = false;
        this.successMessage = 'Profil créé avec succès.';
      },
      error: () => {
        this.errorMessage = 'Impossible de créer le profil.';
        this.creating = false;
      }
    });
  }

  requestVerification(): void {
    this.requestingVerification = true;
    this.svc.requestVerification().subscribe({
      next: (res) => {
        if (this.profile) {
          this.profile = { ...this.profile, profile_status: res.profile_status, partnership_status: res.partnership_status };
        }
        this.requestingVerification = false;
        this.successMessage = 'Demande de vérification envoyée.';
      },
      error: () => {
        this.errorMessage = 'Impossible d\'envoyer la demande de vérification.';
        this.requestingVerification = false;
      }
    });
  }
}
