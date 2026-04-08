import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface ExternalOffer {
  identifier: string;
  title: string;
  source_url: string;
  source_platform: string;
  company_name: string | null;
  city_code: string | null;
  raw_location: string | null;
  sector_code: string | null;
  internship_type: string | null;
  confidence_score: number;
  scraped_at: string;
}

export interface ExternalOffersResponse {
  items: ExternalOffer[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExternalOffersParams {
  page?: number;
  page_size?: number;
  source_platform?: string;
  sector_code?: string;
  city_code?: string;
  internship_type?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ExternalOffersService {
  constructor(private readonly http: HttpClient) {}

  listExternalOffers(params: ExternalOffersParams = {}): Observable<ExternalOffersResponse> {
    const qp: Record<string, string> = {};
    if (params.page) qp['page'] = String(params.page);
    if (params.page_size) qp['page_size'] = String(params.page_size);
    if (params.source_platform) qp['source_platform'] = params.source_platform;
    if (params.sector_code) qp['sector_code'] = params.sector_code;
    if (params.city_code) qp['city_code'] = params.city_code;
    if (params.internship_type) qp['internship_type'] = params.internship_type;
    if (params.search) qp['search'] = params.search;
    return this.http.get<ExternalOffersResponse>(
      buildApiUrl('/api/v1/search/external-offers'),
      { params: qp }
    );
  }
}
