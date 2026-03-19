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
  ColorModeService,
  AvatarComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    ButtonDirective,
    IconDirective,
    TextColorDirective,
    AvatarComponent
  ],
  template: `
    <c-row>
      <c-col lg="8" class="mx-auto">
        <c-card class="mb-4 border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="border-radius: 0.5rem;">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex align-items-center" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
             <button cButton variant="ghost" [class.text-white]="isDark()" routerLink=".." class="me-3 p-0 border-0">
               <svg cIcon name="cilArrowLeft"></svg>
            </button>
            <h5 class="mb-0 fw-bold">{{ isEdit ? 'Modifier' : 'Ajouter' }} un utilisateur</h5>
          </c-card-header>
          <c-card-body class="p-4">
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" cForm>
              <div class="row g-4">
                <!-- Profile Picture Section -->
                <div class="col-12 text-center mb-3">
                  <div class="position-relative d-inline-block">
                    <c-avatar [src]="avatarPreview || (isDark() ? 'assets/images/avatars/8.jpg' : 'assets/images/avatars/8.jpg')" 
                              size="xl" class="border shadow-sm mb-2" [class.border-white]="isDark()"></c-avatar>
                    <button type="button" class="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle p-1 shadow-sm border-2 border-white">
                      <svg cIcon name="cilPencil" size="sm" class="text-white"></svg>
                    </button>
                  </div>
                  <p class="small opacity-50 mt-1">Photo de profil</p>
                </div>

                 <div class="col-md-12">
                  <label cLabel for="name" class="form-label small fw-bold opacity-75 text-uppercase">Nom complet</label>
                  <input cFormControl id="name" formControlName="name" placeholder="Ex: Jean-Paul Ngan" 
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>
                
                <div class="col-md-6">
                  <label cLabel for="email" class="form-label small fw-bold opacity-75 text-uppercase">Email</label>
                  <input cFormControl id="email" formControlName="email" type="email" placeholder="email@exemple.com" 
                         [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                         class="py-2" />
                </div>

                <div class="col-md-6">
                  <label cLabel for="role" class="form-label small fw-bold opacity-75 text-uppercase">Rôle</label>
                  <select cSelect id="role" formControlName="role" 
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                          class="py-2">
                    <option value="etudiant">Étudiant</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                @if (!isEdit) {
                  <div class="col-md-6">
                    <label cLabel for="password" class="form-label small fw-bold opacity-75 text-uppercase">Mot de passe</label>
                    <input cFormControl id="password" formControlName="password" type="password" placeholder="••••••••" 
                           [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                           class="py-2" />
                  </div>
                }

                 <div class="col-md-6">
                  <label cLabel for="status" class="form-label small fw-bold opacity-75 text-uppercase">Statut</label>
                  <select cSelect id="status" formControlName="status" 
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()"
                          class="py-2">
                    <option value="Actif">Actif</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Vérification">En vérification</option>
                  </select>
                </div>
              </div>

              <div class="d-flex justify-content-end mt-5 pt-3 border-top" [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
                <button cButton color="secondary" variant="ghost" class="me-3" [class.text-white]="isDark()" routerLink="..">Annuler</button>
                <button cButton color="primary" type="submit" [disabled]="userForm.invalid" class="px-5 py-2 shadow-sm fw-bold">
                  {{ isEdit ? 'Mettre à jour' : 'Créer l’utilisateur' }}
                </button>
              </div>
            </form>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class UserFormComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');
  avatarPreview: string | null = null;

  userForm!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['etudiant', Validators.required],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      status: ['Actif', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      // Load user data simulation
      this.userForm.patchValue({
        name: 'Utilisateur Existant',
        email: 'user@mail.com',
        role: 'entreprise',
        status: 'Actif'
      });
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log('User data saved:', this.userForm.value);
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }
}
