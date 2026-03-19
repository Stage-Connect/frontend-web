import { INavData } from '@coreui/angular';

export interface INavProps extends INavData {
  role?: 'entreprise' | 'admin';
}

export const navItems: INavProps[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cilSpeedometer' }
  },
  {
    title: true,
    name: 'Entreprise',
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
    iconComponent: { name: 'cilMagnifyingGlass' },
    role: 'entreprise'
  },
  {
    name: 'Profil entreprise',
    url: '/dashboard/entreprise/profil',
    iconComponent: { name: 'cilBank' },
    role: 'entreprise'
  },
  {
    title: true,
    name: 'Administration',
    role: 'admin'
  },
  {
    name: 'Validations',
    url: '/dashboard/admin/validations',
    iconComponent: { name: 'cilCheckCircle' },
    role: 'admin'
  },
  {
    name: 'Utilisateurs',
    url: '/dashboard/admin/utilisateurs',
    iconComponent: { name: 'cilPeople' },
    role: 'admin'
  },
  {
    name: 'Offres',
    url: '/dashboard/admin/offres',
    iconComponent: { name: 'cilList' },
    role: 'admin'
  },
  {
    name: 'Statistiques',
    url: '/dashboard/admin/stats',
    iconComponent: { name: 'cilChartPie' },
    role: 'admin'
  },
  {
    name: 'Configuration',
    url: '/dashboard/admin/config',
    iconComponent: { name: 'cilSettings' },
    role: 'admin'
  },
  {
    name: 'Logs Système',
    url: '/dashboard/admin/logs',
    iconComponent: { name: 'cilNotes' },
    role: 'admin'
  }
];
