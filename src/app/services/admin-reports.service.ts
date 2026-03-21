import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface ModerationReportListItem {
  report_identifier: string;
  target_kind: string;
  target_identifier: string;
  target_summary: string;
  reason_code: string;
  reporter_account_identifier: string;
  priority_code: string;
  status_code: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationReportsListResponse {
  total: number;
  items: ModerationReportListItem[];
}

export interface ModerationDecision {
  action_code: string;
  notes: string;
  decided_by_account_identifier: string;
  decided_at: string;
}

export interface ModerationReportDetail {
  report_identifier: string;
  target_kind: string;
  target_identifier: string;
  target_summary: string;
  reason_code: string;
  reason_details: string;
  reporter_account_identifier: string;
  priority_code: string;
  status_code: string;
  context_json: string;
  created_at: string;
  updated_at: string;
  decision: ModerationDecision | null;
}

export interface ModerationReportDecisionPayload {
  action_code: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminReportsService {
  constructor(private readonly http: HttpClient) {}

  listReports(limit = 20, statuses: string[] = []): Observable<ModerationReportsListResponse> {
    let params = new HttpParams().set('limit', limit);
    for (const status of statuses) {
      params = params.append('statuses', status);
    }

    return this.http.get<ModerationReportsListResponse>(
      buildApiUrl('/api/v1/administration/reports'),
      { params }
    );
  }

  getReport(reportIdentifier: string): Observable<ModerationReportDetail> {
    return this.http.get<ModerationReportDetail>(
      buildApiUrl(`/api/v1/administration/reports/${reportIdentifier}`)
    );
  }

  decideReport(reportIdentifier: string, payload: ModerationReportDecisionPayload): Observable<ModerationReportDetail> {
    return this.http.post<ModerationReportDetail>(
      buildApiUrl(`/api/v1/administration/reports/${reportIdentifier}/decision`),
      payload
    );
  }
}
