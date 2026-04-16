import { ChangeDetectorRef, Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { AdminCompanyVerificationService, CompanyVerificationDecision, CompanyVerificationQueueItem } from '../../../services/admin-company-verification.service';
import { CompanySuspensionService, CompanySuspensionStateResponse } from '../../../services/company-suspension.service';
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
    FormsModule,
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
                      <div class="fw-semibold">{{ company.rccm_document.original_filename }}</div>
                      <div class="small opacity-75">
                        Version {{ company.rccm_document.version_number }} ·
                        Statut: {{ labels.rccmStatus(company.rccm_document_status) }}
                      </div>
                    </div>
                    @if (rccmViewUrl) {
                      <a cButton color="primary" variant="outline" [href]="rccmViewUrl" target="_blank" rel="noopener">
                        Voir le RCCM
                      </a>
                    }
                  </div>
                </div>
              }
            </c-card-body>
          </c-card>

          <!-- Historique des décisions -->
          <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">Historique des décisions</h5>
            </c-card-header>
            <c-card-body class="p-4">
              @if (decisionHistory.length === 0) {
                <p class="small opacity-75 mb-0">Aucune décision enregistrée.</p>
              } @else {
                <ul class="list-unstyled mb-0">
                  @for (d of decisionHistory; track d.decision_identifier) {
                    <li class="mb-3 pb-3 border-bottom small" [class.border-secondary]="isDark()">
                      <div class="d-flex justify-content-between align-items-start">
                        <span class="badge" [class.bg-success]="d.action_code === 'VALIDATE'" [class.bg-danger]="d.action_code === 'REJECT'" [class.bg-secondary]="d.action_code !== 'VALIDATE' && d.action_code !== 'REJECT'">
                          {{ d.action_code }}
                        </span>
                        <span class="opacity-50">{{ d.decided_at | slice:0:10 }}</span>
                      </div>
                      <div class="mt-1"><span class="fw-semibold">Raison :</span> {{ d.reason_code }}</div>
                      @if (d.reason_details) {
                        <div class="opacity-75">{{ d.reason_details }}</div>
                      }
                      <div class="opacity-50">{{ d.previous_status }} → {{ d.next_status }}</div>
                    </li>
                  }
                </ul>
              }
            </c-card-body>
          </c-card>

          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h5 class="mb-0 fw-bold">Actions de vérification</h5>
            </c-card-header>
            <c-card-body class="p-4">
              <form [formGroup]="verificationForm">
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Code de raison</label>
                  <select class="form-control" cFormControl formControlName="reason_code"
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                    <option value="">Sélectionner une raison</option>
                    <option value="DOCUMENTS_COMPLETE">Documents complets</option>
                    <option value="DOCUMENTS_INCOMPLETE">Documents incomplets</option>
                    <option value="DOCUMENTS_INVALID">Documents invalides</option>
                    <option value="IDENTITY_MISMATCH">Incohérence d'identité</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Détails</label>
                  <textarea cFormControl formControlName="reason_details" rows="4"
                            placeholder="Ajoutez vos commentaires détaillés..."
                            [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
                </div>

                <div class="d-flex gap-2">
                  <button cButton color="success" type="button" [disabled]="isSubmitting" (click)="onApprove()" class="px-4">
                    <svg cIcon name="cilCheck" class="me-2"></svg>
                    {{ isSubmitting ? 'Traitement...' : 'Approuver' }}
                  </button>
                  <button cButton color="danger" type="button" [disabled]="isSubmitting" (click)="onReject()" class="px-4">
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
                    RC {{ company.registration_number ? '✓' : '✗' }}
                  </c-badge>
                </div>
              </div>

              <div class="small opacity-75 text-center">
                Créé le {{ company.created_at | date:'medium' }}
              </div>
            </c-card-body>
          </c-card>

          <!-- Suspension d'entreprise -->
          <c-card class="mt-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Suspension</h6>
            </c-card-header>
            <c-card-body class="p-4">
              @if (suspensionState) {
                @if (suspensionState.is_suspended) {
                  <div class="alert alert-danger small mb-3" role="alert">
                    Suspendue depuis {{ suspensionState.suspended_at | slice:0:10 }}<br>
                    Raison : {{ suspensionState.suspension_reason_code }}<br>
                    @if (suspensionState.suspension_reason_details) {
                      <span>{{ suspensionState.suspension_reason_details }}</span>
                    }
                  </div>
                  <button cButton color="success" size="sm" class="w-100" [disabled]="submittingSuspension" (click)="reactivate()">
                    {{ submittingSuspension ? 'Traitement…' : 'Réactiver' }}
                  </button>
                } @else {
                  <p class="small opacity-75 mb-3">Entreprise active.</p>
                  <div class="mb-2">
                    <select class="form-select form-select-sm mb-2" [(ngModel)]="suspendForm.reason_code"
                      [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                      <option value="">Raison…</option>
                      <option value="FRAUD">Fraude</option>
                      <option value="POLICY_VIOLATION">Violation de politique</option>
                      <option value="OTHER">Autre</option>
                    </select>
                    <input class="form-control form-control-sm" [(ngModel)]="suspendForm.reason_details"
                      placeholder="Détails…" [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
                  </div>
                  <button cButton color="danger" size="sm" class="w-100"
                    [disabled]="submittingSuspension || !suspendForm.reason_code"
                    (click)="suspend()">
                    {{ submittingSuspension ? 'Traitement…' : 'Suspendre' }}
                  </button>
                }
                @if (suspensionError) {
                  <div class="alert alert-warning mt-2 small mb-0" role="alert">{{ suspensionError }}</div>
                }
              } @else {
                <p class="small opacity-75 mb-0">Chargement…</p>
              }
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
  readonly #suspensionService = inject(CompanySuspensionService);
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
  rccmViewUrl: string | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  verificationForm!: FormGroup;

  decisionHistory: CompanyVerificationDecision[] = [];
  suspensionState: CompanySuspensionStateResponse | null = null;
  submittingSuspension = false;
  suspensionError = '';
  suspendForm = { reason_code: '', reason_details: '' };

  ngOnInit(): void {
    this.verificationForm = this.#fb.group({
      reason_code: ['', [Validators.required]],
      reason_details: ['', [Validators.required, Validators.minLength(10)]]
    });

    const initialIdentifier = this.#route.snapshot.paramMap.get('identifier')
      ?? this.#route.snapshot.queryParamMap.get('company');

    if (!initialIdentifier) {
      this.errorMessage = "Identifiant de l'entreprise non trouvé.";
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
        this.errorMessage = "Identifiant de l'entreprise non trouvé.";
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
    this.decisionHistory = [];
    this.suspensionState = null;
    this.companyAvatarUrl = 'assets/default.jpeg';
    this.rccmViewUrl = null;
    this.#cdr.markForCheck();

    this.#verificationService.getCompanyVerificationDetail(identifier).subscribe({
      next: (company) => {
        this.company = company;
        this.companyAvatarUrl = this.#authService.getAvatarUrl(company.company_identifier || 'SC');
        this.rccmViewUrl = company.rccm_document
          ? this.#verificationService.getRccmViewUrl(company.company_identifier)
          : null;
        this.isLoading = false;
        this.#cdr.markForCheck();
        this.loadDecisionHistory(company.company_identifier);
        this.loadSuspensionState(company.company_identifier);
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

  private loadDecisionHistory(companyIdentifier: string): void {
    this.#verificationService.getDecisionHistory(companyIdentifier).subscribe({
      next: (res) => { this.decisionHistory = res.items; this.#cdr.markForCheck(); },
      error: () => {}
    });
  }

  private loadSuspensionState(companyIdentifier: string): void {
    this.#suspensionService.getSuspensionState(companyIdentifier).subscribe({
      next: (state) => { this.suspensionState = state; this.#cdr.markForCheck(); },
      error: () => {}
    });
  }

  suspend(): void {
    if (!this.company || !this.suspendForm.reason_code) return;
    this.submittingSuspension = true;
    this.suspensionError = '';
    this.#suspensionService.suspendCompany(this.company.company_identifier, this.suspendForm).subscribe({
      next: (state) => {
        this.suspensionState = state;
        this.submittingSuspension = false;
        this.suspendForm = { reason_code: '', reason_details: '' };
        this.#cdr.markForCheck();
      },
      error: () => {
        this.suspensionError = 'Impossible de suspendre l\'entreprise.';
        this.submittingSuspension = false;
        this.#cdr.markForCheck();
      }
    });
  }

  reactivate(): void {
    if (!this.company) return;
    this.submittingSuspension = true;
    this.suspensionError = '';
    this.#suspensionService.reactivateCompany(this.company.company_identifier).subscribe({
      next: (state) => {
        this.suspensionState = state;
        this.submittingSuspension = false;
        this.#cdr.markForCheck();
      },
      error: () => {
        this.suspensionError = 'Impossible de réactiver l\'entreprise.';
        this.submittingSuspension = false;
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

  async onApprove(): Promise<void> {
    if (!this.company) return;
    const ok = await this.#alerts.confirmCompanyVerificationApprove(this.company.company_name);
    if (!ok) return;
    this.submitDecision('VALIDATE');
  }

  async onReject(): Promise<void> {
    if (!this.company) return;
    const prefill = String(this.verificationForm.value.reason_details ?? '').trim();
    const details = await this.#alerts.confirmCompanyVerificationReject(
      this.company.company_name,
      prefill.length >= 10 ? prefill : ''
    );
    if (details === null) return;
    const rc = String(this.verificationForm.value.reason_code ?? '').trim();
    this.verificationForm.patchValue({
      reason_details: details,
      reason_code: rc || 'DOCUMENTS_INVALID'
    });
    this.submitDecision('REJECT');
  }

  private submitDecision(actionCode: 'VALIDATE' | 'REJECT'): void {
    if (!this.company) {
      return;
    }
    const reasonCodeRaw = String(this.verificationForm.value.reason_code ?? '').trim();
    const reasonDetailsRaw = String(this.verificationForm.value.reason_details ?? '').trim();
    const reasonCode = reasonCodeRaw || (actionCode === 'VALIDATE' ? 'DOCUMENTS_COMPLETE' : 'DOCUMENTS_INVALID');
    const reasonDetails = reasonDetailsRaw || (
      actionCode === 'VALIDATE'
        ? 'Dossier complet et conforme apres verification administrative.'
        : 'Dossier non conforme apres verification administrative.'
    );

    this.isSubmitting = true;
    this.#verificationService.makeVerificationDecision(this.company.company_identifier, {
      action_code: actionCode,
      reason_code: reasonCode,
      reason_details: reasonDetails
    }).subscribe({
      next: (result) => {
        this.company = result.company;
        this.isSubmitting = false;
        const msg = actionCode === 'VALIDATE' ? 'approuvée' : 'rejetée';
        void this.#alerts.success(`Entreprise ${msg}`, `La vérification a été ${msg} avec succès.`);
        this.verificationForm.patchValue({ reason_code: '', reason_details: '' });
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.#authService.getErrorMessage(error, `Impossible d'effectuer cette action.`);
        this.#cdr.markForCheck();
      }
    });
  }
}
