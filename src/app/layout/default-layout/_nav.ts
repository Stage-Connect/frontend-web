import { INavData } from '@coreui/angular';

export interface INavProps extends INavData {
  role?: 'entreprise' | 'admin' | 'student' | 'institution';
}

export const navItems: INavProps[] = [
  {
    name: 'Accueil',
    url: '/dashboard',
    iconComponent: { name: 'cilSpeedometer' }
  },
  {
    title: true,
    name: 'Entreprise',
    role: 'entreprise'
  },
  {
    name: 'Profil entreprise',
    url: '/dashboard/entreprise/profil',
    iconComponent: { name: 'cilBank' },
    role: 'entreprise'
  },
  {
    name: 'Utilisateurs entreprise',
    url: '/dashboard/entreprise/utilisateurs',
    iconComponent: { name: 'cilPeople' },
    role: 'entreprise'
  },
  {
    name: 'Mes offres',
    url: '/dashboard/entreprise/offres',
    iconComponent: { name: 'cilBriefcase' },
    role: 'entreprise'
  },
  {
    name: 'Candidatures',
    url: '/dashboard/entreprise/candidatures',
    iconComponent: { name: 'cilUserFollow' },
    role: 'entreprise'
  },
  {
    name: 'CVthèque',
    url: '/dashboard/entreprise/cvtheque',
    iconComponent: { name: 'cilLibrary' },
    role: 'entreprise'
  },
  {
    name: 'Messagerie',
    url: '/dashboard/entreprise/messagerie',
    iconComponent: { name: 'cilEnvelopeClosed' },
    role: 'entreprise'
  },
  {
    name: 'Paiements',
    url: '/dashboard/entreprise/paiements',
    iconComponent: { name: 'cilDollar' },
    role: 'entreprise'
  },
  {
    name: 'Conventions',
    url: '/dashboard/entreprise/conventions',
    iconComponent: { name: 'cilDescription' },
    role: 'entreprise'
  },
  {
    name: 'Suivi de stages',
    url: '/dashboard/entreprise/suivi',
    iconComponent: { name: 'cilTask' },
    role: 'entreprise'
  },
  {
    title: true,
    name: 'Administration',
    role: 'admin'
  },
  {
    name: 'Validations entreprises',
    url: '/dashboard/admin/validations',
    iconComponent: { name: 'cilCheckCircle' },
    role: 'admin'
  },
  {
    name: 'Signalements',
    url: '/dashboard/admin/reports',
    iconComponent: { name: 'cilWarning' },
    role: 'admin'
  },
  {
    name: 'Modération offres',
    url: '/dashboard/admin/offres',
    iconComponent: { name: 'cilBriefcase' },
    role: 'admin'
  },
  {
    name: 'Comptes utilisateurs',
    url: '/dashboard/admin/utilisateurs',
    iconComponent: { name: 'cilPeople' },
    role: 'admin'
  },
  {
    name: 'Référentiels',
    url: '/dashboard/admin/reference-data',
    iconComponent: { name: 'cilLibrary' },
    role: 'admin'
  },
  {
    name: 'Ops — KPIs',
    url: '/dashboard/admin/operations',
    iconComponent: { name: 'cilChartPie' },
    role: 'admin'
  },
  {
    name: 'Modèle de scoring',
    url: '/dashboard/admin/matching',
    iconComponent: { name: 'cilTask' },
    role: 'admin'
  },
  {
    title: true,
    name: 'Établissement',
    role: 'institution'
  },
  {
    name: 'Profil établissement',
    url: '/dashboard/institution/profil',
    iconComponent: { name: 'cilSchool' },
    role: 'institution'
  },
  {
    name: 'Tableau de bord',
    url: '/dashboard/institution/dashboard',
    iconComponent: { name: 'cilChartPie' },
    role: 'institution'
  },
  {
    name: 'Superviseurs',
    url: '/dashboard/institution/superviseurs',
    iconComponent: { name: 'cilPeople' },
    role: 'institution'
  },
  {
    name: 'Étudiants rattachés',
    url: '/dashboard/institution/etudiants',
    iconComponent: { name: 'cilUser' },
    role: 'institution'
  },
  {
    name: 'Évaluations',
    url: '/dashboard/institution/evaluations',
    iconComponent: { name: 'cilStar' },
    role: 'institution'
  },
  {
    title: true,
    name: 'Espace étudiant',
    role: 'student'
  },
  {
    name: 'Rechercher des stages',
    url: '/recherche',
    iconComponent: { name: 'cilSearch' },
    role: 'student'
  },
  {
    name: 'Offres Externes',
    url: '/offres-externes',
    iconComponent: { name: 'cilGlobeAlt' },
    role: 'student'
  },
  {
    name: 'Mes candidatures',
    url: '/dashboard/student/mes-candidatures',
    iconComponent: { name: 'cilBriefcase' },
    role: 'student'
  },
  {
    name: 'Mon profil',
    url: '/profil',
    iconComponent: { name: 'cilUser' },
    role: 'student'
  }
];
