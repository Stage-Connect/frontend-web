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
  TableDirective
} from '@coreui/angular';
import {
  InstitutionService,
  InstitutionDashboardResponse,
  InstitutionTrackingExportResponse,
  StudentsInInternshipPage
} from '../../../services/institution.service';

@Component({
  selector: 'app-institution-dashboard',
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
    TableDirective
  ],
  template: `
    <c-row class="g-4">
      <!-- KPIs -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 class="fw-bold mb-0">Indicateurs de suivi</h5>
              <div class="d-flex gap-2 align-items-center flex-wrap">
                <input type="date" class="form-control form-control-sm" [(ngModel)]="filterStart"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
                <input type="date" class="form-control form-control-sm" [(ngModel)]="filterEnd"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
                <input class="form-control form-control-sm" [(ngModel)]="filterFiliere"
                  placeholder="Filière…" style="width:120px"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
                <button cButton color="primary" size="sm" (click)="applyFilters()">Filtrer</button>
              </div>
            </div>

            @if (dashboardError) {
              <p class="small opacity-75 mb-0">{{ dashboardError }}</p>
            } @else if (!dashboard) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else {
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="p-3 rounded text-center"
                    [class.bg-light]="!isDark()"
                    [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="fs-3 fw-bold">{{ dashboard.metrics.attached_students }}</div>
                    <div class="small opacity-75">Étudiants rattachés</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 rounded text-center"
                    [class.bg-light]="!isDark()"
                    [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="fs-3 fw-bold text-warning">{{ dashboard.metrics.internships_in_progress }}</div>
                    <div class="small opacity-75">Stages en cours</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 rounded text-center"
                    [class.bg-light]="!isDark()"
                    [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="fs-3 fw-bold text-success">{{ dashboard.metrics.internships_completed }}</div>
                    <div class="small opacity-75">Stages terminés</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 rounded text-center"
                    [class.bg-light]="!isDark()"
                    [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="fs-3 fw-bold text-danger">{{ dashboard.metrics.critical_alerts }}</div>
                    <div class="small opacity-75">Alertes critiques</div>
                  </div>
                </div>
              </div>
              <p class="small opacity-50 mt-3 mb-0">
                Généré le {{ dashboard.generated_at | slice:0:16 }}
                @if (dashboard.filters.period_start) { · Du {{ dashboard.filters.period_start | slice:0:10 }} }
                @if (dashboard.filters.period_end) { au {{ dashboard.filters.period_end | slice:0:10 }} }
              </p>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Étudiants en stage -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Étudiants en stage</h5>
              <div class="d-flex gap-2 align-items-center">
                @if (internshipPage) {
                  <span class="small opacity-75">{{ internshipPage.total }} résultat(s)</span>
                }
                <button cButton color="outline-secondary" size="sm" [disabled]="internshipLoading" (click)="loadInternships()">
                  Actualiser
                </button>
              </div>
            </div>
            @if (internshipLoading) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else if (internshipError) {
              <p class="small text-danger mb-0">{{ internshipError }}</p>
            } @else if (!internshipPage || internshipPage.items.length === 0) {
              <p class="small opacity-75 mb-0">Aucun étudiant en stage actuellement.</p>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th>Étudiant</th>
                      <th>Filière</th>
                      <th>Statut</th>
                      <th>Alerte</th>
                      <th>Début</th>
                      <th>Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of internshipPage.items; track item.stage_record_id) {
                      <tr>
                        <td class="small font-monospace">{{ item.stage_record_id | slice:0:12 }}…</td>
                        <td class="small">{{ item.student_account_id }}</td>
                        <td class="small">{{ item.filiere_code }}</td>
                        <td>
                          <span class="badge"
                            [class.bg-warning]="item.stage_status === 'IN_PROGRESS'"
                            [class.bg-success]="item.stage_status === 'COMPLETED'"
                            [class.bg-secondary]="item.stage_status !== 'IN_PROGRESS' && item.stage_status !== 'COMPLETED'">
                            {{ item.stage_status }}
                          </span>
                        </td>
                        <td>
                          @if (item.alert_level) {
                            <span class="badge bg-danger">{{ item.alert_level }}</span>
                          } @else {
                            <span class="opacity-50 small">—</span>
                          }
                        </td>
                        <td class="small">{{ item.starts_at | slice:0:10 }}</td>
                        <td class="small">{{ (item.ends_at | slice:0:10) || '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <!-- Pagination -->
              @if (internshipPage.total > internshipPage.page_size) {
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <button cButton color="outline-secondary" size="sm"
                    [disabled]="internshipPage.page <= 1"
                    (click)="internshipPage$ = internshipPage.page - 1; loadInternships()">← Précédent</button>
                  <span class="small opacity-75">Page {{ internshipPage.page }}</span>
                  <button cButton color="outline-secondary" size="sm"
                    [disabled]="internshipPage.page * internshipPage.page_size >= internshipPage.total"
                    (click)="internshipPage$ = internshipPage.page + 1; loadInternships()">Suivant →</button>
                </div>
              }
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Exports de suivi -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Exports de suivi</h5>
              <button cButton color="primary" size="sm" [disabled]="generatingExport" (click)="generateExport()">
                {{ generatingExport ? 'Génération…' : '+ Générer un export' }}
              </button>
            </div>
            @if (exportError) {
              <div class="alert alert-danger small" role="alert">{{ exportError }}</div>
            }
            @if (exports.length === 0) {
              <p class="small opacity-75 mb-0">Aucun export généré dans cette session.</p>
            } @else {
              <ul class="list-unstyled mb-0">
                @for (exp of exports; track exp.export_id) {
                  <li class="mb-2 pb-2 border-bottom small d-flex justify-content-between align-items-center"
                    [class.border-secondary]="isDark()">
                    <div>
                      <span class="fw-semibold">{{ exp.document_name || ('Export ' + (exp.export_id | slice:0:8) + '…') }}</span>
                      <span class="ms-2 badge"
                        [class.bg-success]="exp.status === 'READY'"
                        [class.bg-warning]="exp.status === 'GENERATING'"
                        [class.bg-secondary]="exp.status !== 'READY' && exp.status !== 'GENERATING'">
                        {{ exp.status }}
                      </span>
                      @if (exp.row_count > 0) {
                        <span class="ms-2 opacity-50">{{ exp.row_count }} ligne(s)</span>
                      }
                      @if (exp.generated_at) {
                        <span class="ms-2 opacity-50">{{ exp.generated_at | slice:0:10 }}</span>
                      }
                    </div>
                    @if (exp.status === 'READY') {
                      <button cButton color="link" size="sm" [disabled]="downloadingId === exp.export_id"
                        (click)="downloadExport(exp)">
                        {{ downloadingId === exp.export_id ? '…' : 'Télécharger CSV' }}
                      </button>
                    }
                  </li>
                }
              </ul>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class InstitutionDashboardComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly svc = inject(InstitutionService);

  dashboard: InstitutionDashboardResponse | null = null;
  dashboardError = '';
  filterStart = '';
  filterEnd = '';
  filterFiliere = '';

  internshipPage: StudentsInInternshipPage | null = null;
  internshipLoading = false;
  internshipError = '';
  internshipPage$ = 1;

  exports: InstitutionTrackingExportResponse[] = [];
  generatingExport = false;
  exportError = '';
  downloadingId = '';

  ngOnInit(): void {
    this.loadDashboard();
    this.loadInternships();
  }

  applyFilters(): void {
    this.loadDashboard();
    this.internshipPage$ = 1;
    this.loadInternships();
  }

  loadDashboard(): void {
    this.dashboardError = '';
    this.svc.getDashboard({
      period_start: this.filterStart || undefined,
      period_end: this.filterEnd || undefined,
      filiere_code: this.filterFiliere || undefined
    }).subscribe({
      next: (d) => { this.dashboard = d; },
      error: () => { this.dashboardError = 'Impossible de charger le tableau de bord.'; }
    });
  }

  loadInternships(): void {
    this.internshipLoading = true;
    this.internshipError = '';
    this.svc.listStudentsInInternship({
      filiere_code: this.filterFiliere || undefined,
      page: this.internshipPage$,
      page_size: 20
    }).subscribe({
      next: (page) => { this.internshipPage = page; this.internshipLoading = false; },
      error: () => { this.internshipError = 'Impossible de charger les étudiants en stage.'; this.internshipLoading = false; }
    });
  }

  generateExport(): void {
    this.generatingExport = true;
    this.exportError = '';
    this.svc.generateTrackingExport({
      period_start: this.filterStart || undefined,
      period_end: this.filterEnd || undefined,
      filiere_code: this.filterFiliere || undefined
    }).subscribe({
      next: (exp) => {
        this.exports = [exp, ...this.exports];
        this.generatingExport = false;
      },
      error: () => {
        this.exportError = 'Impossible de générer l\'export.';
        this.generatingExport = false;
      }
    });
  }

  downloadExport(exp: InstitutionTrackingExportResponse): void {
    this.downloadingId = exp.export_id;
    this.svc.downloadTrackingExport(exp.export_id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exp.document_name || `export-${exp.export_id}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.downloadingId = '';
      },
      error: () => { this.downloadingId = ''; }
    });
  }
}
