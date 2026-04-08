import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ColorModeService,
  BadgeComponent,
  AvatarComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {
  ApplicationDocumentDto,
  ApplicationDto,
  ApplicationStatusHistoryEntryDto,
  ApplicationsService
} from '../../../services/applications.service';
import { OffersService } from '../../../services/offers.service';
import { StudentPublicProfileDto, StudentPublicProfileService } from '../../../services/student-public-profile.service';

@Component({
  selector: 'app-candidature-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    BadgeComponent,
    AvatarComponent
  ],
  template: `
    <c-row>
      <c-col lg="8">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex align-items-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <button cButton variant="ghost" [class.text-white]="isDark()" routerLink=".." class="me-3 p-0">
              <svg cIcon name="cilArrowLeft"></svg>
            </button>
            <h5 class="mb-0 fw-bold" [class.text-white]="isDark()">Détail de la candidature</h5>
          </c-card-header>
          <c-card-body class="p-4">
            @if (isLoading) {
              <div class="text-center py-5 opacity-75">Chargement…</div>
            } @else if (loadError) {
              <div class="alert alert-danger mb-0" role="alert">{{ loadError }}</div>
            } @else if (application) {
              <div class="d-flex align-items-center mb-5">
                <c-avatar size="xl" [src]="avatarSrc" status="success" class="me-4 shadow-sm"></c-avatar>
                <div>
                  <h3 class="mb-1 fw-bold">{{ candidateTitle }}</h3>
                  <p class="opacity-75 mb-2 small">{{ candidateSubtitle }}</p>
                  <c-badge [color]="statusBadgeColor()" shape="rounded-pill" class="px-3 py-2">{{ statutLabel }}</c-badge>
                </div>
              </div>

              <div class="mb-4">
                <h6 class="fw-bold text-uppercase small opacity-50 mb-2 tracking-wider" [class.text-white]="isDark()">Offre</h6>
                <p class="mb-0 fw-semibold">{{ offerTitle }}</p>
              </div>

              @if (profileSummary) {
                <div class="mb-5">
                  <h6 class="fw-bold text-uppercase small opacity-50 mb-3 tracking-wider" [class.text-white]="isDark()">Profil public</h6>
                  <p class="lh-base mb-2">{{ profileSummary }}</p>
                  @if (profile?.tags?.length) {
                    <div class="d-flex flex-wrap gap-1">
                      @for (t of profile!.tags; track t) {
                        <span class="badge rounded-pill" [class.bg-secondary]="isDark()" [class.bg-light]="!isDark()">{{ t }}</span>
                      }
                    </div>
                  }
                </div>
              }

              <div class="mb-4">
                <h6 class="fw-bold text-uppercase small opacity-50 mb-3 tracking-wider" [class.text-white]="isDark()">Historique des statuts</h6>
                @if (history.length === 0) {
                  <p class="small opacity-75 mb-0">Aucun historique détaillé.</p>
                } @else {
                  <ul class="list-unstyled mb-0 small">
                    @for (h of historySorted; track h.id) {
                      <li class="mb-2 pb-2 border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                        <span class="opacity-75">{{ formatDt(h.occurred_at) }}</span> —
                        <span class="fw-semibold">{{ h.from_status_code ?? '—' }}</span>
                        → {{ h.to_status_code }}
                      </li>
                    }
                  </ul>
                }
              </div>

              <div class="mb-0">
                <h6 class="fw-bold text-uppercase small opacity-50 mb-3 tracking-wider" [class.text-white]="isDark()">Documents</h6>
                @if (documents.length === 0) {
                  <p class="small opacity-75 mb-0">Aucun document joint pour cette candidature.</p>
                } @else {
                  <div class="row g-3">
                    @for (doc of documents; track doc.document_identifier) {
                      <div class="col-md-6">
                        <div class="p-3 rounded border d-flex align-items-center justify-content-between"
                             [class.bg-white]="isDark()" [class.bg-opacity-10]="isDark()"
                             [class.bg-light]="!isDark()"
                             [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                          <div class="d-flex align-items-center">
                            <div class="p-2 bg-primary bg-opacity-10 rounded me-3 text-primary">
                              <svg cIcon name="cilDescription" size="lg"></svg>
                            </div>
                            <div [class.text-white]="isDark()">
                              <p class="mb-0 fw-semibold small">{{ doc.original_filename }}</p>
                              <p class="mb-0 x-small opacity-50">{{ doc.document_type }} · {{ formatBytes(doc.file_size_bytes) }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
      <c-col lg="4">
        <c-card class="mb-4 border-0 shadow-sm overflow-hidden" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-primary text-white border-0">
            <h6 class="mb-0 fw-bold">Décision</h6>
          </c-card-header>
          <c-card-body class="p-4 d-grid gap-3">
            @if (application && canDecide) {
              <button cButton color="success" class="py-3 fw-bold text-white shadow-sm border-0 d-flex align-items-center justify-content-center" (click)="accepter()">
                <svg cIcon name="cilCheckCircle" class="me-2"></svg>
                Accepter la candidature
              </button>
              <button cButton color="danger" variant="ghost" class="py-3 fw-bold border-0 d-flex align-items-center justify-content-center"
                      [class.text-white]="isDark()" (click)="refuser()">
                <svg cIcon name="cilX" class="me-2"></svg>
                Refuser la candidature
              </button>
            } @else if (application && !canDecide) {
              <p class="small opacity-75 mb-0">Aucune action disponible pour ce statut (workflow ou droits).</p>
            }
            <hr class="opacity-10 mx-[-1.5rem]" [class.text-white]="isDark()">
            <button cButton color="dark" class="py-2 opacity-75 border-0 bg-transparent" [class.text-white]="isDark()" routerLink="..">
              Retour à la liste
            </button>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class CandidatureDetailComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  private readonly route = inject(ActivatedRoute);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly offersService = inject(OffersService);
  private readonly studentPublicProfileService = inject(StudentPublicProfileService);

  isLoading = true;
  loadError = '';
  application: ApplicationDto | null = null;
  offerTitle = '';
  profile: StudentPublicProfileDto | null = null;
  history: ApplicationStatusHistoryEntryDto[] = [];
  documents: ApplicationDocumentDto[] = [];

  avatarSrc = 'assets/default.jpeg';

  get historySorted(): ApplicationStatusHistoryEntryDto[] {
    return [...this.history].sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );
  }

  get candidateTitle(): string {
    if (this.profile?.display_name) {
      return this.profile.display_name;
    }
    if (this.application) {
      return this.formatStudentName(this.application.student_account_identifier);
    }
    return 'Candidat';
  }

  get candidateSubtitle(): string {
    if (this.application) {
      return this.application.student_account_identifier;
    }
    return '';
  }

  get profileSummary(): string {
    if (!this.profile) {
      return '';
    }
    const parts: string[] = [];
    if (this.profile.study_level_code || this.profile.filiere_code) {
      parts.push([this.profile.study_level_code, this.profile.filiere_code].filter(Boolean).join(' · '));
    }
    if (this.profile.city_code) {
      parts.push(`Ville (code) : ${this.profile.city_code}`);
    }
    if (this.profile.competences?.length) {
      parts.push(
        'Compétences : ' +
          this.profile.competences
            .slice(0, 5)
            .map((c) => c.competence_code)
            .join(', ')
      );
    }
    return parts.join(' · ') || 'Profil étudiant.';
  }

  get statutLabel(): string {
    return this.application ? this.mapStatutLabel(this.application.status_code) : '';
  }

  statusBadgeColor(): string {
    const c = (this.application?.status_code ?? '').toUpperCase();
    if (c === 'APP-ACCEPTED') {
      return 'success';
    }
    if (c === 'APP-REJECTED' || c === 'APP-WITHDRAWN') {
      return 'danger';
    }
    if (c === 'APP-UNDER_REVIEW') {
      return 'info';
    }
    return 'warning';
  }

  get canDecide(): boolean {
    const c = (this.application?.status_code ?? '').toUpperCase();
    return c === 'APP-SUBMITTED' || c === 'APP-UNDER_REVIEW';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading = false;
      this.loadError = 'Identifiant de candidature manquant.';
      return;
    }
    this.load(id);
  }

  private load(applicationIdentifier: string): void {
    this.isLoading = true;
    this.loadError = '';
    forkJoin({
      app: this.applicationsService.getApplication(applicationIdentifier),
      history: this.applicationsService.getApplicationHistory(applicationIdentifier).pipe(catchError(() => of([]))),
      docs: this.applicationsService.listApplicationDocuments(applicationIdentifier).pipe(catchError(() => of([])))
    })
      .pipe(
        catchError(() => {
          this.loadError = 'Impossible de charger cette candidature (droits ou ressource introuvable).';
          return of(null);
        })
      )
      .subscribe((res) => {
        this.isLoading = false;
        if (!res) {
          return;
        }
        this.application = res.app;
        this.history = res.history;
        this.documents = res.docs;
        this.offersService.getOfferDetail(res.app.offer_identifier).subscribe({
          next: (detail) => {
            this.offerTitle = detail.offer.title;
          },
          error: () => {
            this.offerTitle = res.app.offer_identifier;
          }
        });
        const pid = res.app.student_profile_identifier?.trim();
        if (pid) {
          this.studentPublicProfileService.getPublicProfile(pid).subscribe({
            next: (p) => {
              this.profile = p;
            },
            error: () => {
              this.profile = null;
            }
          });
        } else {
          this.profile = null;
        }
      });
  }

  formatDt(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  formatBytes(n: number): string {
    if (n < 1024) {
      return `${n} o`;
    }
    if (n < 1024 * 1024) {
      return `${(n / 1024).toFixed(1)} Ko`;
    }
    return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
  }

  private formatStudentName(accountId: string): string {
    const short = accountId.replace(/^USR-/, '').slice(0, 8);
    return `Étudiant ${short || accountId}`;
  }

  private mapStatutLabel(code: string): string {
    const c = code.toUpperCase();
    if (c === 'APP-ACCEPTED') {
      return 'Accepté';
    }
    if (c === 'APP-REJECTED') {
      return 'Refusé';
    }
    if (c === 'APP-WITHDRAWN') {
      return 'Retiré';
    }
    if (c === 'APP-UNDER_REVIEW') {
      return 'En revue';
    }
    return 'En attente';
  }

  accepter(): void {
    const app = this.application;
    if (!app) {
      return;
    }
    const code = app.status_code.toUpperCase();
    const next = code === 'APP-SUBMITTED' ? 'APP-UNDER_REVIEW' : 'APP-ACCEPTED';
    void Swal.fire({
      title:
        next === 'APP-UNDER_REVIEW'
          ? 'Marquer comme « en revue » ?'
          : 'Accepter définitivement la candidature ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler'
    }).then((r) => {
      if (!r.isConfirmed) {
        return;
      }
      this.applicationsService.changeApplicationStatus(app.application_identifier, next).subscribe({
        next: (updated) => {
          this.application = updated;
          this.reloadHistory(app.application_identifier);
          void Swal.fire({ title: 'Statut mis à jour', icon: 'success' });
        },
        error: () => {
          void Swal.fire({ title: 'Erreur', text: 'Transition non autorisée ou droits insuffisants.', icon: 'error' });
        }
      });
    });
  }

  refuser(): void {
    const app = this.application;
    if (!app) {
      return;
    }
    void Swal.fire({
      title: 'Refuser la candidature ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Refuser',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545'
    }).then((r) => {
      if (!r.isConfirmed) {
        return;
      }
      this.applicationsService.changeApplicationStatus(app.application_identifier, 'APP-REJECTED').subscribe({
        next: (updated) => {
          this.application = updated;
          this.reloadHistory(app.application_identifier);
          void Swal.fire({ title: 'Candidature refusée', icon: 'info' });
        },
        error: () => {
          void Swal.fire({ title: 'Erreur', text: 'Impossible de refuser.', icon: 'error' });
        }
      });
    });
  }

  private reloadHistory(applicationIdentifier: string): void {
    this.applicationsService.getApplicationHistory(applicationIdentifier).subscribe({
      next: (h) => (this.history = h),
      error: () => undefined
    });
  }
}
