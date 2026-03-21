import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

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
  rccm_document?: {
    document_identifier: string;
    version_number: number;
    original_filename: string;
    mime_type: string;
    file_size_bytes: number;
    checksum_sha256: string;
    secure_storage_path: string;
    uploaded_at: string;
    updated_at: string;
  } | null;
}

export interface CompanyVerificationQueueResponse {
  total: number;
  sort_code: string;
  status_filters: string[];
  items: CompanyVerificationQueueItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminCompanyVerificationService {
  constructor(private readonly http: HttpClient) {}

  listQueue(limit = 20): Observable<CompanyVerificationQueueResponse> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<CompanyVerificationQueueResponse>(
      buildApiUrl('/api/v1/administration/company-verification'),
      { params }
    );
  }

  getCompany(companyIdentifier: string): Observable<CompanyVerificationQueueItem> {
    return this.http.get<CompanyVerificationQueueItem>(
      buildApiUrl(`/api/v1/administration/company-verification/${companyIdentifier}`)
    );
  }
}
