import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface ConventionDto {
  convention_identifier: string;
  status: string;
  [key: string]: unknown;
}

export interface ConventionWorkflowRequest {
  action_code: string;
  notes?: string;
}

export interface ConventionHistoryItem {
  occurred_at: string;
  action_code: string;
  actor_account_identifier: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConventionsPortalService {
  private readonly http = inject(HttpClient);

  getConvention(conventionIdentifier: string): Observable<ConventionDto> {
    return this.http.get<ConventionDto>(
      buildApiUrl(`/api/v1/conventions/${encodeURIComponent(conventionIdentifier)}`)
    );
  }

  generateConvention(payload: {
    application_identifier: string;
    start_date: string;
    end_date: string;
    supervisor_name: string;
    tasks_description: string;
  }): Observable<ConventionDto> {
    return this.http.post<ConventionDto>(buildApiUrl('/api/v1/conventions/generate'), payload);
  }

  applyWorkflowAction(
    conventionIdentifier: string,
    payload: ConventionWorkflowRequest
  ): Observable<ConventionDto> {
    return this.http.post<ConventionDto>(
      buildApiUrl(`/api/v1/conventions/${encodeURIComponent(conventionIdentifier)}/workflow`),
      payload
    );
  }

  getConventionHistory(conventionIdentifier: string): Observable<ConventionHistoryItem[]> {
    return this.http.get<ConventionHistoryItem[]>(
      buildApiUrl(`/api/v1/conventions/${encodeURIComponent(conventionIdentifier)}/history`)
    );
  }
}
