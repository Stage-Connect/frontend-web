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
  FormControlDirective,
  TableDirective
} from '@coreui/angular';
import {
  ActiveSubscriptionDto,
  PlanDto,
  PaymentTransactionDto,
  InitiatePaymentRequest,
  PaymentsPortalService
} from '../../../services/payments-portal.service';

@Component({
  selector: 'app-entreprise-payments',
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
    TableDirective
  ],
  template: `
    <c-row class="g-4">
      <!-- Abonnement actif -->
      <c-col md="6">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Abonnement actif</h5>
            @if (subError) {
              <p class="small opacity-75 mb-0">{{ subError }}</p>
            } @else if (subscription) {
              <p class="mb-1"><strong>{{ subscription.plan_label }}</strong> ({{ subscription.plan_code }})</p>
              <p class="small opacity-75 mb-2">
                Du {{ subscription.starts_at | slice: 0:10 }} au {{ subscription.ends_at | slice: 0:10 }}
              </p>
              <span class="badge" [class.bg-success]="subscription.status === 'ACTIVE'" [class.bg-secondary]="subscription.status !== 'ACTIVE'">
                {{ subscription.status }}
              </span>
              @if (subscription.quotas && subscription.quotas.length) {
                <div class="mt-3">
                  <div class="small fw-semibold mb-1 opacity-75">Quotas</div>
                  <ul class="list-unstyled small mb-0">
                    @for (q of subscription.quotas; track q.feature_code) {
                      <li class="mb-1">{{ q.feature_code }} — {{ q.quota_value }} / {{ q.period_code }}</li>
                    }
                  </ul>
                </div>
              }
            } @else {
              <p class="small opacity-75 mb-0">Aucun abonnement actif pour ce compte.</p>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Catalogue des plans -->
      <c-col md="6">
        <c-card class="border-0 shadow-sm h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <h5 class="fw-bold mb-3">Catalogue des plans</h5>
            @if (plansError) {
              <p class="small opacity-75 mb-0">{{ plansError }}</p>
            } @else if (plans.length) {
              <ul class="list-unstyled mb-0 small">
                @for (p of plans; track p.code) {
                  <li class="mb-2 pb-2 border-bottom" [class.border-secondary]="isDark()">
                    <span class="fw-semibold">{{ p.label }}</span> — {{ p.price_amount_fcfa }} FCFA / {{ p.billing_period }}
                  </li>
                }
              </ul>
            } @else {
              <p class="small opacity-75 mb-0">Aucun plan listé (droits « payments:read_plans » requis pour l'API).</p>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Historique transactions -->
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Historique des transactions</h5>
              <button cButton color="primary" size="sm" (click)="openPaymentModal()">
                + Initier un paiement
              </button>
            </div>
            @if (txError) {
              <p class="small opacity-75 mb-0">{{ txError }}</p>
            } @else if (loadingTx) {
              <p class="small opacity-75 mb-0">Chargement…</p>
            } @else if (transactions.length === 0) {
              <p class="small opacity-75 mb-0">Aucune transaction.</p>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>ID Transaction</th>
                      <th>Plan</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Fournisseur</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of transactions; track tx.transaction_id) {
                      <tr>
                        <td class="small text-truncate" style="max-width:130px">{{ tx.transaction_id }}</td>
                        <td class="small">{{ tx.plan_code }}</td>
                        <td class="small">{{ tx.amount_fcfa | number }} {{ tx.currency }}</td>
                        <td>
                          <span class="badge"
                            [class.bg-success]="tx.status === 'COMPLETED'"
                            [class.bg-warning]="tx.status === 'PENDING'"
                            [class.bg-danger]="tx.status === 'FAILED'"
                            [class.bg-secondary]="tx.status !== 'COMPLETED' && tx.status !== 'PENDING' && tx.status !== 'FAILED'"
                          >{{ tx.status }}</span>
                        </td>
                        <td class="small">{{ tx.provider }}</td>
                        <td class="small">{{ tx.initiated_at | slice: 0:10 }}</td>
                        <td>
                          @if (tx.status === 'COMPLETED') {
                            <button cButton color="link" size="sm" (click)="downloadReceipt(tx.transaction_id)">Reçu</button>
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
    </c-row>

    <!-- Modal initier paiement -->
    @if (showModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <div class="modal-header">
              <h5 class="modal-title">Initier un paiement</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="isDark()" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              @if (modalError) {
                <div class="alert alert-danger small" role="alert">{{ modalError }}</div>
              }
              <div class="mb-3">
                <label class="form-label small fw-semibold">Plan</label>
                <select cFormSelect [(ngModel)]="paymentForm.plan_code" class="form-select">
                  <option value="">-- Sélectionner --</option>
                  @for (p of plans; track p.code) {
                    <option [value]="p.code">{{ p.label }} ({{ p.price_amount_fcfa }} FCFA)</option>
                  }
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Numéro mobile</label>
                <input cFormControl [(ngModel)]="paymentForm.mobile_number" placeholder="Ex: 237691000000" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Fournisseur</label>
                <select cFormSelect [(ngModel)]="paymentForm.provider" class="form-select">
                  <option value="">-- Sélectionner --</option>
                  <option value="MTN_MOMO">MTN MoMo</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button cButton color="secondary" (click)="closeModal()">Annuler</button>
              <button cButton color="primary" [disabled]="submitting || !paymentForm.plan_code || !paymentForm.mobile_number || !paymentForm.provider" (click)="submitPayment()">
                {{ submitting ? 'Traitement…' : 'Initier' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class EntreprisePaymentsComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly payments = inject(PaymentsPortalService);

  subscription: ActiveSubscriptionDto | null = null;
  subError = '';
  plans: PlanDto[] = [];
  plansError = '';

  transactions: PaymentTransactionDto[] = [];
  loadingTx = true;
  txError = '';

  showModal = false;
  submitting = false;
  modalError = '';
  paymentForm: InitiatePaymentRequest = { plan_code: '', mobile_number: '', provider: '' };

  ngOnInit(): void {
    this.payments.getActiveSubscription().subscribe({
      next: (s) => {
        this.subscription = s;
        this.plans = [
          {
            code: s.plan_code,
            label: s.plan_label,
            target_audience: 'COMPANY_RECRUITER',
            price_amount_fcfa: 0,
            billing_period: 'custom',
            validity_days: 0,
            is_active: true
          }
        ];
      },
      error: () => { this.subError = 'Impossible de lire l\'abonnement (droits ou compte).'; }
    });
    this.plansError = 'Catalogue des plans non exposé pour le rôle entreprise sur cette API.';
    this.payments.listTransactions().subscribe({
      next: (res) => { this.transactions = res.items; this.loadingTx = false; },
      error: () => { this.txError = 'Impossible de charger les transactions.'; this.loadingTx = false; }
    });
  }

  openPaymentModal(): void {
    this.paymentForm = { plan_code: '', mobile_number: '', provider: '' };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitPayment(): void {
    if (!this.paymentForm.plan_code || !this.paymentForm.mobile_number || !this.paymentForm.provider) {
      return;
    }
    this.submitting = true;
    this.modalError = '';
    this.payments.initiatePayment(this.paymentForm).subscribe({
      next: () => {
        this.submitting = false;
        this.showModal = false;
        this.payments.listTransactions().subscribe({
          next: (res) => { this.transactions = res.items; },
          error: () => {}
        });
      },
      error: () => {
        this.modalError = 'Erreur lors de l\'initiation du paiement.';
        this.submitting = false;
      }
    });
  }

  downloadReceipt(transactionId: string): void {
    this.payments.generateReceipt(transactionId).subscribe({
      next: (receipt) => {
        if (receipt.download_url) {
          window.open(receipt.download_url, '_blank');
        }
      },
      error: () => {}
    });
  }
}
