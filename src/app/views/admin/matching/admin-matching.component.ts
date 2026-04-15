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
  FormControlDirective,
  TableDirective,
  BadgeComponent
} from '@coreui/angular';
import {
  MatchingService,
  ScoringModelDto,
  CriterionWeightDto
} from '../../../services/matching.service';

@Component({
  selector: 'app-admin-matching',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    FormControlDirective,
    TableDirective,
    BadgeComponent
  ],
  template: `
    <c-row class="g-4">
      <!-- Modèle actif -->
      <c-col md="4">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Modèle actif</h5>
            @if (activeError) {
              <p class="small opacity-75 mb-0">{{ activeError }}</p>
            } @else if (activeModel) {
              <p class="mb-1"><span class="fw-semibold">Version :</span> {{ activeModel.version_code }}</p>
              <p class="mb-1"><span class="fw-semibold">Critères :</span> {{ activeModel.criteria_count }}</p>
              <p class="mb-1"><span class="fw-semibold">Créé le :</span> {{ activeModel.created_at | slice: 0:10 }}</p>
              <c-badge color="success" class="mt-1">Actif</c-badge>
            } @else {
              <p class="small opacity-75 mb-0">Chargement…</p>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Liste des modèles -->
      <c-col md="8">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Tous les modèles de scoring</h5>
            @if (modelsError) {
              <p class="small opacity-75 mb-0">{{ modelsError }}</p>
            } @else if (loadingModels) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else if (!models || models.length === 0) {
              <p class="small opacity-75 mb-0">Aucun modèle.</p>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Critères</th>
                      <th>Créé le</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of models; track m.version_code) {
                      <tr>
                        <td class="fw-semibold small">{{ m.version_code }}</td>
                        <td class="small">{{ m.criteria_count }}</td>
                        <td class="small">{{ m.created_at | slice: 0:10 }}</td>
                        <td>
                          @if (m.is_active) {
                            <c-badge color="success">Actif</c-badge>
                          } @else {
                            <c-badge color="secondary">Inactif</c-badge>
                          }
                        </td>
                        <td>
                          <div class="d-flex gap-2">
                            @if (!m.is_active) {
                              <button cButton color="primary" size="sm" [disabled]="activating === m.version_code" (click)="activateModel(m.version_code)">
                                {{ activating === m.version_code ? '…' : 'Activer' }}
                              </button>
                            }
                            <button cButton color="outline-secondary" size="sm" (click)="loadWeights(m.version_code)">
                              Poids
                            </button>
                          </div>
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

      <!-- Édition des poids -->
      @if (selectedVersionCode) {
        <c-col xs="12">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-body class="p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Poids du modèle : {{ selectedVersionCode }}</h5>
                <button cButton color="success" size="sm" [disabled]="savingWeights" (click)="saveWeights()">
                  {{ savingWeights ? 'Sauvegarde…' : 'Sauvegarder les poids' }}
                </button>
              </div>
              @if (weightsError) {
                <div class="alert alert-warning small mb-3" role="alert">{{ weightsError }}</div>
              }
              @if (weightsSaved) {
                <div class="alert alert-success small mb-3" role="alert">Poids mis à jour avec succès.</div>
              }
              @if (loadingWeights) {
                <p class="small opacity-75 mb-0">Chargement des poids…</p>
              } @else if (weights.length === 0) {
                <p class="small opacity-75 mb-0">Aucun critère pour ce modèle.</p>
              } @else {
                <div class="row g-3">
                  @for (w of weights; track w.criterion_code) {
                    <div class="col-md-6">
                      <div class="p-3 rounded" [class.bg-light]="!isDark()" [style.background]="isDark() ? 'rgba(255,255,255,0.06)' : undefined">
                        <label class="form-label small fw-semibold mb-1">
                          {{ w.criterion_code }}
                          @if (w.description) {
                            <span class="fw-normal opacity-75"> — {{ w.description }}</span>
                          }
                        </label>
                        <div class="d-flex align-items-center gap-2">
                          <input
                            type="range" class="form-range flex-grow-1"
                            min="0" max="100" step="1"
                            [(ngModel)]="w.weight"
                          />
                          <input
                            cFormControl
                            type="number" min="0" max="100"
                            style="width:70px"
                            [(ngModel)]="w.weight"
                          />
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </c-card-body>
          </c-card>
        </c-col>
      }
    </c-row>
  `
})
export class AdminMatchingComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly matching = inject(MatchingService);
  readonly #cdr = inject(ChangeDetectorRef);

  activeModel: ScoringModelDto | null = null;
  activeError = '';

  models: ScoringModelDto[] = [];
  loadingModels = true;
  modelsError = '';

  activating = '';

  selectedVersionCode = '';
  weights: CriterionWeightDto[] = [];
  loadingWeights = false;
  weightsError = '';
  savingWeights = false;
  weightsSaved = false;

  ngOnInit(): void {
    // Modèle actif
    this.matching.getActiveScoringModel().subscribe({
      next: (m) => { 
        this.activeModel = m; 
        this.#cdr.markForCheck();
      },
      error: () => { 
        this.activeError = 'Aucun modèle actif ou accès refusé.'; 
        this.#cdr.markForCheck();
      }
    });

    // Liste des modèles
    this.loadingModels = true;
    this.models = [];
    this.matching.listScoringModels().subscribe({
      next: (list) => { 
        this.models = list || []; 
        this.loadingModels = false; 
        this.#cdr.markForCheck();
      },
      error: () => { 
        this.modelsError = 'Impossible de charger les modèles.'; 
        this.loadingModels = false; 
        this.models = [];
        this.#cdr.markForCheck();
      }
    });
  }

  activateModel(versionCode: string): void {
    this.activating = versionCode;
    this.matching.activateScoringModel(versionCode).subscribe({
      next: (activated) => {
        this.activeModel = activated;
        if (this.models) {
          this.models = this.models.map(m => ({ ...m, is_active: m.version_code === versionCode }));
        }
        this.activating = '';
        this.#cdr.markForCheck();
      },
      error: () => { 
        this.activating = ''; 
        this.#cdr.markForCheck();
      }
    });
  }

  loadWeights(versionCode: string): void {
    this.selectedVersionCode = versionCode;
    this.weights = [];
    this.loadingWeights = true;
    this.weightsError = '';
    this.weightsSaved = false;
    this.matching.getScoringModelWeights(versionCode).subscribe({
      next: (list) => { 
        // Geère si list est un tableau ou un objet avec des propriétés
        let weights: CriterionWeightDto[] = [];
        if (Array.isArray(list)) {
          weights = list as CriterionWeightDto[];
        } else if (list && typeof list === 'object') {
          weights = Object.values(list) as CriterionWeightDto[];
        }
        this.weights = (weights || []).map(w => w && typeof w === 'object' ? { ...w } : w); 
        this.loadingWeights = false; 
        this.#cdr.markForCheck();
      },
      error: () => { 
        this.weightsError = 'Impossible de charger les poids.'; 
        this.loadingWeights = false; 
        this.weights = [];
        this.#cdr.markForCheck();
      }
    });
  }

  saveWeights(): void {
    if (!this.selectedVersionCode) { return; }
    this.savingWeights = true;
    this.weightsError = '';
    this.weightsSaved = false;
    const payload = (this.weights || []).map(w => ({ criterion_code: w.criterion_code, weight: w.weight }));
    this.matching.updateScoringModelWeights(this.selectedVersionCode, payload).subscribe({
      next: (updated) => {
        // Geère si updated est un tableau ou un objet avec des propriétés
        let weights: CriterionWeightDto[] = [];
        if (Array.isArray(updated)) {
          weights = updated as CriterionWeightDto[];
        } else if (updated && typeof updated === 'object') {
          weights = Object.values(updated) as CriterionWeightDto[];
        }
        this.weights = (weights || []).map(w => w && typeof w === 'object' ? { ...w } : w);
        this.savingWeights = false;
        this.weightsSaved = true;
        this.#cdr.markForCheck();
        setTimeout(() => { this.weightsSaved = false; this.#cdr.markForCheck(); }, 3000);
      },
      error: (err) => {
        this.weightsError = 'Erreur lors de la sauvegarde des poids.';
        this.savingWeights = false;
        this.#cdr.markForCheck();
      }
    });
  }
}
