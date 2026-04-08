import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface PlanDto {
  code: string;
  label: string;
  target_audience: string;
  price_amount_fcfa: number;
  billing_period: string;
  validity_days: number;
  is_active: boolean;
}

export interface ActiveSubscriptionDto {
  subscription_id: string;
  account_identifier: string;
  plan_code: string;
  plan_label: string;
  status: string;
  starts_at: string;
  ends_at: string;
  payment_mode: string;
  payment_reference: string | null;
  quotas: { feature_code: string; period_code: string; quota_value: number }[];
}

export interface PaymentTransactionDto {
  transaction_id: string;
  account_identifier: string;
  plan_code: string;
  amount_fcfa: number;
  currency: string;
  status: string;
  mobile_number: string;
  provider: string;
  initiated_at: string;
  completed_at: string | null;
  reconciled_at: string | null;
  receipt_document_number: string | null;
}

export interface PaymentHistoryDto {
  items: PaymentTransactionDto[];
  total: number;
  page: number;
  page_size: number;
}

export interface InitiatePaymentRequest {
  plan_code: string;
  mobile_number: string;
  provider: string;
}

export interface InitiatePaymentResponse {
  transaction_id: string;
  status: string;
  initiated_at: string;
}

export interface ReconcilePaymentRequest {
  provider_transaction_id: string;
  provider_status: string;
  provider_amount_fcfa: number;
}

export interface ActivateSubscriptionRequest {
  plan_code: string;
  payment_mode: string;
  payment_reference?: string;
}

export interface FeatureQuotaStateDto {
  feature_code: string;
  period_code: string;
  quota_value: number;
  consumed: number;
  remaining: number;
  last_reset_at: string;
}

export interface PaymentReceiptDto {
  document_number: string;
  transaction_id: string;
  issued_at: string;
  download_url: string | null;
}

export interface QuotaRequestDto {
  feature_code: string;
  units: number;
}

export interface CreatePlanRequest {
  code: string;
  label: string;
  target_audience: string;
  price_amount_fcfa: number;
  billing_period: string;
  validity_days: number;
  quotas: { feature_code: string; period_code: string; quota_value: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsPortalService {
  private readonly http = inject(HttpClient);

  listPlans(): Observable<PlanDto[]> {
    return this.http.get<PlanDto[]>(buildApiUrl('/api/v1/payments/plans'));
  }

  getActiveSubscription(accountIdentifier?: string): Observable<ActiveSubscriptionDto> {
    let params = new HttpParams();
    if (accountIdentifier) {
      params = params.set('account_identifier', accountIdentifier);
    }
    return this.http.get<ActiveSubscriptionDto>(buildApiUrl('/api/v1/payments/subscriptions/active'), {
      params
    });
  }

  activateSubscription(payload: ActivateSubscriptionRequest): Observable<ActiveSubscriptionDto> {
    return this.http.post<ActiveSubscriptionDto>(
      buildApiUrl('/api/v1/payments/subscriptions/activate'),
      payload
    );
  }

  initiatePayment(payload: InitiatePaymentRequest): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(
      buildApiUrl('/api/v1/payments/transactions'),
      payload
    );
  }

  getTransaction(transactionId: string): Observable<PaymentTransactionDto> {
    return this.http.get<PaymentTransactionDto>(
      buildApiUrl(`/api/v1/payments/transactions/${encodeURIComponent(transactionId)}`)
    );
  }

  listTransactions(page = 1, pageSize = 20): Observable<PaymentHistoryDto> {
    const params = new HttpParams().set('page', String(page)).set('page_size', String(pageSize));
    return this.http.get<PaymentHistoryDto>(buildApiUrl('/api/v1/payments/transactions'), { params });
  }

  reconcileTransaction(transactionId: string, payload: ReconcilePaymentRequest): Observable<PaymentTransactionDto> {
    return this.http.post<PaymentTransactionDto>(
      buildApiUrl(`/api/v1/payments/transactions/${encodeURIComponent(transactionId)}/reconcile`),
      payload
    );
  }

  generateReceipt(transactionId: string): Observable<PaymentReceiptDto> {
    return this.http.post<PaymentReceiptDto>(
      buildApiUrl(`/api/v1/payments/transactions/${encodeURIComponent(transactionId)}/receipt`),
      {}
    );
  }

  getReceipt(transactionId: string): Observable<PaymentReceiptDto> {
    return this.http.get<PaymentReceiptDto>(
      buildApiUrl(`/api/v1/payments/transactions/${encodeURIComponent(transactionId)}/receipt`)
    );
  }

  checkEntitlement(payload: QuotaRequestDto): Observable<FeatureQuotaStateDto> {
    return this.http.post<FeatureQuotaStateDto>(
      buildApiUrl('/api/v1/payments/entitlements/check'),
      payload
    );
  }

  createPlan(payload: CreatePlanRequest): Observable<PlanDto> {
    return this.http.post<PlanDto>(buildApiUrl('/api/v1/payments/plans'), payload);
  }

  updatePlan(planCode: string, payload: Partial<CreatePlanRequest>): Observable<PlanDto> {
    return this.http.put<PlanDto>(
      buildApiUrl(`/api/v1/payments/plans/${encodeURIComponent(planCode)}`),
      payload
    );
  }

  reconcileExpiredSubscriptions(): Observable<{ reconciled_count: number }> {
    return this.http.post<{ reconciled_count: number }>(
      buildApiUrl('/api/v1/payments/subscriptions/reconcile-expired'), {}
    );
  }

  consumeEntitlement(entitlementCode: string): Observable<{ consumed: boolean; remaining: number }> {
    return this.http.post<{ consumed: boolean; remaining: number }>(
      buildApiUrl(`/api/v1/payments/entitlements/${encodeURIComponent(entitlementCode)}/consume`), {}
    );
  }

  getReconciliationStatus(transactionId: string): Observable<{ status: string; reconciled_at: string | null }> {
    return this.http.get<{ status: string; reconciled_at: string | null }>(
      buildApiUrl(`/api/v1/payments/transactions/${encodeURIComponent(transactionId)}/reconciliation-status`)
    );
  }

  getReceiptDownloadUrl(documentNumber: string): Observable<{ download_url: string }> {
    return this.http.get<{ download_url: string }>(
      buildApiUrl(`/api/v1/payments/receipts/${encodeURIComponent(documentNumber)}/download`)
    );
  }
}
