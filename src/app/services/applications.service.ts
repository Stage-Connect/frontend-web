import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface ApplicationDto {
  application_identifier: string;
  student_account_identifier: string;
  offer_identifier: string;
  status_code: string;
  submission_context_json: string;
  created_at: string;
  updated_at: string;
  student_profile_identifier?: string | null;
}

export interface CompanyApplicationDashboardResponse {
  applications: ApplicationDto[];
  total: number;
}

export interface ApplicationStatusHistoryEntryDto {
  id: number;
  application_identifier: string;
  from_status_code: string | null;
  to_status_code: string;
  actor_account_identifier: string | null;
  context_json: string;
  occurred_at: string;
}

export interface ApplicationDocumentDto {
  document_identifier: string;
  application_identifier: string;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  created_at: string;
}

export interface InitiateApplicationRequest {
  offer_identifier: string;
}

export interface InitiateApplicationResponse {
  application: ApplicationDto;
  initial_status_code: string;
  initial_status_occurred_at: string;
}

export interface ApplicationPreconditionResponse {
  offer_identifier: string;
  student_account_identifier: string;
  is_eligible: boolean;
  blocking_reasons: string[];
  missing_conditions: string[];
  satisfied_conditions: string[];
}

export interface StudentApplicationDashboardResponse {
  applications: ApplicationDto[];
  total: number;
}

export interface ApplicationStatusSnapshotResponse {
  application_identifier: string;
  status_code: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private readonly http = inject(HttpClient);

  getCompanyDashboard(companyIdentifier: string): Observable<CompanyApplicationDashboardResponse> {
    const params = new HttpParams().set('company_identifier', companyIdentifier);
    return this.http.get<CompanyApplicationDashboardResponse>(
      buildApiUrl('/api/v1/applications/company-dashboard'),
      { params }
    );
  }

  getApplication(applicationIdentifier: string): Observable<ApplicationDto> {
    return this.http.get<ApplicationDto>(
      buildApiUrl(`/api/v1/applications/${encodeURIComponent(applicationIdentifier)}`)
    );
  }

  changeApplicationStatus(
    applicationIdentifier: string,
    newStatusCode: string,
    contextNote = ''
  ): Observable<ApplicationDto> {
    return this.http.put<ApplicationDto>(
      buildApiUrl(`/api/v1/applications/${encodeURIComponent(applicationIdentifier)}/status`),
      { new_status_code: newStatusCode, context_note: contextNote }
    );
  }

  getApplicationHistory(applicationIdentifier: string): Observable<ApplicationStatusHistoryEntryDto[]> {
    return this.http.get<ApplicationStatusHistoryEntryDto[]>(
      buildApiUrl(`/api/v1/applications/${encodeURIComponent(applicationIdentifier)}/history`)
    );
  }

  listApplicationDocuments(applicationIdentifier: string): Observable<ApplicationDocumentDto[]> {
    return this.http.get<ApplicationDocumentDto[]>(
      buildApiUrl(`/api/v1/applications/${encodeURIComponent(applicationIdentifier)}/documents`)
    );
  }

  // --- Candidatures étudiants ---

  initiateApplication(payload: InitiateApplicationRequest): Observable<InitiateApplicationResponse> {
    return this.http.post<InitiateApplicationResponse>(
      buildApiUrl('/api/v1/applications'),
      payload
    );
  }

  checkPreconditions(offerIdentifier: string): Observable<ApplicationPreconditionResponse> {
    const params = new HttpParams().set('offer_identifier', offerIdentifier);
    return this.http.get<ApplicationPreconditionResponse>(
      buildApiUrl('/api/v1/applications/preconditions'),
      { params }
    );
  }

  getStudentDashboard(): Observable<StudentApplicationDashboardResponse> {
    return this.http.get<StudentApplicationDashboardResponse>(
      buildApiUrl('/api/v1/applications/my-dashboard')
    );
  }

  pollApplicationStatus(applicationIdentifier: string): Observable<ApplicationStatusSnapshotResponse> {
    return this.http.get<ApplicationStatusSnapshotResponse>(
      buildApiUrl(`/api/v1/applications/${encodeURIComponent(applicationIdentifier)}/status`)
    );
  }

  sendMaintenanceReminders(): Observable<{ checked: number; reminders_emitted: number }> {
    return this.http.post<{ checked: number; reminders_emitted: number }>(
      buildApiUrl('/api/v1/applications/maintenance/reminders'), {}
    );
  }

  uploadApplicationDocument(
    applicationIdentifier: string,
    file: File,
    documentType: string
  ): Observable<ApplicationDocumentDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return this.http.post<ApplicationDocumentDto>(
      buildApiUrl(`/api/v1/applications/${encodeURIComponent(applicationIdentifier)}/documents`),
      formData
    );
  }
}
