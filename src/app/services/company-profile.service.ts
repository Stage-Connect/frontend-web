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

@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {
  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<CompanyProfile> {
    return this.http.get<CompanyProfile>(buildApiUrl('/api/v1/companies/profile'));
  }
}
