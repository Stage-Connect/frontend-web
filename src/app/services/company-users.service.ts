import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface CompanyUser {
  user_identifier: string;
  company_identifier: string;
  account_identifier: string | null;
  email: string;
  internal_role: string;
  membership_status: string;
  is_active: boolean;
  invited_by_account_identifier: string;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
}

export interface CompanyUsersListResponse {
  company_identifier: string;
  users_count: number;
  users: CompanyUser[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyUsersService {
  constructor(private readonly http: HttpClient) {}

  listCompanyUsers(): Observable<CompanyUsersListResponse> {
    return this.http.get<CompanyUsersListResponse>(buildApiUrl('/api/v1/companies/profile/users'));
  }
}
