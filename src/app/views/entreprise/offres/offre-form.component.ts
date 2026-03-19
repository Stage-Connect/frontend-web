import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  RowComponent,
  TextColorDirective,
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-offre-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormSelectDirective,
    ButtonDirective,
    IconDirective,
    TextColorDirective
  ],
  template: `
    <c-row>
      <c-col lg="8">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <h5 class="mb-0 fw-bold" [class.text-white]="isDark()">{{ isEdit ? 'Modifier' : 'Ajouter' }} une offre de stage</h5>
          </c-card-header>
          <c-card-body class="p-4">
            <form [formGroup]="offreForm" (ngSubmit)="onSubmit()" cForm>
              <div class="mb-4">
                <label cLabel for="titre" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Titre de l'offre</label>
                <input cFormControl id="titre" formControlName="titre" placeholder="Ex: Développeur Angular Junior" 
                       [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                       class="py-2" />
              </div>
              
              <div class="mb-4">
                <label cLabel for="domaine" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Domaine</label>
                <select cSelect id="domaine" formControlName="domaine" 
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                        class="py-2">
                  <option value="">Sélectionnez un domaine</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Marketing">Marketing & Communication</option>
                  <option value="Finance">Finance & Comptabilité</option>
                  <option value="RH">Ressources Humaines</option>
                </select>
              </div>

              <div class="mb-4">
                <label cLabel for="description" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Description du poste</label>
                <textarea cFormControl id="description" formControlName="description" rows="5" 
                          placeholder="Décrivez les missions et responsabilités..."
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-4">
                  <label cLabel for="duree" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Durée (mois)</label>
                  <input cFormControl id="duree" formControlName="duree" type="number" 
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>
                <div class="col-md-6 mb-4">
                  <label cLabel for="dateLimite" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Date limite</label>
                  <input cFormControl id="dateLimite" formControlName="dateLimite" type="date" 
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>
              </div>

              <div class="d-flex justify-content-end mt-4 pt-3 border-top" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <button cButton color="secondary" variant="ghost" class="me-3" [class.text-white]="isDark()" [class.opacity-50]="isDark()" routerLink="..">Annuler</button>
                <button cButton color="primary" type="submit" [disabled]="offreForm.invalid" class="px-4 py-2 shadow-sm">
                  {{ submitButtonText }}
                </button>
              </div>
            </form>
          </c-card-body>
        </c-card>
      </c-col>
      <c-col lg="4">
        <div class="p-4 rounded shadow-sm border mb-4 backdrop-blur" 
             [class.bg-primary]="!isDark()" [class.bg-opacity-10]="true"
             [class.border-primary]="true" [class.border-opacity-10]="true"
             [class.text-primary]="true">
          <h6 class="fw-bold mb-3 d-flex align-items-center"><svg cIcon name="cilInfo" class="me-2"></svg>Conseils pour votre offre</h6>
          <ul class="small mb-0 opacity-75 ps-3">
            <li class="mb-2">Utilisez un titre clair et accrocheur.</li>
            <li class="mb-2">Précisez les technologies et outils utilisés.</li>
            <li class="mb-2">Indiquez si le stage est rémunéré ou non.</li>
            <li>Précisez la localisation (Douala, Yaoundé, etc).</li>
          </ul>
        </div>
      </c-col>
    </c-row>
  `
})
export class OffreFormComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  offreForm!: FormGroup;
  isEdit = false;

  get submitButtonText(): string {
    return this.isEdit ? 'Mettre à jour' : 'Publier l\'offre';
  }
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    this.offreForm = this.fb.group({
      titre: ['', Validators.required],
      domaine: ['', Validators.required],
      description: ['', Validators.required],
      duree: [3, Validators.required],
      dateLimite: ['', Validators.required]
    });

    if (this.isEdit) {
      // Mock loading data
      this.offreForm.patchValue({
        titre: 'Développeur Fullstack Angular/Spring',
        domaine: 'Informatique',
        description: 'Nous recherchons un stagiaire passionné par le développement web...',
        duree: 6,
        dateLimite: '2026-06-30'
      });
    }
  }

  onSubmit(): void {
    if (this.offreForm.valid) {
      console.log('Offre enregistrée:', this.offreForm.value);
      this.router.navigate(['/dashboard/entreprise/offres']);
    }
  }
}
