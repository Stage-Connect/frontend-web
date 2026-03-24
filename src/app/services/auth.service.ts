import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';

import { buildApiUrl } from '../core/api.config';
import { CompanyProfile } from './company-profile.service';

export type FrontendRole = 'entreprise' | 'admin';

const FRONTEND_ROLE_BLOCKED_MESSAGE =
  'Cet espace est reserve aux administrateurs et aux entreprises. Les comptes etudiants ne peuvent pas se connecter sur ce frontend.';

export interface User {
  id: string;
  email: string;
  role: FrontendRole;
  roleCode: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

interface LoginApiResponse {
  session: {
    session_id: string;
    account_id: string;
    access_expires_at: string;
    refresh_expires_at: string;
  };
  tokens: {
    access_token: string;
  };
}

interface RbacContextResponse {
  account_id: string;
  name?: string | null;
  role_code: string;
  avatar_url?: string | null;
  permissions: string[];
}

interface RegisterCompanyRequest {
  email: string;
  password: string;
  company_name: string;
}

interface RegisterCompanyResponse {
  account: {
    account_id: string;
    email: string;
    role_code: string;
    is_email_verified: boolean;
  };
  profile: {
    profile_id: string;
    company_name: string;
    onboarding_status: string;
  };
  email_verification: {
    token: string;
    expires_at: string;
  };
}

interface RequestPasswordResetResponse {
  account_id: string;
  email: string;
  token: string;
  expires_at: string;
}

interface OnboardingStep {
  code: string;
  label: string;
  description: string;
  required_fields: string[];
  minimum_required: boolean;
  system_managed: boolean;
  completed: boolean;
  field_values: Record<string, unknown>;
}

export interface OnboardingProfile {
  account_id: string;
  role_code: string;
  onboarding_status: string;
  current_step_code: string | null;
  completion_rate: number;
  is_complete: boolean;
  is_minimum_ready: boolean;
  steps: OnboardingStep[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<LoginApiResponse>(buildApiUrl('/api/v1/identity/login'), {
      email,
      password
    }).pipe(
      switchMap((loginResponse) =>
        this.http.get<RbacContextResponse>(buildApiUrl('/api/v1/identity/me/rbac'), {
          headers: new HttpHeaders({
            Authorization: `Bearer ${loginResponse.tokens.access_token}`
          })
        }).pipe(
          switchMap((rbacContext) => {
            if (rbacContext.role_code === 'COMPANY_RECRUITER') {
              return this.http.get<CompanyProfile>(buildApiUrl('/api/v1/companies/profile'), {
                headers: new HttpHeaders({
                  Authorization: `Bearer ${loginResponse.tokens.access_token}`
                })
              }).pipe(
                map((profile) => this.toAuthResponse(email, loginResponse, rbacContext, profile.company_name)),
                catchError(() => of(this.toAuthResponse(email, loginResponse, rbacContext)))
              );
            }

            return of(this.toAuthResponse(email, loginResponse, rbacContext));
          })
        )
      ),
      tap((response) => this.persistSession(response))
    );
  }

  uploadMyAvatar(file: File): Observable<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar_file', file, file.name);
    return this.http.post<{ avatar_url: string }>(buildApiUrl('/api/v1/identity/me/avatar'), formData);
  }

  registerCompany(payload: RegisterCompanyRequest): Observable<RegisterCompanyResponse> {
    return this.http.post<RegisterCompanyResponse>(buildApiUrl('/api/v1/identity/register-company'), payload);
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post(buildApiUrl('/api/v1/identity/verify-email'), { token }).pipe(map(() => void 0));
  }

  requestPasswordReset(email: string): Observable<RequestPasswordResetResponse> {
    return this.http.post<RequestPasswordResetResponse>(buildApiUrl('/api/v1/identity/reset-password/request'), {
      email
    });
  }

  confirmPasswordReset(token: string, newPassword: string): Observable<void> {
    return this.http.post(buildApiUrl('/api/v1/identity/reset-password/confirm'), {
      token,
      new_password: newPassword
    }).pipe(map(() => void 0));
  }

  getMyOnboarding(): Observable<OnboardingProfile> {
    return this.http.get<OnboardingProfile>(buildApiUrl('/api/v1/identity/onboarding/me'));
  }

  updateMyOnboardingStep(
    stepCode: string,
    fieldValues: Record<string, unknown>,
    markCompleted = true
  ): Observable<OnboardingProfile> {
    return this.http.put<OnboardingProfile>(
      buildApiUrl(`/api/v1/identity/onboarding/me/steps/${stepCode}`),
      {
        field_values: fieldValues,
        mark_completed: markCompleted
      }
    );
  }

  logout(): Observable<boolean> {
    return this.http.post(buildApiUrl('/api/v1/identity/logout'), {}, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false)),
      tap(() => this.clearSession())
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): FrontendRole | null {
    return this.userSubject.value?.role ?? null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    if (userRole === 'admin') {
      return true;
    }
    return userRole === role;
  }

  getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;

      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }

      if (detail && typeof detail === 'object' && 'reason' in detail) {
        return `Accès refusé: ${String(detail.reason)}`;
      }

      if (error.status === 0) {
        return 'Connexion impossible au backend. Relance le frontend avec le proxy Angular et verifie que le backend tourne sur le port 8005.';
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return fallbackMessage;
  }

  private getStoredUser(): User | null {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  private toAuthResponse(
    email: string,
    loginResponse: LoginApiResponse,
    rbacContext: RbacContextResponse,
    companyName?: string
  ): AuthResponse {
    const role = this.mapRoleCode(rbacContext.role_code);

    if (!role) {
      throw new Error(`Rôle backend non pris en charge: ${rbacContext.role_code}`);
    }

    return {
      token: loginResponse.tokens.access_token,
      user: {
        id: loginResponse.session.account_id,
        email,
        role,
        roleCode: rbacContext.role_code,
        name: companyName?.trim() || rbacContext.name?.trim() || this.buildDisplayName(email, role),
        avatar: rbacContext.avatar_url || this.getAvatarUrl(loginResponse.session.account_id),
        avatarUrl: rbacContext.avatar_url || this.getAvatarUrl(loginResponse.session.account_id),
        permissions: rbacContext.permissions
      }
    };
  }

  getAvatarUrl(seed: string): string {
    if (this.isImageUrl(seed)) {
      return seed;
    }

    const stored = this.getStoredAvatarUrl(seed);
    if (stored) {
      return stored;
    }

    return 'assets/default.jpeg';
  }

  setAvatarUrl(key: string, avatarUrl: string): void {
    const normalizedKey = this.normalizeAvatarKey(key);
    localStorage.setItem(this.getAvatarStorageKey(normalizedKey), avatarUrl);

    const currentUser = this.userSubject.value;
    if (currentUser && this.matchesAvatarKey(currentUser, normalizedKey)) {
      const updatedUser = { ...currentUser, avatar: avatarUrl, avatarUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.userSubject.next(updatedUser);
    }
  }

  getStoredAvatarUrl(key: string): string | null {
    const normalizedKey = this.normalizeAvatarKey(key);
    return localStorage.getItem(this.getAvatarStorageKey(normalizedKey));
  }

  private persistSession(response: AuthResponse): void {
    const avatarUrl =
      this.getStoredAvatarUrl(response.user.id) ??
      this.getStoredAvatarUrl(response.user.email) ??
      response.user.avatarUrl ??
      response.user.avatar;

    const user = {
      ...response.user,
      avatar: avatarUrl || 'assets/default.jpeg',
      avatarUrl: avatarUrl || 'assets/default.jpeg'
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  private mapRoleCode(roleCode: string): FrontendRole | null {
    if (roleCode === 'COMPANY_RECRUITER') {
      return 'entreprise';
    }

    if (roleCode === 'ADMIN_PLATFORM' || roleCode === 'OPS_ADMIN' || roleCode === 'ADMIN') {
      return 'admin';
    }

    if (roleCode === 'STUDENT') {
      throw new Error(FRONTEND_ROLE_BLOCKED_MESSAGE);
    }

    return null;
  }

  private buildDisplayName(email: string, role: FrontendRole): string {
    if (role === 'admin') {
      return 'Administrateur StageConnect';
    }

    const localPart = email.split('@')[0] ?? 'entreprise';
    return localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private isImageUrl(value: string): boolean {
    return /^(https?:\/\/|data:|blob:|assets\/)/i.test(value.trim());
  }

  private normalizeAvatarKey(value: string): string {
    return value.trim().toLowerCase();
  }

  private getAvatarStorageKey(key: string): string {
    return `stageconnect.avatar.${key}`;
  }

  private matchesAvatarKey(user: User, key: string): boolean {
    return this.normalizeAvatarKey(user.id) === key || this.normalizeAvatarKey(user.email) === key;
  }
}
