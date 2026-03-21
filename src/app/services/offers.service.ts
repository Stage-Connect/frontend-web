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

interface OfferDetailResponse {
  offer: OfferResponse;
  company_name: string | null;
  requirements: unknown[];
}

interface OfferUpdateResponse {
  offer: OfferResponse;
  changed_fields: string[];
  reindexed_search: boolean;
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
}
