import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { IconDirective } from '@coreui/icons-angular';
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
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    BadgeComponent,
    AlertComponent,
    ButtonDirective,
    IconDirective
  ],
  template: `
    <c-row>
      <c-col xs="12">
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
                    @for (item of items; track item.company_identifier) {
                      <tr
                        style="cursor: pointer;">
                        <td>
                          <div class="fw-semibold">{{ item.company_name }}</div>
                          <div class="small opacity-75">{{ item.company_identifier }}</div>
                        </td>
                        <td>
                          <c-badge color="warning" shape="rounded-pill">{{ labels.verificationStatus(item.verification_status) }}</c-badge>
                        </td>
                        <td>{{ labels.rccmStatus(item.rccm_document_status) }}</td>
                        <td>{{ item.dossier_priority_score }}</td>
                        <td class="text-end">
                          <a
                            cButton
                            color="primary"
                            size="sm"
                            variant="ghost"
                            class="p-2 rounded-pill"
                            title="Voir détails"
                            [routerLink]="['/dashboard/admin/validations', item.company_identifier]">
                            <svg cIcon name="cilFindInPage" size="sm"></svg>
                          </a>
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
    </c-row>
  `
})
export class CompanyVerificationComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #verificationService = inject(AdminCompanyVerificationService);
  readonly #authService = inject(AuthService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  items: CompanyVerificationQueueItem[] = [];
  isLoading = true;
  errorMessage = '';

  constructor() {}

  ngOnInit(): void {
    this.loadQueue();
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

}
