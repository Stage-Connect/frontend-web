import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface CompanySuspensionStateResponse {
  company_identifier: string;
  is_suspended: boolean;
  suspension_reason_code: string | null;
  suspension_reason_details: string | null;
  suspended_at: string | null;
  suspended_by_account_identifier: string | null;
}

export interface SuspendCompanyRequest {
  reason_code: string;
  reason_details: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanySuspensionService {
  private readonly http = inject(HttpClient);

  getSuspensionState(companyIdentifier: string): Observable<CompanySuspensionStateResponse> {
    return this.http.get<CompanySuspensionStateResponse>(
      buildApiUrl(`/api/v1/companies/${encodeURIComponent(companyIdentifier)}/suspension-state`)
    );
  }

  suspendCompany(companyIdentifier: string, payload: SuspendCompanyRequest): Observable<CompanySuspensionStateResponse> {
    return this.http.post<CompanySuspensionStateResponse>(
      buildApiUrl(`/api/v1/companies/${encodeURIComponent(companyIdentifier)}/suspend`),
      payload
    );
  }

  reactivateCompany(companyIdentifier: string): Observable<CompanySuspensionStateResponse> {
    return this.http.post<CompanySuspensionStateResponse>(
      buildApiUrl(`/api/v1/companies/${encodeURIComponent(companyIdentifier)}/reactivate`),
      {}
    );
  }
}
