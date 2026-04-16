import { Component, OnInit, inject, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  ColorModeService,
  ButtonDirective,
  TableDirective,
  BadgeComponent
} from '@coreui/angular';
import {
  OperationsPortalService,
  ProductKpiDashboardDto,
  CriticalIncidentDto,
  BackupRunDto,
  BackupPolicyDto,
  ScrapedOfferDto,
  RunbookDto,
  LogEntryDto,
  ExecuteRunbookPayload
} from '../../../services/operations-portal.service';

@Component({
  selector: 'app-admin-ops-kpis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    TableDirective,
    BadgeComponent
  ],
  template: `
    <c-row class="g-4">
      <!-- KPIs produit -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Indicateurs produit (ops)</h5>
            @if (kpiError) {
              <p class="small opacity-75 mb-0">{{ kpiError }}</p>
            } @else if (data) {
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="p-3 rounded" [class.bg-light]="!isDark()" [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="small opacity-75">Inscriptions</div>
                    <div class="fs-4 fw-bold">{{ data.metrics.registrations_count }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 rounded" [class.bg-light]="!isDark()" [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="small opacity-75">Offres publiées</div>
                    <div class="fs-4 fw-bold">{{ data.metrics.published_offers_count }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 rounded" [class.bg-light]="!isDark()" [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="small opacity-75">Candidatures</div>
                    <div class="fs-4 fw-bold">{{ data.metrics.applications_count }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 rounded" [class.bg-light]="!isDark()" [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                    <div class="small opacity-75">Conversion</div>
                    <div class="fs-4 fw-bold">{{ data.metrics.conversion_rate_percent | number: '1.1-1' }} %</div>
                  </div>
                </div>
              </div>
              <p class="small opacity-50 mt-3 mb-0">Période : {{ data.period_start }} → {{ data.period_end }}</p>
            } @else {
              <p class="small opacity-75 mb-0">Chargement…</p>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Incidents critiques -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Incidents critiques</h5>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm" style="width:auto" [(ngModel)]="incidentFilter" (ngModelChange)="loadIncidents()">
                  <option value="">Tous</option>
                  <option value="OPEN">Ouverts</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolus</option>
                </select>
              </div>
            </div>
            @if (incidentError) {
              <p class="small opacity-75 mb-0">{{ incidentError }}</p>
            } @else if (loadingIncidents) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else if (!incidents || incidents.length === 0) {
              <p class="small opacity-75 mb-0">Aucun incident.</p>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Sévérité</th>
                      <th>Statut</th>
                      <th>Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (inc of incidents; track inc.incident_id) {
                      <tr>
                        <td class="small fw-semibold">{{ inc.title }}</td>
                        <td>
                          <c-badge
                            [color]="inc.severity === 'CRITICAL' ? 'danger' : inc.severity === 'HIGH' ? 'warning' : 'secondary'">
                            {{ inc.severity }}
                          </c-badge>
                        </td>
                        <td>
                          <c-badge
                            [color]="inc.status === 'RESOLVED' ? 'success' : inc.status === 'OPEN' ? 'danger' : 'warning'">
                            {{ inc.status }}
                          </c-badge>
                        </td>
                        <td class="small">{{ inc.created_at | slice: 0:10 }}</td>
                        <td>
                          @if (inc.status !== 'RESOLVED') {
                            <button cButton color="link" size="sm" (click)="resolveIncident(inc)">
                              Résoudre
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Sauvegardes -->
      <c-col md="4">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Politique de sauvegarde</h5>
            @if (backupPolicyError) {
              <p class="small opacity-75 mb-0">{{ backupPolicyError }}</p>
            } @else if (backupPolicy) {
              <ul class="list-unstyled small mb-0">
                <li class="mb-2"><span class="fw-semibold">Rétention :</span> {{ backupPolicy.retention_days }} jours</li>
                <li class="mb-2"><span class="fw-semibold">Planification :</span> {{ backupPolicy.schedule_cron }}</li>
                <li><span class="fw-semibold">Stockage :</span> {{ backupPolicy.storage_location }}</li>
              </ul>
            } @else {
              <p class="small opacity-75 mb-0">Chargement…</p>
            }
            <div class="mt-3">
              <button cButton color="primary" size="sm" [disabled]="triggeringBackup" (click)="triggerBackup()">
                {{ triggeringBackup ? 'Démarrage…' : '+ Lancer une sauvegarde' }}
              </button>
              @if (triggerError) {
                <div class="alert alert-warning mt-2 small mb-0" role="alert">{{ triggerError }}</div>
              }
              @if (triggerSuccess) {
                <div class="alert alert-success mt-2 small mb-0" role="alert">Sauvegarde démarrée.</div>
              }
            </div>
          </c-card-body>
        </c-card>
      </c-col>

      <c-col md="8">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Exécutions de sauvegarde</h5>
            @if (backupRunsError) {
              <p class="small opacity-75 mb-0">{{ backupRunsError }}</p>
            } @else if (loadingBackupRuns) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else if (!backupRuns || backupRuns.length === 0) {
              <p class="small opacity-75 mb-0">Aucune exécution.</p>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Statut</th>
                      <th>Démarré</th>
                      <th>Terminé</th>
                      <th>Taille</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (run of backupRuns; track run.backup_id) {
                      <tr>
                        <td class="small text-truncate" style="max-width:120px">{{ run.backup_id }}</td>
                        <td>
                          <c-badge
                            [color]="run.status === 'COMPLETED' ? 'success' : run.status === 'RUNNING' ? 'warning' : 'danger'">
                            {{ run.status }}
                          </c-badge>
                        </td>
                        <td class="small">{{ run.started_at | slice: 0:16 }}</td>
                        <td class="small">{{ run.completed_at ? (run.completed_at | slice: 0:16) : '—' }}</td>
                        <td class="small">{{ run.size_bytes ? (run.size_bytes | number) + ' o' : '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Offres scrapées -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Offres scrapées</h5>
              <div class="d-flex gap-2 align-items-center">
                <select class="form-select form-select-sm" style="width:auto" [(ngModel)]="scrapedFilter" (ngModelChange)="loadScrapedOffers()">
                  <option value="">Toutes</option>
                  <option value="NEW">Nouvelles</option>
                  <option value="VALIDATED">Validées</option>
                  <option value="PUBLISHED">Publiées</option>
                  <option value="REJECTED">Rejetées</option>
                </select>
                <button cButton color="primary" size="sm" [disabled]="scrapingRunning" (click)="runScraping()">
                  @if (scrapingRunning) {
                    <span class="spinner-border spinner-border-sm me-1"></span> Scraping…
                  } @else {
                    Lancer le scraping
                  }
                </button>
              </div>
            </div>
            @if (scrapingResult) {
              <div class="alert alert-info py-2 small mb-3">{{ scrapingResult }}</div>
            }
            @if (scrapedError) {
              <p class="small opacity-75 mb-0">{{ scrapedError }}</p>
            } @else if (loadingScraped) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else if (!scrapedOffers || scrapedOffers.length === 0) {
              <p class="small opacity-75 mb-0">Aucune offre scrapée.</p>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr><th>Titre</th><th>Entreprise</th><th>Statut</th><th>Scrapée le</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    @for (so of scrapedOffers; track so.scraped_offer_id) {
                      <tr>
                        <td class="small fw-semibold">{{ so.title }}</td>
                        <td class="small">{{ so.company_name }}</td>
                        <td>
                          <c-badge [color]="so.validation_status === 'VALIDATED' ? 'success' : so.validation_status === 'REJECTED' ? 'danger' : 'warning'">
                            {{ so.validation_status }}
                          </c-badge>
                        </td>
                        <td class="small">{{ so.scraped_at | slice:0:10 }}</td>
                        <td>
                          @if (so.validation_status === 'PENDING') {
                            <button cButton color="success" size="sm" class="me-1" (click)="validateScraped(so)">Valider</button>
                            <button cButton color="danger" size="sm" (click)="rejectScraped(so)">Rejeter</button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Runbooks -->
      <c-col md="6">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Runbooks opérationnels</h5>
            @if (runbooksError) {
              <p class="small opacity-75 mb-0">{{ runbooksError }}</p>
            } @else if (!runbooks || runbooks.length === 0) {
              <p class="small opacity-75 mb-0">Aucun runbook.</p>
            } @else {
              <ul class="list-unstyled mb-0">
                @for (rb of runbooks; track getRunbookId(rb)) {
                  <li class="mb-2 pb-2 border-bottom small" [class.border-secondary]="isDark()">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <span class="fw-semibold">{{ getRunbookLabel(rb) }}</span>
                        <div class="small opacity-75">{{ rb.description }}</div>
                      </div>
                      <button cButton color="primary" size="sm" [disabled]="executingRunbook === getRunbookId(rb)"
                        (click)="executeRunbook(rb)">
                        {{ executingRunbook === getRunbookId(rb) ? 'Exécution…' : 'Exécuter' }}
                      </button>
                    </div>
                  </li>
                }
              </ul>
              @if (runbookSuccess) {
                <div class="alert alert-success mt-2 small mb-0" role="alert">Runbook lancé.</div>
              }
              @if (runbookExecutionError) {
                <div class="alert alert-warning mt-2 small mb-0" role="alert">{{ runbookExecutionError }}</div>
              }
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Logs -->
      <c-col md="6">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Logs système</h5>
              <select class="form-select form-select-sm" style="width:auto" [(ngModel)]="logLevelFilter" (ngModelChange)="loadLogs()">
                <option value="">Tous</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
              </select>
            </div>
            @if (logsError) {
              <p class="small opacity-75 mb-0">{{ logsError }}</p>
            } @else if (!logs || logs.length === 0) {
              <p class="small opacity-75 mb-0">Aucun log.</p>
            } @else {
              <div style="max-height:300px;overflow-y:auto">
                @for (log of logs; track log.log_id) {
                  <div class="mb-1 small d-flex gap-2">
                    <c-badge [color]="log.level === 'ERROR' ? 'danger' : log.level === 'WARNING' ? 'warning' : 'secondary'" class="flex-shrink-0">
                      {{ log.level }}
                    </c-badge>
                    <span class="opacity-75 flex-shrink-0">{{ log.created_at | slice:11:19 }}</span>
                    <span class="text-truncate">{{ log.message }}</span>
                  </div>
                }
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class AdminOpsKpisComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly ops = inject(OperationsPortalService);
  private readonly cdr = inject(ChangeDetectorRef);

  data: ProductKpiDashboardDto | null = null;
  kpiError = '';

  incidents: CriticalIncidentDto[] = [];
  loadingIncidents = true;
  incidentError = '';
  incidentFilter = '';

  backupPolicy: BackupPolicyDto | null = null;
  backupPolicyError = '';
  backupRuns: BackupRunDto[] = [];
  loadingBackupRuns = true;
  backupRunsError = '';
  triggeringBackup = false;
  triggerError = '';
  triggerSuccess = false;

  scrapedOffers: ScrapedOfferDto[] = [];
  loadingScraped = true;
  scrapedError = '';
  scrapedFilter = '';
  scrapingRunning = false;
  scrapingResult = '';

  runbooks: RunbookDto[] = [];
  loadingRunbooks = true;
  runbooksError = '';
  runbookExecutionError = '';
  executingRunbook = '';
  runbookSuccess = false;

  logs: LogEntryDto[] = [];
  loadingLogs = true;
  logsError = '';
  logLevelFilter = '';

  ngOnInit(): void {
    // KPIs
    this.ops.getProductKpis().subscribe({
      next: (d) => { this.data = d; this.#cdr.markForCheck(); },
      error: () => { this.kpiError = 'Accès réservé aux rôles avec permission « ops:read_product_kpis ».'; this.#cdr.markForCheck(); }
    });

    // Incidents
    this.loadIncidents();

    // Backup Policy
    this.ops.getBackupPolicy().subscribe({
      next: (p) => { this.backupPolicy = p; this.#cdr.markForCheck(); },
      error: () => { this.backupPolicyError = 'Impossible de lire la politique de sauvegarde.'; this.#cdr.markForCheck(); }
    });

    // Backup Runs
    this.loadingBackupRuns = true;
    this.ops.listBackupRuns().subscribe({
      next: (res) => { 
        this.backupRuns = res.items || []; 
        this.loadingBackupRuns = false; 
        this.#cdr.markForCheck(); 
      },
      error: () => { 
        this.backupRunsError = 'Impossible de lire les exécutions.'; 
        this.loadingBackupRuns = false; 
        this.backupRuns = [];
        this.#cdr.markForCheck(); 
      }
    });

    // Scraped Offers
    this.loadScrapedOffers();

    // Runbooks
    this.loadRunbooks();

    // Logs
    this.loadLogs();
  }

  loadIncidents(): void {
    this.loadingIncidents = true;
    this.incidentError = '';
    this.incidents = [];
    this.ops.listIncidents(this.incidentFilter || undefined).subscribe({
      next: (res) => { this.incidents = res.items || []; this.loadingIncidents = false; this.#cdr.markForCheck(); },
      error: () => { this.incidentError = 'Impossible de charger les incidents.'; this.loadingIncidents = false; this.incidents = []; this.#cdr.markForCheck(); }
    });
  }

  resolveIncident(inc: CriticalIncidentDto): void {
    this.ops.updateIncidentStatus(inc.incident_id, 'RESOLVED').subscribe({
      next: (updated) => {
        const idx = this.incidents.findIndex(i => i.incident_id === inc.incident_id);
        if (idx >= 0) { this.incidents[idx] = updated; }
      },
      error: () => {}
    });
  }

  triggerBackup(): void {
    this.triggeringBackup = true;
    this.triggerError = '';
    this.triggerSuccess = false;
    this.ops.triggerBackup().subscribe({
      next: (run) => {
        this.backupRuns = [run, ...(this.backupRuns || [])];
        this.triggeringBackup = false;
        this.triggerSuccess = true;
        this.#cdr.markForCheck();
        setTimeout(() => { this.triggerSuccess = false; }, 3000);
      },
      error: () => {
        this.triggerError = 'Impossible de lancer la sauvegarde.';
        this.triggeringBackup = false;
        this.#cdr.markForCheck();
      }
    });
  }

  // --- Scraping ---
  loadScrapedOffers(): void {
    this.loadingScraped = true;
    this.scrapedError = '';
    this.scrapedOffers = [];
    this.ops.listScrapedOffers(this.scrapedFilter || undefined).subscribe({
      next: (res) => { this.scrapedOffers = res.items || []; this.loadingScraped = false; this.#cdr.markForCheck(); },
      error: () => { this.scrapedError = 'Impossible de charger les offres scrapées.'; this.loadingScraped = false; this.scrapedOffers = []; this.#cdr.markForCheck(); }
    });
  }

  runScraping(): void {
    this.scrapingRunning = true;
    this.scrapingResult = '';
    this.ops.triggerScraping().subscribe({
      next: (res) => {
        const platforms = Object.entries(res.platforms || {})
          .map(([name, data]) => {
            const err = data.error ? `, erreur: ${data.error}` : '';
            return `${name}: ${data.ingested} ingerees${err}`;
          })
          .join(' | ');
        this.scrapingResult = platforms
          ? `Scraping lance (${platforms})`
          : 'Scraping lance avec succes.';
        this.scrapingRunning = false;
        this.loadScrapedOffers();
        this.#cdr.markForCheck();
      },
      error: () => {
        this.scrapingResult = 'Echec du lancement du scraping.';
        this.scrapingRunning = false;
        this.#cdr.markForCheck();
      }
    });
  }

  validateScraped(so: ScrapedOfferDto): void {
    this.ops.validateScrapedOffer(so.scraped_offer_id).subscribe({
      next: (updated) => {
        if (this.scrapedOffers) {
          const idx = this.scrapedOffers.findIndex(s => s.scraped_offer_id === updated.scraped_offer_id);
          if (idx >= 0) { this.scrapedOffers[idx] = updated; this.#cdr.markForCheck(); }
        }
      },
      error: () => {}
    });
  }

  rejectScraped(so: ScrapedOfferDto): void {
    this.ops.rejectScrapedOffer(so.scraped_offer_id).subscribe({
      next: (updated) => {
        if (this.scrapedOffers) {
          const idx = this.scrapedOffers.findIndex(s => s.scraped_offer_id === updated.scraped_offer_id);
          if (idx >= 0) { this.scrapedOffers[idx] = updated; this.#cdr.markForCheck(); }
        }
      },
      error: () => {}
    });
  }

  // --- Runbooks ---
  loadRunbooks(): void {
    this.loadingRunbooks = true;
    this.runbooksError = '';
    this.runbookExecutionError = '';
    this.runbooks = [];
    this.ops.listRunbooks().subscribe({
      next: (res) => { this.runbooks = res.items || []; this.loadingRunbooks = false; this.#cdr.markForCheck(); },
      error: () => { this.runbooksError = 'Impossible de charger les runbooks.'; this.loadingRunbooks = false; this.runbooks = []; this.#cdr.markForCheck(); }
    });
  }

  executeRunbook(rb: RunbookDto): void {
    if (!rb) {
      console.error('No runbook provided');
      return;
    }
    const rbId = this.getRunbookId(rb);
    if (!rbId) {
      console.error('Invalid runbook - no ID found:', rb);
      return;
    }
    const payload = this.buildRunbookExecutionPayload(rb);
    if (!payload) {
      this.runbookExecutionError = 'Aucun incident actif compatible n’est disponible pour ce runbook.';
      this.#cdr.markForCheck();
      return;
    }
    this.executingRunbook = rbId;
    this.runbookExecutionError = '';
    this.ops.executeRunbook(rbId, payload).subscribe({
      next: () => {
        this.executingRunbook = '';
        this.runbookSuccess = true;
        this.#cdr.markForCheck();
        setTimeout(() => { this.runbookSuccess = false; this.#cdr.markForCheck(); }, 3000);
      },
      error: (err) => { 
        console.error('Error executing runbook:', err);
        this.runbookExecutionError = this.extractRunbookError(err);
        this.executingRunbook = ''; 
        this.#cdr.markForCheck();
      }
    });
  }

  getRunbookId(rb: RunbookDto): string {
    return rb.runbook_id || rb.code;
  }

  getRunbookLabel(rb: RunbookDto): string {
    return rb.name || rb.label || rb.code;
  }

  private buildRunbookExecutionPayload(rb: RunbookDto): ExecuteRunbookPayload | null {
    const activeIncidents = this.incidents.filter((incident) => incident.status !== 'RESOLVED');
    const matchingIncident = activeIncidents.find((incident) =>
      !rb.target_error_types?.length || rb.target_error_types.includes(incident.error_type)
    );
    if (!matchingIncident) {
      return null;
    }

    return {
      incident_id: matchingIncident.incident_id,
      outcome: 'IN_PROGRESS',
      actions_taken: [`Runbook ${this.getRunbookId(rb)} déclenché depuis le portail admin`],
      notes: `Exécution lancée pour l'incident ${matchingIncident.incident_id}.`
    };
  }

  private extractRunbookError(error: unknown): string {
    const detail = (error as any)?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return "Impossible d'exécuter ce runbook pour le moment.";
  }

  // --- Logs ---
  loadLogs(): void {
    this.logs = [];
    this.ops.getLogs({ level: this.logLevelFilter || undefined, limit: 100 }).subscribe({
      next: (res) => { this.logs = res.items || []; this.#cdr.markForCheck(); },
      error: () => { this.logsError = 'Impossible de charger les logs.'; this.logs = []; this.#cdr.markForCheck(); }
    });
  }
}
