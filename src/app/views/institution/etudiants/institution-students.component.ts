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
  InstitutionStudentLinkResponse,
  CreateInstitutionStudentLinkRequest
} from '../../../services/institution.service';

@Component({
  selector: 'app-institution-students',
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
              <h5 class="mb-0 fw-bold">Étudiants rattachés</h5>
              <p class="small mb-0 opacity-75">{{ students.length }} étudiant(s)</p>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <select class="form-select form-select-sm" style="width:auto" [(ngModel)]="statusFilter" (ngModelChange)="loadStudents()"
                [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                <option value="">Tous</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
                <option value="SUSPENDED">Suspendus</option>
              </select>
              <button cButton color="primary" size="sm" (click)="openCreateModal()">+ Lier un étudiant</button>
            </div>
          </c-card-header>
          <c-card-body class="p-0">
            @if (loading) {
              <div class="p-4 text-center opacity-75">Chargement…</div>
            } @else if (students.length === 0) {
              <div class="p-4 text-center opacity-75 small">Aucun étudiant rattaché.</div>
            } @else {
              <div class="table-responsive">
                <table cTable [hover]="true" class="mb-0" [class.table-dark]="isDark()">
                  <thead>
                    <tr>
                      <th>Compte étudiant</th>
                      <th>Filière</th>
                      <th>Statut</th>
                      <th>Effectif le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of students; track s.student_account_id) {
                      <tr>
                        <td class="small fw-semibold">{{ s.student_account_id }}</td>
                        <td class="small">{{ s.filiere_code }}</td>
                        <td>
                          <span class="badge"
                            [class.bg-success]="s.link_status === 'ACTIVE'"
                            [class.bg-secondary]="s.link_status === 'INACTIVE'"
                            [class.bg-danger]="s.link_status === 'SUSPENDED'">
                            {{ s.link_status }}
                          </span>
                        </td>
                        <td class="small">{{ s.effective_at | slice:0:10 }}</td>
                        <td>
                          @if (s.link_status !== 'INACTIVE') {
                            <button cButton color="link" size="sm" class="p-0 me-2"
                              (click)="changeStatus(s, 'INACTIVE')">Désactiver</button>
                          }
                          @if (s.link_status === 'INACTIVE') {
                            <button cButton color="link" size="sm" class="p-0 me-2"
                              (click)="changeStatus(s, 'ACTIVE')">Activer</button>
                          }
                          @if (s.link_status !== 'SUSPENDED') {
                            <button cButton color="link" size="sm" class="p-0 text-danger"
                              (click)="changeStatus(s, 'SUSPENDED')">Suspendre</button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Modal lier étudiant -->
    @if (showCreateModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
            <div class="modal-header">
              <h5 class="modal-title">Lier un étudiant</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="isDark()" (click)="closeModals()"></button>
            </div>
            <div class="modal-body">
              @if (modalError) {
                <div class="alert alert-danger small" role="alert">{{ modalError }}</div>
              }
              <div class="mb-3">
                <label class="form-label small fw-semibold">Identifiant compte étudiant</label>
                <input class="form-control" [(ngModel)]="createForm.student_account_id"
                  placeholder="UUID du compte étudiant"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Code filière</label>
                <input class="form-control" [(ngModel)]="createForm.filiere_code"
                  placeholder="Ex: INFO, GEI, GC…"
                  [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
              </div>
            </div>
            <div class="modal-footer">
              <button cButton color="secondary" (click)="closeModals()">Annuler</button>
              <button cButton color="primary"
                [disabled]="submitting || !createForm.student_account_id || !createForm.filiere_code"
                (click)="submitCreate()">
                {{ submitting ? 'Liaison…' : 'Lier' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class InstitutionStudentsComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly svc = inject(InstitutionService);

  students: InstitutionStudentLinkResponse[] = [];
  loading = true;
  statusFilter = '';

  showCreateModal = false;
  submitting = false;
  modalError = '';

  createForm: CreateInstitutionStudentLinkRequest = {
    student_account_id: '',
    filiere_code: ''
  };

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.svc.listStudentLinks({ status: this.statusFilter || undefined }).subscribe({
      next: (list) => { this.students = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateModal(): void {
    this.createForm = { student_account_id: '', filiere_code: '' };
    this.modalError = '';
    this.showCreateModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    this.submitting = true;
    this.modalError = '';
    this.svc.createStudentLink(this.createForm).subscribe({
      next: (link) => {
        this.students = [...this.students, link];
        this.submitting = false;
        this.showCreateModal = false;
      },
      error: () => {
        this.modalError = 'Impossible de lier l\'étudiant.';
        this.submitting = false;
      }
    });
  }

  changeStatus(s: InstitutionStudentLinkResponse, newStatus: string): void {
    this.svc.updateStudentLinkStatus({ student_account_id: s.student_account_id, next_status: newStatus }).subscribe({
      next: (updated) => {
        const idx = this.students.findIndex(st => st.student_account_id === updated.student_account_id);
        if (idx >= 0) this.students[idx] = updated;
      },
      error: () => {}
    });
  }
}
