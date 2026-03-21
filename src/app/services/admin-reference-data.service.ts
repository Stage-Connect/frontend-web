import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface StatusReferentialPayload {
  code: string;
  label: string;
  version: string;
  evolution_policy: string;
  is_active: boolean;
  display_order: number;
}

export interface StatusPayload {
  code: string;
  label: string;
  usage_category: string;
  is_terminal: boolean;
  referential_code: string;
  is_active: boolean;
  display_order: number;
}

export interface SkillReferentialPayload {
  code: string;
  label: string;
  version: string;
  evolution_policy: string;
  is_active: boolean;
  display_order: number;
}

export interface SectorPayload {
  code: string;
  label: string;
  referential_code: string;
  is_active: boolean;
  display_order: number;
}

export interface FilierePayload {
  code: string;
  label: string;
  sector_code: string;
  referential_code: string;
  is_active: boolean;
  display_order: number;
}

export interface CompetencePayload {
  code: string;
  label: string;
  filiere_code: string;
  sector_code: string;
  referential_code: string;
  is_active: boolean;
  display_order: number;
}

export interface StatusReferential extends StatusReferentialPayload {}
export interface StatusItem extends StatusPayload {}
export interface SkillReferential extends SkillReferentialPayload {}
export interface SectorItem extends SectorPayload {}
export interface FiliereItem extends FilierePayload {}
export interface CompetenceItem extends CompetencePayload {}

export interface ReferenceCatalog {
  status_referentials: StatusReferential[];
  statuses: StatusItem[];
  skill_referentials: SkillReferential[];
  sectors: SectorItem[];
  filieres: FiliereItem[];
  competences: CompetenceItem[];
}

export interface ReferenceAuditLog {
  id: number;
  event_type: string;
  resource_kind: string;
  resource_code: string;
  actor_account_identifier: string | null;
  details_json: string;
  created_at: string;
}

export type ReferenceCategory =
  | 'status_referentials'
  | 'statuses'
  | 'skill_referentials'
  | 'sectors'
  | 'filieres'
  | 'competences';

export type ReferenceItem =
  | StatusReferential
  | StatusItem
  | SkillReferential
  | SectorItem
  | FiliereItem
  | CompetenceItem;

@Injectable({
  providedIn: 'root'
})
export class AdminReferenceDataService {
  constructor(private readonly http: HttpClient) {}

  getCatalog(includeInactive = true): Observable<ReferenceCatalog> {
    const params = new HttpParams().set('include_inactive', includeInactive);
    return this.http.get<ReferenceCatalog>(
      buildApiUrl('/api/v1/administration/reference-data'),
      { params }
    );
  }

  listAudit(limit = 20): Observable<ReferenceAuditLog[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<ReferenceAuditLog[]>(
      buildApiUrl('/api/v1/administration/reference-data/audit'),
      { params }
    );
  }

  createStatusReferential(payload: StatusReferentialPayload): Observable<StatusReferential> {
    return this.http.post<StatusReferential>(buildApiUrl('/api/v1/administration/status-referentials'), payload);
  }

  updateStatusReferential(code: string, payload: StatusReferentialPayload): Observable<StatusReferential> {
    return this.http.put<StatusReferential>(buildApiUrl(`/api/v1/administration/status-referentials/${code}`), payload);
  }

  createStatus(payload: StatusPayload): Observable<StatusItem> {
    return this.http.post<StatusItem>(buildApiUrl('/api/v1/administration/statuses'), payload);
  }

  updateStatus(code: string, payload: StatusPayload): Observable<StatusItem> {
    return this.http.put<StatusItem>(buildApiUrl(`/api/v1/administration/statuses/${code}`), payload);
  }

  createSkillReferential(payload: SkillReferentialPayload): Observable<SkillReferential> {
    return this.http.post<SkillReferential>(buildApiUrl('/api/v1/administration/skill-referentials'), payload);
  }

  updateSkillReferential(code: string, payload: SkillReferentialPayload): Observable<SkillReferential> {
    return this.http.put<SkillReferential>(buildApiUrl(`/api/v1/administration/skill-referentials/${code}`), payload);
  }

  createSector(payload: SectorPayload): Observable<SectorItem> {
    return this.http.post<SectorItem>(buildApiUrl('/api/v1/administration/sectors'), payload);
  }

  updateSector(code: string, payload: SectorPayload): Observable<SectorItem> {
    return this.http.put<SectorItem>(buildApiUrl(`/api/v1/administration/sectors/${code}`), payload);
  }

  createFiliere(payload: FilierePayload): Observable<FiliereItem> {
    return this.http.post<FiliereItem>(buildApiUrl('/api/v1/administration/filieres'), payload);
  }

  updateFiliere(code: string, payload: FilierePayload): Observable<FiliereItem> {
    return this.http.put<FiliereItem>(buildApiUrl(`/api/v1/administration/filieres/${code}`), payload);
  }

  createCompetence(payload: CompetencePayload): Observable<CompetenceItem> {
    return this.http.post<CompetenceItem>(buildApiUrl('/api/v1/administration/competences'), payload);
  }

  updateCompetence(code: string, payload: CompetencePayload): Observable<CompetenceItem> {
    return this.http.put<CompetenceItem>(buildApiUrl(`/api/v1/administration/competences/${code}`), payload);
  }
}
