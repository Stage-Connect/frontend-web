import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  ColorModeService,
  ButtonDirective,
  FormControlDirective
} from '@coreui/angular';
import {
  InternshipFollowupService,
  LogbookEntryDto,
  CompanyEvaluationDto,
  InternshipCertificateDto,
  SubmitEvaluationRequest
} from '../../../services/internship-followup.service';

@Component({
  selector: 'app-internship-followup',
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
      <!-- Identifiant du stage -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Suivi de stage</h5>
            <div class="d-flex gap-2 flex-wrap">
              <input cFormControl class="flex-grow-1" [(ngModel)]="stageRecordId" placeholder="Identifiant du stage (stage_record_identifier)" />
              <button cButton color="primary" [disabled]="!stageRecordId.trim() || loadingAll" (click)="loadAll()">
                {{ loadingAll ? 'Chargement…' : 'Charger' }}
              </button>
            </div>
          </c-card-body>
        </c-card>
      </c-col>

      @if (stageLoaded) {
        <!-- Évaluation du stagiaire -->
        <c-col md="6">
          <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-body class="p-4">
              <h5 class="fw-bold mb-3">Évaluation du stagiaire</h5>
              @if (evaluation) {
                <p class="small mb-1"><strong>Note globale :</strong> {{ evaluation.overall_rating }}/5</p>
                <p class="small mb-1"><strong>Compétences techniques :</strong> {{ evaluation.technical_skills_rating }}/5</p>
                <p class="small mb-1"><strong>Soft skills :</strong> {{ evaluation.soft_skills_rating }}/5</p>
                <p class="small mb-1"><strong>Commentaires :</strong> {{ evaluation.comments }}</p>
                <p class="small opacity-75 mb-0">Soumis le {{ evaluation.submitted_at | slice: 0:10 }}</p>
              } @else if (!showEvalForm) {
                <p class="small opacity-75 mb-2">Aucune évaluation soumise.</p>
                <button cButton color="primary" size="sm" (click)="showEvalForm = true">
                  Évaluer le stagiaire
                </button>
              }

              @if (showEvalForm && !evaluation) {
                <div class="mt-3">
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">Note globale (1-5)</label>
                    <input cFormControl type="number" min="1" max="5" [(ngModel)]="evalForm.overall_rating" />
                  </div>
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">Compétences techniques (1-5)</label>
                    <input cFormControl type="number" min="1" max="5" [(ngModel)]="evalForm.technical_skills_rating" />
                  </div>
                  <div class="mb-2">
                    <label class="form-label small fw-semibold">Soft skills (1-5)</label>
                    <input cFormControl type="number" min="1" max="5" [(ngModel)]="evalForm.soft_skills_rating" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Commentaires</label>
                    <textarea cFormControl [(ngModel)]="evalForm.comments" rows="3"></textarea>
                  </div>
                  @if (evalError) {
                    <div class="alert alert-warning small mb-2" role="alert">{{ evalError }}</div>
                  }
                  <div class="d-flex gap-2">
                    <button cButton color="success" size="sm" [disabled]="submittingEval" (click)="submitEvaluation()">
                      {{ submittingEval ? 'Envoi…' : 'Soumettre' }}
                    </button>
                    <button cButton color="secondary" size="sm" (click)="showEvalForm = false">Annuler</button>
                  </div>
                </div>
              }
            </c-card-body>
          </c-card>
        </c-col>

        <!-- Certificat de stage -->
        <c-col md="6">
          <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-body class="p-4">
              <h5 class="fw-bold mb-3">Certificat de stage</h5>
              @if (certificate) {
                <p class="small mb-1"><strong>Étudiant :</strong> {{ certificate.student_name }}</p>
                <p class="small mb-1"><strong>Entreprise :</strong> {{ certificate.company_name }}</p>
                <p class="small mb-1"><strong>Période :</strong> {{ certificate.start_date }} → {{ certificate.end_date }}</p>
                <p class="small mb-1"><strong>Code de vérification :</strong> {{ certificate.verification_code }}</p>
                <p class="small opacity-75 mb-0">Émis le {{ certificate.issued_at | slice: 0:10 }}</p>
              } @else {
                <p class="small opacity-75 mb-2">Aucun certificat émis.</p>
                @if (certError) {
                  <div class="alert alert-warning small mb-2" role="alert">{{ certError }}</div>
                }
                <button cButton color="primary" size="sm" [disabled]="issuingCert" (click)="issueCertificate()">
                  {{ issuingCert ? 'Émission…' : 'Émettre le certificat' }}
                </button>
              }
            </c-card-body>
          </c-card>
        </c-col>

        <!-- Logbook -->
        <c-col xs="12">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-body class="p-4">
              <h5 class="fw-bold mb-3">Journal de bord (logbook)</h5>
              @if (logbookError) {
                <p class="small opacity-75 mb-0">{{ logbookError }}</p>
              } @else if (logbookEntries.length === 0) {
                <p class="small opacity-75 mb-2">Aucune entrée dans le logbook.</p>
              } @else {
                <ul class="list-unstyled mb-3">
                  @for (entry of logbookEntries; track entry.entry_identifier) {
                    <li class="mb-3 pb-3 border-bottom" [class.border-secondary]="isDark()">
                      <div class="d-flex justify-content-between">
                        <span class="fw-semibold small">{{ entry.entry_date }}</span>
                        <span class="small opacity-50">{{ entry.updated_at | slice: 0:10 }}</span>
                      </div>
                      <p class="small mb-0 mt-1">{{ entry.content }}</p>
                    </li>
                  }
                </ul>
              }
            </c-card-body>
          </c-card>
        </c-col>
      }
    </c-row>
  `
})
export class InternshipFollowupComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly followup = inject(InternshipFollowupService);

  stageRecordId = '';
  loadingAll = false;
  stageLoaded = false;

  evaluation: CompanyEvaluationDto | null = null;
  showEvalForm = false;
  submittingEval = false;
  evalError = '';
  evalForm: Omit<SubmitEvaluationRequest, 'stage_record_identifier'> = {
    overall_rating: 3,
    technical_skills_rating: 3,
    soft_skills_rating: 3,
    comments: ''
  };

  certificate: InternshipCertificateDto | null = null;
  issuingCert = false;
  certError = '';

  logbookEntries: LogbookEntryDto[] = [];
  logbookError = '';

  ngOnInit(): void {}

  loadAll(): void {
    const id = this.stageRecordId.trim();
    if (!id) { return; }
    this.loadingAll = true;
    this.stageLoaded = false;
    this.evaluation = null;
    this.certificate = null;
    this.logbookEntries = [];
    this.evalError = '';
    this.certError = '';
    this.logbookError = '';

    // Load evaluation
    this.followup.getCompanyEvaluation(id).subscribe({
      next: (ev) => { this.evaluation = ev; },
      error: () => {}
    });

    // Load certificate
    this.followup.getCertificate(id).subscribe({
      next: (cert) => { this.certificate = cert; },
      error: () => {}
    });

    // Load logbook
    this.followup.getLogbook(id).subscribe({
      next: (entries) => { this.logbookEntries = entries; this.loadingAll = false; this.stageLoaded = true; },
      error: () => { this.logbookError = 'Impossible de charger le logbook.'; this.loadingAll = false; this.stageLoaded = true; }
    });
  }

  submitEvaluation(): void {
    const id = this.stageRecordId.trim();
    if (!id) { return; }
    this.submittingEval = true;
    this.evalError = '';
    const payload: SubmitEvaluationRequest = { ...this.evalForm, stage_record_identifier: id };
    this.followup.submitCompanyEvaluation(payload).subscribe({
      next: (ev) => {
        this.evaluation = ev;
        this.showEvalForm = false;
        this.submittingEval = false;
      },
      error: () => {
        this.evalError = 'Erreur lors de la soumission de l\'évaluation.';
        this.submittingEval = false;
      }
    });
  }

  issueCertificate(): void {
    const id = this.stageRecordId.trim();
    if (!id) { return; }
    this.issuingCert = true;
    this.certError = '';
    this.followup.issueCertificate(id).subscribe({
      next: (cert) => {
        this.certificate = cert;
        this.issuingCert = false;
      },
      error: () => {
        this.certError = 'Impossible d\'émettre le certificat.';
        this.issuingCert = false;
      }
    });
  }
}
