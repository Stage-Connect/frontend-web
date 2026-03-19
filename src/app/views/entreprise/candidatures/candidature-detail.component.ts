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
            <div class="d-flex align-items-center mb-5">
              <c-avatar size="xl" src="assets/images/avatars/3.jpg" status="success" class="me-4 shadow-sm"></c-avatar>
              <div>
                <h3 class="mb-1 fw-bold">{{ candidate.name }}</h3>
                <p class="opacity-75 mb-2">{{ candidate.email }} | {{ candidate.phone }}</p>
                <c-badge color="warning" shape="rounded-pill" class="px-3 py-2">En attente de revue</c-badge>
              </div>
            </div>

            <div class="mb-5">
              <h6 class="fw-bold text-uppercase small opacity-50 mb-3 tracking-wider" [class.text-white]="isDark()">Résumé du profil</h6>
              <p class="lh-base">
                Étudiant en Master 1 Informatique à l'Université de Yaoundé I. Passionné par le développement d'applications web et mobiles. 
                Recherche un stage de 3 mois pour mettre en pratique mes connaissances en Angular et Spring Boot.
              </p>
            </div>

            <div class="mb-0">
              <h6 class="fw-bold text-uppercase small opacity-50 mb-3 tracking-wider" [class.text-white]="isDark()">Documents téléversés</h6>
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let doc of documents">
                  <div class="p-3 rounded border d-flex align-items-center justify-content-between"
                       [class.bg-white]="isDark()" [class.bg-opacity-10]="isDark()"
                       [class.bg-light]="!isDark()"
                       [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                    <div class="d-flex align-items-center">
                      <div class="p-2 bg-primary bg-opacity-10 rounded me-3 text-primary">
                        <svg cIcon name="cilDescription" size="lg"></svg>
                      </div>
                      <div [class.text-white]="isDark()">
                        <p class="mb-0 fw-semibold small">{{ doc.name }}</p>
                        <p class="mb-0 x-small opacity-50">{{ doc.size }}</p>
                      </div>
                    </div>
                    <button cButton variant="ghost" color="primary" size="sm" class="p-2 rounded-circle shadow-none">
                      <svg cIcon name="cilCloudDownload"></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
      <c-col lg="4">
        <c-card class="mb-4 border-0 shadow-sm overflow-hidden" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
           <c-card-header class="py-3 px-4 bg-primary text-white border-0">
            <h6 class="mb-0 fw-bold">Décision</h6>
          </c-card-header>
          <c-card-body class="p-4 d-grid gap-3">
            <button cButton color="success" class="py-3 fw-bold text-white shadow-sm border-0 d-flex align-items-center justify-content-center">
              <svg cIcon name="cilCheckCircle" class="me-2"></svg>
              Accepter la candidature
            </button>
            <button cButton color="danger" variant="ghost" class="py-3 fw-bold border-0 d-flex align-items-center justify-content-center"
                    [class.text-white]="isDark()">
              <svg cIcon name="cilX" class="me-2"></svg>
              Refuser la candidature
            </button>
            <hr class="opacity-10 mx-[-1.5rem]" [class.text-white]="isDark()">
            <button cButton color="dark" class="py-2 opacity-75 border-0 bg-transparent" [class.text-white]="isDark()" routerLink="..">
              Plus tard
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

  candidate = {
    name: 'Joseph Manga',
    email: 'j.manga@mail.com',
    phone: '+237 677 88 99 00',
    title: 'Étudiant Master I'
  };

  documents = [
    { name: 'Curriculum_Vitae_Manga.pdf', size: '1.2 MB' },
    { name: 'Lettre_de_Motivation.pdf', size: '850 KB' },
    { name: 'Attestation_de_Scolarite.pdf', size: '2.1 MB' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Viewing candidature:', id);
  }
}
