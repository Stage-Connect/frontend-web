import { Component, HostListener, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LandingComponent implements OnInit {
  isNavOpen = signal(false);
  isSticky = signal(false);
  currentTheme = signal<'light' | 'dark'>('light');
  activeTestimonial = signal(0);
  
  // Typewriter effect
  fullText = "Le pont entre les talents et le monde professionnel";
  typedText = signal("");
  typewriterIndex = 0;
  
  // Safe YouTube URL
  youtubeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // URL YouTube de démonstration (à remplacer par la vôtre)
    this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ');
  }

  navLinks = [
    { label: 'Accueil', id: 'home' },
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'À propos', id: 'about' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'Application', id: 'mobile' },
    { label: 'Témoignages', id: 'testimonials' },
  ];

  testimonialsList = [
    {
      text: "Grâce à StageConnect, j'ai trouvé mon premier stage en finance en moins de deux semaines. La plateforme est intuitive et les offres sont de qualité.",
      name: "Zen Doan",
      role: "Étudiante en Master",
      image: "https://user-images.githubusercontent.com/13468728/234031693-6bbaba7d-632c-4d7d-965f-75a76a549ce2.jpg"
    },
    {
      text: "En tant qu'entrepreneur, recruter des stagiaires compétents était un défi. StageConnect a simplifié tout notre processus de sélection.",
      name: "Jonathan Koletic",
      role: "Fondateur de Treymont",
      image: "https://user-images.githubusercontent.com/13468728/234031617-2dfb19ea-01d0-4370-b63b-bb6bdfb4f78e.jpg"
    },
    {
      text: "Une expérience utilisateur exceptionnelle. Les outils de matching sont vraiment performants et nous font gagner un temps précieux.",
      name: "Charlie Green",
      role: "Consultant RH",
      image: "https://user-images.githubusercontent.com/13468728/234031646-10533999-39e5-4c7b-ab54-d0299b13ce74.jpg"
    },
    {
      text: "La meilleure plateforme au Cameroun pour connecter les talents aux entreprises. Je recommande vivement à tous les étudiants.",
      name: "Sarah Dam",
      role: "Chef de projet Digital",
      image: "https://github.com/ecemgo/ecemgo/assets/13468728/55116c98-5f9a-4b0a-9fdb-4911b52d5ef3"
    }
  ];

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

  setTestimonial(index: number) {
    this.activeTestimonial.set(index);
  }

  downloadApk() {
    window.location.href = 'assets/app/stage-connect.apk';
  }
}
