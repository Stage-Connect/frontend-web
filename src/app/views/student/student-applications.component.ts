import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  AlertComponent,
  ColorModeService,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import {
  ApplicationsService,
  ApplicationDto,
  ApplicationStatusHistoryEntryDto,
  ApplicationDocumentDto
} from '../../services/applications.service';
import { AuthService } from '../../services/auth.service';
import { backendLabels } from '../../core/backend-labels';
import { forkJoin } from 'rxjs';

interface ApplicationWithDetails extends ApplicationDto {
  history?: ApplicationStatusHistoryEntryDto[];
  documents?: ApplicationDocumentDto[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    BadgeComponent,
    ButtonDirective,
    IconDirective,
    AlertComponent,
    SpinnerComponent
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius:0.5rem;">
          <c-card-header class="d-flex justify-content-between align-items-center py-3 px-4 bg-transparent border-bottom"
                         [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Mes Candidatures</h5>
            <button cButton color="primary" size="sm" routerLink="/recherche">
              <svg cIcon name="cilSearch" class="me-1"></svg>
              Rechercher des stages
            </button>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-3">{{ errorMessage }}</c-alert>
            }

            @if (isLoading) {
              <div class="d-flex justify-content-center py-5">
                <c-spinner color="primary"></c-spinner>
              </div>
            } @else if (!applications.length) {
              <div class="text-center py-5 opacity-75">
                <svg cIcon name="cilBriefcase" size="3xl" class="mb-3 d-block mx-auto opacity-25"></svg>
                <p class="mb-3">Vous n'avez pas encore de candidatures.</p>
                <button cButton color="primary" routerLink="/recherche" class="shadow-sm">
                  <svg cIcon name="cilSearch" class="me-2"></svg>
                  Trouver des stages
                </button>
              </div>
            } @else {
              <!-- Stats -->
              <c-row class="g-3 mb-4">
                @for (stat of statusStats; track stat.label) {
                  <c-col sm="6" md="3">
                    <div class="rounded-3 p-3 text-center" [style.backgroundColor]="stat.bgColor">
                      <div class="fw-bold" style="font-size:1.5rem;" [style.color]="stat.color">{{ stat.count }}</div>
                      <div class="small opacity-75" [style.color]="stat.color">{{ stat.label }}</div>
                    </div>
                  </c-col>
                }
              </c-row>

              <!-- Applications list -->
              <div class="d-flex flex-column gap-3">
                @for (app of applications; track app.application_identifier) {
                  <c-card class="border-0" [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                          [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,153,0.03)'"
                          style="border-radius:0.5rem; border:1px solid rgba(0,74,153,0.1) !important;">
                    <c-card-body class="p-3">
                      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div class="flex-grow-1">
                          <div class="d-flex align-items-center gap-2 mb-1">
                            <c-badge [color]="getStatusColor(app.status_code)" shape="rounded-pill">
                              {{ labels.applicationStatus(app.status_code) }}
                            </c-badge>
                            <span class="small opacity-50">{{ app.created_at | date:'dd/MM/yyyy' }}</span>
                          </div>
                          <div class="small opacity-75 text-break">ID offre : {{ app.offer_identifier }}</div>
                          <div class="small opacity-50 text-break">Réf : {{ app.application_identifier }}</div>
                        </div>
                        <div class="d-flex gap-2 flex-shrink-0">
                          <button cButton color="primary" variant="ghost" size="sm" class="p-2 rounded-pill"
                                  (click)="viewOffer(app.offer_identifier)" title="Voir l'offre">
                            <svg cIcon name="cilExternalLink" size="sm"></svg>
                          </button>
                          <button cButton [color]="isDark() ? 'secondary' : 'light'" size="sm" class="p-2 rounded-pill"
                                  (click)="toggleExpand(app)" title="Voir détails">
                            <svg cIcon [name]="app.isExpanded ? 'cilChevronTop' : 'cilChevronBottom'" size="sm"></svg>
                          </button>
                        </div>
                      </div>

                      @if (app.isExpanded) {
                        <hr [class.border-white]="isDark()" [class.border-opacity-10]="isDark()" class="mt-3 mb-3" />

                        <!-- Status history -->
                        @if (app.history?.length) {
                          <div class="mb-3">
                            <p class="small fw-bold opacity-75 text-uppercase mb-2">Historique</p>
                            <div class="d-flex flex-column gap-1">
                              @for (entry of app.history; track entry.id) {
                                <div class="d-flex align-items-center gap-2 small">
                                  <span class="opacity-50">{{ entry.occurred_at | date:'dd/MM/yyyy HH:mm' }}</span>
                                  @if (entry.from_status_code) {
                                    <span class="opacity-50">{{ labels.applicationStatus(entry.from_status_code) }}</span>
                                    <svg cIcon name="cilArrowRight" size="sm" class="opacity-50"></svg>
                                  }
                                  <span class="fw-semibold">{{ labels.applicationStatus(entry.to_status_code) }}</span>
                                </div>
                              }
                            </div>
                          </div>
                        }

                        <!-- Documents -->
                        @if (app.documents?.length) {
                          <div>
                            <p class="small fw-bold opacity-75 text-uppercase mb-2">Documents</p>
                            <div class="d-flex flex-wrap gap-2">
                              @for (doc of app.documents; track doc.document_identifier) {
                                <span class="badge bg-secondary rounded-pill">
                                  <svg cIcon name="cilFile" size="sm" class="me-1"></svg>
                                  {{ doc.document_type }} · {{ doc.original_filename }}
                                </span>
                              }
                            </div>
                          </div>
                        }

                        <!-- Upload document -->
                        <div class="mt-3">
                          <label class="form-label small fw-semibold opacity-75">Ajouter un document</label>
                          <div class="d-flex gap-2 align-items-center">
                            <input type="file" class="form-control form-control-sm"
                                   [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                                   (change)="onFileSelected($event, app)" style="max-width:280px;" />
                            <select class="form-select form-select-sm" [(ngModel)]="selectedDocType"
                                    [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="max-width:160px;">
                              <option value="CV">CV</option>
                              <option value="MOTIVATION_LETTER">Lettre de motivation</option>
                              <option value="TRANSCRIPT">Relevé de notes</option>
                              <option value="OTHER">Autre</option>
                            </select>
                          </div>
                        </div>
                      }
                    </c-card-body>
                  </c-card>
                }
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class StudentApplicationsComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #applicationsService = inject(ApplicationsService);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  applications: ApplicationWithDetails[] = [];
  isLoading = true;
  errorMessage = '';
  selectedDocType = 'CV';

  get statusStats() {
    const counts: Record<string, number> = {};
    this.applications.forEach(a => { counts[a.status_code] = (counts[a.status_code] || 0) + 1; });
    return [
      { label: 'Total', count: this.applications.length, color: '#004a99', bgColor: 'rgba(0,74,153,0.08)' },
      { label: 'En attente', count: counts['SUBMITTED'] || 0, color: '#f7941e', bgColor: 'rgba(247,148,30,0.08)' },
      { label: 'En cours', count: counts['UNDER_REVIEW'] || 0, color: '#17a2b8', bgColor: 'rgba(23,162,184,0.08)' },
      { label: 'Acceptées', count: counts['ACCEPTED'] || 0, color: '#198754', bgColor: 'rgba(25,135,84,0.08)' }
    ];
  }

  ngOnInit(): void {
    this.#applicationsService.getStudentDashboard().subscribe({
      next: (response) => {
        this.applications = response.applications.map(a => ({ ...a, isExpanded: false }));
        this.isLoading = false;
        this.#cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.#authService.getErrorMessage(err, 'Impossible de charger vos candidatures.');
        this.isLoading = false;
        this.#cdr.markForCheck();
      }
    });
  }

  toggleExpand(app: ApplicationWithDetails): void {
    app.isExpanded = !app.isExpanded;
    if (app.isExpanded && !app.history) {
      forkJoin({
        history: this.#applicationsService.getApplicationHistory(app.application_identifier),
        documents: this.#applicationsService.listApplicationDocuments(app.application_identifier)
      }).subscribe({
        next: ({ history, documents }) => {
          app.history = history;
          app.documents = documents;
          this.#cdr.markForCheck();
        }
      });
    }
  }

  onFileSelected(event: Event, app: ApplicationWithDetails): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.#applicationsService.uploadApplicationDocument(
      app.application_identifier,
      file,
      this.selectedDocType
    ).subscribe({
      next: (doc) => {
        app.documents = [...(app.documents || []), doc];
        this.#cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.#authService.getErrorMessage(err, "Impossible d'uploader le document.");
        this.#cdr.markForCheck();
      }
    });
  }

  viewOffer(offerIdentifier: string): void {
    this.#router.navigate(['/offres', offerIdentifier]);
  }

  getStatusColor(statusCode: string): string {
    const map: Record<string, string> = {
      'SUBMITTED': 'warning',
      'UNDER_REVIEW': 'info',
      'SHORTLISTED': 'primary',
      'ACCEPTED': 'success',
      'REJECTED': 'danger',
      'WITHDRAWN': 'secondary'
    };
    return map[statusCode] || 'secondary';
  }
}
