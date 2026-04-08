import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/api.config';

export interface ConsentDto {
  consent_code: string;
  is_granted: boolean;
  granted_at: string | null;
  withdrawn_at: string | null;
}

export interface ConsentCenterDto {
  consents: ConsentDto[];
}

export interface UpsertConsentRequest {
  is_granted: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConsentsService {
  private readonly http = inject(HttpClient);

  getMyConsents(): Observable<ConsentCenterDto> {
    return this.http.get<ConsentCenterDto>(buildApiUrl('/api/v1/consents/me'));
  }

  upsertConsent(consentCode: string, payload: UpsertConsentRequest): Observable<ConsentDto> {
    return this.http.put<ConsentDto>(buildApiUrl(`/api/v1/consents/me/${consentCode}`), payload);
  }

  withdrawConsent(consentCode: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/v1/consents/me/${consentCode}`));
  }
}
