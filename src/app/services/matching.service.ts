import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/api.config';

export interface CriterionWeightDto {
  criterion_code: string;
  weight: number;
  description: string;
}

export interface ScoringModelDto {
  version_code: string;
  is_active: boolean;
  created_at: string;
  criteria_count: number;
}

export interface CreateScoringModelRequest {
  version_code: string;
  criteria: { criterion_code: string; weight: number }[];
}

@Injectable({ providedIn: 'root' })
export class MatchingService {
  private readonly http = inject(HttpClient);

  getActiveScoringModel(): Observable<ScoringModelDto> {
    return this.http.get<ScoringModelDto>(buildApiUrl('/api/v1/matching/scoring-model/active'));
  }

  listScoringModels(): Observable<ScoringModelDto[]> {
    return this.http.get<ScoringModelDto[]>(buildApiUrl('/api/v1/matching/scoring-models'));
  }

  createScoringModel(payload: CreateScoringModelRequest): Observable<ScoringModelDto> {
    return this.http.post<ScoringModelDto>(buildApiUrl('/api/v1/matching/scoring-models'), payload);
  }

  activateScoringModel(versionCode: string): Observable<ScoringModelDto> {
    return this.http.post<ScoringModelDto>(buildApiUrl(`/api/v1/matching/scoring-models/${versionCode}/activate`), {});
  }

  getScoringModelWeights(versionCode: string): Observable<CriterionWeightDto[]> {
    return this.http.get<CriterionWeightDto[]>(buildApiUrl(`/api/v1/matching/scoring-models/${versionCode}/weights`));
  }

  updateScoringModelWeights(
    versionCode: string,
    weights: { criterion_code: string; weight: number }[]
  ): Observable<CriterionWeightDto[]> {
    return this.http.put<CriterionWeightDto[]>(
      buildApiUrl(`/api/v1/matching/scoring-models/${versionCode}/weights`),
      { weights }
    );
  }
}
