import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ColorModeService } from '@coreui/angular';
import {
  ExternalOffersService,
  ExternalOffer,
  ExternalOffersParams
} from '../../services/external-offers.service';
import { AnalyticsService } from '../../services/analytics.service';

const PLATFORM_LABELS: Record<string, string> = {
  minajobs: 'MinaJobs',
  jobincamer: 'JobinCamer',
  jobartis_cm: 'Jobartis CM',
  indeed_cm: 'Indeed CM',
  emploi_jeune: 'Emploi Jeune',
  jobaas: 'Jobaas',
  emploi_service: 'Emploi Service',
  michael_page: 'Michael Page',
  jobberman: 'Jobberman',
  emploi_cm: 'Emploi.cm',
};

const PLATFORM_COLORS: Record<string, string> = {
  minajobs: '#1a73e8',
  jobincamer: '#e65100',
  jobartis_cm: '#6a1b9a',
  indeed_cm: '#2164f3',
  emploi_jeune: '#00897b',
  jobaas: '#c62828',
  emploi_service: '#37474f',
  michael_page: '#b71c1c',
  jobberman: '#00695c',
  emploi_cm: '#283593',
};

const SECTOR_LABELS: Record<string, string> = {
  'SEC-DIG': 'Informatique / Digital',
  'SEC-TEL': 'Télécoms',
  'SEC-BAN': 'Banque / Finance',
  'SEC-ENE': 'Énergie / Pétrole',
  'SEC-MKT': 'Marketing / Commerce',
  'SEC-HR': 'Ressources Humaines',
  'SEC-EDUC': 'Éducation',
  'SEC-SANTE': 'Santé',
  'SEC-IND': 'Industrie / Logistique',
  'SEC-AGRI': 'Agriculture',
  'SEC-AUTRE': 'Autre',
};

const CITY_LABELS: Record<string, string> = {
  DOUALA: 'Douala',
  YAOUNDE: 'Yaoundé',
  BAFOUSSAM: 'Bafoussam',
  GAROUA: 'Garoua',
  LIMBE: 'Limbé',
  BUEA: 'Buea',
  NGAOUNDERE: 'Ngaoundéré',
  MAROUA: 'Maroua',
  BERTOUA: 'Bertoua',
  EBOLOWA: 'Ebolowa',
};

const TYPE_LABELS: Record<string, string> = {
  REMOTE: 'Télétravail',
  HYBRID: 'Hybride',
  ONSITE: 'Présentiel',
};

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS);
const ALL_SECTORS = Object.keys(SECTOR_LABELS);
const ALL_CITIES = Object.keys(CITY_LABELS);
const ALL_TYPES = Object.keys(TYPE_LABELS);

@Component({
  selector: 'app-external-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="external-offers-page" [class.dark]="isDark()">

      <!-- Header -->
      <div class="eo-header py-5 px-4 text-white text-center"
           style="background: linear-gradient(135deg, #004a99 0%, #0065cc 100%);">
        <h1 class="fw-bold mb-2" style="font-size: 2rem;">Offres Externes</h1>
        <p class="mb-0 opacity-75">
          Offres de stage collectées sur {{ totalSources }} plateformes camerounaises —
          <strong>{{ total() }}</strong> offre{{ total() !== 1 ? 's' : '' }} disponible{{ total() !== 1 ? 's' : '' }}
        </p>
      </div>

      <div class="container py-4">

        <!-- Filters row -->
        <div class="row g-2 mb-4 align-items-end">
          <div class="col-md-4">
            <label class="form-label small fw-bold opacity-75 text-uppercase mb-1">Recherche</label>
            <input type="text" class="form-control" placeholder="Titre, entreprise…"
                   [(ngModel)]="searchText" (input)="onFilterChange()" />
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold opacity-75 text-uppercase mb-1">Plateforme</label>
            <select class="form-select" [(ngModel)]="filterPlatform" (change)="onFilterChange()">
              <option value="">Toutes</option>
              @for (p of allPlatforms; track p) {
                <option [value]="p">{{ platformLabel(p) }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold opacity-75 text-uppercase mb-1">Secteur</label>
            <select class="form-select" [(ngModel)]="filterSector" (change)="onFilterChange()">
              <option value="">Tous</option>
              @for (s of allSectors; track s) {
                <option [value]="s">{{ sectorLabel(s) }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold opacity-75 text-uppercase mb-1">Ville</label>
            <select class="form-select" [(ngModel)]="filterCity" (change)="onFilterChange()">
              <option value="">Toutes</option>
              @for (c of allCities; track c) {
                <option [value]="c">{{ cityLabel(c) }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold opacity-75 text-uppercase mb-1">Type</label>
            <select class="form-select" [(ngModel)]="filterType" (change)="onFilterChange()">
              <option value="">Tous</option>
              @for (t of allTypes; track t) {
                <option [value]="t">{{ typeLabel(t) }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="text-center py-5 opacity-75">
            <div class="spinner-border text-primary mb-3"></div>
            <p>Chargement des offres…</p>
          </div>
        }

        <!-- Error -->
        @else if (error()) {
          <div class="alert alert-warning text-center">
            Impossible de charger les offres externes pour le moment.
          </div>
        }

        <!-- Empty -->
        @else if (offers().length === 0) {
          <div class="text-center py-5 opacity-75">
            <p class="fs-5">Aucune offre externe disponible avec ces filtres.</p>
          </div>
        }

        <!-- Cards grid -->
        @else {
          <div class="row g-3">
            @for (offer of offers(); track offer.identifier) {
              <div class="col-lg-4 col-md-6">
                <div class="eo-card h-100 p-4 rounded shadow-sm"
                     [class.eo-card-dark]="isDark()"
                     style="border: 1px solid rgba(0,0,0,0.07); background: #fff; position: relative;">

                  <!-- Platform badge -->
                  <span class="badge mb-3"
                        [style.background]="platformColor(offer.source_platform)"
                        style="font-size: 0.72rem; padding: 4px 10px; border-radius: 20px;">
                    {{ platformLabel(offer.source_platform) }}
                  </span>

                  <!-- Title -->
                  <h6 class="fw-bold mb-2 lh-base" style="color: #004a99; font-size: 0.97rem;">
                    {{ offer.title }}
                  </h6>

                  <!-- Company & location -->
                  @if (offer.company_name) {
                    <p class="small mb-1 text-muted">
                      <i class="lni lni-briefcase me-1"></i>{{ offer.company_name }}
                    </p>
                  }
                  @if (offer.city_code || offer.raw_location) {
                    <p class="small mb-2 text-muted">
                      <i class="lni lni-map-marker me-1"></i>
                      {{ offer.city_code ? cityLabel(offer.city_code) : offer.raw_location }}
                    </p>
                  }

                  <!-- Tags row -->
                  <div class="d-flex flex-wrap gap-1 mb-3">
                    @if (offer.sector_code) {
                      <span class="badge bg-light text-dark border" style="font-size: 0.68rem;">
                        {{ sectorLabel(offer.sector_code) }}
                      </span>
                    }
                    @if (offer.internship_type) {
                      <span class="badge bg-light text-dark border" style="font-size: 0.68rem;">
                        {{ typeLabel(offer.internship_type) }}
                      </span>
                    }
                    <!-- Confidence badge -->
                    <span class="badge ms-auto"
                          [style.background]="confidenceColor(offer.confidence_score)"
                          style="font-size: 0.68rem; color: #fff;">
                      {{ offer.confidence_score }}% fiabilité
                    </span>
                  </div>

                  <!-- Date -->
                  <p class="small text-muted mb-3" style="font-size: 0.72rem;">
                    Collectée le {{ formatDate(offer.scraped_at) }}
                  </p>

                  <!-- CTA -->
                  <a [href]="offer.source_url" target="_blank" rel="noopener noreferrer"
                     class="btn btn-sm btn-primary w-100 fw-bold"
                     style="background: #004a99; border-color: #004a99;"
                     (click)="trackOfferClick(offer)">
                    Voir l'offre <i class="lni lni-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button class="btn btn-outline-primary btn-sm"
                      [disabled]="currentPage() === 1"
                      (click)="goToPage(currentPage() - 1)">
                &lsaquo; Précédent
              </button>
              <span class="small opacity-75">
                Page {{ currentPage() }} / {{ totalPages() }}
              </span>
              <button class="btn btn-outline-primary btn-sm"
                      [disabled]="currentPage() === totalPages()"
                      (click)="goToPage(currentPage() + 1)">
                Suivant &rsaquo;
              </button>
            </div>
          }
        }

      </div>
    </div>
  `,
  styles: [`
    .eo-card:hover { box-shadow: 0 4px 20px rgba(0,74,153,0.15) !important; transform: translateY(-2px); transition: all 0.2s; }
    .eo-card-dark { background: #1e2a3a !important; border-color: rgba(255,255,255,0.1) !important; }
    .eo-card-dark h6 { color: #7eb3ff !important; }
    .eo-card-dark .text-muted { color: #aaa !important; }
    .dark .form-control, .dark .form-select { background: #1e2a3a; color: #eee; border-color: rgba(255,255,255,0.15); }
  `]
})
export class ExternalOffersComponent implements OnInit {
  readonly #service = inject(ExternalOffersService);
  readonly #colorMode = inject(ColorModeService);
  readonly #analytics = inject(AnalyticsService);

  readonly isDark = computed(() => this.#colorMode.colorMode() === 'dark');

  offers = signal<ExternalOffer[]>([]);
  total = signal(0);
  loading = signal(true);
  error = signal(false);
  currentPage = signal(1);
  readonly pageSize = 20;
  readonly totalSources = ALL_PLATFORMS.length;

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  searchText = '';
  filterPlatform = '';
  filterSector = '';
  filterCity = '';
  filterType = '';

  readonly allPlatforms = ALL_PLATFORMS;
  readonly allSectors = ALL_SECTORS;
  readonly allCities = ALL_CITIES;
  readonly allTypes = ALL_TYPES;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.load();
  }

  onFilterChange(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.#analytics.trackEvent('external_offers_filter', {
        search: this.searchText || undefined,
        platform: this.filterPlatform || undefined,
        sector: this.filterSector || undefined,
        city: this.filterCity || undefined,
        type: this.filterType || undefined,
      });
      this.load();
    }, 350);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    const params: ExternalOffersParams = {
      page: this.currentPage(),
      page_size: this.pageSize,
    };
    if (this.searchText.trim()) params.search = this.searchText.trim();
    if (this.filterPlatform) params.source_platform = this.filterPlatform;
    if (this.filterSector) params.sector_code = this.filterSector;
    if (this.filterCity) params.city_code = this.filterCity;
    if (this.filterType) params.internship_type = this.filterType;

    this.#service.listExternalOffers(params).subscribe({
      next: (res) => {
        this.offers.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  trackOfferClick(offer: ExternalOffer): void {
    this.#analytics.trackEvent('external_offer_click', {
      offer_identifier: offer.identifier,
      source_platform: offer.source_platform,
      offer_title: offer.title,
      sector_code: offer.sector_code ?? undefined,
      city_code: offer.city_code ?? undefined,
    });
  }

  platformLabel(p: string): string { return PLATFORM_LABELS[p] ?? p; }
  platformColor(p: string): string { return PLATFORM_COLORS[p] ?? '#555'; }
  sectorLabel(s: string): string { return SECTOR_LABELS[s] ?? s; }
  cityLabel(c: string): string { return CITY_LABELS[c] ?? c; }
  typeLabel(t: string): string { return TYPE_LABELS[t] ?? t; }

  confidenceColor(score: number): string {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#e65100';
    return '#c62828';
  }

  formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
    } catch {
      return iso.slice(0, 10);
    }
  }
}
