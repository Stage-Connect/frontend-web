import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface UserProfileCore {
  profile_id?: string;
  first_name: string;
  last_name: string;
  city: string;
  education_level?: string;
  visibility_level?: 'public' | 'private' | 'limited';
  /** Champ API, rempli au chargement (requis pour le PUT profil). */
  profile_status?: string;
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

export interface StudentCvDocumentResponse {
  document_identifier: string;
  profile_identifier: string;
  version_number: number;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  is_active: boolean;
  is_deleted: boolean;
  uploaded_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DeleteStudentCvDocumentResponse {
  deleted: boolean;
  document_identifier: string | null;
}

/** Profil public étudiant (API /api/v1/students/public-profiles/{id}). */
export interface StudentPublicProfileDto {
  profile_identifier: string;
  visibility_level: string;
  display_name: string;
  city_code: string;
  education_level_code: string;
  profile_status: string;
  study_level_code: string | null;
  filiere_code: string | null;
  competences: Array<{ competence_code: string; mastery_level_code: string; mastery_level_rank: number }>;
  tags: string[];
  completion_percentage: number | null;
  updated_at: string;
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

export interface StudentPortfolioProject {
  project_identifier?: string;
  title: string;
  description: string;
  project_url?: string;
  technologies?: string[];
  created_at?: string;
}

export interface StudentSupportingDocument {
  document_identifier: string;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
}

const MASTERY_FROM_API: Record<string, UserProfileCompetence['mastery_level']> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

function visibilityToForm(v: string): 'public' | 'private' | 'limited' {
  const u = v.toUpperCase();
  if (u === 'PUBLIC') {
    return 'public';
  }
  if (u === 'LIMITED') {
    return 'limited';
  }
  return 'private';
}

function visibilityToApi(v: string | undefined): string {
  const raw = (v || 'private').toLowerCase();
  if (raw === 'public') {
    return 'PUBLIC';
  }
  if (raw === 'limited') {
    return 'LIMITED';
  }
  return 'PRIVATE';
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getMyProfileCore(): Observable<UserProfileCore> {
    return this.http
      .get<{
        profile_identifier: string;
        first_name: string;
        last_name: string;
        city_code: string;
        education_level_code: string;
        profile_status: string;
        visibility_level: string;
      }>(buildApiUrl('/api/v1/students/profile/core'))
      .pipe(
        map((row) => ({
          profile_id: row.profile_identifier,
          first_name: row.first_name,
          last_name: row.last_name,
          city: row.city_code,
          education_level: row.education_level_code,
          visibility_level: visibilityToForm(row.visibility_level),
          profile_status: row.profile_status
        }))
      );
  }

  updateMyProfileCore(profile: UserProfileCore): Observable<UserProfileCore> {
    const status = profile.profile_status?.trim() || 'DRAFT';
    return this.http
      .put<{
        profile_identifier: string;
        first_name: string;
        last_name: string;
        city_code: string;
        education_level_code: string;
        profile_status: string;
        visibility_level: string;
      }>(buildApiUrl('/api/v1/students/profile/core'), {
        first_name: profile.first_name,
        last_name: profile.last_name,
        city_code: profile.city,
        education_level_code: profile.education_level || 'BAC',
        profile_status: status,
        visibility_level: visibilityToApi(profile.visibility_level)
      })
      .pipe(
        map((row) => ({
          profile_id: row.profile_identifier,
          first_name: row.first_name,
          last_name: row.last_name,
          city: row.city_code,
          education_level: row.education_level_code,
          visibility_level: visibilityToForm(row.visibility_level),
          profile_status: row.profile_status
        }))
      );
  }

  getMyProfileAcademic(): Observable<UserProfileAcademic> {
    return this.http
      .get<{
        current: {
          institution_identifier: string;
          filiere_code: string;
          study_level_code: string;
          academic_year_label: string;
        } | null;
      }>(buildApiUrl('/api/v1/students/profile/academic'))
      .pipe(
        map((body) => {
          const c = body.current;
          if (!c) {
            return {};
          }
          return {
            institution_name: c.institution_identifier,
            filiere: c.filiere_code,
            study_level: c.study_level_code,
            year_of_graduation: c.academic_year_label
          } satisfies UserProfileAcademic;
        })
      );
  }

  updateMyProfileAcademic(academic: UserProfileAcademic): Observable<UserProfileAcademic> {
    return this.http
      .put<{
        current: {
          institution_identifier: string;
          filiere_code: string;
          study_level_code: string;
          academic_year_label: string;
        } | null;
      }>(buildApiUrl('/api/v1/students/profile/academic'), {
        institution_identifier: (academic.institution_name || '').trim() || 'INST-UNKNOWN',
        filiere_code: (academic.filiere || '').trim() || 'FIL-UNKNOWN',
        study_level_code: (academic.study_level || '').trim() || 'LVL-UNKNOWN',
        academic_year_label: (academic.year_of_graduation || '').trim() || ''
      })
      .pipe(
        map((body) => {
          const c = body.current;
          if (!c) {
            return {};
          }
          return {
            institution_name: c.institution_identifier,
            filiere: c.filiere_code,
            study_level: c.study_level_code,
            year_of_graduation: c.academic_year_label
          };
        })
      );
  }

  getMyProfileCompetences(): Observable<UserProfileCompetence[]> {
    return this.http
      .get<{
        competences: Array<{
          competence_code: string;
          mastery_level_code: string;
        }>;
      }>(buildApiUrl('/api/v1/students/profile/skills-tags'))
      .pipe(
        map((body) =>
          body.competences.map((c) => ({
            competence_id: c.competence_code,
            name: c.competence_code,
            mastery_level: MASTERY_FROM_API[c.mastery_level_code.toUpperCase()] ?? 'intermediate'
          }))
        )
      );
  }

  /** La gestion fine des compétences se fait via POST/DELETE /competencies et /tags. */
  updateMyProfileCompetences(_competences: UserProfileCompetence[]): Observable<UserProfileCompetence[]> {
    return this.getMyProfileCompetences();
  }

  getMyProfileCompletionScore(): Observable<{ score: number; total: number; percentage: number }> {
    return this.http
      .get<{
        completion_percentage: number;
        achieved_weight: number;
        total_weight: number;
      }>(buildApiUrl('/api/v1/students/profile/completion-score'))
      .pipe(
        map((row) => ({
          score: row.achieved_weight,
          total: row.total_weight,
          percentage: row.completion_percentage
        }))
      );
  }

  /**
   * @deprecated Préférer `CompanyProfileService` pour la fiche entreprise réelle.
   */
  getCompanyProfile(): Observable<CompanyProfileResponse> {
    return this.http
      .get<{
        company_identifier: string;
        account_identifier: string;
        company_name: string;
      }>(buildApiUrl('/api/v1/companies/profile'))
      .pipe(
        map((row) => ({
          profile_id: row.company_identifier,
          account_id: row.account_identifier,
          company_name: row.company_name
        }))
      );
  }

  /**
   * Non supporté par l’API actuelle (pas de PUT sur `/api/v1/companies/profile`).
   */
  updateCompanyProfile(_profile: Partial<CompanyProfileResponse>): Observable<CompanyProfileResponse> {
    return throwError(
      () =>
        new Error(
          'Mise à jour profil entreprise non exposée sur cette API; utiliser CompanyProfileService et les écrans entreprise.'
        )
    );
  }

  getPublicProfile(profileId: string): Observable<StudentPublicProfileDto> {
    return this.http.get<StudentPublicProfileDto>(
      buildApiUrl(`/api/v1/students/public-profiles/${encodeURIComponent(profileId)}`)
    );
  }

  // --- CV ---

  uploadMyCv(file: File): Observable<StudentCvDocumentResponse> {
    const formData = new FormData();
    formData.append('cv_file', file);
    return this.http.post<StudentCvDocumentResponse>(
      buildApiUrl('/api/v1/students/profile/cv'),
      formData
    );
  }

  getMyCv(): Observable<StudentCvDocumentResponse | null> {
    return this.http.get<StudentCvDocumentResponse | null>(
      buildApiUrl('/api/v1/students/profile/cv')
    );
  }

  deleteMyCv(): Observable<DeleteStudentCvDocumentResponse> {
    return this.http.delete<DeleteStudentCvDocumentResponse>(
      buildApiUrl('/api/v1/students/profile/cv')
    );
  }

  // --- Portfolio projects ---

  getMyPortfolioProjects(): Observable<StudentPortfolioProject[]> {
    return this.http.get<StudentPortfolioProject[]>(
      buildApiUrl('/api/v1/students/profile/portfolio/projects')
    );
  }

  createPortfolioProject(
    project: Omit<StudentPortfolioProject, 'project_identifier' | 'created_at'>
  ): Observable<StudentPortfolioProject> {
    return this.http.post<StudentPortfolioProject>(
      buildApiUrl('/api/v1/students/profile/portfolio/projects'),
      project
    );
  }

  updatePortfolioProject(
    id: string,
    project: Omit<StudentPortfolioProject, 'project_identifier' | 'created_at'>
  ): Observable<StudentPortfolioProject> {
    return this.http.put<StudentPortfolioProject>(
      buildApiUrl(`/api/v1/students/profile/portfolio/projects/${encodeURIComponent(id)}`),
      project
    );
  }

  deletePortfolioProject(id: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(`/api/v1/students/profile/portfolio/projects/${encodeURIComponent(id)}`)
    );
  }

  // --- Supporting documents ---

  getMySupportingDocuments(): Observable<StudentSupportingDocument[]> {
    return this.http.get<StudentSupportingDocument[]>(
      buildApiUrl('/api/v1/students/profile/pieces')
    );
  }

  uploadSupportingDocument(file: File, documentType: string): Observable<StudentSupportingDocument> {
    const formData = new FormData();
    formData.append('document_file', file);
    formData.append('document_type', documentType);
    return this.http.post<StudentSupportingDocument>(
      buildApiUrl('/api/v1/students/profile/pieces'),
      formData
    );
  }

  deleteSupportingDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(`/api/v1/students/profile/pieces/${encodeURIComponent(documentId)}`)
    );
  }

  // --- Competencies ---

  addCompetence(
    competenceCode: string,
    masteryLevelCode: string
  ): Observable<{ competence_code: string; mastery_level_code: string }> {
    return this.http.post<{ competence_code: string; mastery_level_code: string }>(
      buildApiUrl('/api/v1/students/profile/competencies'),
      { competence_code: competenceCode, mastery_level_code: masteryLevelCode }
    );
  }

  removeCompetence(competenceCode: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(`/api/v1/students/profile/competencies/${encodeURIComponent(competenceCode)}`)
    );
  }

  // --- Tags ---

  addTag(tagValue: string): Observable<{ tag_value: string }> {
    return this.http.post<{ tag_value: string }>(
      buildApiUrl('/api/v1/students/profile/tags'),
      { tag_value: tagValue }
    );
  }

  removeTag(tagValue: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(`/api/v1/students/profile/tags/${encodeURIComponent(tagValue)}`)
    );
  }
}
