import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
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
          { path: 'offres', redirectTo: '/404', pathMatch: 'full' },
          { path: 'candidatures', redirectTo: '/404', pathMatch: 'full' },
          { path: 'cvtheque', redirectTo: '/404', pathMatch: 'full' },
          { path: 'profil', loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      {
        path: 'dashboard/admin',
        canActivate: [RoleGuard],
        data: { role: 'admin' },
        children: [
          { path: 'validations', redirectTo: '/404', pathMatch: 'full' },
          { path: 'utilisateurs', redirectTo: '/404', pathMatch: 'full' },
          { path: 'offres', redirectTo: '/404', pathMatch: 'full' },
          { path: 'stats', redirectTo: '/404', pathMatch: 'full' }
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
