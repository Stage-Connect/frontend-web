import { INavData } from '@coreui/angular';

export interface INavProps extends INavData {
  role?: 'entreprise' | 'admin';
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
  }
];
