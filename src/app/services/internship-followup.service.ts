import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/api.config';

export interface LogbookEntryDto {
  entry_identifier: string;
  stage_record_identifier: string;
  entry_date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLogbookEntryRequest {
  stage_record_identifier: string;
  entry_date: string;
  content: string;
}

export interface CompanyEvaluationDto {
  stage_record_identifier: string;
  overall_rating: number;
  technical_skills_rating: number;
  soft_skills_rating: number;
  comments: string;
  submitted_at: string;
}

export interface SubmitEvaluationRequest {
  stage_record_identifier: string;
  overall_rating: number;
  technical_skills_rating: number;
  soft_skills_rating: number;
  comments: string;
}

export interface InternshipReportDto {
  stage_record_identifier: string;
  report_type: string;
  content: string;
  submitted_at: string;
}

export interface InternshipCertificateDto {
  certificate_identifier: string;
  stage_record_identifier: string;
  verification_code: string;
  issued_at: string;
  student_name: string;
  company_name: string;
  start_date: string;
  end_date: string;
}

@Injectable({ providedIn: 'root' })
export class InternshipFollowupService {
  private readonly http = inject(HttpClient);

  createLogbookEntry(payload: CreateLogbookEntryRequest): Observable<LogbookEntryDto> {
    return this.http.post<LogbookEntryDto>(buildApiUrl('/api/v1/internship-followup/logbook/entries'), payload);
  }

  updateLogbookEntry(entryId: string, payload: Partial<CreateLogbookEntryRequest>): Observable<LogbookEntryDto> {
    return this.http.patch<LogbookEntryDto>(buildApiUrl(`/api/v1/internship-followup/logbook/entries/${entryId}`), payload);
  }

  getLogbook(stageRecordId: string): Observable<LogbookEntryDto[]> {
    return this.http.get<LogbookEntryDto[]>(buildApiUrl(`/api/v1/internship-followup/logbook/${stageRecordId}`));
  }

  submitCompanyEvaluation(payload: SubmitEvaluationRequest): Observable<CompanyEvaluationDto> {
    return this.http.post<CompanyEvaluationDto>(buildApiUrl('/api/v1/internship-followup/evaluations/company'), payload);
  }

  getCompanyEvaluation(stageRecordId: string): Observable<CompanyEvaluationDto> {
    return this.http.get<CompanyEvaluationDto>(buildApiUrl(`/api/v1/internship-followup/evaluations/company/${stageRecordId}`));
  }

  submitReport(stageRecordId: string, reportType: string, content: string): Observable<InternshipReportDto> {
    return this.http.post<InternshipReportDto>(buildApiUrl('/api/v1/internship-followup/reports'), {
      stage_record_identifier: stageRecordId,
      report_type: reportType,
      content
    });
  }

  getReport(stageRecordId: string, reportType: string): Observable<InternshipReportDto> {
    return this.http.get<InternshipReportDto>(buildApiUrl(`/api/v1/internship-followup/reports/${stageRecordId}/${reportType}`));
  }

  issueCertificate(stageRecordId: string): Observable<InternshipCertificateDto> {
    return this.http.post<InternshipCertificateDto>(buildApiUrl('/api/v1/internship-followup/certificates/issue'), {
      stage_record_identifier: stageRecordId
    });
  }

  getCertificate(stageRecordId: string): Observable<InternshipCertificateDto> {
    return this.http.get<InternshipCertificateDto>(buildApiUrl(`/api/v1/internship-followup/certificates/${stageRecordId}`));
  }

  verifyCertificate(verificationCode: string): Observable<InternshipCertificateDto> {
    return this.http.get<InternshipCertificateDto>(buildApiUrl(`/api/v1/internship-followup/certificates/verify/${verificationCode}`));
  }
}
