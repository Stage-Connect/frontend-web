import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface CompanyVerificationRccmDocument {
  document_identifier: string;
  version_number: number;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  checksum_sha256: string;
  secure_storage_path: string;
  uploaded_at: string;
  updated_at: string;
}

export interface CompanyVerificationQueueItem {
  company_identifier: string;
  company_name: string;
  registration_number: string;
  tax_identifier: string;
  verification_status: string;
  rccm_document_status: string;
  has_rccm_document: boolean;
  rccm_last_uploaded_at: string | null;
  dossier_priority_score: number;
  created_at: string;
  updated_at: string;
  rccm_document: CompanyVerificationRccmDocument | null;
}

export interface CompanyVerificationQueueResponse {
  total: number;
  sort_code: string;
  status_filters: string[];
  items: CompanyVerificationQueueItem[];
}

export interface DecideCompanyVerificationRequest {
  action_code: string;
  reason_code: string;
  reason_details: string;
}

export interface CompanyVerificationDecision {
  decision_identifier: string;
  company_identifier: string;
  action_code: string;
  reason_code: string;
  reason_details: string;
  previous_status: string;
  next_status: string;
  decided_by_account_identifier: string;
  decided_at: string;
}

export interface CompanyVerificationDecisionResult {
  company: CompanyVerificationQueueItem;
  decision: CompanyVerificationDecision;
}

export interface CompanyVerificationQueueParams {
  statuses?: string[];
  sort_code?: string;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCompanyVerificationService {
  constructor(private readonly http: HttpClient) {}

  getVerificationQueue(params: CompanyVerificationQueueParams = {}): Observable<CompanyVerificationQueueResponse> {
    let httpParams = new HttpParams();
    if (params.statuses?.length) {
      params.statuses.forEach(s => { httpParams = httpParams.append('statuses', s); });
    }
    if (params.sort_code) {
      httpParams = httpParams.set('sort_code', params.sort_code);
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    return this.http.get<CompanyVerificationQueueResponse>(
      buildApiUrl('/api/v1/administration/company-verification'),
      { params: httpParams }
    );
  }

  getCompanyVerificationDetail(companyIdentifier: string): Observable<CompanyVerificationQueueItem> {
    return this.http.get<CompanyVerificationQueueItem>(
      buildApiUrl(`/api/v1/administration/company-verification/${encodeURIComponent(companyIdentifier)}`)
    );
  }

  getRccmViewUrl(companyIdentifier: string): string {
    return buildApiUrl(`/api/v1/administration/company-verification/${encodeURIComponent(companyIdentifier)}/rccm/view`);
  }

  makeVerificationDecision(
    companyIdentifier: string,
    payload: DecideCompanyVerificationRequest
  ): Observable<CompanyVerificationDecisionResult> {
    return this.http.post<CompanyVerificationDecisionResult>(
      buildApiUrl(`/api/v1/administration/company-verification/${encodeURIComponent(companyIdentifier)}/decision`),
      payload
    );
  }

  getDecisionHistory(companyIdentifier: string): Observable<{ items: CompanyVerificationDecision[] }> {
    return this.http.get<{ items: CompanyVerificationDecision[] }>(
      buildApiUrl(`/api/v1/administration/company-verification/${encodeURIComponent(companyIdentifier)}/decisions`)
    );
  }
}
