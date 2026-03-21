import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  ColorModeService
} from '@coreui/angular';
import {
  AdminCompanyVerificationService,
  CompanyVerificationQueueItem
} from '../../../services/admin-company-verification.service';
import { AuthService } from '../../../services/auth.service';
import { finalize, timeout } from 'rxjs';
import { backendLabels } from '../../../core/backend-labels';

@Component({
  selector: 'app-company-verification',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    BadgeComponent,
    AlertComponent,
    ButtonDirective
  ],
  template: `
    <c-row>
      <c-col xs="12" lg="7">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold">Entreprises à verifier</h5>
              <button cButton color="secondary" size="sm" class="site-secondary-action" (click)="loadQueue()">Actualiser</button>
            </div>
          </c-card-header>
          <c-card-body class="p-4">
            @if (errorMessage) {
              <c-alert color="danger" class="border-0 shadow-sm mb-4">{{ errorMessage }}</c-alert>
            }

            @if (isLoading && !items.length) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement des entreprises...</span>
              </div>
            } @else if (!items.length) {
              <div class="text-center py-5 opacity-75">Aucune entreprise à verifier n’a été renvoyée par le backend.</div>
            } @else {
            <div class="table-responsive">
              <table cTable [hover]="true" [class.table-dark]="isDark()">
                <thead>
                  <tr>
                    <th>Entreprise</th>
                    <th>Statut</th>
                    <th>RCCM</th>
                    <th>Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of items"
                    (click)="selectCompany(item.company_identifier)"
                    style="cursor: pointer;"
                    [class.table-active]="selectedCompany?.company_identifier === item.company_identifier">
                    <td>
                      <div class="fw-semibold">{{ item.company_name }}</div>
                      <div class="small opacity-75">{{ item.company_identifier }}</div>
                    </td>
                    <td>
                      <c-badge color="warning" shape="rounded-pill">{{ labels.verificationStatus(item.verification_status) }}</c-badge>
                    </td>
                    <td>{{ labels.rccmStatus(item.rccm_document_status) }}</td>
                    <td>{{ item.dossier_priority_score }}</td>
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
            <h5 class="mb-0 fw-bold">Dossier entreprise</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (detailLoading && !selectedCompany) {
              <div class="d-flex align-items-center gap-3 py-5 justify-content-center opacity-75">
                <span class="spinner-border spinner-border-sm"></span>
                <span>Chargement du dossier...</span>
              </div>
            } @else if (selectedCompany) {
              <div class="mb-3">
                <div class="fw-bold fs-5">{{ selectedCompany.company_name }}</div>
                <div class="small opacity-75">{{ selectedCompany.company_identifier }}</div>
              </div>

              <div class="d-flex gap-2 flex-wrap mb-4">
                <c-badge color="warning" shape="rounded-pill">{{ labels.verificationStatus(selectedCompany.verification_status) }}</c-badge>
                <c-badge [color]="selectedCompany.has_rccm_document ? 'success' : 'secondary'" shape="rounded-pill">
                  {{ selectedCompany.has_rccm_document ? 'RCCM présent' : 'RCCM absent' }}
                </c-badge>
              </div>

              <div class="mb-3">
                <div class="small opacity-75">Registre</div>
                <div>{{ selectedCompany.registration_number }}</div>
              </div>
              <div class="mb-3">
                <div class="small opacity-75">Taxe</div>
                <div>{{ selectedCompany.tax_identifier }}</div>
              </div>
              <div class="mb-3">
                <div class="small opacity-75">Document RCCM</div>
                <div>{{ labels.rccmStatus(selectedCompany.rccm_document_status) }}</div>
              </div>
              <div class="mb-0">
                <div class="small opacity-75">Priorité</div>
                <div>{{ selectedCompany.dossier_priority_score }}</div>
              </div>
            } @else {
              <div class="text-center py-5 opacity-75">Survole ou clique une entreprise pour afficher son dossier.</div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class CompanyVerificationComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #verificationService = inject(AdminCompanyVerificationService);
  readonly #authService = inject(AuthService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  items: CompanyVerificationQueueItem[] = [];
  selectedCompany: CompanyVerificationQueueItem | null = null;
  isLoading = true;
  detailLoading = false;
  errorMessage = '';

  constructor() {}

  ngOnInit(): void {
    this.loadQueue();
    this.#route.queryParamMap.subscribe((params) => {
      const companyIdentifier = params.get('company');
      if (companyIdentifier) {
        this.loadCompanyDetail(companyIdentifier);
      }
    });
  }

  loadQueue(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.#verificationService.listQueue().pipe(
      timeout(15000),
      finalize(() => {
        this.isLoading = false;
        this.#cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.items = response.items;
        this.#cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.#authService.getErrorMessage(error, 'Impossible de charger la file de verification des entreprises.');
        this.items = [];
        this.#cdr.markForCheck();
      }
    });
  }

  selectCompany(companyIdentifier: string): void {
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { company: companyIdentifier },
      queryParamsHandling: 'merge'
    });
  }

  private loadCompanyDetail(companyIdentifier: string): void {
    this.detailLoading = true;
    this.#verificationService.getCompany(companyIdentifier).pipe(
      timeout(15000),
      finalize(() => {
        this.detailLoading = false;
        this.#cdr.markForCheck();
      })
    ).subscribe({
      next: (company) => {
        this.selectedCompany = company;
        this.#cdr.markForCheck();
      },
      error: () => {
        this.selectedCompany = null;
        this.#cdr.markForCheck();
      }
    });
  }
}
