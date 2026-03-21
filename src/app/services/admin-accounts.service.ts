import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface AccountSuspension {
  reason_code: string;
  reason_details: string;
  suspended_by_account_identifier: string;
  suspended_at: string;
  invalidated_sessions_count: number;
}

export interface AdminAccountState {
  account_identifier: string;
  email: string;
  role_code: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  is_suspended: boolean;
  suspension: AccountSuspension | null;
}

export interface SuspendAccountPayload {
  reason_code: string;
  reason_details: string;
}

export interface ListAccountsResponse {
  items: AdminAccountState[];
  total: number;
  page: number;
  page_size: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAccountsService {
  constructor(private readonly http: HttpClient) {}

  listAccounts(params: {
    page?: number,
    page_size?: number,
    search?: string,
    role_code?: string,
    is_active?: boolean,
    is_suspended?: boolean
  } = {}): Observable<ListAccountsResponse> {
    const queryParams: Record<string, string> = {};
    if (params.page) queryParams['page'] = params.page.toString();
    if (params.page_size) queryParams['page_size'] = params.page_size.toString();
    if (params.search) queryParams['search'] = params.search;
    if (params.role_code) queryParams['role_code'] = params.role_code;
    if (params.is_active !== undefined) queryParams['is_active'] = params.is_active.toString();
    if (params.is_suspended !== undefined) queryParams['is_suspended'] = params.is_suspended.toString();

    return this.http.get<ListAccountsResponse>(
      buildApiUrl('/api/v1/administration/accounts'),
      { params: queryParams }
    );
  }

  getAccountState(accountIdentifier: string): Observable<AdminAccountState> {
    return this.http.get<AdminAccountState>(
      buildApiUrl(`/api/v1/administration/accounts/${encodeURIComponent(accountIdentifier)}`)
    );
  }

  suspendAccount(accountIdentifier: string, payload: SuspendAccountPayload): Observable<AdminAccountState> {
    return this.http.post<AdminAccountState>(
      buildApiUrl(`/api/v1/administration/accounts/${encodeURIComponent(accountIdentifier)}/suspend`),
      payload
    );
  }
}
