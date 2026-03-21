import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ColorModeService,
  FormCheckComponent,
  FormCheckInputDirective,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  RowComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import {
  AdminReferenceDataService,
  CompetenceItem,
  CompetencePayload,
  FiliereItem,
  FilierePayload,
  ReferenceAuditLog,
  ReferenceCatalog,
  ReferenceCategory,
  ReferenceItem,
  SectorItem,
  SectorPayload,
  SkillReferential,
  SkillReferentialPayload,
  StatusItem,
  StatusPayload,
  StatusReferential,
  StatusReferentialPayload
} from '../../../services/admin-reference-data.service';
import { finalize, Observable, timeout } from 'rxjs';
import { backendLabels } from '../../../core/backend-labels';

interface ReferenceCard {
  category: ReferenceCategory;
  label: string;
  helper: string;
  icon: string;
  accent: string;
  count: number;
}

@Component({
  selector: 'app-admin-reference-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    AlertComponent,
    BadgeComponent,
    ButtonDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    IconDirective
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <c-card class="border-0 shadow-sm overflow-hidden" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4 p-lg-5" [style.background]="heroBackground">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
              <div>
                <div class="small text-uppercase fw-semibold opacity-75 mb-2">Administration</div>
                <h2 class="fw-bold mb-2">Référentiels administratifs</h2>
                <p class="mb-0 opacity-75" style="max-width: 720px;">
                  Gère les codes métier du backend: statuts, référentiels, secteurs, filières et compétences.
                  L’API actuelle permet la lecture, la création et la mise à jour. Il n’y a pas d’endpoint de suppression dédié.
                </p>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button cButton color="light" class="fw-semibold" (click)="resetEditor()">
                  Nouveau
                </button>
                <button cButton color="secondary" class="fw-semibold site-secondary-action" (click)="loadReferenceData()">
                  Actualiser
                </button>
              </div>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    @if (errorMessage) {
      <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
    }

    @if (!catalogReady) {
      <c-row class="g-3 mb-4">
        <c-col xs="12">
          <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <c-card-body class="py-4 d-flex align-items-center justify-content-center gap-3 opacity-75">
              <span class="spinner-border spinner-border-sm"></span>
              <span>Chargement des cartes référentielles...</span>
            </c-card-body>
          </c-card>
        </c-col>
      </c-row>
    } @else {
      <c-row class="g-3 mb-4">
        @for (card of referenceCards; track card.category) {
          <c-col sm="6" lg="4" xl="2">
            <button
              type="button"
              class="w-100 h-100 text-start border-0 p-0 bg-transparent"
              (click)="switchCategory(card.category)">
              <c-card
                class="h-100 border-0 shadow-sm reference-summary-card"
                [class.bg-dark]="isDark()"
                [class.text-white]="isDark()"
                [class.reference-summary-card-active]="activeCategory === card.category">
                <c-card-body class="p-4">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style="width: 44px; height: 44px;"
                      [style.backgroundColor]="card.accent">
                      <svg cIcon [name]="card.icon" class="text-white"></svg>
                    </div>
                    <c-badge [style.backgroundColor]="card.accent" shape="rounded-pill">{{ card.count }}</c-badge>
                  </div>
                  <div class="fw-bold mb-1">{{ card.label }}</div>
                  <div class="small opacity-75">{{ card.helper }}</div>
                </c-card-body>
              </c-card>
            </button>
          </c-col>
        }
      </c-row>
    }

    <c-row class="g-4">
      <c-col xs="12" xl="7">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center"
            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <div>
              <h5 class="mb-0 fw-bold">{{ activeCategoryMeta.label }}</h5>
              <div class="small opacity-75">{{ activeCategoryMeta.helper }}</div>
            </div>
            <c-badge color="primary" shape="rounded-pill">{{ currentItems.length }}</c-badge>
          </c-card-header>
          <c-card-body class="p-0">
            @if (isLoadingCatalog) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des référentiels...</span>
              </div>
            } @else if (!currentItems.length) {
              <div class="text-center py-5 opacity-75">Aucun élément à afficher pour cette rubrique.</div>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Label</th>
                      <th>Relation</th>
                      <th>État</th>
                      <th>Ordre</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of currentItems; track item.code) {
                      <tr
                        (click)="selectItem(item)"
                        style="cursor: pointer;"
                        [class.table-active]="selectedCode === item.code">
                        <td class="fw-semibold">{{ item.code }}</td>
                        <td>{{ getItemLabel(item) }}</td>
                        <td>{{ getRelationLabel(item) }}</td>
                        <td>
                          <c-badge [color]="item.is_active ? 'success' : 'secondary'" shape="rounded-pill">
                            {{ item.is_active ? 'Actif' : 'Inactif' }}
                          </c-badge>
                        </td>
                        <td>{{ item.display_order }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <c-col xs="12" xl="5">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom"
            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0 fw-bold">{{ selectedCode ? 'Éditer l’élément' : 'Créer un élément' }}</h5>
                <div class="small opacity-75">{{ activeCategoryMeta.label }}</div>
              </div>
              <button cButton color="secondary" variant="ghost" size="sm" (click)="resetEditor()">Réinitialiser</button>
            </div>
          </c-card-header>
          <c-card-body class="p-4">
            @if (saveError) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ saveError }}</c-alert>
            }

            <form [formGroup]="editorForm" (ngSubmit)="submitForm()" cForm>
              <div class="mb-3">
                <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Code</label>
                <input cFormControl formControlName="code" [readOnly]="!!selectedCode" />
              </div>

              <div class="mb-3">
                <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Label</label>
                <input cFormControl formControlName="label" />
              </div>

              @if (showField('version')) {
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Version</label>
                  <input cFormControl formControlName="version" />
                </div>
              }

              @if (showField('evolution_policy')) {
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Politique d’évolution</label>
                  <input cFormControl formControlName="evolution_policy" />
                </div>
              }

              @if (showField('usage_category')) {
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Catégorie d'usage</label>
                  <input cFormControl formControlName="usage_category" />
                </div>
              }

              @if (showField('referential_code')) {
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Code référentiel</label>
                  <input cFormControl formControlName="referential_code" />
                </div>
              }

              @if (showField('sector_code')) {
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Code secteur</label>
                  <input cFormControl formControlName="sector_code" />
                </div>
              }

              @if (showField('filiere_code')) {
                <div class="mb-3">
                  <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Code filière</label>
                  <input cFormControl formControlName="filiere_code" />
                </div>
              }

              <div class="mb-3">
                <label cLabel class="form-label small fw-bold text-uppercase opacity-75">Ordre d'affichage</label>
                <input cFormControl type="number" formControlName="display_order" />
              </div>

              @if (showField('is_terminal')) {
                <div class="mb-3">
                  <c-form-check>
                    <input cFormCheckInput type="checkbox" formControlName="is_terminal" />
                    <label cLabel class="ms-2 mb-0">Statut terminal</label>
                  </c-form-check>
                </div>
              }

              <div class="mb-4">
                <c-form-check>
                  <input cFormCheckInput type="checkbox" formControlName="is_active" />
                  <label cLabel class="ms-2 mb-0">Élément actif</label>
                </c-form-check>
              </div>

              <div class="d-grid">
                <button cButton color="primary" type="submit" [disabled]="editorForm.invalid || isSaving">
                  {{ isSaving ? 'Enregistrement...' : (selectedCode ? 'Mettre à jour' : 'Créer') }}
                </button>
              </div>
            </form>
          </c-card-body>
        </c-card>

        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom"
            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold">Audit récent</h5>
          </c-card-header>
          <c-card-body class="p-0">
            @if (isLoadingAudit) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement de l’audit...</span>
              </div>
            } @else if (!auditLogs.length) {
              <div class="text-center py-5 opacity-75">Aucun audit disponible.</div>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Code</th>
                      <th>Acteur</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of auditLogs; track item.resource_code) {
                      <tr>
                        <td>{{ labels.resourceKind(item.resource_kind) }}</td>
                        <td>{{ item.resource_code }}</td>
                        <td>{{ item.actor_account_identifier || 'N/A' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class AdminReferenceDataComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #referenceService = inject(AdminReferenceDataService);
  readonly #authService = inject(AuthService);
  readonly #alerts = inject(AlertService);
  readonly #fb = inject(FormBuilder);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  readonly editorForm: FormGroup = this.#fb.group({
    code: ['', [Validators.required, Validators.minLength(2)]],
    label: ['', [Validators.required, Validators.minLength(2)]],
    version: [''],
    evolution_policy: [''],
    usage_category: [''],
    referential_code: [''],
    sector_code: [''],
    filiere_code: [''],
    display_order: [0, [Validators.required]],
    is_active: [true],
    is_terminal: [false]
  });

  catalog: ReferenceCatalog | null = null;
  auditLogs: ReferenceAuditLog[] = [];
  referenceCards: ReferenceCard[] = [];
  currentItems: ReferenceItem[] = [];
  activeCategoryMeta: Omit<ReferenceCard, 'count'>;
  errorMessage = '';
  saveError = '';
  isLoadingCatalog = true;
  isLoadingAudit = true;
  isSaving = false;
  catalogReady = false;

  activeCategory: ReferenceCategory = 'sectors';
  selectedCode: string | null = null;

  readonly categoryMeta: Record<ReferenceCategory, Omit<ReferenceCard, 'count'>> = {
    status_referentials: {
      category: 'status_referentials',
      label: 'Référentiels statuts',
      helper: 'Versionne les familles de statuts du système.',
      icon: 'cilLayers',
      accent: '#004a99'
    },
    statuses: {
      category: 'statuses',
      label: 'Statuts',
      helper: 'Gère les codes d’état exploitables par le backend.',
      icon: 'cilCheckCircle',
      accent: '#2eb85c'
    },
    skill_referentials: {
      category: 'skill_referentials',
      label: 'Référentiels skills',
      helper: 'Structure les nomenclatures de compétences.',
      icon: 'cilPuzzle',
      accent: '#6f42c1'
    },
    sectors: {
      category: 'sectors',
      label: 'Secteurs',
      helper: 'Catégorise les domaines métiers principaux.',
      icon: 'cilBuilding',
      accent: '#f7941e'
    },
    filieres: {
      category: 'filieres',
      label: 'Filières',
      helper: 'Relie les parcours aux secteurs.',
      icon: 'cilLibrary',
      accent: '#20a8d8'
    },
    competences: {
      category: 'competences',
      label: 'Compétences',
      helper: 'Granularité fine des savoir-faire.',
      icon: 'cilStar',
      accent: '#dc3545'
    }
  };

  constructor() {
    this.activeCategoryMeta = this.categoryMeta[this.activeCategory];
  }

  get heroBackground(): string {
    return this.isDark()
      ? 'linear-gradient(135deg, rgba(0,74,153,0.55), rgba(36,48,63,0.95))'
      : 'linear-gradient(135deg, rgba(0,74,153,0.12), rgba(247,148,30,0.14))';
  }

  ngOnInit(): void {
    setTimeout(() => this.loadReferenceData(), 0);
  }

  loadReferenceData(): void {
    this.isLoadingCatalog = true;
    this.isLoadingAudit = true;
    this.catalogReady = false;
    this.errorMessage = '';

    this.#referenceService.getCatalog().pipe(
      timeout(15000),
      finalize(() => {
        this.isLoadingCatalog = false;
        this.#cdr.markForCheck();
      })
    ).subscribe({
      next: (catalog) => {
        this.catalog = catalog;
        this.referenceCards = this.buildReferenceCards(catalog);
        this.currentItems = [...catalog[this.activeCategory]];
        this.activeCategoryMeta = this.categoryMeta[this.activeCategory];
        this.catalogReady = true;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger les référentiels.');
        this.catalog = null;
        this.referenceCards = [];
        this.currentItems = [];
        this.catalogReady = true;
        this.#cdr.markForCheck();
      }
    });

    this.#referenceService.listAudit().pipe(
      timeout(15000),
      finalize(() => {
        this.isLoadingAudit = false;
        this.#cdr.markForCheck();
      })
    ).subscribe({
      next: (logs) => {
        setTimeout(() => {
          this.auditLogs = logs;
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.auditLogs = [];
        }, 0);
      }
    });
  }

  switchCategory(category: ReferenceCategory): void {
    this.activeCategory = category;
    this.activeCategoryMeta = this.categoryMeta[category];
    this.currentItems = this.catalog ? [...this.catalog[category]] : [];
    this.resetEditor();
  }

  selectItem(item: ReferenceItem): void {
    this.selectedCode = item.code;
    this.saveError = '';
    this.editorForm.reset({
      code: item.code,
      label: this.getItemLabel(item),
      version: this.getString(item, 'version'),
      evolution_policy: this.getString(item, 'evolution_policy'),
      usage_category: this.getString(item, 'usage_category'),
      referential_code: this.getString(item, 'referential_code'),
      sector_code: this.getString(item, 'sector_code'),
      filiere_code: this.getString(item, 'filiere_code'),
      display_order: item.display_order,
      is_active: item.is_active,
      is_terminal: this.getBoolean(item, 'is_terminal')
    });
  }

  resetEditor(): void {
    this.selectedCode = null;
    this.saveError = '';
    this.editorForm.reset({
      code: '',
      label: '',
      version: '',
      evolution_policy: '',
      usage_category: '',
      referential_code: '',
      sector_code: '',
      filiere_code: '',
      display_order: 0,
      is_active: true,
      is_terminal: false
    });
  }

  showField(field: 'version' | 'evolution_policy' | 'usage_category' | 'referential_code' | 'sector_code' | 'filiere_code' | 'is_terminal'): boolean {
    switch (this.activeCategory) {
      case 'status_referentials':
      case 'skill_referentials':
        return field === 'version' || field === 'evolution_policy';
      case 'statuses':
        return field === 'usage_category' || field === 'referential_code' || field === 'is_terminal';
      case 'sectors':
        return field === 'referential_code';
      case 'filieres':
        return field === 'sector_code' || field === 'referential_code';
      case 'competences':
        return field === 'sector_code' || field === 'filiere_code' || field === 'referential_code';
      default:
        return false;
    }
  }

  getItemLabel(item: ReferenceItem): string {
    return item.label;
  }

  getRelationLabel(item: ReferenceItem): string {
    switch (this.activeCategory) {
      case 'status_referentials':
      case 'skill_referentials':
        return this.getString(item, 'version') || 'Version n/a';
      case 'statuses':
        return this.getString(item, 'referential_code') || this.getString(item, 'usage_category') || 'Aucune';
      case 'sectors':
        return this.getString(item, 'referential_code') || 'Aucun';
      case 'filieres':
        return this.getString(item, 'sector_code') || 'Aucun';
      case 'competences':
        return this.getString(item, 'filiere_code') || this.getString(item, 'sector_code') || 'Aucune';
      default:
        return 'Aucune';
    }
  }

  submitForm(): void {
    if (this.editorForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const raw = this.editorForm.getRawValue();

    this.buildSaveRequest(raw).subscribe({
      next: async () => {
        this.isSaving = false;
        await this.#alerts.success(
          this.selectedCode ? 'Référentiel mis à jour' : 'Référentiel créé',
          'Les changements ont bien été enregistrés côté backend.'
        );
        this.loadReferenceData();
        this.resetEditor();
      },
      error: async (error: unknown) => {
        this.isSaving = false;
        this.saveError = this.#authService.getErrorMessage(error, 'Impossible d’enregistrer ce référentiel.');
        await this.#alerts.error('Enregistrement impossible', this.saveError);
      }
    });
  }

  private buildSaveRequest(raw: Record<string, unknown>): Observable<ReferenceItem> {
    const code = String(raw['code'] ?? '').trim();

    switch (this.activeCategory) {
      case 'status_referentials': {
        const payload: StatusReferentialPayload = {
          code,
          label: String(raw['label'] ?? '').trim(),
          version: String(raw['version'] ?? '').trim(),
          evolution_policy: String(raw['evolution_policy'] ?? '').trim(),
          is_active: Boolean(raw['is_active']),
          display_order: Number(raw['display_order'] ?? 0)
        };
        return this.selectedCode
          ? this.#referenceService.updateStatusReferential(this.selectedCode, payload)
          : this.#referenceService.createStatusReferential(payload);
      }
      case 'statuses': {
        const payload: StatusPayload = {
          code,
          label: String(raw['label'] ?? '').trim(),
          usage_category: String(raw['usage_category'] ?? '').trim(),
          is_terminal: Boolean(raw['is_terminal']),
          referential_code: String(raw['referential_code'] ?? '').trim(),
          is_active: Boolean(raw['is_active']),
          display_order: Number(raw['display_order'] ?? 0)
        };
        return this.selectedCode
          ? this.#referenceService.updateStatus(this.selectedCode, payload)
          : this.#referenceService.createStatus(payload);
      }
      case 'skill_referentials': {
        const payload: SkillReferentialPayload = {
          code,
          label: String(raw['label'] ?? '').trim(),
          version: String(raw['version'] ?? '').trim(),
          evolution_policy: String(raw['evolution_policy'] ?? '').trim(),
          is_active: Boolean(raw['is_active']),
          display_order: Number(raw['display_order'] ?? 0)
        };
        return this.selectedCode
          ? this.#referenceService.updateSkillReferential(this.selectedCode, payload)
          : this.#referenceService.createSkillReferential(payload);
      }
      case 'sectors': {
        const payload: SectorPayload = {
          code,
          label: String(raw['label'] ?? '').trim(),
          referential_code: String(raw['referential_code'] ?? '').trim(),
          is_active: Boolean(raw['is_active']),
          display_order: Number(raw['display_order'] ?? 0)
        };
        return this.selectedCode
          ? this.#referenceService.updateSector(this.selectedCode, payload)
          : this.#referenceService.createSector(payload);
      }
      case 'filieres': {
        const payload: FilierePayload = {
          code,
          label: String(raw['label'] ?? '').trim(),
          sector_code: String(raw['sector_code'] ?? '').trim(),
          referential_code: String(raw['referential_code'] ?? '').trim(),
          is_active: Boolean(raw['is_active']),
          display_order: Number(raw['display_order'] ?? 0)
        };
        return this.selectedCode
          ? this.#referenceService.updateFiliere(this.selectedCode, payload)
          : this.#referenceService.createFiliere(payload);
      }
      case 'competences': {
        const payload: CompetencePayload = {
          code,
          label: String(raw['label'] ?? '').trim(),
          filiere_code: String(raw['filiere_code'] ?? '').trim(),
          sector_code: String(raw['sector_code'] ?? '').trim(),
          referential_code: String(raw['referential_code'] ?? '').trim(),
          is_active: Boolean(raw['is_active']),
          display_order: Number(raw['display_order'] ?? 0)
        };
        return this.selectedCode
          ? this.#referenceService.updateCompetence(this.selectedCode, payload)
          : this.#referenceService.createCompetence(payload);
      }
    }
  }

  private getCount(category: ReferenceCategory): number {
    return this.catalog?.[category]?.length ?? 0;
  }

  private buildReferenceCards(catalog: ReferenceCatalog): ReferenceCard[] {
    return (Object.keys(this.categoryMeta) as ReferenceCategory[]).map((category) => ({
      ...this.categoryMeta[category],
      count: catalog[category].length
    }));
  }

  private getString(item: ReferenceItem, key: string): string {
    const value = (item as unknown as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
  }

  private getBoolean(item: ReferenceItem, key: string): boolean {
    const value = (item as unknown as Record<string, unknown>)[key];
    return typeof value === 'boolean' ? value : false;
  }
}
