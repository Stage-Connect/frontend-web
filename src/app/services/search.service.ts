import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface SearchOfferItemDto {
  offer_identifier: string;
  title: string;
  status_code: string;
  published_at: string;
  relevance_score?: number;
  sector_code?: string;
  location_code?: string;
  internship_type_code?: string;
  company_name?: string;
}

export interface SearchOffersResultDto {
  total: number;
  page: number;
  page_size: number;
  query: string;
  sort_by: string;
  sort_order: string;
  items: SearchOfferItemDto[];
}

export interface SearchOffersParams {
  q?: string;
  sector_code?: string;
  location_code?: string;
  internship_type_code?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface RecommendedOffersResultDto {
  total: number;
  items: SearchOfferItemDto[];
}

export interface MapLocationDto {
  location_code: string;
  location_label: string;
  latitude: number;
  longitude: number;
  offer_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly http = inject(HttpClient);

  getLandingOffers(): Observable<SearchOffersResultDto> {
    return this.http.get<SearchOffersResultDto>(buildApiUrl('/api/v1/search/landing-offers'));
  }

  searchOffers(params: SearchOffersParams = {}): Observable<SearchOffersResultDto> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.sector_code) httpParams = httpParams.set('sector_code', params.sector_code);
    if (params.location_code) httpParams = httpParams.set('location_code', params.location_code);
    if (params.internship_type_code) httpParams = httpParams.set('internship_type_code', params.internship_type_code);
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size !== undefined) httpParams = httpParams.set('page_size', params.page_size.toString());
    return this.http.get<SearchOffersResultDto>(buildApiUrl('/api/v1/search/offers'), { params: httpParams });
  }

  getRecommendedOffers(): Observable<RecommendedOffersResultDto> {
    return this.http.get<RecommendedOffersResultDto>(buildApiUrl('/api/v1/search/recommended-offers'));
  }

  autocompleteOfferTitles(q: string): Observable<{ suggestions: string[] }> {
    return this.http.get<{ suggestions: string[] }>(
      buildApiUrl('/api/v1/search/offers/autocomplete'),
      { params: new HttpParams().set('q', q) }
    );
  }

  getMapLocations(params?: { sector_code?: string; internship_type_code?: string }): Observable<MapLocationDto[]> {
    let httpParams = new HttpParams();
    if (params?.sector_code) httpParams = httpParams.set('sector_code', params.sector_code);
    if (params?.internship_type_code) httpParams = httpParams.set('internship_type_code', params.internship_type_code);
    return this.http.get<MapLocationDto[]>(buildApiUrl('/api/v1/search/map-locations'), { params: httpParams });
  }
}
