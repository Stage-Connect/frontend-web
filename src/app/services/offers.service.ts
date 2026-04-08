import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface OfferPayload {
  title: string;
  description: string;
  sector_code: string;
  location_code: string;
  internship_type_code: string;
}

export interface OfferResponse extends OfferPayload {
  offer_identifier: string;
  company_identifier: string;
  status_code: string;
  is_public: boolean;
  created_by_account_identifier: string;
  updated_by_account_identifier: string;
  created_at: string;
  updated_at: string;
}

export interface OfferDetailResponse {
  offer: OfferResponse;
  company_name: string | null;
  requirements: OfferRequirement[];
}

export interface OfferRequirement {
  offer_identifier: string;
  competence_code: string;
  expected_level_code: string;
  expected_level_rank: number;
  matching_level_score: number;
  matching_criteria_weight_snapshot: number;
}

export interface OfferUpdateResponse {
  offer: OfferResponse;
  changed_fields: string[];
  reindexed_search: boolean;
}

export interface CompanyOffersResponse {
  company_identifier: string;
  offers: OfferResponse[];
  total: number;
}

export interface OfferListItem {
  offer_identifier: string;
  title: string;
  sector_code: string;
  location_code: string;
  internship_type_code: string;
  status_code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveStageOfferDraftRequest {
  title: string;
  description: string;
  sector_code: string;
  location_code: string;
  internship_type_code: string;
}

export interface StageOfferDraftSaveResponse {
  offer: OfferResponse;
  draft_version_identifier: string;
  saved_at: string;
  is_idempotent_replay: boolean;
}

export interface StageOfferPublishResponse {
  offer: OfferResponse;
  published_at: string;
}

export interface CloseStageOfferResponse {
  offer: OfferResponse;
  closed_at: string;
}

export interface SuspendStageOfferRequest {
  suspension_reason_code: string;
  suspension_reason_details: string;
}

export interface SuspendStageOfferResponse {
  offer: OfferResponse;
  suspended_at: string;
}

export interface OfferCompetenceRequirementRequest {
  competence_code: string;
  expected_level_code: string;
}

export interface OfferCompetenceRequirementResponse {
  offer_identifier: string;
  competence_code: string;
  expected_level_code: string;
  expected_level_rank: number;
  matching_level_score: number;
  matching_criteria_weight_snapshot: number;
}

export interface OfferRequirementsListResponse {
  total: number;
  items: OfferCompetenceRequirementResponse[];
}

export interface OfferPerformanceStatsResponse {
  offer_identifier: string;
  view_count: number;
  click_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  constructor(private readonly http: HttpClient) {}

  createOffer(payload: OfferPayload): Observable<OfferResponse> {
    return this.http.post<OfferResponse>(buildApiUrl('/api/v1/offers'), payload);
  }

  getOfferDetail(offerIdentifier: string): Observable<OfferDetailResponse> {
    return this.http.get<OfferDetailResponse>(buildApiUrl(`/api/v1/offers/${offerIdentifier}`));
  }

  updateOffer(offerIdentifier: string, payload: Partial<OfferPayload>): Observable<OfferUpdateResponse> {
    return this.http.patch<OfferUpdateResponse>(buildApiUrl(`/api/v1/offers/${offerIdentifier}`), payload);
  }

  listMyOffers(): Observable<CompanyOffersResponse> {
    return this.http.get<CompanyOffersResponse>(buildApiUrl('/api/v1/offers'));
  }

  // --- Cycle de vie des offres ---

  saveDraft(offerIdentifier: string, payload: SaveStageOfferDraftRequest): Observable<StageOfferDraftSaveResponse> {
    return this.http.put<StageOfferDraftSaveResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/draft`),
      payload
    );
  }

  getDraft(offerIdentifier: string): Observable<OfferResponse> {
    return this.http.get<OfferResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/draft`)
    );
  }

  publishOffer(offerIdentifier: string): Observable<StageOfferPublishResponse> {
    return this.http.post<StageOfferPublishResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/publish`),
      {}
    );
  }

  closeOffer(offerIdentifier: string): Observable<CloseStageOfferResponse> {
    return this.http.post<CloseStageOfferResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/close`),
      {}
    );
  }

  suspendOffer(offerIdentifier: string, payload: SuspendStageOfferRequest): Observable<SuspendStageOfferResponse> {
    return this.http.post<SuspendStageOfferResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/suspend`),
      payload
    );
  }

  getOfferRequirements(offerIdentifier: string): Observable<OfferRequirementsListResponse> {
    return this.http.get<OfferRequirementsListResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/required-competencies`)
    );
  }

  replaceOfferRequirements(
    offerIdentifier: string,
    requirements: OfferCompetenceRequirementRequest[]
  ): Observable<OfferRequirementsListResponse> {
    return this.http.put<OfferRequirementsListResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/required-competencies`),
      requirements
    );
  }

  addOfferRequirement(
    offerIdentifier: string,
    payload: OfferCompetenceRequirementRequest
  ): Observable<OfferCompetenceRequirementResponse> {
    return this.http.post<OfferCompetenceRequirementResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/required-competencies`),
      payload
    );
  }

  updateOfferRequirement(
    offerIdentifier: string,
    competenceCode: string,
    payload: OfferCompetenceRequirementRequest
  ): Observable<OfferCompetenceRequirementResponse> {
    return this.http.patch<OfferCompetenceRequirementResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/required-competencies/${encodeURIComponent(competenceCode)}`),
      payload
    );
  }

  deleteOfferRequirement(offerIdentifier: string, competenceCode: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/required-competencies/${encodeURIComponent(competenceCode)}`)
    );
  }

  trackOfferInteraction(offerIdentifier: string, eventType: string, sessionKey?: string): Observable<void> {
    return this.http.post<void>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/interactions`),
      { event_type: eventType, session_key: sessionKey }
    );
  }

  getOfferStats(offerIdentifier: string): Observable<OfferPerformanceStatsResponse> {
    return this.http.get<OfferPerformanceStatsResponse>(
      buildApiUrl(`/api/v1/offers/${encodeURIComponent(offerIdentifier)}/stats`)
    );
  }
}
