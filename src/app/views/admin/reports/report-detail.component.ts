import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  FormLabelDirective,
  FormSelectDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AdminReportsService, ModerationReportDetail } from '../../../services/admin-reports.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-report-detail',
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
    FormControlDirective,
    FormSelectDirective
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <div class="d-flex align-items-center gap-3 mb-3">
          <button cButton color="secondary" variant="ghost" routerLink=".." class="p-2">
            <svg cIcon name="cilArrowLeft" size="sm"></svg>
          </button>
          <h4 class="mb-0 fw-bold" [class.text-white]="isDark()">Détails du signalement</h4>
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
    } @else if (report) {
      <c-row>
        <c-col lg="8">
          <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold">Signalement #{{ report.report_identifier }}</h5>
                <c-badge [color]="getStatusColor()" shape="rounded-pill" class="px-3 py-2">
                  {{ labels.status(report.status_code) }}
                </c-badge>
              </div>
            </c-card-header>
            <c-card-body class="p-4">
              <c-row class="g-4">
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Type de cible</div>
                  <div class="fw-semibold">{{ labels.prettify(report.target_kind) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Identifiant cible</div>
                  <div class="fw-semibold text-break">{{ report.target_identifier }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Raison</div>
                  <div class="fw-semibold">{{ labels.reasonCode(report.reason_code) }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Priorité</div>
                  <div class="fw-semibold">
                    <c-badge [color]="getPriorityColor()" shape="rounded-pill">
                      {{ labels.priority(report.priority_code) }}
                    </c-badge>
                  </div>
                </c-col>
                <c-col md="12">
                  <div class="small text-uppercase opacity-50 mb-1">Résumé de la cible</div>
                  <div class="fw-semibold">{{ report.target_summary }}</div>
                </c-col>
                <c-col md="12">
                  <div class="small text-uppercase opacity-50 mb-1">Détails de la raison</div>
                  <div class="p-3 rounded" [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,74,153,0.05)'">
                    {{ report.reason_details }}
                  </div>
                </c-col>
                @if (report.context_json && report.context_json !== '{}') {
                  <c-col md="12">
                    <div class="small text-uppercase opacity-50 mb-1">Contexte JSON</div>
                    <pre class="p-3 rounded small mb-0" [style.backgroundColor]="isDark() ? '#1d2a39' : '#f6f7fb'">{{ report.context_json }}</pre>
                  </c-col>
                }
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Date de création</div>
                  <div class="fw-semibold">{{ report.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
                </c-col>
                <c-col md="6">
                  <div class="small text-uppercase opacity-50 mb-1">Dernière mise à jour</div>
                  <div class="fw-semibold">{{ report.updated_at | date:'dd/MM/yyyy HH:mm' }}</div>
                </c-col>
              </c-row>
            </c-card-body>
          </c-card>

          @if (!report.decision) {
            <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
              <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <h5 class="mb-0 fw-bold">Prendre une décision</h5>
              </c-card-header>
              <c-card-body class="p-4">
                <form [formGroup]="decisionForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Type d'action</label>
                    <select cSelect formControlName="actionCode"
                            [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                      <option value="">Sélectionnez une action</option>
                      <option value="CLOSE">Clore le signalement</option>
                      <option value="ESCALATE">Escalader</option>
                      <option value="REJECT">Rejeter</option>
                      <option value="APPROVE">Approuver</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label cLabel class="form-label small fw-bold opacity-75 text-uppercase">Notes de modération</label>
                    <textarea cFormControl formControlName="notes" rows="4" 
                              placeholder="Expliquez votre décision..."
                              [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                              [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
                  </div>

                  <div class="d-flex gap-2">
                    <button cButton color="primary" type="submit" [disabled]="isSubmitting || decisionForm.invalid" class="px-4">
                      <svg cIcon name="cilCheck" class="me-2"></svg>
                      {{ isSubmitting ? 'Traitement...' : 'Envoyer la décision' }}
                    </button>
                    <button cButton color="secondary" variant="outline" routerLink=".." class="px-4">
                      Annuler
                    </button>
                  </div>
                </form>
              </c-card-body>
            </c-card>
          } @else {
            <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
              <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <h5 class="mb-0 fw-bold">Décision prise</h5>
              </c-card-header>
              <c-card-body class="p-4">
                <c-alert color="info" class="border-0 mb-3">
                  <div class="mb-2">
                    <strong>Action:</strong> {{ labels.actionCode(report.decision.action_code) }}
                  </div>
                  <div class="mb-2">
                    <strong>Décidé par:</strong> {{ report.decision.decided_by_account_identifier }}
                  </div>
                  <div class="mb-0">
                    <strong>Date:</strong> {{ report.decision.decided_at | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </c-alert>
                @if (report.decision.notes) {
                  <div class="p-3 rounded" [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,74,153,0.05)'">
                    <div class="small text-uppercase opacity-50 mb-1">Notes</div>
                    {{ report.decision.notes }}
                  </div>
                }
              </c-card-body>
            </c-card>
          }
        </c-col>

        <c-col lg="4">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
            <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
              <h6 class="mb-0 fw-bold">Informations du signalement</h6>
            </c-card-header>
            <c-card-body class="p-4">
              <div class="text-center mb-4">
                <c-avatar [src]="getAvatarUrl()" size="xl" class="mb-3"></c-avatar>
                <h5 class="fw-bold mb-1">{{ labels.prettify(report.target_kind) }}</h5>
                <p class="small opacity-75 mb-0">{{ report.target_identifier }}</p>
              </div>

              <div class="mb-3">
                <div class="small text-uppercase opacity-50 mb-2 text-center">Statut</div>
                <div class="d-flex justify-content-center">
                  <c-badge [color]="getStatusColor()" shape="rounded-pill" class="px-3 py-2">
                    {{ labels.status(report.status_code) }}
                  </c-badge>
                </div>
              </div>

              <div class="mb-3">
                <div class="small text-uppercase opacity-50 mb-2 text-center">Raison</div>
                <div class="d-flex justify-content-center">
                  <c-badge color="warning" shape="rounded-pill">
                    {{ labels.reasonCode(report.reason_code) }}
                  </c-badge>
                </div>
              </div>

              <div class="small opacity-75 text-center">
                Signalé le {{ report.created_at | date:'medium' }}
              </div>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else if (!isLoading) {
      <c-row>
        <c-col xs="12">
          <div class="text-center py-5 opacity-75">
            <p>Aucun signalement trouvé.</p>
            <button cButton color="primary" routerLink="..">Retour à la liste</button>
          </div>
        </c-col>
      </c-row>
    }
  `
})
export class ReportDetailComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #reportsService = inject(AdminReportsService);
  readonly #authService = inject(AuthService);
  readonly #alerts = inject(AlertService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #fb = inject(FormBuilder);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  report: ModerationReportDetail | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  decisionForm!: FormGroup;

  ngOnInit(): void {
    this.decisionForm = this.#fb.group({
      actionCode: ['', Validators.required],
      notes: ['', [Validators.required, Validators.minLength(10)]]
    });

    const identifier = this.#route.snapshot.paramMap.get('identifier');
    if (identifier) {
      this.loadReport(identifier);
    } else {
      this.errorMessage = 'Identifiant du signalement non trouvé.';
      this.isLoading = false;
    }
  }

  private loadReport(identifier: string): void {
    this.isLoading = true;
    this.#reportsService.getReport(identifier).subscribe({
      next: (report) => {
        this.report = report;
        if (report.decision) {
          this.decisionForm.patchValue({
            actionCode: report.decision.action_code,
            notes: report.decision.notes
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger ce signalement.');
        this.isLoading = false;
      }
    });
  }

  getStatusColor(): string {
    const statusColors: Record<string, string> = {
      'OPEN': 'warning',
      'CLOSED': 'success',
      'RESOLVED': 'success',
      'REJECTED': 'danger',
      'PENDING': 'info'
    };
    return statusColors[this.report?.status_code || ''] || 'secondary';
  }

  getPriorityColor(): string {
    const priorityColors: Record<string, string> = {
      'LOW': 'secondary',
      'MEDIUM': 'info',
      'HIGH': 'warning',
      'CRITICAL': 'danger',
      'URGENT': 'danger'
    };
    return priorityColors[this.report?.priority_code || ''] || 'secondary';
  }

  getAvatarUrl(): string {
    return this.#authService.getAvatarUrl(this.report?.reporter_account_identifier || 'RP');
  }

  onSubmit(): void {
    if (this.decisionForm.invalid || !this.report) {
      return;
    }

    this.isSubmitting = true;
    this.#reportsService.decideReport(this.report.report_identifier, {
      action_code: this.decisionForm.value.actionCode,
      notes: this.decisionForm.value.notes
    }).subscribe({
      next: (report) => {
        this.report = report;
        this.isSubmitting = false;
        void this.#alerts.success('Décision enregistrée', 'La décision de modération a été transmise avec succès.');
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de transmettre la décision.');
      }
    });
  }
}
