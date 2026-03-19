import { Component, inject, computed } from '@angular/core';
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
  FormSelectDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';

interface CandidateCV {
  id: number;
  name: string;
  avatar: string;
  title: string;
  level: string;
  domain: string;
  skills: string[];
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
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    AvatarComponent,
    FormControlDirective,
    InputGroupComponent,
    FormSelectDirective,
    FormsModule
  ],
  template: `
    <c-row class="mb-4">
      <c-col xs="12">
        <div class="p-4 rounded shadow-sm border-0 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
             [class.bg-dark]="isDark()" [class.text-white]="isDark()"
             [class.bg-white]="!isDark()" 
             style="border-radius: 0.5rem;">
          <div class="flex-grow-1 w-100">
            <h4 class="mb-1 fw-bold">CVthèque</h4>
            <p class="mb-0 opacity-50 small text-uppercase tracking-wider">Trouvez les meilleurs talents pour vos stages</p>
          </div>
          <div class="d-flex gap-2 w-100 w-md-auto">
            <c-input-group>
              <span class="input-group-text border-0" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()">
                <svg cIcon name="cilMagnifyingGlass" [class.text-white]="isDark()"></svg>
              </span>
              <input cFormControl placeholder="Compétence, nom..." class="border-0 py-2" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            </c-input-group>
            <select cSelect class="border-0 py-2 w-auto" [class.bg-light]="!isDark()" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
              <option value="">Tout domaines</option>
              <option value="IT">Informatique</option>
              <option value="MK">Marketing</option>
            </select>
          </div>
        </div>
      </c-col>
    </c-row>

    <c-row>
      <c-col lg="3" md="4" sm="6" *ngFor="let cv of cvList" class="mb-4">
        <c-card class="h-100 border-0 shadow-sm cv-card hvr-lift" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-body class="p-4 text-center d-flex flex-column">
            <div class="mb-3 position-relative d-inline-block mx-auto">
              <c-avatar [src]="cv.avatar" size="xl" class="border shadow-sm" [class.border-white]="isDark()"></c-avatar>
              <div class="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle" style="width: 12px; height: 12px;"></div>
            </div>
            <h5 class="mb-1 fw-bold">{{ cv.name }}</h5>
            <p class="small fw-semibold opacity-75 mb-3" style="color: #f7941e;">{{ cv.title }}</p>
            
            <div class="mb-3 d-flex flex-wrap justify-content-center gap-1">
               <span *ngFor="let skill of cv.skills" class="badge rounded-pill fw-normal" 
                     [style.backgroundColor]="isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,74,153,0.05)'"
                     [style.color]="isDark() ? '#fff' : '#004a99'"
                     style="font-size: 0.65rem; padding: 4px 10px;">{{ skill }}</span>
            </div>

            <div class="mt-auto pt-3">
              <button cButton color="primary" variant="outline" class="w-100 py-2 fw-bold text-uppercase" 
                      style="font-size: 0.75rem; border-width: 2px;"
                      [class.text-white]="isDark()"
                      [routerLink]="['/dashboard/entreprise/candidatures/101']">Voir le profil</button>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class CVthequeComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  cvList: CandidateCV[] = [
    { id: 1, name: 'Jean-Paul Ngan', avatar: 'assets/images/avatars/student-1.png', title: 'Développeur Angular / Node', level: 'Master 1', domain: 'Informatique', skills: ['Angular', 'TypeScript', 'Node.js'] },
    { id: 2, name: 'Aicha Bella', avatar: 'assets/images/avatars/student-2.png', title: 'Designer UI/UX & Figma', level: 'Licence 3', domain: 'Design', skills: ['Figma', 'UI Design', 'Adobe XD'] },
    { id: 3, name: 'Samuel Ebogo', avatar: 'assets/images/avatars/student-3.png', title: 'Data Scientist Junior', level: 'Master 2', domain: 'Data Science', skills: ['Python', 'SQL', 'Pandas'] },
    { id: 4, name: 'Marie Ondoa', avatar: 'assets/images/avatars/student-4.png', title: 'Manager Marketing Digital', level: 'Master 1', domain: 'Marketing', skills: ['SEO', 'Google Ads', 'Facebook'] },
    { id: 5, name: 'Cédric Tagne', avatar: 'assets/images/avatars/student-1.png', title: 'Analyste Cyber-sécurité', level: 'Licence 3', domain: 'Informatique', skills: ['OWASP', 'Linux', 'Network'] },
    { id: 6, name: 'Esther Kouam', avatar: 'assets/images/avatars/student-2.png', title: 'Audit & Comptabilité', level: 'Master 2', domain: 'Finance', skills: ['Audit', 'Comptabilité', 'Excel'] },
    { id: 7, name: 'Boris Nkongo', avatar: 'assets/images/avatars/student-3.png', title: 'Développeur Mobile Flutter', level: 'Master 1', domain: 'Informatique', skills: ['Flutter', 'Dart', 'Firebase'] },
    { id: 8, name: 'Léa Fotso', avatar: 'assets/images/avatars/student-4.png', title: 'Responsable RH', level: 'Licence 3', domain: 'RH', skills: ['Recrutement', 'Communication'] }
  ];
}
