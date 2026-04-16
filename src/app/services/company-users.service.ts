import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';

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

export interface InviteUserRequest {
  email: string;
  internal_role: string;
}

export interface UpdateUserRequest {
  internal_role: string;
  membership_status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyUsersService {
  constructor(private readonly http: HttpClient) {}

  listCompanyUsers(): Observable<CompanyUsersListResponse> {
    return this.http.get<CompanyUsersListResponse>(buildApiUrl('/api/v1/companies/profile/users')).pipe(
      catchError((error) => {
        // A recruiter can exist before the company profile is created.
        if (error?.status === 404) {
          return of({ company_identifier: '', users_count: 0, users: [] });
        }
        return throwError(() => error);
      })
    );
  }

  inviteUser(payload: InviteUserRequest): Observable<CompanyUser> {
    return this.http.post<CompanyUser>(buildApiUrl('/api/v1/companies/profile/users'), payload);
  }

  updateUser(userId: string, payload: UpdateUserRequest): Observable<CompanyUser> {
    return this.http.patch<CompanyUser>(
      buildApiUrl(`/api/v1/companies/profile/users/${encodeURIComponent(userId)}`),
      payload
    );
  }

  deactivateUser(userId: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(`/api/v1/companies/profile/users/${encodeURIComponent(userId)}`)
    );
  }

  acceptInvitation(token: string): Observable<CompanyUser> {
    return this.http.post<CompanyUser>(
      buildApiUrl('/api/v1/companies/profile/users/invitations/accept'),
      { token }
    );
  }
}
