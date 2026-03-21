import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
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
import { OffersService } from '../../../services/offers.service';
import { ReferenceDataService, SelectOption } from '../../../services/reference-data.service';

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
              @if (errorMessage) {
                <div class="alert alert-danger border-0 small py-2 mb-3 shadow-sm">
                  {{ errorMessage }}
                </div>
              }

              <div class="mb-4">
                <label cLabel for="title" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Titre de l'offre</label>
                <input cFormControl id="title" formControlName="title" placeholder="Ex: Développeur Angular Junior" 
                       [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                       class="py-2" />
              </div>
              
              <div class="mb-4">
                <label cLabel for="sectorCode" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Secteur</label>
                <select cSelect id="sectorCode" formControlName="sectorCode" 
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                        class="py-2">
                  <option value="">Sélectionnez un secteur</option>
                  <option *ngFor="let sector of sectorOptions" [value]="sector.code">{{ sector.label }}</option>
                </select>
              </div>

              <div class="mb-4">
                <label cLabel for="internshipTypeCode" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Type de stage</label>
                <select cSelect id="internshipTypeCode" formControlName="internshipTypeCode"
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                        class="py-2">
                  <option value="">Sélectionnez un type</option>
                  <option *ngFor="let type of internshipTypeOptions" [value]="type.code">{{ type.label }}</option>
                </select>
              </div>

              <div class="mb-4">
                <label cLabel for="locationCode" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Localisation</label>
                <select cSelect id="locationCode" formControlName="locationCode" 
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                        class="py-2">
                  <option value="">Sélectionnez un lieu</option>
                  <option *ngFor="let location of locationOptions" [value]="location.code">{{ location.label }}</option>
                </select>
              </div>

              <div class="mb-4">
                <label cLabel for="description" class="form-label small fw-bold opacity-75 text-uppercase" [class.text-white]="isDark()">Description du poste</label>
                <textarea cFormControl id="description" formControlName="description" rows="6" 
                          placeholder="Décrivez les missions et responsabilités..."
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"></textarea>
              </div>

              <div class="d-flex justify-content-end mt-4 pt-3 border-top" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <button cButton color="secondary" variant="ghost" class="me-3" [class.text-white]="isDark()" [class.opacity-50]="isDark()" routerLink="..">Annuler</button>
                <button cButton color="primary" type="submit" [disabled]="offreForm.invalid || isSaving" class="px-4 py-2 shadow-sm">
                  {{ isSaving ? 'Enregistrement...' : submitButtonText }}
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
  isSaving = false;
  errorMessage = '';
  sectorOptions: SelectOption[] = [];
  locationOptions: SelectOption[] = [];
  readonly internshipTypeOptions: SelectOption[] = [
    { code: 'ONSITE', label: 'Présentiel' },
    { code: 'REMOTE', label: 'À distance' },
    { code: 'HYBRID', label: 'Hybride' }
  ];

  get submitButtonText(): string {
    return this.isEdit ? 'Mettre à jour' : 'Publier l\'offre';
  }
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private readonly offersService: OffersService,
    private readonly referenceDataService: ReferenceDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    this.offreForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      sectorCode: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      locationCode: ['', Validators.required],
      internshipTypeCode: ['', Validators.required]
    });

    this.loadReferenceData();

    if (this.isEdit && id) {
      this.offersService.getOfferDetail(id).subscribe({
        next: (response) => {
          this.offreForm.patchValue({
            title: response.offer.title,
            sectorCode: response.offer.sector_code,
            description: response.offer.description,
            locationCode: response.offer.location_code,
            internshipTypeCode: response.offer.internship_type_code
          });
        },
        error: () => {
          this.errorMessage = 'Impossible de charger cette offre depuis le backend.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.offreForm.invalid) {
      this.offreForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = {
      title: this.offreForm.value.title,
      description: this.offreForm.value.description,
      sector_code: this.offreForm.value.sectorCode,
      location_code: this.offreForm.value.locationCode,
      internship_type_code: this.offreForm.value.internshipTypeCode
    };

    const id = this.route.snapshot.paramMap.get('id');
    const request$: Observable<unknown> = this.isEdit && id
      ? this.offersService.updateOffer(id, payload)
      : this.offersService.createOffer(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/dashboard/entreprise/offres']);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Le backend a refusé l’enregistrement de l’offre. Vérifie ton compte, tes permissions et les champs saisis.';
      }
    });
  }

  private loadReferenceData(): void {
    forkJoin({
      sectors: this.referenceDataService.getSectorOptions(),
      locations: this.referenceDataService.getLocationOptions()
    }).subscribe({
      next: ({ sectors, locations }) => {
        this.sectorOptions = sectors.sectors.map((sector) => ({
          code: sector.code,
          label: sector.label
        }));
        this.locationOptions = locations.locations.map((location) => ({
          code: location.code,
          label: location.label
        }));
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les référentiels backend pour le formulaire d’offre.';
      }
    });
  }
}
