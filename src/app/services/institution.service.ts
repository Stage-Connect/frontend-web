import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface InstitutionProfileResponse {
  institution_id: string;
  account_identifier: string;
  institution_name: string;
  institution_type: string;
  region_code: string;
  profile_status: string;
  partnership_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInstitutionProfileRequest {
  institution_name: string;
  institution_type: string;
  region_code: string;
}

export interface AcademicSupervisorResponse {
  supervisor_id: string;
  institution_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  department_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
}

export interface CreateAcademicSupervisorRequest {
  full_name: string;
  email: string;
  phone_number: string;
  department_name: string;
}

export interface UpdateAcademicSupervisorRequest {
  full_name?: string;
  email?: string;
  phone_number?: string;
  department_name?: string;
}

export interface SupervisorAssignmentResponse {
  supervisor_id: string;
  institution_id: string;
  student_account_id: string;
  assignment_status: string;
  assigned_at: string;
  updated_at: string;
  unassigned_at: string | null;
}

export interface AssignStudentRequest {
  student_account_id: string;
}

export interface InstitutionStudentLinkResponse {
  institution_id: string;
  student_account_id: string;
  filiere_code: string;
  link_status: string;
  effective_at: string;
}

export interface CreateInstitutionStudentLinkRequest {
  student_account_id: string;
  filiere_code: string;
  effective_at?: string;
}

export interface UpdateInstitutionStudentLinkStatusRequest {
  student_account_id: string;
  next_status: string;
  effective_at?: string;
}

export interface InstitutionDashboardResponse {
  institution_id: string;
  institution_name: string;
  institution_type: string;
  region_code: string;
  filters: {
    period_start: string | null;
    period_end: string | null;
    stage_status: string | null;
    filiere_code: string | null;
  };
  metrics: {
    attached_students: number;
    internships_in_progress: number;
    internships_completed: number;
    critical_alerts: number;
  };
  generated_at: string;
}

export interface SupervisorEvaluationResponse {
  evaluation_id: string;
  institution_id: string;
  stage_record_id: string;
  supervisor_id: string;
  student_account_id: string;
  score: number;
  recommendation: string;
  strengths: string;
  improvement_areas: string;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertSupervisorEvaluationRequest {
  supervisor_id: string;
  score: number;
  recommendation: string;
  strengths: string;
  improvement_areas: string;
  comments?: string | null;
}

export interface InstitutionTrackingExportResponse {
  export_id: string;
  institution_id: string;
  document_name: string;
  file_format: string;
  row_count: number;
  status: string;
  generated_at: string;
  downloaded_at: string | null;
}

export interface InstitutionDashboardParams {
  institution_id?: string;
  period_start?: string;
  period_end?: string;
  stage_status?: string;
  filiere_code?: string;
}

export interface StudentInternshipItem {
  stage_record_id: string;
  institution_id: string;
  student_account_id: string;
  filiere_code: string;
  stage_status: string;
  alert_level: string | null;
  starts_at: string;
  ends_at: string | null;
  updated_at: string;
}

export interface StudentsInInternshipPage {
  institution_id: string;
  total: number;
  page: number;
  page_size: number;
  items: StudentInternshipItem[];
  generated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private readonly http = inject(HttpClient);

  // --- Profile ---

  createProfile(payload: CreateInstitutionProfileRequest): Observable<InstitutionProfileResponse> {
    return this.http.post<InstitutionProfileResponse>(
      buildApiUrl('/api/v1/institutions'),
      payload
    );
  }

  getMyProfile(): Observable<InstitutionProfileResponse> {
    return this.http.get<InstitutionProfileResponse>(buildApiUrl('/api/v1/institutions/me'));
  }

  requestVerification(): Observable<{ institution_identifier: string; profile_status: string; partnership_status: string }> {
    return this.http.post<{ institution_identifier: string; profile_status: string; partnership_status: string }>(
      buildApiUrl('/api/v1/institutions/verification/request'),
      {}
    );
  }

  verifyInstitution(institutionId: string): Observable<{ institution_identifier: string; profile_status: string; partnership_status: string }> {
    return this.http.post<{ institution_identifier: string; profile_status: string; partnership_status: string }>(
      buildApiUrl(`/api/v1/institutions/${encodeURIComponent(institutionId)}/verify`),
      {}
    );
  }

  // --- Dashboard ---

  getDashboard(params?: InstitutionDashboardParams): Observable<InstitutionDashboardResponse> {
    let httpParams = new HttpParams();
    if (params?.institution_id) httpParams = httpParams.set('institution_id', params.institution_id);
    if (params?.period_start) httpParams = httpParams.set('period_start', params.period_start);
    if (params?.period_end) httpParams = httpParams.set('period_end', params.period_end);
    if (params?.stage_status) httpParams = httpParams.set('stage_status', params.stage_status);
    if (params?.filiere_code) httpParams = httpParams.set('filiere_code', params.filiere_code);
    return this.http.get<InstitutionDashboardResponse>(
      buildApiUrl('/api/v1/institutions/dashboard'),
      { params: httpParams }
    );
  }

  // --- Supervisors ---

  listSupervisors(includeInactive = false): Observable<AcademicSupervisorResponse[]> {
    const params = new HttpParams().set('include_inactive', String(includeInactive));
    return this.http.get<AcademicSupervisorResponse[]>(
      buildApiUrl('/api/v1/institutions/supervisors'),
      { params }
    );
  }

  createSupervisor(payload: CreateAcademicSupervisorRequest): Observable<AcademicSupervisorResponse> {
    return this.http.post<AcademicSupervisorResponse>(
      buildApiUrl('/api/v1/institutions/supervisors'),
      payload
    );
  }

  updateSupervisor(supervisorId: string, payload: UpdateAcademicSupervisorRequest): Observable<AcademicSupervisorResponse> {
    return this.http.put<AcademicSupervisorResponse>(
      buildApiUrl(`/api/v1/institutions/supervisors/${encodeURIComponent(supervisorId)}`),
      payload
    );
  }

  deactivateSupervisor(supervisorId: string): Observable<AcademicSupervisorResponse> {
    return this.http.post<AcademicSupervisorResponse>(
      buildApiUrl(`/api/v1/institutions/supervisors/${encodeURIComponent(supervisorId)}/deactivate`),
      {}
    );
  }

  getSupervisorAssignments(supervisorId: string): Observable<SupervisorAssignmentResponse[]> {
    return this.http.get<SupervisorAssignmentResponse[]>(
      buildApiUrl(`/api/v1/institutions/supervisors/${encodeURIComponent(supervisorId)}/assignments`)
    );
  }

  assignStudentToSupervisor(supervisorId: string, payload: AssignStudentRequest): Observable<SupervisorAssignmentResponse> {
    return this.http.put<SupervisorAssignmentResponse>(
      buildApiUrl(`/api/v1/institutions/supervisors/${encodeURIComponent(supervisorId)}/assignments`),
      payload
    );
  }

  unassignStudent(supervisorId: string, studentAccountId: string): Observable<SupervisorAssignmentResponse> {
    return this.http.delete<SupervisorAssignmentResponse>(
      buildApiUrl(`/api/v1/institutions/supervisors/${encodeURIComponent(supervisorId)}/assignments/${encodeURIComponent(studentAccountId)}`)
    );
  }

  // --- Tracking exports ---

  generateTrackingExport(params?: InstitutionDashboardParams): Observable<InstitutionTrackingExportResponse> {
    let httpParams = new HttpParams();
    if (params?.institution_id) httpParams = httpParams.set('institution_id', params.institution_id);
    if (params?.period_start) httpParams = httpParams.set('period_start', params.period_start);
    if (params?.period_end) httpParams = httpParams.set('period_end', params.period_end);
    if (params?.stage_status) httpParams = httpParams.set('stage_status', params.stage_status);
    if (params?.filiere_code) httpParams = httpParams.set('filiere_code', params.filiere_code);
    return this.http.post<InstitutionTrackingExportResponse>(
      buildApiUrl('/api/v1/institutions/tracking-exports'),
      null,
      { params: httpParams }
    );
  }

  getTrackingExport(exportId: string): Observable<InstitutionTrackingExportResponse> {
    return this.http.get<InstitutionTrackingExportResponse>(
      buildApiUrl(`/api/v1/institutions/tracking-exports/${encodeURIComponent(exportId)}`)
    );
  }

  downloadTrackingExport(exportId: string): Observable<Blob> {
    return this.http.get(
      buildApiUrl(`/api/v1/institutions/tracking-exports/${encodeURIComponent(exportId)}/download`),
      { responseType: 'blob' }
    );
  }

  // --- Supervisor evaluations ---

  upsertSupervisorEvaluation(stageRecordId: string, payload: UpsertSupervisorEvaluationRequest): Observable<SupervisorEvaluationResponse> {
    return this.http.put<SupervisorEvaluationResponse>(
      buildApiUrl(`/api/v1/institutions/stage-records/${encodeURIComponent(stageRecordId)}/supervisor-evaluation`),
      payload
    );
  }

  getSupervisorEvaluation(stageRecordId: string): Observable<SupervisorEvaluationResponse> {
    return this.http.get<SupervisorEvaluationResponse>(
      buildApiUrl(`/api/v1/institutions/stage-records/${encodeURIComponent(stageRecordId)}/supervisor-evaluation`)
    );
  }

  // --- Student links ---

  createStudentLink(payload: CreateInstitutionStudentLinkRequest): Observable<InstitutionStudentLinkResponse> {
    return this.http.post<InstitutionStudentLinkResponse>(
      buildApiUrl('/api/v1/institutions/student-links'),
      payload
    );
  }

  listStudentLinks(params?: { filiere_code?: string; status?: string }): Observable<InstitutionStudentLinkResponse[]> {
    let httpParams = new HttpParams();
    if (params?.filiere_code) httpParams = httpParams.set('filiere_code', params.filiere_code);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<InstitutionStudentLinkResponse[]>(
      buildApiUrl('/api/v1/institutions/student-links'),
      { params: httpParams }
    );
  }

  getStudentLink(studentAccountId: string): Observable<InstitutionStudentLinkResponse> {
    return this.http.get<InstitutionStudentLinkResponse>(
      buildApiUrl(`/api/v1/institutions/student-links/${encodeURIComponent(studentAccountId)}`)
    );
  }

  updateStudentLinkStatus(payload: UpdateInstitutionStudentLinkStatusRequest): Observable<InstitutionStudentLinkResponse> {
    return this.http.patch<InstitutionStudentLinkResponse>(
      buildApiUrl('/api/v1/institutions/student-links/status'),
      payload
    );
  }

  // --- Students in internship ---

  listStudentsInInternship(params?: { institution_id?: string; stage_status?: string; filiere_code?: string; page?: number; page_size?: number }): Observable<StudentsInInternshipPage> {
    let httpParams = new HttpParams();
    if (params?.institution_id) httpParams = httpParams.set('institution_id', params.institution_id);
    if (params?.stage_status) httpParams = httpParams.set('stage_status', params.stage_status);
    if (params?.filiere_code) httpParams = httpParams.set('filiere_code', params.filiere_code);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.page_size) httpParams = httpParams.set('page_size', String(params.page_size));
    return this.http.get<StudentsInInternshipPage>(
      buildApiUrl('/api/v1/institutions/students-in-internship'),
      { params: httpParams }
    );
  }
}
