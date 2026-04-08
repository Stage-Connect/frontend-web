import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  ColorModeService,
  ButtonDirective,
  TableDirective
} from '@coreui/angular';
import {
  InstitutionService,
  AcademicSupervisorResponse,
  SupervisorAssignmentResponse,
  CreateAcademicSupervisorRequest,
  UpdateAcademicSupervisorRequest
} from '../../../services/institution.service';

@Component({
  selector: 'app-institution-supervisors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    TableDirective
  ],
  template: `
    <c-row class="g-4">
      <c-col xs="12">
        <c-card class="border-0 shadow-sm" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-header class="py-3 px-4 bg-transparent border-bottom d-flex justify-content-between align-items-center"
            [class.border-white]="isDark()" [class.border-opacity-10]="isDark()">
            <div>
              <h5 class="mb-0 fw-bold">Superviseurs académiques</h5>
              <p class="small mb-0 opacity-75">{{ supervisors.length }} superviseur(s)</p>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <label class="form-check-label small me-1">
                <input type="checkbox" class="form-check-input me-1" [(ngModel)]="showInactive" (ngModelChange)="loadSupervisors()">
                Inactifs
              </label>
              <button cButton color="primary" size="sm" (click)="openCreateModal()">+ Créer</button>
            </div>
          </c-card-header>
          <c-card-body class="p-0">
            @if (loading) {
              <div class="p-4 text-center opacity-75">Chargement…</div>
            } @else if (supervisors.length === 0) {
              <div class="p-4 text-center opacity-75 small">Aucun superviseur.</div>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Nom complet</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Département</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (sv of supervisors; track sv.supervisor_id) {
                      <tr>
                        <td class="small fw-semibold">{{ sv.full_name }}</td>
                        <td class="small">{{ sv.email }}</td>
                        <td class="small">{{ sv.phone_number }}</td>
                        <td class="small">{{ sv.department_name }}</td>
                        <td>
                          <span class="badge" [class.bg-success]="sv.is_active" [class.bg-secondary]="!sv.is_active">
                            {{ sv.is_active ? 'Actif' : 'Inactif' }}
                          </span>
                        </td>
                        <td>
                          <button cButton color="link" size="sm" class="p-0 me-2" (click)="openEditModal(sv)">Modifier</button>
                          <button cButton color="link" size="sm" class="p-0 me-2" (click)="openAssignments(sv)">Assignments</button>
                          @if (sv.is_active) {
                            <button cButton color="link" size="sm" class="p-0 text-danger" (click)="deactivate(sv)">Désactiver</button>
                          }
                        </td>
                      </tr>
                      <!-- Assignments expandables -->
                      @if (selectedSupervisor?.supervisor_id === sv.supervisor_id) {
                        <tr>
                          <td colspan="6" class="p-3" [class.bg-light]="!isDark()"
                            [style.background]="isDark() ? 'rgba(255,255,255,0.04)' : undefined">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                              <span class="small fw-bold">Étudiants assignés à {{ sv.full_name }}</span>
                              <div class="d-flex gap-2">
                                <input class="form-control form-control-sm" style="width:220px"
                                  [(ngModel)]="newStudentId" placeholder="ID étudiant à assigner"
                                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
                                <button cButton color="success" size="sm" [disabled]="assigning || !newStudentId.trim()"
                                  (click)="assignStudent(sv)">
                                  {{ assigning ? '…' : 'Assigner' }}
                                </button>
                              </div>
                            </div>
                            @if (assignments.length === 0) {
                              <p class="small opacity-75 mb-0">Aucun étudiant assigné.</p>
                            } @else {
                              <ul class="list-unstyled mb-0">
                                @for (a of assignments; track a.student_account_id) {
                                  <li class="small d-flex justify-content-between align-items-center mb-1">
                                    <span>{{ a.student_account_id }}
                                      @if (a.assignment_status !== 'ACTIVE') {
                                        <span class="badge bg-secondary ms-1">{{ a.assignment_status }}</span>
                                      }
                                    </span>
                                    <button cButton color="link" size="sm" class="p-0 text-danger"
                                      (click)="unassign(sv, a.student_account_id)">Désassigner</button>
                                  </li>
                                }
                              </ul>
                            }
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Modal création -->
    @if (showCreateModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <div class="modal-header">
              <h5 class="modal-title">Créer un superviseur</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="isDark()" (click)="closeModals()"></button>
            </div>
            <div class="modal-body">
              @if (modalError) {
                <div class="alert alert-danger small" role="alert">{{ modalError }}</div>
              }
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nom complet</label>
                <input class="form-control" [(ngModel)]="createForm.full_name"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input class="form-control" type="email" [(ngModel)]="createForm.email"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Téléphone</label>
                <input class="form-control" [(ngModel)]="createForm.phone_number"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Département</label>
                <input class="form-control" [(ngModel)]="createForm.department_name"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
            </div>
            <div class="modal-footer">
              <button cButton color="secondary" (click)="closeModals()">Annuler</button>
              <button cButton color="primary" [disabled]="submitting" (click)="submitCreate()">
                {{ submitting ? 'Création…' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal édition -->
    @if (showEditModal && editTarget) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <div class="modal-header">
              <h5 class="modal-title">Modifier — {{ editTarget.full_name }}</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="isDark()" (click)="closeModals()"></button>
            </div>
            <div class="modal-body">
              @if (modalError) {
                <div class="alert alert-danger small" role="alert">{{ modalError }}</div>
              }
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nom complet</label>
                <input class="form-control" [(ngModel)]="editForm.full_name"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input class="form-control" type="email" [(ngModel)]="editForm.email"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Téléphone</label>
                <input class="form-control" [(ngModel)]="editForm.phone_number"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Département</label>
                <input class="form-control" [(ngModel)]="editForm.department_name"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
            </div>
            <div class="modal-footer">
              <button cButton color="secondary" (click)="closeModals()">Annuler</button>
              <button cButton color="primary" [disabled]="submitting" (click)="submitEdit()">
                {{ submitting ? 'Sauvegarde…' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class InstitutionSupervisorsComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly svc = inject(InstitutionService);

  supervisors: AcademicSupervisorResponse[] = [];
  loading = true;
  showInactive = false;

  selectedSupervisor: AcademicSupervisorResponse | null = null;
  assignments: SupervisorAssignmentResponse[] = [];
  newStudentId = '';
  assigning = false;

  showCreateModal = false;
  showEditModal = false;
  editTarget: AcademicSupervisorResponse | null = null;
  submitting = false;
  modalError = '';

  createForm: CreateAcademicSupervisorRequest = { full_name: '', email: '', phone_number: '', department_name: '' };
  editForm: UpdateAcademicSupervisorRequest = { full_name: '', email: '', phone_number: '', department_name: '' };

  ngOnInit(): void {
    this.loadSupervisors();
  }

  loadSupervisors(): void {
    this.loading = true;
    this.svc.listSupervisors(this.showInactive).subscribe({
      next: (list) => { this.supervisors = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateModal(): void {
    this.createForm = { full_name: '', email: '', phone_number: '', department_name: '' };
    this.modalError = '';
    this.showCreateModal = true;
  }

  openEditModal(sv: AcademicSupervisorResponse): void {
    this.editTarget = sv;
    this.editForm = { full_name: sv.full_name, email: sv.email, phone_number: sv.phone_number, department_name: sv.department_name };
    this.modalError = '';
    this.showEditModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.editTarget = null;
  }

  submitCreate(): void {
    this.submitting = true;
    this.modalError = '';
    this.svc.createSupervisor(this.createForm).subscribe({
      next: (sv) => {
        this.supervisors = [...this.supervisors, sv];
        this.submitting = false;
        this.showCreateModal = false;
      },
      error: () => {
        this.modalError = 'Impossible de créer le superviseur.';
        this.submitting = false;
      }
    });
  }

  submitEdit(): void {
    if (!this.editTarget) return;
    this.submitting = true;
    this.modalError = '';
    this.svc.updateSupervisor(this.editTarget.supervisor_id, this.editForm).subscribe({
      next: (updated) => {
        const idx = this.supervisors.findIndex(s => s.supervisor_id === updated.supervisor_id);
        if (idx >= 0) this.supervisors[idx] = updated;
        this.submitting = false;
        this.showEditModal = false;
        this.editTarget = null;
      },
      error: () => {
        this.modalError = 'Impossible de modifier le superviseur.';
        this.submitting = false;
      }
    });
  }

  deactivate(sv: AcademicSupervisorResponse): void {
    if (!confirm(`Désactiver ${sv.full_name} ?`)) return;
    this.svc.deactivateSupervisor(sv.supervisor_id).subscribe({
      next: (updated) => {
        const idx = this.supervisors.findIndex(s => s.supervisor_id === sv.supervisor_id);
        if (idx >= 0) this.supervisors[idx] = updated;
      },
      error: () => {}
    });
  }

  openAssignments(sv: AcademicSupervisorResponse): void {
    if (this.selectedSupervisor?.supervisor_id === sv.supervisor_id) {
      this.selectedSupervisor = null;
      return;
    }
    this.selectedSupervisor = sv;
    this.assignments = [];
    this.newStudentId = '';
    this.svc.getSupervisorAssignments(sv.supervisor_id).subscribe({
      next: (list) => { this.assignments = list; },
      error: () => {}
    });
  }

  assignStudent(sv: AcademicSupervisorResponse): void {
    const id = this.newStudentId.trim();
    if (!id) return;
    this.assigning = true;
    this.svc.assignStudentToSupervisor(sv.supervisor_id, { student_account_id: id }).subscribe({
      next: (assignment) => {
        const exists = this.assignments.some(a => a.student_account_id === assignment.student_account_id);
        if (!exists) this.assignments = [...this.assignments, assignment];
        this.newStudentId = '';
        this.assigning = false;
      },
      error: () => { this.assigning = false; }
    });
  }

  unassign(sv: AcademicSupervisorResponse, studentId: string): void {
    this.svc.unassignStudent(sv.supervisor_id, studentId).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(a => a.student_account_id !== studentId);
      },
      error: () => {}
    });
  }
}
