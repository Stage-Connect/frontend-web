import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';

import { buildApiUrl } from '../core/api.config';
import { CompanyProfile } from './company-profile.service';

export type FrontendRole = 'entreprise' | 'admin' | 'student' | 'institution';


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

interface RegisterStudentRequest {
  email: string;
  password: string;
}

export interface RegisterStudentResponse {
  account: {
    account_id: string;
    email: string;
    role_code: string;
    is_email_verified: boolean;
  };
  email_verification: {
    token: string;
    expires_at: string;
  };
}

export interface RegisterInstitutionRequest {
  email: string;
  password: string;
  institution_name: string;
  institution_type: string;
  region_code: string;
}

export interface RegisterInstitutionResponse {
  account: {
    account_id: string;
    email: string;
    role_code: string;
    is_email_verified: boolean;
  };
  profile: {
    institution_id: string;
    institution_name: string;
    institution_type: string;
    region_code: string;
    onboarding_status: string;
  };
  email_verification: {
    token: string | null;
    expires_at: string;
  };
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

export interface RequestPasswordResetResponse {
  account_id: string;
  email: string;
  token: string | null;
  expires_at: string;
}

export interface ConfirmPasswordResetResponse {
  account_id: string;
  email: string;
  sessions_invalidated: number;
  reset_at: string;
}

export interface ResetPasswordByEmailResponse {
  message: string;
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

  registerInstitution(payload: RegisterInstitutionRequest): Observable<RegisterInstitutionResponse> {
    return this.http.post<RegisterInstitutionResponse>(buildApiUrl('/api/v1/identity/register-institution'), payload);
  }

  registerStudent(email: string, password: string): Observable<RegisterStudentResponse> {
    return this.http.post<RegisterStudentResponse>(buildApiUrl('/api/v1/identity/register-student'), {
      email,
      password
    } satisfies RegisterStudentRequest);
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post(buildApiUrl('/api/v1/identity/verify-email'), { token }).pipe(map(() => void 0));
  }

  requestPasswordReset(email: string): Observable<RequestPasswordResetResponse> {
    return this.http.post<RequestPasswordResetResponse>(buildApiUrl('/api/v1/identity/reset-password/request'), {
      email
    });
  }

  confirmPasswordReset(token: string, newPassword: string): Observable<ConfirmPasswordResetResponse> {
    return this.http.post<ConfirmPasswordResetResponse>(buildApiUrl('/api/v1/identity/reset-password/confirm'), {
      token,
      new_password: newPassword
    });
  }

  resetPasswordByEmail(email: string): Observable<ResetPasswordByEmailResponse> {
    return this.http.post<ResetPasswordByEmailResponse>(buildApiUrl('/api/v1/identity/reset-password-by-email'), {
      email
    });
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

  revokeAllSessions(): Observable<void> {
    return this.http.delete<void>(buildApiUrl('/api/v1/identity/sessions'));
  }

  getLoginEvents(params?: { account_identifier?: string; email?: string; result?: string; limit?: number }): Observable<{ total: number; items: { event_id: string; account_id: string; email: string; result: string; ip_address: string; occurred_at: string }[] }> {
    let httpParams = new HttpParams();
    if (params?.account_identifier) httpParams = httpParams.set('account_identifier', params.account_identifier);
    if (params?.email) httpParams = httpParams.set('email', params.email);
    if (params?.result) httpParams = httpParams.set('result', params.result);
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<{ total: number; items: { event_id: string; account_id: string; email: string; result: string; ip_address: string; occurred_at: string }[] }>(
      buildApiUrl('/api/v1/identity/login-events'), { params: httpParams }
    );
  }

  getPrivacySummary(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(buildApiUrl('/api/v1/identity/me/privacy-summary'));
  }

  requestDataExport(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(buildApiUrl('/api/v1/identity/me/data-export'));
  }

  deleteMyAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(buildApiUrl('/api/v1/identity/me'));
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
      const backendMessageRaw = error.error?.message;
      const backendDetailRaw = error.error?.detail;
      const backendMessage = typeof backendMessageRaw === 'string' ? backendMessageRaw.trim() : '';
      const backendDetail = typeof backendDetailRaw === 'string' ? backendDetailRaw.trim() : '';
      const detail = backendDetailRaw;
      const detailText = typeof detail === 'string' ? detail.trim().toLowerCase() : '';
      const detailMessage = typeof detail === 'string' ? detail.trim() : '';

      if (error.status === 0) {
        return 'Le service est temporairement indisponible. Veuillez reessayer dans quelques instants.';
      }
      if (error.status === 401) {
        return 'Votre session a expire. Veuillez vous reconnecter.';
      }
      if (error.status === 403) {
        if (detailMessage) {
          return detailMessage;
        }
        return "Vous n'avez pas l'autorisation requise pour cette action.";
      }
      if (error.status === 404) {
<<<<<<< HEAD
        return backendMessage || backendDetail || "La ressource demandee est introuvable.";
=======
        if (detailMessage) {
          return detailMessage;
        }
        return "La ressource demandee est introuvable.";
>>>>>>> 968d797 (Integration complete avec le backend en prod)
      }
      if (error.status === 409) {
        return backendMessage || backendDetail || 'Cette operation est deja appliquee ou entre en conflit avec des donnees existantes.';
      }
      if (error.status === 422) {
        const normalizedBackendMessage = (backendMessage || backendDetail || detailText).toLowerCase();
        if (detailText.includes('password')) {
          return 'Le mot de passe doit contenir au moins 8 caracteres avec majuscule, minuscule, chiffre et caractere special.';
        }
        if (detailText.includes('token') || detailText.includes('invitation')) {
          return "Ce lien d'invitation n'est plus valide.";
        }
        if (normalizedBackendMessage.includes('password')) {
          return 'Le mot de passe doit contenir au moins 8 caracteres avec majuscule, minuscule, chiffre et caractere special.';
        }
        if (normalizedBackendMessage.includes('token')) {
          return "Le lien de reinitialisation est invalide, expire ou deja utilise.";
        }
        if (backendMessage || backendDetail) {
          return backendMessage || backendDetail;
        }
        return 'Certaines informations saisies sont invalides.';
      }

      if (backendMessage || backendDetail) {
        return backendMessage || backendDetail;
      }
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
      return 'student';
    }

    if (roleCode === 'INSTITUTION_RESPONSIBLE' || roleCode === 'INSTITUTION_SUPERVISOR') {
      return 'institution';
    }

    return null;
  }

  private buildDisplayName(email: string, role: FrontendRole): string {
    if (role === 'admin') {
      return 'Administrateur StageConnect';
    }

    const localPart = email.split('@')[0] ?? (role === 'student' ? 'etudiant' : 'entreprise');
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
