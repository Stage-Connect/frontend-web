import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface ProductKpiDashboardDto {
  period_start: string;
  period_end: string;
  generated_at: string;
  metrics: {
    registrations_count: number;
    published_offers_count: number;
    applications_count: number;
    conversion_rate_percent: number;
  };
  definitions: Record<string, string>;
}

export interface CriticalIncidentDto {
  incident_id: string;
  title: string;
  status: string;
  severity: string;
  description: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface IncidentsListDto {
  items: CriticalIncidentDto[];
  total: number;
}

export interface BackupRunDto {
  backup_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  size_bytes: number | null;
  error_message: string | null;
}

export interface BackupRunsListDto {
  items: BackupRunDto[];
  total: number;
}

export interface BackupPolicyDto {
  retention_days: number;
  schedule_cron: string;
  storage_location: string;
}

export interface RunbookDto {
  runbook_id: string;
  name: string;
  description: string;
  steps_count: number;
}

export interface RunbookExecutionDto {
  execution_id: string;
  runbook_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

export interface ScrapedOfferDto {
  scraped_offer_id: string;
  title: string;
  company_name: string;
  source_url: string;
  scraped_at: string;
  validation_status: string;
}

export interface ScrapedOffersListDto {
  items: ScrapedOfferDto[];
  total: number;
}

export interface LogEntryDto {
  log_id: string;
  level: string;
  message: string;
  created_at: string;
  service: string;
}

export interface LogsListDto {
  items: LogEntryDto[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OperationsPortalService {
  private readonly http = inject(HttpClient);

  getProductKpis(): Observable<ProductKpiDashboardDto> {
    return this.http.get<ProductKpiDashboardDto>(buildApiUrl('/api/v1/operations/kpis'));
  }

  listIncidents(status?: string): Observable<IncidentsListDto> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<IncidentsListDto>(buildApiUrl('/api/v1/operations/incidents'), { params });
  }

  getIncident(incidentId: string): Observable<CriticalIncidentDto> {
    return this.http.get<CriticalIncidentDto>(
      buildApiUrl(`/api/v1/operations/incidents/${encodeURIComponent(incidentId)}`)
    );
  }

  updateIncidentStatus(
    incidentId: string,
    status: string,
    resolution_notes?: string
  ): Observable<CriticalIncidentDto> {
    return this.http.patch<CriticalIncidentDto>(
      buildApiUrl(`/api/v1/operations/incidents/${encodeURIComponent(incidentId)}/status`),
      { status, resolution_notes }
    );
  }

  getBackupPolicy(): Observable<BackupPolicyDto> {
    return this.http.get<BackupPolicyDto>(buildApiUrl('/api/v1/operations/backups/policy'));
  }

  listBackupRuns(): Observable<BackupRunsListDto> {
    return this.http.get<BackupRunsListDto>(buildApiUrl('/api/v1/operations/backups/runs'));
  }

  getBackupRun(backupId: string): Observable<BackupRunDto> {
    return this.http.get<BackupRunDto>(
      buildApiUrl(`/api/v1/operations/backups/runs/${encodeURIComponent(backupId)}`)
    );
  }

  triggerBackup(): Observable<BackupRunDto> {
    return this.http.post<BackupRunDto>(buildApiUrl('/api/v1/operations/backups/run'), {});
  }

  triggerRestoreTest(): Observable<{ status: string; triggered_at: string }> {
    return this.http.post<{ status: string; triggered_at: string }>(
      buildApiUrl('/api/v1/operations/backups/restore-test'), {}
    );
  }

  listRunbooks(): Observable<{ items: RunbookDto[] }> {
    return this.http.get<{ items: RunbookDto[] }>(buildApiUrl('/api/v1/operations/runbooks'));
  }

  getRunbook(runbookId: string): Observable<RunbookDto> {
    return this.http.get<RunbookDto>(
      buildApiUrl(`/api/v1/operations/runbooks/${encodeURIComponent(runbookId)}`)
    );
  }

  listRunbookExecutions(incidentId?: string): Observable<{ items: RunbookExecutionDto[] }> {
    let params = new HttpParams();
    if (incidentId) params = params.set('incident_id', incidentId);
    return this.http.get<{ items: RunbookExecutionDto[] }>(
      buildApiUrl('/api/v1/operations/runbooks/executions'), { params }
    );
  }

  executeRunbook(runbookId: string): Observable<RunbookExecutionDto> {
    return this.http.post<RunbookExecutionDto>(
      buildApiUrl(`/api/v1/operations/runbooks/${encodeURIComponent(runbookId)}/execute`), {}
    );
  }

  listScrapedOffers(status?: string): Observable<ScrapedOffersListDto> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ScrapedOffersListDto>(
      buildApiUrl('/api/v1/operations/scraping/offers'), { params }
    );
  }

  validateScrapedOffer(scrapedOfferId: string): Observable<ScrapedOfferDto> {
    return this.http.post<ScrapedOfferDto>(
      buildApiUrl(`/api/v1/operations/scraping/offers/${encodeURIComponent(scrapedOfferId)}/validate`), {}
    );
  }

  rejectScrapedOffer(scrapedOfferId: string): Observable<ScrapedOfferDto> {
    return this.http.post<ScrapedOfferDto>(
      buildApiUrl(`/api/v1/operations/scraping/offers/${encodeURIComponent(scrapedOfferId)}/reject`), {}
    );
  }

  getLogs(params?: { level?: string; limit?: number }): Observable<LogsListDto> {
    let httpParams = new HttpParams();
    if (params?.level) httpParams = httpParams.set('level', params.level);
    if (params?.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<LogsListDto>(buildApiUrl('/api/v1/operations/logs'), { params: httpParams });
  }
}
