import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  FormControlDirective,
  RowComponent,
  ColorModeService,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { SearchService, SearchOfferItemDto, SearchOffersParams } from '../../services/search.service';
import { ReferenceDataService, SelectOption } from '../../services/reference-data.service';
import { backendLabels } from '../../core/backend-labels';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search-offers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    BadgeComponent,
    ButtonDirective,
    IconDirective,
    FormControlDirective,
    SpinnerComponent
  ],
  template: `
    <div class="py-4 px-3 px-md-4" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="min-height: 100vh;">

      <!-- Hero search bar -->
      <div class="text-center mb-5 pt-2">
        <h2 class="fw-bold mb-2" [class.text-white]="isDark()">Rechercher des stages</h2>
        <p class="opacity-75 mb-4">Trouvez le stage qui correspond à votre profil</p>
        <div class="d-flex gap-2 justify-content-center flex-wrap" style="max-width:680px; margin:0 auto;">
          <input cFormControl [(ngModel)]="query" (ngModelChange)="onQueryChange($event)"
                 placeholder="Titre, mot-clé, compétence..."
                 style="max-width:380px;"
                 [class.bg-dark]="isDark()" [class.text-white]="isDark()" />
          <button cButton color="primary" (click)="search()" [disabled]="isLoading">
            <svg cIcon name="cilSearch" class="me-1"></svg>
            Rechercher
          </button>
        </div>
      </div>

      <c-row class="g-4">
        <!-- Filters sidebar -->
        <c-col lg="3">
          <c-card class="border-0 shadow-sm sticky-top" [class.bg-dark]="isDark()" [class.text-white]="isDark()" style="top:80px; border-radius:0.5rem;">
            <c-card-body class="p-3">
              <h6 class="fw-bold mb-3 text-uppercase small opacity-75">Filtres</h6>

              <div class="mb-3">
                <label class="form-label small fw-semibold" [class.text-white]="isDark()">Secteur</label>
                <select class="form-control" cFormControl [(ngModel)]="filters.sector_code" (ngModelChange)="search()"
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">Tous les secteurs</option>
                  @for (s of sectorOptions; track s.code) {
                    <option [value]="s.code">{{ s.label }}</option>
                  }
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold" [class.text-white]="isDark()">Localisation</label>
                <select class="form-control" cFormControl [(ngModel)]="filters.location_code" (ngModelChange)="search()"
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">Toutes les villes</option>
                  @for (l of locationOptions; track l.code) {
                    <option [value]="l.code">{{ l.label }}</option>
                  }
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold" [class.text-white]="isDark()">Type de stage</label>
                <select class="form-control" cFormControl [(ngModel)]="filters.internship_type_code" (ngModelChange)="search()"
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">Tous les types</option>
                  <option value="ONSITE">Présentiel</option>
                  <option value="REMOTE">À distance</option>
                  <option value="HYBRID">Hybride</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold" [class.text-white]="isDark()">Trier par</label>
                <select class="form-control" cFormControl [(ngModel)]="filters.sort_by" (ngModelChange)="search()"
                        [class.bg-dark]="isDark()" [class.text-white]="isDark()">
                  <option value="">Pertinence</option>
                  <option value="published_at">Date de publication</option>
                  <option value="title">Titre</option>
                </select>
              </div>

              <button cButton color="secondary" size="sm" variant="outline" class="w-100" (click)="resetFilters()">
                Réinitialiser les filtres
              </button>
            </c-card-body>
          </c-card>
        </c-col>

        <!-- Results -->
        <c-col lg="9">
          @if (errorMessage) {
            <div class="alert alert-warning border-0 shadow-sm mb-3">{{ errorMessage }}</div>
          }

          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small opacity-75" [class.text-white]="isDark()">
              @if (!isLoading) {
                {{ total }} offre{{ total !== 1 ? 's' : '' }} trouvée{{ total !== 1 ? 's' : '' }}
              }
            </span>
          </div>

          @if (isLoading) {
            <div class="d-flex justify-content-center py-5">
              <c-spinner color="primary"></c-spinner>
            </div>
          } @else if (!offers.length) {
            <div class="text-center py-5 opacity-75">
              <svg cIcon name="cilSearch" size="3xl" class="mb-3 d-block mx-auto opacity-25"></svg>
              <p class="mb-2">Aucune offre ne correspond à vos critères.</p>
              <button cButton color="primary" size="sm" (click)="resetFilters()">Voir toutes les offres</button>
            </div>
          } @else {
            <c-row class="g-3">
              @for (offer of offers; track offer.offer_identifier) {
                <c-col xs="12">
                  <c-card class="border-0 shadow-sm offer-card h-100"
                          [class.bg-dark]="isDark()" [class.text-white]="isDark()"
                          style="border-radius:0.5rem; cursor:pointer; transition:box-shadow 0.15s;"
                          (click)="viewOffer(offer.offer_identifier)">
                    <c-card-body class="p-4">
                      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div class="flex-grow-1">
                          <h5 class="fw-bold mb-1" [class.text-white]="isDark()">{{ offer.title }}</h5>
                          @if (offer.company_name) {
                            <p class="small opacity-75 mb-2">{{ offer.company_name }}</p>
                          }
                          <div class="d-flex flex-wrap gap-2 mt-2">
                            @if (offer.sector_code) {
                              <c-badge color="primary" shape="rounded-pill">{{ labels.sector(offer.sector_code) }}</c-badge>
                            }
                            @if (offer.location_code) {
                              <c-badge color="secondary" shape="rounded-pill">
                                <svg cIcon name="cilLocationPin" size="sm" class="me-1"></svg>
                                {{ labels.location(offer.location_code) }}
                              </c-badge>
                            }
                            @if (offer.internship_type_code) {
                              <c-badge color="info" shape="rounded-pill">{{ labels.internshipType(offer.internship_type_code) }}</c-badge>
                            }
                          </div>
                        </div>
                        <div class="text-end flex-shrink-0">
                          <div class="small opacity-50 mb-2">{{ offer.published_at | date:'dd/MM/yyyy' }}</div>
                          <button cButton color="primary" size="sm" class="shadow-sm" (click)="viewOffer(offer.offer_identifier); $event.stopPropagation()">
                            Voir l'offre
                          </button>
                        </div>
                      </div>
                    </c-card-body>
                  </c-card>
                </c-col>
              }
            </c-row>

            <!-- Pagination -->
            @if (totalPages > 1) {
              <div class="d-flex justify-content-center gap-2 mt-4">
                <button cButton color="secondary" size="sm" variant="outline" [disabled]="currentPage <= 1" (click)="changePage(currentPage - 1)">
                  <svg cIcon name="cilChevronLeft" size="sm"></svg>
                </button>
                <span class="d-flex align-items-center small px-2 opacity-75">Page {{ currentPage }} / {{ totalPages }}</span>
                <button cButton color="secondary" size="sm" variant="outline" [disabled]="currentPage >= totalPages" (click)="changePage(currentPage + 1)">
                  <svg cIcon name="cilChevronRight" size="sm"></svg>
                </button>
              </div>
            }
          }
        </c-col>
      </c-row>
    </div>
  `,
  styles: [`
    .offer-card:hover { box-shadow: 0 4px 20px rgba(0,74,153,0.15) !important; }
  `]
})
export class SearchOffersComponent implements OnInit {
  readonly labels = backendLabels;
  readonly #colorModeService = inject(ColorModeService);
  readonly #searchService = inject(SearchService);
  readonly #refDataService = inject(ReferenceDataService);
  readonly #router = inject(Router);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly isDark = computed(() => this.colorMode() === 'dark');

  offers: SearchOfferItemDto[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 12;
  isLoading = false;
  errorMessage = '';
  query = '';
  sectorOptions: SelectOption[] = [];
  locationOptions: SelectOption[] = [];

  filters: SearchOffersParams = {
    sector_code: '',
    location_code: '',
    internship_type_code: '',
    sort_by: ''
  };

  private readonly querySubject = new Subject<string>();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  ngOnInit(): void {
    forkJoin({
      sectors: this.#refDataService.getSectorOptions(),
      locations: this.#refDataService.getLocationOptions()
    }).subscribe({
      next: ({ sectors, locations }) => {
        this.sectorOptions = sectors.sectors.map(s => ({ code: s.code, label: s.label }));
        this.locationOptions = locations.locations.map(l => ({ code: l.code, label: l.label }));
      }
    });

    this.querySubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => this.search());

    this.search();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.querySubject.next(value);
  }

  search(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const params: SearchOffersParams = {
      ...this.filters,
      page: this.currentPage,
      page_size: this.pageSize
    };
    if (this.query.trim()) params.q = this.query.trim();

    // Remove empty strings
    Object.keys(params).forEach(k => {
      if ((params as Record<string, unknown>)[k] === '') {
        delete (params as Record<string, unknown>)[k];
      }
    });

    this.#searchService.searchOffers(params).subscribe({
      next: (result) => {
        this.offers = result.items;
        this.total = result.total;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les offres. Vérifiez votre connexion.';
        this.offers = [];
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.query = '';
    this.filters = { sector_code: '', location_code: '', internship_type_code: '', sort_by: '' };
    this.currentPage = 1;
    this.search();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.search();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewOffer(offerIdentifier: string): void {
    this.#router.navigate(['/offres', offerIdentifier]);
  }
}
