import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/api.config';

export interface UserAccount {
  account_identifier: string;
  email: string;
  role_code: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  items: UserAccount[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserFilters {
  page?: number;
  page_size?: number;
  role_code?: string;
  is_active?: boolean;
  is_suspended?: boolean;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersListService {
  private readonly http = inject(HttpClient);

  /**
   * Get paginated list of all users
   */
  getAllUsers(filters?: UserFilters): Observable<UsersListResponse> {
    let params = new HttpParams();

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.page_size) {
      params = params.set('page_size', filters.page_size.toString());
    }
    if (filters?.role_code) {
      params = params.set('role_code', filters.role_code);
    }
    if (filters?.is_active !== undefined) {
      params = params.set('is_active', filters.is_active.toString());
    }
    if (filters?.is_suspended !== undefined) {
      params = params.set('is_suspended', filters.is_suspended.toString());
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<UsersListResponse>(
      buildApiUrl('/api/v1/administration/accounts'),
      { params }
    );
  }

  /**
   * Get a specific user detail
   */
  getUser(accountIdentifier: string): Observable<UserAccount> {
    return this.http.get<UserAccount>(
      buildApiUrl(`/api/v1/administration/accounts/${encodeURIComponent(accountIdentifier)}`)
    );
  }

  /**
   * Suspend a user account
   */
  suspendUser(accountIdentifier: string, reason: string): Observable<UserAccount> {
    return this.http.post<UserAccount>(
      buildApiUrl(`/api/v1/administration/accounts/${encodeURIComponent(accountIdentifier)}/suspend`),
      { reason_code: 'ADMIN_ACTION', reason_details: reason }
    );
  }

}
