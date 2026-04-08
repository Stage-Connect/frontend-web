import { Component, HostListener, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { SearchOfferItemDto, SearchService } from '../../services/search.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LandingComponent implements OnInit {
  private readonly searchService = inject(SearchService);

  isNavOpen = signal(false);
  isSticky = signal(false);
  currentTheme = signal<'light' | 'dark'>('light');
  landingOffersLoading = signal(true);
  landingOffersError = signal<string | null>(null);
  landingOffers = signal<SearchOfferItemDto[]>([]);
  
  // Typewriter effect
  fullText = "Le pont entre les talents et le monde professionnel";
  typedText = signal("");
  typewriterIndex = 0;
  
  // Safe YouTube URL
  youtubeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // Vidéo de présentation StageConnect
    this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/GPIcVL8QlH4?autoplay=1&mute=1&loop=1&playlist=GPIcVL8QlH4');
  }

  navLinks = [
    { label: 'Accueil', id: 'home' },
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'Offres', id: 'offers' },
    { label: 'Témoignages', id: 'testimonials' },
    { label: 'À propos', id: 'about' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'Application', id: 'mobile' },
  ];

  activeTestimonial = signal(0);

  testimonialsList = [
    {
      name: 'Jean-Pierre Kamga',
      role: 'DRH — MTN Cameroun',
      avatar: 'JK',
      text: 'StageConnect a transformé notre façon de recruter des stagiaires. En moins de deux semaines nous avons reçu plus de 40 candidatures qualifiées. La qualité des profils proposés par le système de matching dépasse nos attentes.',
      stars: 5,
    },
    {
      name: 'Christelle Mbarga',
      role: 'Responsable RH — Afriland First Bank',
      avatar: 'CM',
      text: 'Nous avons trouvé notre stagiaire développeur en 4 jours grâce au matching intelligent. Le tableau de bord de suivi des candidatures est très intuitif et a vraiment simplifié notre processus de recrutement.',
      stars: 5,
    },
    {
      name: 'Alain Nkotto',
      role: 'Étudiant ENSP Yaoundé — Génie Informatique',
      avatar: 'AN',
      text: 'J\'ai décroché mon stage de fin d\'étude chez Orange Cameroun grâce à StageConnect. La plateforme m\'a permis de postuler à plusieurs entreprises en quelques clics et de suivre l\'état de mes candidatures en temps réel.',
      stars: 5,
    },
    {
      name: 'Marie-Claire Essomba',
      role: 'Directrice — Cabinet RH ProTalents',
      avatar: 'ME',
      text: 'StageConnect comble un vide réel sur le marché camerounais. Nos clients entreprises trouvent des stagiaires compétents beaucoup plus rapidement qu\'avant. La vérification des profils étudiants est un vrai plus.',
      stars: 5,
    },
    {
      name: 'Boris Talla',
      role: 'Étudiant ESSEC Douala — Finance',
      avatar: 'BT',
      text: 'La recherche d\'offres géolocalisée m\'a permis de trouver un stage à Douala correspondant exactement à mon profil en finance. L\'application mobile est très pratique pour gérer mes candidatures partout.',
      stars: 4,
    },
    {
      name: 'Sandrine Ondoua',
      role: 'Chef de Projet — SGBC Cameroun',
      avatar: 'SO',
      text: 'Nous utilisons StageConnect depuis 6 mois. La qualité du matching et la rapidité du processus ont réduit notre temps de recrutement de 60%. Je recommande vivement cette plateforme à toutes les entreprises camerounaises.',
      stars: 5,
    },
    {
      name: 'Kevin Nguele',
      role: 'Étudiant IUT Douala — Génie Civil',
      avatar: 'KN',
      text: 'Grâce à StageConnect j\'ai trouvé un stage au sein d\'Eneo Cameroun. Le système de conventions numériques a facilité toutes les démarches administratives avec mon école. Une plateforme vraiment indispensable.',
      stars: 5,
    },
    {
      name: 'Dr. Francine Ateba',
      role: 'Directrice des Relations Entreprises — Université de Yaoundé I',
      avatar: 'FA',
      text: 'StageConnect a considérablement amélioré notre suivi des étudiants en stage. La gestion numérique des conventions et le reporting en temps réel nous font gagner un temps précieux dans notre administration.',
      stars: 5,
    },
    {
      name: 'Mireille Nguematchoua',
      role: 'RH — Groupe Phoenix',
      avatar: 'MN',
      text: 'La plateforme a rendu notre sélection beaucoup plus rapide. Les candidatures sont mieux qualifiées, et nous passons moins de temps à trier des profils non pertinents.',
      stars: 5,
    },
    {
      name: 'Patrick Talla',
      role: 'Responsable Formation — TechSolutions Cameroon',
      avatar: 'PT',
      text: 'Nous avons récupéré des données propres et exploitables : historique, statut, documents. Le suivi est clair, et nos décisions sont prises plus vite.',
      stars: 5,
    },
    {
      name: 'Sarah Essomba',
      role: 'Étudiante — Communication Digitale',
      avatar: 'SE',
      text: 'J\'ai trouvé un stage en marketing en utilisant la recherche de la plateforme. J\'adore le fait de suivre le statut de ma candidature depuis mon téléphone.',
      stars: 5,
    },
    {
      name: 'Emmanuel Biloa',
      role: 'DRH — LogiWest Africa',
      avatar: 'EB',
      text: 'StageConnect améliore vraiment le matching : les candidats correspondent davantage à nos critères. Le tableau de bord des candidatures est simple et efficace.',
      stars: 4,
    },
  ];

  setTestimonial(index: number): void {
    this.activeTestimonial.set(index);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky.set(window.pageYOffset > 50);
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('landing-theme');
    if (savedTheme === 'dark') {
      this.currentTheme.set('dark');
    }
    this.startTypewriter();
    this.searchService.getLandingOffers().subscribe({
      next: (r) => {
        this.landingOffers.set(r.items);
        this.landingOffersLoading.set(false);
      },
      error: () => {
        this.landingOffersError.set('extraits indisponibles');
        this.landingOffersLoading.set(false);
      }
    });
  }

  startTypewriter() {
    this.typedText.set("");
    this.typewriterIndex = 0;
    const interval = setInterval(() => {
      if (this.typewriterIndex < this.fullText.length) {
        this.typedText.update(text => text + this.fullText.charAt(this.typewriterIndex));
        this.typewriterIndex++;
      } else {
        clearInterval(interval);
      }
    }, 70); // Vitesse de frappe (en ms)
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
    localStorage.setItem('landing-theme', newTheme);
  }

  toggleNav() {
    this.isNavOpen.set(!this.isNavOpen());
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isNavOpen.set(false);
  }

  downloadApk() {
    window.location.href = 'assets/app/stage-connect.apk';
  }

  formatOfferDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }
}
