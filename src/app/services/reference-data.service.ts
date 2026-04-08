import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface SelectOption {
  code: string;
  label: string;
}

interface SkillTaxonomyResponse {
  sectors: Array<{
    code: string;
    label: string;
  }>;
}

interface LocationsResponse {
  locations: Array<{
    identifier: string;
    code: string;
    label: string;
    region_code: string;
    city_code: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  constructor(private readonly http: HttpClient) {}

  getSectorOptions(): Observable<SkillTaxonomyResponse> {
    return this.http.get<SkillTaxonomyResponse>(buildApiUrl('/api/v1/foundation/skill-taxonomy'));
  }

  getLocationOptions(): Observable<LocationsResponse> {
    return this.http.get<LocationsResponse>(buildApiUrl('/api/v1/foundation/geography/locations'));
  }

  getRegions(): Observable<{ regions: { code: string; label: string }[] }> {
    return this.http.get<{ regions: { code: string; label: string }[] }>(
      buildApiUrl('/api/v1/foundation/geography/regions')
    );
  }

  getCities(regionCode?: string): Observable<{ cities: { code: string; label: string; region_code: string }[] }> {
    let params = new HttpParams();
    if (regionCode) params = params.set('region_code', regionCode);
    return this.http.get<{ cities: { code: string; label: string; region_code: string }[] }>(
      buildApiUrl('/api/v1/foundation/geography/cities'), { params }
    );
  }
}
