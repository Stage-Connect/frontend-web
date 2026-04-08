import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ColorModeService,
  AvatarComponent,
  FormControlDirective,
  InputGroupComponent,
  BadgeComponent,
  FormSelectDirective,
  ModalComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CompanyProfileService } from '../../../services/company-profile.service';
import { ApplicationsService } from '../../../services/applications.service';
import { StudentPublicProfileDto, StudentPublicProfileService } from '../../../services/student-public-profile.service';

interface CandidateCV {
  profileIdentifier: string;
  name: string;
  avatar: string;
  title: string;
  level: string;
  domain: string;
  city: string;
  skills: string[];
  email: string;
  phone: string;
  disponibilite: string;
  experience: string;
}

@Component({
  selector: 'app-cvtheque',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    BadgeComponent,
    IconDirective,
    TextColorDirective,
    AvatarComponent,
    FormControlDirective,
    InputGroupComponent,
    FormSelectDirective,
    FormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-body class="p-4">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
              <div>
                <h4 class="mb-1 fw-bold">CVthèque</h4>
                <p class="mb-0 opacity-50 small">
                  @if (loadError()) {
                    <span class="text-danger">{{ loadError() }}</span>
                  } @else {
                    {{ filteredCvs.length }} profil(s) issu(s) de vos candidatures
                  }
                </p>
              </div>
              <div class="d-flex gap-2 w-100 w-lg-auto flex-wrap">
                <c-input-group>
                  <span class="input-group-text border-0" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()">
                    <svg cIcon name="cilMagnifyingGlass" [class.text-white]="isDark()"></svg>
                  </span>
                  <input cFormControl placeholder="Nom, compétence, tag..." [(ngModel)]="searchTerm"
                         class="border-0 py-2" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()"
                         [class.text-white]="isDark()" (ngModelChange)="filterCvs()">
                </c-input-group>
                <select cSelect class="border-0 py-2 w-auto" [(ngModel)]="domainFilter"
                        [class.bg-light]="!isDark()" [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                        (ngModelChange)="filterCvs()">
                  <option value="">Tous domaines</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                  <option value="RH">RH</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    @if (isLoading()) {
      <div class="text-center py-5 opacity-75">Chargement des profils…</div>
    } @else if (!loadError() && filteredCvs.length === 0) {
      <div class="text-center py-5 opacity-75">
        <p class="mb-0">Aucun profil public pour l’instant. Les étudiants apparaissent ici lorsqu’ils ont candidaté chez vous et que leur visibilité le permet.</p>
      </div>
    } @else {
      <c-row>
        @for (cv of filteredCvs; track cv.profileIdentifier) {
          <c-col lg="3" md="4" sm="6" class="mb-4">
            <c-card class="h-100 border-0 shadow-sm cv-card" [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                    style="border-radius: 0.5rem; transition: transform 0.2s;"
                    (mouseenter)="hoveredId = cv.profileIdentifier"
                    (mouseleave)="hoveredId = null">
              <c-card-body class="p-4 text-center d-flex flex-column">
                <div class="mb-3 position-relative d-inline-block mx-auto">
                  <c-avatar [src]="cv.avatar" size="xl" class="border shadow-sm"
                            [class.border-white]="isDark()"
                            [style.transform]="hoveredId === cv.profileIdentifier ? 'scale(1.05)' : 'scale(1)'"
                            style="transition: transform 0.2s;"></c-avatar>
                  <div class="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle"
                       style="width: 12px; height: 12px;"></div>
                </div>

                <h5 class="mb-1 fw-bold">{{ cv.name }}</h5>
                <p class="small fw-semibold mb-1" style="color: #f7941e;">{{ cv.title }}</p>
                <p class="small opacity-75 mb-2">{{ cv.level }} · {{ cv.city }}</p>

                <div class="mb-3 d-flex flex-wrap justify-content-center gap-1">
                  @for (skill of cv.skills.slice(0, 3); track skill) {
                    <span class="badge rounded-pill fw-normal"
                          [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,74,153,0.05)'"
                          [style.color]="isDark() ? '#fff' : '#004a99'"
                          style="font-size: 0.65rem; padding: 4px 10px;">{{ skill }}</span>
                  }
                  @if (cv.skills.length > 3) {
                    <span class="badge rounded-pill fw-normal"
                          [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,74,153,0.1)'"
                          [style.fontSize]="'0.65rem'"
                          style="padding: 4px 10px;">+{{ cv.skills.length - 3 }}</span>
                  }
                </div>

                <div class="mt-auto pt-3">
                  <button cButton color="primary" variant="outline" class="w-100 py-2 fw-bold text-uppercase"
                          style="font-size: 0.75rem; border-width: 2px;"
                          [class.text-white]="isDark()"
                          (click)="openCvModal(cv)">
                    <svg cIcon name="cilDescription" class="me-2"></svg>
                    Voir le profil
                  </button>
                </div>
              </c-card-body>
            </c-card>
          </c-col>
        }
      </c-row>
    }

    <c-modal [visible]="showModal" (visibleChange)="showModal = $event" size="lg">
      @if (selectedCv) {
        <c-modal-header [class.bg-dark]="isDark()">
          <h5 cModalTitle class="fw-bold">Profil de {{ selectedCv.name }}</h5>
          <button cButtonClose (click)="showModal = false"></button>
        </c-modal-header>
        <c-modal-body class="p-4">
          <c-row>
            <c-col md="4" class="text-center mb-4 mb-md-0">
              <c-avatar [src]="selectedCv.avatar" size="xl" class="mb-3 border shadow-sm"></c-avatar>
              <h5 class="fw-bold mb-1">{{ selectedCv.name }}</h5>
              <p class="small fw-semibold mb-2" style="color: #f7941e;">{{ selectedCv.title }}</p>
              <p class="small opacity-75 mb-3">{{ selectedCv.level }}</p>

              <div class="d-flex flex-column gap-2 text-start">
                <div class="d-flex align-items-center gap-2">
                  <svg cIcon name="cil-envelope-open" size="sm"></svg>
                  <span class="small">{{ selectedCv.email }}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <svg cIcon name="cil-phone" size="sm"></svg>
                  <span class="small">{{ selectedCv.phone }}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <svg cIcon name="cil-location-pin" size="sm"></svg>
                  <span class="small">{{ selectedCv.city }}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <svg cIcon name="cil-calendar-check" size="sm"></svg>
                  <span class="small">{{ selectedCv.disponibilite }}</span>
                </div>
              </div>
            </c-col>

            <c-col md="8">
              <div class="mb-4">
                <h6 class="fw-bold mb-3 text-uppercase small opacity-50">Compétences</h6>
                <div class="d-flex flex-wrap gap-2">
                  @for (skill of selectedCv.skills; track skill) {
                    <span class="badge rounded-pill"
                          [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,74,153,0.1)'"
                          [style.color]="isDark() ? '#fff' : '#004a99'"
                          style="font-size: 0.8rem; padding: 6px 14px;">{{ skill }}</span>
                  }
                </div>
              </div>

              <div class="mb-4">
                <h6 class="fw-bold mb-3 text-uppercase small opacity-50">Résumé</h6>
                <div class="p-3 rounded" [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,74,153,0.05)'">
                  {{ selectedCv.experience }}
                </div>
              </div>

              <div class="mb-4">
                <h6 class="fw-bold mb-3 text-uppercase small opacity-50">Domaine</h6>
                <c-badge color="primary" shape="rounded-pill">{{ selectedCv.domain }}</c-badge>
              </div>
            </c-col>
          </c-row>
        </c-modal-body>
        <c-modal-footer>
          <button cButton color="secondary" variant="outline" (click)="showModal = false">Fermer</button>
          <button cButton color="primary" (click)="contacterCandidat(selectedCv)">
            <svg cIcon name="cil-paper-plane" class="me-2"></svg>
            Contacter
          </button>
        </c-modal-footer>
      }
    </c-modal>
  `
})
export class CVthequeComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  private readonly companyProfileService = inject(CompanyProfileService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly studentPublicProfileService = inject(StudentPublicProfileService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');

  searchTerm = '';
  domainFilter = '';
  hoveredId: string | null = null;
  showModal = false;
  selectedCv: CandidateCV | null = null;

  cvList: CandidateCV[] = [];
  filteredCvs: CandidateCV[] = [];

  constructor() {
    this.companyProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.applicationsService.getCompanyDashboard(profile.company_identifier).subscribe({
          next: (dashboard) => {
            const ids = new Map<string, string>();
            for (const app of dashboard.applications) {
              const pid = app.student_profile_identifier?.trim();
              if (pid) {
                ids.set(pid, pid);
              }
            }
            const unique = [...ids.keys()];
            if (unique.length === 0) {
              this.isLoading.set(false);
              this.cvList = [];
              this.filteredCvs = [];
              return;
            }
            forkJoin(
              unique.map((pid) =>
                this.studentPublicProfileService.getPublicProfile(pid).pipe(catchError(() => of(null)))
              )
            ).subscribe({
              next: (profiles) => {
                const rows: CandidateCV[] = [];
                for (const p of profiles) {
                  if (p) {
                    rows.push(this.mapProfile(p));
                  }
                }
                this.cvList = rows;
                this.filterCvs();
                this.isLoading.set(false);
              },
              error: () => {
                this.loadError.set('Impossible de charger les profils publics.');
                this.isLoading.set(false);
              }
            });
          },
          error: () => {
            this.loadError.set('Impossible de charger les candidatures.');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Profil entreprise introuvable.');
      }
    });
  }

  private mapProfile(p: StudentPublicProfileDto): CandidateCV {
    const skills = [
      ...p.tags,
      ...p.competences.slice(0, 8).map((c) => c.competence_code)
    ];
    return {
      profileIdentifier: p.profile_identifier,
      name: p.display_name,
      avatar: 'assets/default.jpeg',
      title: p.filiere_code ?? 'Profil étudiant',
      level: p.study_level_code ?? p.education_level_code,
      domain: this.guessDomain(p),
      city: p.city_code,
      skills: skills.length ? skills : ['—'],
      email: '(voir messagerie — contact après mise en relation)',
      phone: '—',
      disponibilite: p.profile_status === 'COMPLETED' ? 'Profil complété' : 'Profil en cours',
      experience:
        `Visibilité : ${p.visibility_level}. Complétion : ${p.completion_percentage ?? '—'} %. ` +
        `Mis à jour : ${this.formatDate(p.updated_at)}.`
    };
  }

  private guessDomain(p: StudentPublicProfileDto): string {
    const f = (p.filiere_code ?? '').toLowerCase();
    if (f.includes('info') || f.includes('dev')) {
      return 'Informatique';
    }
    if (f.includes('market') || f.includes('comm')) {
      return 'Marketing';
    }
    if (f.includes('fin') || f.includes('compta')) {
      return 'Finance';
    }
    if (f.includes('design')) {
      return 'Design';
    }
    if (f.includes('data')) {
      return 'Data Science';
    }
    if (f.includes('rh') || f.includes('humain')) {
      return 'RH';
    }
    return 'Autre';
  }

  private formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  filterCvs(): void {
    this.filteredCvs = this.cvList.filter((cv) => {
      const q = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        cv.name.toLowerCase().includes(q) ||
        cv.title.toLowerCase().includes(q) ||
        cv.skills.some((s) => s.toLowerCase().includes(q));
      const matchesDomain = !this.domainFilter || cv.domain === this.domainFilter;
      return matchesSearch && matchesDomain;
    });
  }

  openCvModal(cv: CandidateCV): void {
    this.selectedCv = cv;
    this.showModal = true;
  }

  contacterCandidat(cv: CandidateCV): void {
    void Swal.fire({
      title: 'Messagerie',
      html: `Les coordonnées directes ne sont pas exposées ici. Utilisez la <strong>messagerie</strong> de la plateforme (module dédié) pour contacter <strong>${cv.name}</strong> après mise en relation.`,
      icon: 'info',
      confirmButtonColor: '#004a99'
    });
    this.showModal = false;
  }
}
