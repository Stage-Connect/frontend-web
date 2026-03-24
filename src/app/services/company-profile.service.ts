import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface CompanyProfile {
  company_identifier: string;
  account_identifier: string;
  owner_account_identifier: string;
  company_name: string;
  registration_number: string;
  tax_identifier: string;
  verification_status: string;
  public_visibility_level: string;
  has_rccm_document: boolean;
  rccm_document_status: string;
  rccm_last_uploaded_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyProfilePayload {
  company_name: string;
  registration_number: string;
  tax_identifier: string;
}

export interface CompanyRccmDocument {
  document_identifier: string;
  company_identifier: string;
  version_number: number;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  checksum_sha256: string;
  storage_provider: string;
  secure_storage_path: string;
  is_active: boolean;
  uploaded_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {
  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<CompanyProfile> {
    return this.http.get<CompanyProfile>(buildApiUrl('/api/v1/companies/profile'));
  }

  createMyProfile(payload: CreateCompanyProfilePayload): Observable<CompanyProfile> {
    return this.http.post<CompanyProfile>(buildApiUrl('/api/v1/companies/profile'), payload);
  }

  uploadRccmDocument(file: File): Observable<CompanyRccmDocument> {
    const formData = new FormData();
    formData.append('rccm_file', file, file.name);

    return this.http.post<CompanyRccmDocument>(
      buildApiUrl('/api/v1/companies/profile/rccm'),
      formData
    );
  }
}
