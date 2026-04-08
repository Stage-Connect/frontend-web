import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { ColorModeService } from '@coreui/angular';
import {
  InstitutionService,
  SupervisorEvaluationResponse,
  AcademicSupervisorResponse,
  UpsertSupervisorEvaluationRequest,
} from '../../../services/institution.service';

const RECOMMENDATIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Bien' },
  { value: 'AVERAGE', label: 'Moyen' },
  { value: 'NEEDS_IMPROVEMENT', label: 'À améliorer' },
  { value: 'UNSATISFACTORY', label: 'Insuffisant' },
];

@Component({
  selector: 'app-supervisor-evaluations',
  standalone: true,
  imports: [
    FormsModule,
    AlertComponent,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    FormControlDirective,
    FormDirective,
    FormLabelDirective,
    SpinnerComponent,
  ],
  template: `
    <div class="container-lg py-4">
      <div class="mb-4">
        <h2 class="fw-bold mb-1" [class.text-white]="colorMode() === 'dark'">Évaluations superviseur</h2>
        <p class="text-muted">Évaluez les étudiants en stage rattachés à votre établissement.</p>
      </div>

      <!-- Stage record lookup -->
      <c-card class="mb-4 shadow-sm">
        <c-card-header class="fw-semibold">Rechercher un enregistrement de stage</c-card-header>
        <c-card-body>
          <form cForm (ngSubmit)="loadEvaluation()" class="d-flex gap-3 align-items-end flex-wrap">
            <div class="flex-grow-1" style="min-width:260px;">
              <label cLabel class="small fw-bold text-uppercase opacity-75">Identifiant du stage</label>
              <input cFormControl
                     [(ngModel)]="stageRecordId"
                     name="stage_record_id"
                     placeholder="Ex: STG-XXXXXXXXXXXXXX"
                     [class.bg-dark]="colorMode() === 'dark'"
                     [class.text-white]="colorMode() === 'dark'" />
            </div>
            <button cButton color="primary" type="submit" [disabled]="!stageRecordId.trim() || loadingRecord()">
              @if (loadingRecord()) {
                <c-spinner size="sm" class="me-1"></c-spinner>
              }
              Charger
            </button>
          </form>
          @if (loadError()) {
            <c-alert color="warning" class="mt-3 small py-2 border-0">{{ loadError() }}</c-alert>
          }
        </c-card-body>
      </c-card>

      <!-- Evaluation form -->
      @if (existingEvaluation() || showForm()) {
        <c-card class="shadow-sm">
          <c-card-header class="fw-semibold d-flex align-items-center justify-content-between">
            <span>Évaluation — Stage {{ stageRecordId }}</span>
            @if (existingEvaluation()) {
              <span class="badge bg-success-subtle text-success small">Évaluation existante</span>
            }
          </c-card-header>
          <c-card-body>
            @if (saveError()) {
              <c-alert color="danger" class="small py-2 border-0 mb-3">{{ saveError() }}</c-alert>
            }
            @if (saveSuccess()) {
              <c-alert color="success" class="small py-2 border-0 mb-3">{{ saveSuccess() }}</c-alert>
            }

            <form cForm (ngSubmit)="saveEvaluation()">
              <!-- Supervisor -->
              <div class="mb-3">
                <label cLabel class="small fw-bold text-uppercase opacity-75">Superviseur académique</label>
                @if (loadingSuperviors()) {
                  <c-spinner size="sm" class="ms-2"></c-spinner>
                } @else {
                  <select cFormControl
                          [(ngModel)]="form.supervisor_id"
                          name="supervisor_id"
                          [class.bg-dark]="colorMode() === 'dark'"
                          [class.text-white]="colorMode() === 'dark'">
                    <option value="">-- Sélectionner un superviseur --</option>
                    @for (s of supervisors(); track s.supervisor_id) {
                      <option [value]="s.supervisor_id">{{ s.full_name }} ({{ s.email }})</option>
                    }
                  </select>
                }
              </div>

              <!-- Score -->
              <div class="mb-3">
                <label cLabel class="small fw-bold text-uppercase opacity-75">Note (1 – 5 étoiles)</label>
                <div class="d-flex gap-2 mt-1">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button"
                            class="btn p-0 border-0 bg-transparent fs-4 lh-1"
                            (click)="form.score = star"
                            [style.color]="form.score >= star ? '#f7941e' : '#ccc'"
                            [attr.aria-label]="star + ' étoile' + (star > 1 ? 's' : '')">
                      ★
                    </button>
                  }
                  <span class="small text-muted align-self-center ms-2">{{ form.score || 0 }}/5</span>
                </div>
              </div>

              <!-- Recommendation -->
              <div class="mb-3">
                <label cLabel class="small fw-bold text-uppercase opacity-75">Recommandation globale</label>
                <select cFormControl
                        [(ngModel)]="form.recommendation"
                        name="recommendation"
                        [class.bg-dark]="colorMode() === 'dark'"
                        [class.text-white]="colorMode() === 'dark'">
                  <option value="">-- Sélectionner --</option>
                  @for (r of recommendations; track r.value) {
                    <option [value]="r.value">{{ r.label }}</option>
                  }
                </select>
              </div>

              <!-- Strengths -->
              <div class="mb-3">
                <label cLabel class="small fw-bold text-uppercase opacity-75">Points forts</label>
                <textarea cFormControl
                          [(ngModel)]="form.strengths"
                          name="strengths"
                          rows="3"
                          placeholder="Décrivez les points forts du stagiaire..."
                          [class.bg-dark]="colorMode() === 'dark'"
                          [class.text-white]="colorMode() === 'dark'"></textarea>
              </div>

              <!-- Improvement areas -->
              <div class="mb-3">
                <label cLabel class="small fw-bold text-uppercase opacity-75">Axes d'amélioration</label>
                <textarea cFormControl
                          [(ngModel)]="form.improvement_areas"
                          name="improvement_areas"
                          rows="3"
                          placeholder="Décrivez les axes d'amélioration..."
                          [class.bg-dark]="colorMode() === 'dark'"
                          [class.text-white]="colorMode() === 'dark'"></textarea>
              </div>

              <!-- Comments (optional) -->
              <div class="mb-4">
                <label cLabel class="small fw-bold text-uppercase opacity-75">Commentaires additionnels <span class="text-muted fw-normal">(optionnel)</span></label>
                <textarea cFormControl
                          [(ngModel)]="form.comments"
                          name="comments"
                          rows="2"
                          placeholder="Observations complémentaires..."
                          [class.bg-dark]="colorMode() === 'dark'"
                          [class.text-white]="colorMode() === 'dark'"></textarea>
              </div>

              <button cButton color="primary" type="submit" [disabled]="!canSave || saving()">
                @if (saving()) {
                  <c-spinner size="sm" class="me-1"></c-spinner>
                }
                {{ existingEvaluation() ? "Mettre à jour l'évaluation" : "Enregistrer l'évaluation" }}
              </button>
            </form>
          </c-card-body>
        </c-card>
      }
    </div>
  `,
})
export class SupervisorEvaluationsComponent {
  readonly recommendations = RECOMMENDATIONS;

  stageRecordId = '';

  readonly loadingRecord = signal(false);
  readonly loadingSuperviors = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly saveSuccess = signal('');
  readonly existingEvaluation = signal<SupervisorEvaluationResponse | null>(null);
  readonly supervisors = signal<AcademicSupervisorResponse[]>([]);

  form: UpsertSupervisorEvaluationRequest & { comments: string | null } = {
    supervisor_id: '',
    score: 0,
    recommendation: '',
    strengths: '',
    improvement_areas: '',
    comments: null,
  };

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  constructor(private readonly svc: InstitutionService) {
    this.loadSupervisors();
  }

  get canSave(): boolean {
    return (
      !!this.form.supervisor_id &&
      this.form.score >= 1 &&
      this.form.score <= 5 &&
      !!this.form.recommendation &&
      !!this.form.strengths.trim() &&
      !!this.form.improvement_areas.trim()
    );
  }

  loadSupervisors(): void {
    this.loadingSuperviors.set(true);
    this.svc.listSupervisors(false).subscribe({
      next: (list) => {
        this.supervisors.set(list);
        this.loadingSuperviors.set(false);
      },
      error: () => this.loadingSuperviors.set(false),
    });
  }

  loadEvaluation(): void {
    const id = this.stageRecordId.trim();
    if (!id) return;

    this.loadError.set('');
    this.saveError.set('');
    this.saveSuccess.set('');
    this.existingEvaluation.set(null);
    this.showForm.set(false);
    this.loadingRecord.set(true);

    this.svc.getSupervisorEvaluation(id).subscribe({
      next: (ev) => {
        this.existingEvaluation.set(ev);
        this.form = {
          supervisor_id: ev.supervisor_id,
          score: ev.score,
          recommendation: ev.recommendation,
          strengths: ev.strengths,
          improvement_areas: ev.improvement_areas,
          comments: ev.comments ?? null,
        };
        this.loadingRecord.set(false);
        this.showForm.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingRecord.set(false);
        if (err.status === 404) {
          this.showForm.set(true);
          this.form = { supervisor_id: '', score: 0, recommendation: '', strengths: '', improvement_areas: '', comments: null };
        } else {
          this.loadError.set('Impossible de charger l\'évaluation. Vérifiez l\'identifiant du stage.');
        }
      },
    });
  }

  saveEvaluation(): void {
    if (!this.canSave) return;

    this.saveError.set('');
    this.saveSuccess.set('');
    this.saving.set(true);

    const payload: UpsertSupervisorEvaluationRequest = {
      supervisor_id: this.form.supervisor_id,
      score: this.form.score,
      recommendation: this.form.recommendation,
      strengths: this.form.strengths.trim(),
      improvement_areas: this.form.improvement_areas.trim(),
      comments: this.form.comments?.trim() || null,
    };

    this.svc.upsertSupervisorEvaluation(this.stageRecordId.trim(), payload).subscribe({
      next: (ev) => {
        this.existingEvaluation.set(ev);
        this.saving.set(false);
        this.saveSuccess.set('Évaluation enregistrée avec succès.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(
          err.error?.detail?.reason ?? err.error?.detail ?? 'Impossible d\'enregistrer l\'évaluation.'
        );
      },
    });
  }
}
