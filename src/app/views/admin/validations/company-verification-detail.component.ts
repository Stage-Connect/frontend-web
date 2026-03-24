import { ChangeDetectorRef, Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  ColorModeService,
  AvatarComponent,
  FormControlDirective,
  FormLabelDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AdminCompanyVerificationService, CompanyVerificationQueueItem } from '../../../services/admin-company-verification.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';
import { AlertService } from '../../../services/alert.service';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-company-verification-detail',
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
    BadgeComponent,
    AlertComponent,
    ButtonDirective,
    IconDirective,
    AvatarComponent,
    FormLabelDirective,
    FormControlDirective
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <div class="d-flex align-items-center gap-3 mb-3">
          <button cButton color="secondary" variant="ghost" routerLink=".." class="p-2">
            <svg cIcon name="cilArrowLeft" size="sm"></svg>
          </button>
          <h4 class="mb-0 fw-bold" [class.text-white]="isDark()">Détails de l'entreprise</h4>
        </div>
      </c-col>
    </c-row>

    @if (errorMessage) {
      <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
    }

    @if (isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
            <span class="spinner-border spinner-border-sm"></span>
            <span>Chargement des détails...</span>
          </div>
        </c-col>
      </c-row>
    } @else if (company) {
      <c-row>
        <c-col lg="8">
          <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold">{{ company.company_name }}</h5>
                <div class="d-flex gap-2">
                  <c-badge [color]="getStatusColor()" shape="rounded-pill" class="px-3 py-2">
                    {{ labels.verificationStatus(company.verification_status) }}
                  </c-badge>
                  <c-badge [color]="company.has_rccm_document ? 'success' : 'secondary'" shape="rounded-pill">
                    {{ company.has_rccm_document ? 'RCCM présent' : 'RCCM absent' }}
                  </c-badge>
                </div>
              </div>
            </c-card-header>
            <c-card-body class="p-4">
              <c-row class="g-4">
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Identifiant entreprise</div>
                  <div class="fw-semibold">{{ company.company_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Identifiant compte</div>
                  <div class="fw-semibold">{{ company.account_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Numéro de registre</div>
                  <div class="fw-semibold">{{ company.registration_number || 'Non renseigné' }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Identifiant fiscal</div>
                  <div class="fw-semibold">{{ company.tax_identifier || 'Non renseigné' }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Statut de vérification</div>
                  <div class="fw-semibold">{{ labels.verificationStatus(company.verification_status) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Statut du document RCCM</div>
                  <div class="fw-semibold">{{ labels.rccmStatus(company.rccm_document_status) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Date de création</div>
                  <div class="fw-semibold">{{ company.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Dernière mise à jour</div>
                  <div class="fw-semibold">{{ company.updated_at | date:'dd/MM/yyyy HH:mm' }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Score de priorité</div>
                  <div class="fw-semibold">
                    <span class="badge" [style.backgroundColor]="getPriorityColor()">{{ company.dossier_priority_score }}</span>
                  </div>
                </c-col>
              </c-row>

              @if (company.rccm_document) {
                <hr [class.border-white]="isDark()" [class.border-opacity-10]="isDark()" class="my-4" />
                <div class="mb-3">
                  <h6 class="fw-bold mb-3">Document RCCM</h6>
                  <div class="d-flex align-items-center gap-3 p-3 rounded" 
                       [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,74,153,0.05)'">
                    <svg cIcon name="cilFile" size="lg"></svg>
                    <div>
                      <div class="fw-semibold">Document RCCM</div>
                      <div class="small opacity-75">
                        Statut: {{ labels.rccmStatus(company.rccm_document_status) }}
                      </div>
                    </div>
                  </div>
                </div>
              }
            </c-card-body>
          </c-card>

          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">Actions de vérification</h5>
            </c-card-header>
            <c-card-body class="p-4">
              <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Notes de vérification</label>
                  <textarea cFormControl formControlName="notes" rows="4" 
                            placeholder="Ajoutez vos notes sur cette vérification..."
                            [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
                </div>

                <div class="d-flex gap-2">
                  <button cButton color="success" type="submit" [disabled]="isSubmitting || verificationForm.invalid" class="px-4">
                    <svg cIcon name="cilCheck" class="me-2"></svg>
                    {{ isSubmitting ? 'Traitement...' : 'Approuver' }}
                  </button>
                  <button cButton color="danger" type="button" [disabled]="isSubmitting" (click)="reject()" class="px-4">
                    <svg cIcon name="cilX" class="me-2"></svg>
                    Rejeter
                  </button>
                  <button cButton color="secondary" variant="outline" routerLink=".." class="px-4">
                    Retour
                  </button>
                </div>
              </form>
            </c-card-body>
          </c-card>
        </c-col>

        <c-col lg="4">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Statut actuel</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="text-center mb-4">
                <c-avatar [src]="companyAvatarUrl" size="xl" class="mb-3"></c-avatar>
                <h5 class="fw-bold mb-1">{{ company.company_name }}</h5>
                <p class="small opacity-75 mb-0">{{ company.company_identifier }}</p>
              </div>

              <div class="mb-3">
                <div class="small text-uppercase opacity-50 mb-2 text-center">Documents</div>
                <div class="d-flex justify-content-center gap-2 flex-wrap">
                  <c-badge [color]="company.has_rccm_document ? 'success' : 'secondary'" shape="rounded-pill">
                    RCCM {{ company.has_rccm_document ? '✓' : '✗' }}
                  </c-badge>
                  <c-badge [color]="company.tax_identifier ? 'success' : 'secondary'" shape="rounded-pill">
                    IF {{ company.tax_identifier ? '✓' : '✗' }}
                  </c-badge>
                  <c-badge [color]="company.registration_number ? 'success' : 'secondary'" shape="rounded-pill">
                    RCCM {{ company.registration_number ? '✓' : '✗' }}
                  </c-badge>
                </div>
              </div>

              <div class="small opacity-75 text-center">
                Créé le {{ company.created_at | date:'medium' }}
              </div>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (!isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="text-center py-5 opacity-75">
            <p>Aucune entreprise trouvée.</p>
            <button cButton color="primary" routerLink="..">Retour à la liste</button>
          </div>
        </c-col>
      </c-row>
    }
  `
})
export class CompanyVerificationDetailComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #verificationService = inject(AdminCompanyVerificationService);
  readonly #authService = inject(AuthService);
  readonly #alerts = inject(AlertService);
  readonly #route = inject(ActivatedRoute);
  readonly #fb = inject(FormBuilder);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  company: CompanyVerificationQueueItem | null = null;
  companyAvatarUrl = 'assets/default.jpeg';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  verificationForm!: FormGroup;

  ngOnInit(): void {
    this.verificationForm = this.#fb.group({
      notes: ['', [Validators.required, Validators.minLength(10)]]
    });

    const initialIdentifier = this.#route.snapshot.paramMap.get('identifier')
      ?? this.#route.snapshot.queryParamMap.get('company');

    if (!initialIdentifier) {
      this.errorMessage = 'Identifiant de l\'entreprise non trouvé.';
      this.isLoading = false;
      this.#cdr.markForCheck();
      return;
    }

    combineLatest([this.#route.paramMap, this.#route.queryParamMap]).pipe(
      map(([params, queryParams]) => params.get('identifier') ?? queryParams.get('company')),
      distinctUntilChanged(),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe((identifier) => {
      if (!identifier) {
        this.company = null;
        this.companyAvatarUrl = 'assets/default.jpeg';
        this.errorMessage = 'Identifiant de l\'entreprise non trouvé.';
        this.isLoading = false;
        this.#cdr.markForCheck();
        return;
      }

      this.loadCompany(identifier);
    });
  }

  private loadCompany(identifier: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.company = null;
    this.companyAvatarUrl = 'assets/default.jpeg';
    this.#cdr.markForCheck();

    this.#verificationService.getCompany(identifier).subscribe({
      next: (company) => {
        try {
          this.company = company;
          this.companyAvatarUrl = this.#authService.getAvatarUrl(company.company_identifier || 'SC');
        } catch {
          this.companyAvatarUrl = 'assets/default.jpeg';
        } finally {
          this.isLoading = false;
          this.#cdr.markForCheck();
        }
      },
      error: (error) => {
        this.company = null;
        this.companyAvatarUrl = 'assets/default.jpeg';
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger cette entreprise.');
        this.isLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  getStatusColor(): string {
    const statusColors: Record<string, string> = {
      'VERIFIED': 'success',
      'PENDING_VERIFICATION': 'warning',
      'REJECTED': 'danger',
      'IN_REVIEW': 'info'
    };
    return statusColors[this.company?.verification_status || ''] || 'secondary';
  }

  getPriorityColor(): string {
    const score = this.company?.dossier_priority_score ?? 0;
    if (score >= 80) return '#dc3545';
    if (score >= 50) return '#f7941e';
    return '#198754';
  }

  onSubmit(): void {
    if (this.verificationForm.invalid || !this.company) {
      return;
    }

    this.isSubmitting = true;
    this.#verificationService.approveCompany(this.company.company_identifier, {
      action_code: 'APPROVE',
      notes: this.verificationForm.value.notes
    }).subscribe({
      next: (company) => {
        this.company = company;
        this.isSubmitting = false;
        void this.#alerts.success('Entreprise approuvée', 'La vérification a été approuvée avec succès.');
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible d\'approuver cette entreprise.');
        this.#cdr.markForCheck();
      }
    });
  }

  reject(): void {
    if (!this.company) {
      return;
    }

    this.isSubmitting = true;
    this.#verificationService.rejectCompany(this.company.company_identifier, {
      action_code: 'REJECT',
      notes: this.verificationForm.value.notes || 'Rejet de la vérification'
    }).subscribe({
      next: (company) => {
        this.company = company;
        this.isSubmitting = false;
        void this.#alerts.error('Entreprise rejetée', 'La vérification a été rejetée.');
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de rejeter cette entreprise.');
        this.#cdr.markForCheck();
      }
    });
  }
}
