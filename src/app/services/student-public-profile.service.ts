import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface StudentPublicCompetenceDto {
  competence_code: string;
  mastery_level_code: string;
  mastery_level_rank: number;
}

export interface StudentPublicProfileDto {
  profile_identifier: string;
  visibility_level: string;
  display_name: string;
  city_code: string;
  education_level_code: string;
  profile_status: string;
  study_level_code: string | null;
  filiere_code: string | null;
  competences: StudentPublicCompetenceDto[];
  tags: string[];
  completion_percentage: number | null;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentPublicProfileService {
  private readonly http = inject(HttpClient);

  getPublicProfile(profileIdentifier: string): Observable<StudentPublicProfileDto> {
    return this.http.get<StudentPublicProfileDto>(
      buildApiUrl(`/api/v1/students/public-profiles/${encodeURIComponent(profileIdentifier)}`)
    );
  }
}
