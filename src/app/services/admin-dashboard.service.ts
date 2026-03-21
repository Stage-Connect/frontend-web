import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface AdminDashboardSummary {
  companies_pending_verification: number;
  suspended_accounts: number;
  suspended_offers: number;
  open_reports: number;
  recent_activity: number;
}

export interface AdminDashboardBlock<T> {
  total: number;
  sort_applied: string;
  items: T[];
}

export interface AdminDashboardCompanyItem {
  company_identifier: string;
  account_identifier: string;
  company_name: string;
  verification_status: string;
  created_at: string;
}

export interface AdminDashboardSuspendedAccountItem {
  account_identifier: string;
  email: string;
  role_code: string | null;
  is_active: boolean;
  is_suspended: boolean;
}

export interface AdminDashboardOfferItem {
  offer_identifier: string;
  title: string;
  status_code: string;
  is_visible: boolean;
  published_at: string | null;
}

export interface AdminDashboardReportItem {
  report_identifier: string;
  source_kind: string;
  title: string;
  status: string;
  severity: string;
  last_seen_at: string;
}

export interface AdminDashboardActivityItem {
  source_kind: string;
  reference_identifier: string | null;
  event_type: string;
  actor_account_identifier: string | null;
  summary: string;
  occurred_at: string;
}

export interface AdminDashboardResponse {
  generated_at: string;
  summary: AdminDashboardSummary;
  companies_to_verify: AdminDashboardBlock<AdminDashboardCompanyItem>;
  suspended_accounts: AdminDashboardBlock<AdminDashboardSuspendedAccountItem>;
  suspended_offers: AdminDashboardBlock<AdminDashboardOfferItem>;
  open_reports: AdminDashboardBlock<AdminDashboardReportItem>;
  recent_activity: AdminDashboardBlock<AdminDashboardActivityItem>;
}

export interface AdminDashboardMetricsSeries {
  labels: string[];
  values: number[];
}

export interface AdminDashboardMetricsResponse {
  generated_at: string;
  summary: AdminDashboardSummary;
  overview: AdminDashboardMetricsSeries;
  distribution: AdminDashboardMetricsSeries;
}

export interface AdminDashboardAuditLog {
  id: number;
  actor_account_identifier: string | null;
  counters_json: string;
  priority_limit: number;
  activity_limit: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(priorityLimit = 5, activityLimit = 5): Observable<AdminDashboardResponse> {
    const params = new HttpParams()
      .set('priority_limit', priorityLimit)
      .set('activity_limit', activityLimit);

    return this.http.get<AdminDashboardResponse>(
      buildApiUrl('/api/v1/administration/dashboard'),
      { params }
    );
  }

  getMetrics(): Observable<AdminDashboardMetricsResponse> {
    return this.http.get<AdminDashboardMetricsResponse>(
      buildApiUrl('/api/v1/administration/dashboard/metrics')
    );
  }

  listAudit(limit = 10): Observable<AdminDashboardAuditLog[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<AdminDashboardAuditLog[]>(
      buildApiUrl('/api/v1/administration/dashboard/audit'),
      { params }
    );
  }
}
