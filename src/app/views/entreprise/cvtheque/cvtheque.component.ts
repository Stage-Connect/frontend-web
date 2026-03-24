import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ColorModeService,
  AvatarComponent,
  FormDirective,
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
import Swal from 'sweetalert2';

interface CandidateCV {
  id: number;
  name: string;
  avatar: string;
  title: string;
  level: string;
  domain: string;
  city: string;
  skills: string[];
  email: string;
  phone: string;
  Disponibilité: string;
  experience: string;
}

@Component({
  selector: 'app-cvtheque',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
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
                <p class="mb-0 opacity-50 small">{{ filteredCvs.length }} profil(s) disponible(s)</p>
              </div>
              <div class="d-flex gap-2 w-100 w-lg-auto flex-wrap">
                <c-input-group>
                  <span class="input-group-text border-0" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()">
                    <svg cIcon name="cilMagnifyingGlass" [class.text-white]="isDark()"></svg>
                  </span>
                  <input cFormControl placeholder="Nom, compétence..." [(ngModel)]="searchTerm" 
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
                </select>
              </div>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <c-row>
      @for (cv of filteredCvs; track cv.id) {
        <c-col lg="3" md="4" sm="6" class="mb-4">
          <c-card class="h-100 border-0 shadow-sm cv-card" [class.bg-dark]="isDark()" [class.text-white]="isDark()" 
                  style="border-radius: 0.5rem; transition: transform 0.2s;"
                  (mouseenter)="hoveredId = cv.id"
                  (mouseleave)="hoveredId = null">
            <c-card-body class="p-4 text-center d-flex flex-column">
              <div class="mb-3 position-relative d-inline-block mx-auto">
                <c-avatar [src]="cv.avatar" size="xl" class="border shadow-sm" 
                          [class.border-white]="isDark()"
                          [style.transform]="hoveredId === cv.id ? 'scale(1.05)' : 'scale(1)'"
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
                        style="font-size: 0.65rem; padding: 4px 10px;">+{{ cv.skills.length - 3 }}</span>
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
                  <span class="small">{{ selectedCv.Disponibilité }}</span>
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
                <h6 class="fw-bold mb-3 text-uppercase small opacity-50">Expérience</h6>
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

  searchTerm = '';
  domainFilter = '';
  hoveredId: number | null = null;
  showModal = false;
  selectedCv: CandidateCV | null = null;

  cvList: CandidateCV[] = [
    { 
      id: 1, 
      name: 'Jean-Paul Ngan', 
      avatar: 'assets/images/avatars/student-1.png', 
      title: 'Développeur Angular / Node', 
      level: 'Master 1', 
      domain: 'Informatique', 
      city: 'Douala',
      skills: ['Angular', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL'],
      email: 'jeanpaul.ngan@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Immédiate',
      experience: 'Stage de 6 mois chez Orange Cameroon en développement web. Participation au développement d\'applications internes.'
    },
    { 
      id: 2, 
      name: 'Aicha Bella', 
      avatar: 'assets/images/avatars/student-2.png', 
      title: 'Designer UI/UX & Figma', 
      level: 'Licence 3', 
      domain: 'Design', 
      city: 'Yaoundé',
      skills: ['Figma', 'UI Design', 'Adobe XD', 'Photoshop', 'Illustrator'],
      email: 'aicha.bella@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Sous 1 mois',
      experience: 'Freelance designer depuis 2 ans. Création de logos, affiches et interfaces pour PME camerounaises.'
    },
    { 
      id: 3, 
      name: 'Samuel Ebogo', 
      avatar: 'assets/images/avatars/student-3.png', 
      title: 'Data Scientist Junior', 
      level: 'Master 2', 
      domain: 'Data Science', 
      city: 'Douala',
      skills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'TensorFlow'],
      email: 'samuel.ebogo@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Immédiate',
      experience: 'Projet de fin d\'études sur l\'analyse prédictive des ventes. Certification Kaggle en cours.'
    },
    { 
      id: 4, 
      name: 'Marie Ondoa', 
      avatar: 'assets/images/avatars/student-4.png', 
      title: 'Manager Marketing Digital', 
      level: 'Master 1', 
      domain: 'Marketing', 
      city: 'Douala',
      skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Marketing'],
      email: 'marie.ondoa@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Sous 2 semaines',
      experience: 'Chargée de communication digitale chez MTN Cameroon. Gestion de budgets publicitaires de 5M FCFA/mois.'
    },
    { 
      id: 5, 
      name: 'Cédric Tagne', 
      avatar: 'assets/images/avatars/student-1.png', 
      title: 'Analyste Cyber-sécurité', 
      level: 'Licence 3', 
      domain: 'Informatique', 
      city: 'Yaoundé',
      skills: ['OWASP', 'Linux', 'Network Security', 'Penetration Testing', 'Python'],
      email: 'cedric.tagne@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Sous 1 mois',
      experience: 'Participant au CTF national 2025. Stage au MINFI en sécurité des systèmes d\'information.'
    },
    { 
      id: 6, 
      name: 'Esther Kouam', 
      avatar: 'assets/images/avatars/student-2.png', 
      title: 'Audit & Comptabilité', 
      level: 'Master 2', 
      domain: 'Finance', 
      city: 'Douala',
      skills: ['Audit', 'Comptabilité', 'Excel', 'Sage', 'Fiscalité'],
      email: 'esther.kouam@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Immédiate',
      experience: 'Assistante comptable chez un cabinet d\'expertise à Douala. Préparation du DSC (Diplôme Supérieur de Comptabilité).'
    },
    { 
      id: 7, 
      name: 'Boris Nkongo', 
      avatar: 'assets/images/avatars/student-3.png', 
      title: 'Développeur Mobile Flutter', 
      level: 'Master 1', 
      domain: 'Informatique', 
      city: 'Douala',
      skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Bloc'],
      email: 'boris.nkongo@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Sous 2 semaines',
      experience: 'Développeur mobile freelance. Applications publiées sur Google Play Store avec 10K+ téléchargements.'
    },
    { 
      id: 8, 
      name: 'Léa Fotso', 
      avatar: 'assets/images/avatars/student-4.png', 
      title: 'Responsable RH', 
      level: 'Licence 3', 
      domain: 'RH', 
      city: 'Yaoundé',
      skills: ['Recrutement', 'Communication', 'GPEC', ' droit du travail', 'Paie'],
      email: 'lea.fotso@email.com',
      phone: '+237 6XX XXX XXX',
      Disponibilité: 'Sous 1 mois',
      experience: 'Chargée de recrutement dans une ONG internationale. Gestion du processus d\'intégration de 50+ stagiaires/an.'
    }
  ];

  filteredCvs = this.cvList;

  filterCvs(): void {
    this.filteredCvs = this.cvList.filter(cv => {
      const matchesSearch = !this.searchTerm || 
        cv.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cv.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cv.skills.some(s => s.toLowerCase().includes(this.searchTerm.toLowerCase()));
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
      title: 'Contacter ce candidat ?',
      html: `Un email sera envoyé à <strong>${cv.email}</strong> pour lui proposer un entretien.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#004a99',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        void Swal.fire({
          title: 'Email envoyé !',
          text: `Votre message a été envoyé à ${cv.name}.`,
          icon: 'success',
          confirmButtonColor: '#004a99'
        });
        this.showModal = false;
      }
    });
  }
}
