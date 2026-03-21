import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/api.config';

export interface UserProfileCore {
  profile_id?: string;
  first_name: string;
  last_name: string;
  city: string;
  education_level?: string;
  visibility_level?: 'public' | 'private' | 'limited';
}

export interface UserProfileAcademic {
  institution_name?: string;
  filiere?: string;
  study_level?: string;
  year_of_graduation?: string;
}

export interface UserProfileCompetence {
  competence_id?: string;
  name: string;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserProfileTag {
  tag_id?: string;
  name: string;
}

export interface UserProfileResponse {
  profile_id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  city: string;
  education_level: string;
  visibility_level: string;
  institution_name?: string;
  filiere?: string;
  study_level?: string;
  year_of_graduation?: string;
  competences?: UserProfileCompetence[];
  tags?: UserProfileTag[];
}

export interface CompanyProfileResponse {
  profile_id: string;
  account_id: string;
  company_name: string;
  sector?: string;
  contact_phone?: string;
  public_description?: string;
  website?: string;
  address?: string;
  city?: string;
  region?: string;
  logo_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly http = inject(HttpClient);

  /**
   * Get current user's core profile
   */
  getMyProfileCore(): Observable<UserProfileCore> {
    return this.http.get<UserProfileCore>(
      buildApiUrl('/api/v1/students/profile/core')
    );
  }

  /**
   * Update current user's core profile
   */
  updateMyProfileCore(profile: UserProfileCore): Observable<UserProfileCore> {
    return this.http.put<UserProfileCore>(
      buildApiUrl('/api/v1/students/profile/core'),
      profile
    );
  }

  /**
   * Get current user's academic information
   */
  getMyProfileAcademic(): Observable<UserProfileAcademic> {
    return this.http.get<UserProfileAcademic>(
      buildApiUrl('/api/v1/students/profile/academic')
    );
  }

  /**
   * Update current user's academic information
   */
  updateMyProfileAcademic(academic: UserProfileAcademic): Observable<UserProfileAcademic> {
    return this.http.put<UserProfileAcademic>(
      buildApiUrl('/api/v1/students/profile/academic'),
      academic
    );
  }

  /**
   * Get current user's competencies
   */
  getMyProfileCompetences(): Observable<UserProfileCompetence[]> {
    return this.http.get<UserProfileCompetence[]>(
      buildApiUrl('/api/v1/students/profile/skills-tags')
    );
  }

  /**
   * Update current user's competencies
   */
  updateMyProfileCompetences(competences: UserProfileCompetence[]): Observable<UserProfileCompetence[]> {
    return this.http.put<UserProfileCompetence[]>(
      buildApiUrl('/api/v1/students/profile/skills-tags'),
      { competences }
    );
  }

  /**
   * Get user profile completion score
   */
  getMyProfileCompletionScore(): Observable<{ score: number; total: number; percentage: number }> {
    return this.http.get<{ score: number; total: number; percentage: number }>(
      buildApiUrl('/api/v1/students/profile/completion-score')
    );
  }

  /**
   * Get company profile
   */
  getCompanyProfile(): Observable<CompanyProfileResponse> {
    return this.http.get<CompanyProfileResponse>(
      buildApiUrl('/api/v1/companies/me/profile')
    );
  }

  /**
   * Update company profile
   */
  updateCompanyProfile(profile: Partial<CompanyProfileResponse>): Observable<CompanyProfileResponse> {
    return this.http.put<CompanyProfileResponse>(
      buildApiUrl('/api/v1/companies/me/profile'),
      profile
    );
  }

  /**
   * Get user's public profile
   */
  getPublicProfile(profileId: string): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(
      buildApiUrl(`/api/v1/students/profile/public/${profileId}`)
    );
  }
}
