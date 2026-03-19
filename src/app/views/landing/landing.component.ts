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
    // Vidéo de présentation StageConnect
    this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/GPIcVL8QlH4?autoplay=1&mute=1&loop=1&playlist=GPIcVL8QlH4');
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
      text: "StageConnect a littéralement changé mon parcours. Grâce à la plateforme, j'ai décroché un stage dans une banque locale à Douala en 10 jours seulement.",
      name: "Samuel Ngando",
      role: "Étudiant en Informatique (UY1)",
      image: "assets/images/landing/testimonial-student-1.png"
    },
    {
      text: "La simplicité de l'interface et la pertinence des offres sont incroyables. J'ai enfin pu trouver un stage qui correspond à mes études en Marketing.",
      name: "Divine Mbah",
      role: "Étudiante en Communication (UCAC)",
      image: "assets/images/landing/testimonial-student-2.png"
    },
    {
      text: "En tant que chef d'entreprise à Douala, trouver des stagiaires qualifiés était un casse-tête. StageConnect filtre parfaitement les meilleurs profils pour nous.",
      name: "Dr. André Fosso",
      role: "CEO de TechSolutions Cameroon",
      image: "assets/images/landing/testimonial-executive-1.png"
    },
    {
      text: "Une plateforme indispensable pour les DRH au Cameroun. Le matching intelligent nous fait gagner des semaines de recrutement.",
      name: "Mme Hortense Bella",
      role: "Directrice RH - Africa Logistics",
      image: "assets/images/landing/testimonial-executive-2.png"
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
