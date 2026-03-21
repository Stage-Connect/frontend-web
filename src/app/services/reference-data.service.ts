import { HttpClient } from '@angular/common/http';
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
}
