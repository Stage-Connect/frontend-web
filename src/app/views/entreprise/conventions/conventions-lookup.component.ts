import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  FormControlDirective,
  RowComponent,
  ColorModeService
} from '@coreui/angular';
import {
  ConventionsPortalService,
  ConventionDto,
  ConventionHistoryItem
} from '../../../services/conventions-portal.service';

@Component({
  selector: 'app-conventions-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    FormControlDirective
  ],
  template: `
    <c-row class="g-4">
      <!-- Génération de convention -->
      <c-col lg="8">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Générer une convention</h5>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label small fw-semibold">Identifiant candidature</label>
                <input cFormControl [(ngModel)]="genForm.application_identifier" placeholder="ex: APP-001" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Date de début</label>
                <input cFormControl type="date" [(ngModel)]="genForm.start_date" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Date de fin</label>
                <input cFormControl type="date" [(ngModel)]="genForm.end_date" />
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Nom du superviseur</label>
                <input cFormControl [(ngModel)]="genForm.supervisor_name" placeholder="Prénom Nom" />
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Description des tâches</label>
                <textarea cFormControl [(ngModel)]="genForm.tasks_description" rows="3" placeholder="Description des missions…"></textarea>
              </div>
              <div class="col-12">
                <button cButton color="primary"
                  [disabled]="generating || !genForm.application_identifier.trim() || !genForm.start_date || !genForm.end_date"
                  (click)="generateConvention()">
                  {{ generating ? 'Génération…' : 'Générer la convention' }}
                </button>
                @if (genError) {
                  <div class="alert alert-warning mt-3 mb-0 small" role="alert">{{ genError }}</div>
                }
              </div>
            </div>
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Recherche par ID -->
      <c-col lg="4">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Charger une convention</h5>
            <div class="d-flex gap-2 flex-wrap">
              <input cFormControl class="flex-grow-1" [(ngModel)]="conventionId" placeholder="Identifiant convention" />
              <button cButton color="outline-primary" (click)="load()" [disabled]="loading || !conventionId.trim()">
                Charger
              </button>
            </div>
            @if (loadError) {
              <div class="alert alert-warning mt-3 mb-0 small" role="alert">{{ loadError }}</div>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Convention affichée -->
      @if (convention) {
        <c-col xs="12">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-body class="p-4">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                  <h5 class="fw-bold mb-1">Convention {{ convention.convention_identifier }}</h5>
                  <span class="badge"
                    [class.bg-success]="convention.status === 'SIGNED'"
                    [class.bg-warning]="convention.status === 'PENDING'"
                    [class.bg-danger]="convention.status === 'REJECTED'"
                    [class.bg-secondary]="convention.status !== 'SIGNED' && convention.status !== 'PENDING' && convention.status !== 'REJECTED'">
                    {{ convention.status }}
                  </span>
                </div>
                <div class="d-flex gap-2">
                  @if (convention.status !== 'SIGNED') {
                    <button cButton color="success" size="sm" [disabled]="workflowLoading" (click)="applyAction('SIGN')">
                      Signer
                    </button>
                  }
                  @if (convention.status !== 'REJECTED') {
                    <button cButton color="danger" size="sm" [disabled]="workflowLoading" (click)="applyAction('REJECT')">
                      Rejeter
                    </button>
                  }
                </div>
              </div>
              @if (workflowError) {
                <div class="alert alert-warning small mb-3" role="alert">{{ workflowError }}</div>
              }
              <pre class="p-3 rounded small mb-0"
                   [class.bg-light]="!isDark()" [class.text-dark]="!isDark()"
                   [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">{{ convention | json }}</pre>
            </c-card-body>
          </c-card>
        </c-col>

        <!-- Historique -->
        @if (history.length > 0) {
          <c-col xs="12">
            <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
              <c-card-body class="p-4">
                <h5 class="fw-bold mb-3">Historique du workflow</h5>
                <ul class="list-unstyled mb-0 small">
                  @for (item of history; track item.occurred_at) {
                    <li class="mb-2 pb-2 border-bottom" [class.border-secondary]="isDark()">
                      <span class="fw-semibold">{{ item.action_code }}</span>
                      — {{ item.occurred_at | slice: 0:10 }}
                      — acteur : {{ item.actor_account_identifier }}
                      @if (item.notes) {
                        <br><span class="opacity-75">{{ item.notes }}</span>
                      }
                    </li>
                  }
                </ul>
              </c-card-body>
            </c-card>
          </c-col>
        }
      }
    </c-row>
  `
})
export class ConventionsLookupComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly conventions = inject(ConventionsPortalService);

  conventionId = '';
  loading = false;
  loadError = '';
  convention: ConventionDto | null = null;
  history: ConventionHistoryItem[] = [];

  genForm = {
    application_identifier: '',
    start_date: '',
    end_date: '',
    supervisor_name: '',
    tasks_description: ''
  };
  generating = false;
  genError = '';

  workflowLoading = false;
  workflowError = '';

  load(): void {
    const id = this.conventionId.trim();
    if (!id) { return; }
    this.loading = true;
    this.loadError = '';
    this.convention = null;
    this.history = [];
    this.conventions.getConvention(id).subscribe({
      next: (data) => {
        this.convention = data;
        this.loading = false;
        this.loadHistory(id);
      },
      error: () => {
        this.loadError = 'Convention introuvable ou accès refusé.';
        this.loading = false;
      }
    });
  }

  generateConvention(): void {
    if (!this.genForm.application_identifier.trim()) { return; }
    this.generating = true;
    this.genError = '';
    this.conventions.generateConvention(this.genForm).subscribe({
      next: (data) => {
        this.convention = data;
        this.conventionId = data.convention_identifier;
        this.generating = false;
        this.loadHistory(data.convention_identifier);
      },
      error: () => {
        this.genError = 'Erreur lors de la génération de la convention.';
        this.generating = false;
      }
    });
  }

  applyAction(actionCode: string): void {
    if (!this.convention) { return; }
    this.workflowLoading = true;
    this.workflowError = '';
    this.conventions.applyWorkflowAction(this.convention.convention_identifier, { action_code: actionCode }).subscribe({
      next: (data) => {
        this.convention = data;
        this.workflowLoading = false;
        this.loadHistory(data.convention_identifier);
      },
      error: () => {
        this.workflowError = 'Impossible d\'appliquer l\'action.';
        this.workflowLoading = false;
      }
    });
  }

  private loadHistory(id: string): void {
    this.conventions.getConventionHistory(id).subscribe({
      next: (items) => { this.history = items; },
      error: () => { this.history = []; }
    });
  }
}
