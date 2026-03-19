import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./views/landing/landing.component').then(m => m.LandingComponent),
    data: { title: 'Accueil' }
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'dashboard/entreprise',
        canActivate: [RoleGuard],
        data: { role: 'entreprise' },
        children: [
          { 
            path: 'offres', 
            children: [
              { path: '', loadComponent: () => import('./views/entreprise/offres/offres.component').then(m => m.OffresComponent) },
              { path: 'nouveau', loadComponent: () => import('./views/entreprise/offres/offre-form.component').then(m => m.OffreFormComponent) },
              { path: 'modifier/:id', loadComponent: () => import('./views/entreprise/offres/offre-form.component').then(m => m.OffreFormComponent) }
            ]
          },
          { 
            path: 'candidatures', 
            children: [
              { path: '', loadComponent: () => import('./views/entreprise/candidatures/candidatures.component').then(m => m.CandidaturesComponent) },
              { path: ':id', loadComponent: () => import('./views/entreprise/candidatures/candidature-detail.component').then(m => m.CandidatureDetailComponent) }
            ]
          },
          { path: 'cvtheque', loadComponent: () => import('./views/entreprise/cvtheque/cvtheque.component').then(m => m.CVthequeComponent) },
          { path: 'profil', loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      {
        path: 'dashboard/admin',
        canActivate: [RoleGuard],
        data: { role: 'admin' },
        children: [
          { path: 'validations', redirectTo: '/404', pathMatch: 'full' },
          { 
            path: 'utilisateurs',
            children: [
              { path: '', loadComponent: () => import('./views/admin/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent) },
              { path: 'nouveau', loadComponent: () => import('./views/admin/utilisateurs/user-form.component').then(m => m.UserFormComponent) },
              { path: ':id', loadComponent: () => import('./views/admin/utilisateurs/user-form.component').then(m => m.UserFormComponent) }
            ]
          },
          { path: 'offres', redirectTo: '/404', pathMatch: 'full' },
          { path: 'stats', redirectTo: '/404', pathMatch: 'full' },
          { path: 'config', redirectTo: '/404', pathMatch: 'full' },
          { path: 'logs', redirectTo: '/404', pathMatch: 'full' }
        ]
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: { title: 'Page 404' }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: { title: 'Page 500' }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Connexion' }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: { title: 'Inscription' }
  },
  { path: '**', redirectTo: '404' }
];
