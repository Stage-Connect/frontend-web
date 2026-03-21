import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ColorModeService,
  FormControlDirective,
  FormDirective,
  RowComponent,
  TableDirective
} from '@coreui/angular';

import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { backendLabels } from '../../../core/backend-labels';
import {
  AdminReportsService,
  ModerationReportDetail,
  ModerationReportListItem
} from '../../../services/admin-reports.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    BadgeComponent,
    AlertComponent,
    FormDirective,
    FormControlDirective,
    ButtonDirective
  ],
  template: `
    <c-row>
      <c-col xs="12" lg="7">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold">Signalements de modération</h5>
              <button cButton color="secondary" size="sm" class="site-secondary-action" (click)="loadReports()">
                Actualiser
              </button>
            </div>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
            }

            @if (isLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des signalements...</span>
              </div>
            } @else {
            <div class="table-responsive">
              <table cTable [hover]="true" [class.table-dark]="isDark()">
                <thead>
                  <tr>
                    <th>Cible</th>
                    <th>Raison</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of reports"
                    (click)="selectReport(item)"
                    style="cursor: pointer;"
                    [class.table-active]="selectedReport?.report_identifier === item.report_identifier">
                    <td>
                      <div class="fw-semibold">{{ item.target_summary }}</div>
                      <div class="small opacity-75">{{ item.report_identifier }}</div>
                    </td>
                    <td>{{ labels.reasonCode(item.reason_code) }}</td>
                    <td>{{ labels.priority(item.priority_code) }}</td>
                    <td>
                      <c-badge color="warning" shape="rounded-pill">{{ labels.status(item.status_code) }}</c-badge>
                    </td>
                    <td class="text-end">
                      <button cButton size="sm" color="primary" variant="ghost" (click)="selectReport(item)">
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <c-col xs="12" lg="5">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Détail du signalement</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (detailError) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ detailError }}</c-alert>
            }

            @if (detailLoading) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement du détail...</span>
              </div>
            } @else if (selectedReport) {
              <div class="mb-3">
                <div class="small opacity-75">Cible</div>
                <div class="fw-semibold">{{ selectedReport.target_summary }}</div>
                <div class="small opacity-75">{{ labels.prettify(selectedReport.target_kind) }} · {{ selectedReport.target_identifier }}</div>
              </div>

              <div class="mb-3">
                <div class="small opacity-75">Motif</div>
                <div>{{ labels.reasonCode(selectedReport.reason_code) }}</div>
                <div class="small mt-1">{{ selectedReport.reason_details }}</div>
              </div>

              <div class="mb-3">
                <div class="small opacity-75">Contexte JSON</div>
                <pre class="small p-3 rounded-3 mb-0" [style.backgroundColor]="isDark() ? '#1d2a39' : '#f6f7fb'">{{ selectedReport.context_json }}</pre>
              </div>

              <div class="mb-4 small opacity-75">
                Dernière mise à jour: {{ selectedReport.updated_at | date:'short' }}
              </div>

              @if (selectedReport.decision) {
                <c-alert color="info" class="border-0 shadow-sm mb-4">
                  Décision déjà prise: {{ labels.actionCode(selectedReport.decision.action_code) }} par {{ selectedReport.decision.decided_by_account_identifier }}
                </c-alert>
              }

              <form cForm (ngSubmit)="submitDecision()">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase opacity-75">Type de décision</label>
                  <input cFormControl name="actionCode" [(ngModel)]="actionCode" placeholder="Ex: CLOSE, ESCALATE, REJECT" />
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase opacity-75">Notes de modération</label>
                  <textarea cFormControl name="decisionNotes" rows="4" [(ngModel)]="decisionNotes"
                    placeholder="Explique la décision de modération"></textarea>
                </div>
                <button cButton type="submit" color="primary" [disabled]="isSubmittingDecision || !actionCode.trim() || decisionNotes.trim().length < 5">
                  {{ isSubmittingDecision ? 'Envoi...' : 'Envoyer la décision' }}
                </button>
              </form>
            } @else {
              <div class="text-center py-5 opacity-75">Sélectionne un signalement pour afficher ses détails.</div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class AdminReportsComponent {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #reportsService = inject(AdminReportsService);
  readonly #authService = inject(AuthService);
  readonly #alerts = inject(AlertService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  reports: ModerationReportListItem[] = [];
  selectedReport: ModerationReportDetail | null = null;
  errorMessage = '';
  detailError = '';
  actionCode = '';
  decisionNotes = '';
  isSubmittingDecision = false;
  isLoading = true;
  detailLoading = false;

  constructor() {
    this.loadReports();
    this.#route.queryParamMap.subscribe((params) => {
      const reportIdentifier = params.get('report');
      if (reportIdentifier) {
        this.openReport(reportIdentifier);
      }
    });
  }

  loadReports(): void {
    this.isLoading = true;
    this.#reportsService.listReports().subscribe({
      next: (response) => {
        this.reports = response.items;
        this.errorMessage = '';
        this.isLoading = false;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger les signalements.');
        this.isLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  selectReport(item: ModerationReportListItem): void {
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { report: item.report_identifier },
      queryParamsHandling: 'merge'
    });
  }

  private openReport(reportIdentifier: string): void {
    this.detailLoading = true;
    this.#reportsService.getReport(reportIdentifier).subscribe({
      next: (detail) => {
        this.selectedReport = detail;
        this.actionCode = detail.decision?.action_code ?? '';
        this.decisionNotes = detail.decision?.notes ?? '';
        this.detailError = '';
        this.detailLoading = false;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.detailError = this.#authService.getErrorMessage(error, 'Impossible de charger ce signalement.');
        this.detailLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  submitDecision(): void {
    if (!this.selectedReport) {
      return;
    }

    this.isSubmittingDecision = true;
    this.#reportsService.decideReport(this.selectedReport.report_identifier, {
      action_code: this.actionCode.trim(),
      notes: this.decisionNotes.trim()
    }).subscribe({
      next: async (detail) => {
        this.selectedReport = detail;
        this.isSubmittingDecision = false;
        await this.#alerts.success('Décision enregistrée', 'La décision de modération a bien été transmise au backend.');
        this.loadReports();
        this.#cdr.markForCheck();
      },
      error: async (error) => {
        this.isSubmittingDecision = false;
        this.detailError = this.#authService.getErrorMessage(error, 'Impossible de transmettre la décision.');
        await this.#alerts.error('Échec de décision', this.detailError);
        this.#cdr.markForCheck();
      }
    });
  }
}
