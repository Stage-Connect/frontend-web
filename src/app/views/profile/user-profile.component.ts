import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import {
  UserProfileService,
  UserProfileCore,
  UserProfileAcademic,
  UserProfileCompetence
} from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import {
  ButtonDirective,
  FormControlDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent,
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormControlDirective,
    ButtonDirective,
  ],
  template: `
    <div class="container-lg">
      <div class="page-header d-print-none mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="page-title">Mon profil</h2>
          </div>
        </div>
      </div>

      <div class="card mb-4 border-0 shadow-sm">
        <div class="card-body">
          <div class="row align-items-center g-3">
            <div class="col-auto">
              <img [src]="currentAvatarUrl" alt="Avatar" class="rounded-circle border shadow-sm" style="width: 72px; height: 72px; object-fit: cover;" />
            </div>
            <div class="col">
              <div class="d-flex flex-wrap align-items-center gap-2">
                <h4 class="mb-0 fw-bold">{{ currentUserLabel }}</h4>
                <span class="badge bg-primary">{{ completionScore?.percentage ?? 0 }}%</span>
              </div>
              <p class="text-muted mb-0">
                Le profil se charge section par section pour éviter l'écran figé.
              </p>
            </div>
            <div class="col-12 col-md-auto">
              <div class="d-flex gap-3 flex-wrap">
                <div class="text-center">
                  <div class="fw-bold">{{ completionScore?.score ?? 0 }}</div>
                  <div class="small text-muted">Champs</div>
                </div>
                <div class="text-center">
                  <div class="fw-bold">{{ competences.length }}</div>
                  <div class="small text-muted">Compétences</div>
                </div>
                <div class="text-center">
                  <div class="fw-bold">{{ academicForm.get('institution_name')?.value || 'N/A' }}</div>
                  <div class="small text-muted">Établissement</div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="completionScore !== null" class="mt-4">
            <div class="d-flex justify-content-between small mb-2">
              <span>Progression du profil</span>
              <span>{{ completionScore.percentage }}%</span>
            </div>
            <div class="progress" style="height: 12px;">
              <div class="progress-bar" [style.width.%]="completionScore.percentage" [ngClass]="getCompletionBarColor()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Erreur</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Success Alert -->
      <div *ngIf="success" class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Succès</strong> {{ success }}
        <button type="button" class="btn-close" (click)="success = ''"></button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div cSpinner color="primary" class="mb-2"></div>
        <p>Chargement des informations de base...</p>
      </div>

      <!-- Profile Forms -->
      <div *ngIf="!isLoading">
        <ul cNav variant="tabs" class="mb-3">
          <li cNavItem>
            <a cNavLink [class.active]="activeTab === 'core'" (click)="activeTab = 'core'">
              Basic Information
            </a>
          </li>
          <li cNavItem>
            <a cNavLink [class.active]="activeTab === 'academic'" (click)="activeTab = 'academic'">
              Academic Information
            </a>
          </li>
        </ul>

        <div class="tab-content">
          <!-- Basic Information Tab -->
          <div *ngIf="activeTab === 'core'" class="tab-pane fade show active">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Basic Information</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="coreForm" (ngSubmit)="submitCore()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>First Name *</label>
                      <input
                        type="text"
                        cFormControl
                        formControlName="first_name"
                        placeholder="Enter your first name"
                      />
                      <div
                        *ngIf="coreForm.get('first_name')?.invalid && coreForm.get('first_name')?.touched"
                        class="invalid-feedback d-block"
                      >
                        First name is required
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>Last Name *</label>
                      <input
                        type="text"
                        cFormControl
                        formControlName="last_name"
                        placeholder="Enter your last name"
                      />
                      <div
                        *ngIf="coreForm.get('last_name')?.invalid && coreForm.get('last_name')?.touched"
                        class="invalid-feedback d-block"
                      >
                        Last name is required
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>City *</label>
                      <input
                        type="text"
                        cFormControl
                        formControlName="city"
                        placeholder="Enter your city"
                      />
                      <div
                        *ngIf="coreForm.get('city')?.invalid && coreForm.get('city')?.touched"
                        class="invalid-feedback d-block"
                      >
                        City is required
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>Education Level</label>
                      <select cFormSelect formControlName="education_level">
                        <option value="">-- Select --</option>
                        <option value="bac">Baccalauréat</option>
                        <option value="l1">Licence 1</option>
                        <option value="l2">Licence 2</option>
                        <option value="l3">Licence 3</option>
                        <option value="m1">Master 1</option>
                        <option value="m2">Master 2</option>
                        <option value="diploma">Diplôme</option>
                      </select>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label cFormLabel>Profile Visibility</label>
                    <select cFormSelect formControlName="visibility_level">
                      <option value="public">Public</option>
                      <option value="limited">Limited (Visible to companies)</option>
                      <option value="private">Private (Only you)</option>
                    </select>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      cButton
                      color="primary"
                      [disabled]="isSubmitting || coreForm.invalid"
                    >
                      <i *ngIf="!isSubmitting" cIcon name="cilSave" class="me-1"></i>
                      <span *ngIf="isSubmitting">
                        <i cIcon name="cilSpinnersAlt" class="me-1"></i>Saving...
                      </span>
                      <span *ngIf="!isSubmitting">Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Academic Information Tab -->
          <div *ngIf="activeTab === 'academic'" class="tab-pane fade show active">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Academic Information</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="academicForm" (ngSubmit)="submitAcademic()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>Institution Name</label>
                      <input
                        type="text"
                        cFormControl
                        formControlName="institution_name"
                        placeholder="Ex: University of Yaoundé"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>Filière (Program)</label>
                      <input
                        type="text"
                        cFormControl
                        formControlName="filiere"
                        placeholder="Ex: Computer Science"
                      />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>Study Level</label>
                      <input
                        type="text"
                        cFormControl
                        formControlName="study_level"
                        placeholder="Ex: Bachelor's, Master's"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label cFormLabel>Expected Graduation Year</label>
                      <input
                        type="number"
                        cFormControl
                        formControlName="year_of_graduation"
                        placeholder="Ex: 2025"
                      />
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      cButton
                      color="primary"
                      [disabled]="isSubmitting"
                    >
                      <i *ngIf="!isSubmitting" cIcon name="cilSave" class="me-1"></i>
                      <span *ngIf="isSubmitting">
                        <i cIcon name="cilSpinnersAlt" class="me-1"></i>Saving...
                      </span>
                      <span *ngIf="!isSubmitting">Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="competences.length" class="card mt-4 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Compétences détectées</h5>
              <span class="badge bg-secondary">{{ competences.length }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <span *ngFor="let competence of competences" class="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle px-3 py-2">
                {{ competence.name }} · {{ competence.mastery_level }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    input[cFormControl].ng-invalid.ng-touched,
    select[cFormSelect].ng-invalid.ng-touched {
      border-color: #dc3545;
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly userProfileService = inject(UserProfileService);
  private readonly alertService = inject(AlertService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  isLoading = false;
  isSubmitting = false;
  error = '';
  success = '';
  activeTab: 'core' | 'academic' = 'core';
  coreLoading = false;
  academicLoading = false;
  completionLoading = false;
  competencesLoading = false;

  coreForm!: FormGroup;
  academicForm!: FormGroup;

  completionScore: { score: number; total: number; percentage: number } | null = null;
  competences: UserProfileCompetence[] = [];

  ngOnInit(): void {
    this.initializeForms();
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.coreForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      city: ['', Validators.required],
      education_level: [''],
      visibility_level: ['public'],
      profile_status: ['']
    });

    this.academicForm = this.fb.group({
      institution_name: [''],
      filiere: [''],
      study_level: [''],
      year_of_graduation: ['']
    });
  }

  private loadProfileData(): void {
    this.error = '';
    this.coreLoading = true;
    this.academicLoading = true;
    this.completionLoading = true;
    this.competencesLoading = true;
    this.isLoading = true;

    this.userProfileService.getMyProfileCore()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.coreLoading = false;
          this.refreshInitialLoadingState();
        })
      )
      .subscribe({
        next: (core) => this.coreForm.patchValue(core),
        error: (error) => {
          console.error('Error loading core profile:', error);
          this.error = 'Impossible de charger les informations de base.';
        }
      });

    this.userProfileService.getMyProfileAcademic()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.academicLoading = false;
          this.refreshInitialLoadingState();
        })
      )
      .subscribe({
        next: (academic) => this.academicForm.patchValue(academic),
        error: (error) => {
          console.error('Error loading academic profile:', error);
          this.error = this.error || 'Impossible de charger les informations académiques.';
        }
      });

    this.userProfileService.getMyProfileCompletionScore()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.completionLoading = false;
        })
      )
      .subscribe({
        next: (completion) => {
          this.completionScore = completion;
        },
        error: (error) => {
          console.error('Error loading completion score:', error);
        }
      });

    this.userProfileService.getMyProfileCompetences()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.competencesLoading = false;
        })
      )
      .subscribe({
        next: (competences) => {
          this.competences = competences;
        },
        error: (error) => {
          console.error('Error loading competences:', error);
        }
      });
  }

  private refreshInitialLoadingState(): void {
    this.isLoading = this.coreLoading || this.academicLoading;
  }

  submitCore(): void {
    if (this.coreForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    this.userProfileService.updateMyProfileCore(this.coreForm.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.success = 'Basic information updated successfully';
          // Reload completion score
          this.userProfileService.getMyProfileCompletionScore()
            .pipe(takeUntil(this.destroy$))
            .subscribe(completion => {
              this.completionScore = completion;
            });
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.error = 'Failed to update your profile';
        }
      });
  }

  submitAcademic(): void {
    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    this.userProfileService.updateMyProfileAcademic(this.academicForm.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.success = 'Academic information updated successfully';
          // Reload completion score
          this.userProfileService.getMyProfileCompletionScore()
            .pipe(takeUntil(this.destroy$))
            .subscribe(completion => {
              this.completionScore = completion;
            });
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.error = 'Failed to update your profile';
        }
      });
  }

  getCompletionBadgeColor(): string {
    const percentage = this.completionScore?.percentage ?? 0;
    if (percentage === 100) return 'bg-success';
    if (percentage >= 75) return 'bg-info';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getCompletionBarColor(): string {
    const percentage = this.completionScore?.percentage ?? 0;
    if (percentage === 100) return 'bg-success';
    if (percentage >= 75) return 'bg-info';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  get currentUserLabel(): string {
    return this.authService.getCurrentUser()?.name || 'Mon profil';
  }

  get currentAvatarUrl(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.avatarUrl || currentUser?.avatar || 'assets/default.jpeg';
  }
}
