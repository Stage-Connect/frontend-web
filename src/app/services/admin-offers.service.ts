import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface OfferSuspensionState {
  reason_code: string;
  reason_details: string;
  suspended_by_account_identifier: string;
  suspended_at: string;
}

export interface AdminOfferState {
  offer_identifier: string;
  company_identifier: string | null;
  company_name?: string | null;
  title: string;
  status_code: string;
  is_public: boolean;
  updated_by_account_identifier: string | null;
  updated_at: string;
  suspension: OfferSuspensionState | null;
}

export interface SuspendOfferPayload {
  reason_code: string;
  reason_details: string;
}

export interface ListOffersResponse {
  items: AdminOfferState[];
  total: number;
  page: number;
  page_size: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOffersService {
  constructor(private readonly http: HttpClient) {}

  listOffers(page = 1, pageSize = 20, search?: string): Observable<ListOffersResponse> {
    let url = buildApiUrl(`/api/v1/administration/offers?page=${page}&page_size=${pageSize}`);
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<ListOffersResponse>(url);
  }


  getOfferState(offerIdentifier: string): Observable<AdminOfferState> {
    return this.http.get<AdminOfferState>(
      buildApiUrl(`/api/v1/administration/offers/${offerIdentifier}`)
    );
  }

  suspendOffer(offerIdentifier: string, payload: SuspendOfferPayload): Observable<AdminOfferState> {
    return this.http.post<AdminOfferState>(
      buildApiUrl(`/api/v1/administration/offers/${offerIdentifier}/suspend`),
      payload
    );
  }
}
