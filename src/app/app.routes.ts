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
        path: 'notifications',
        loadChildren: () => import('./views/notifications/routes').then((m) => m.routes)
      },
      {
        path: 'profil',
        loadChildren: () => import('./views/profile/routes').then((m) => m.routes)
      },
      {
        path: 'utilisateurs-list',
        redirectTo: 'dashboard/admin/utilisateurs',
        pathMatch: 'full'
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
              { path: ':id', loadComponent: () => import('./views/entreprise/offres/offre-detail.component').then(m => m.OffreDetailComponent) },
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
          { path: 'utilisateurs', loadComponent: () => import('./views/entreprise/utilisateurs/company-users.component').then(m => m.CompanyUsersComponent) },
          { path: 'profil', loadComponent: () => import('./views/entreprise/profil/company-profile.component').then(m => m.CompanyProfileComponent) },
          { path: 'cvtheque', loadComponent: () => import('./views/entreprise/cvtheque/cvtheque.component').then(m => m.CVthequeComponent) },
          { path: 'messagerie', loadComponent: () => import('./views/entreprise/messagerie/entreprise-messaging.component').then(m => m.EntrepriseMessagingComponent) },
          { path: 'paiements', loadComponent: () => import('./views/entreprise/paiements/entreprise-payments.component').then(m => m.EntreprisePaymentsComponent) },
          { path: 'conventions', loadComponent: () => import('./views/entreprise/conventions/conventions-lookup.component').then(m => m.ConventionsLookupComponent) },
          { path: 'suivi', loadComponent: () => import('./views/entreprise/suivi/internship-followup.component').then(m => m.InternshipFollowupComponent) }
        ]
      },
      {
        path: 'recherche',
        loadComponent: () => import('./views/student/search-offers.component').then(m => m.SearchOffersComponent),
        data: { title: 'Rechercher des stages' }
      },
      {
        path: 'offres/:id',
        loadComponent: () => import('./views/student/offer-detail-public.component').then(m => m.OfferDetailPublicComponent),
        data: { title: 'Détail de l\'offre' }
      },
      {
        path: 'offres-externes',
        loadComponent: () => import('./views/student/external-offers.component').then(m => m.ExternalOffersComponent),
        data: { title: 'Offres Externes — Sites Camerounais' }
      },
      {
        path: 'dashboard/student',
        canActivate: [RoleGuard],
        data: { role: 'student' },
        children: [
          {
            path: 'mes-candidatures',
            loadComponent: () => import('./views/student/student-applications.component').then(m => m.StudentApplicationsComponent),
            data: { title: 'Mes candidatures' }
          },
          { path: '', redirectTo: 'mes-candidatures', pathMatch: 'full' }
        ]
      },
      {
        path: 'dashboard/institution',
        canActivate: [RoleGuard],
        data: { role: 'institution' },
        children: [
          { path: '', redirectTo: 'profil', pathMatch: 'full' },
          { path: 'profil', loadComponent: () => import('./views/institution/profil/institution-profile.component').then(m => m.InstitutionProfileComponent) },
          { path: 'dashboard', loadComponent: () => import('./views/institution/dashboard/institution-dashboard.component').then(m => m.InstitutionDashboardComponent) },
          { path: 'superviseurs', loadComponent: () => import('./views/institution/superviseurs/institution-supervisors.component').then(m => m.InstitutionSupervisorsComponent) },
          { path: 'etudiants', loadComponent: () => import('./views/institution/etudiants/institution-students.component').then(m => m.InstitutionStudentsComponent) },
          { path: 'evaluations', loadComponent: () => import('./views/institution/evaluations/supervisor-evaluations.component').then(m => m.SupervisorEvaluationsComponent), data: { title: 'Évaluations superviseur' } }
        ]
      },
      {
        path: 'dashboard/admin',
        canActivate: [RoleGuard],
        data: { role: 'admin' },
        children: [
          { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
          { 
            path: 'validations', 
            children: [
              { path: '', loadComponent: () => import('./views/admin/validations/company-verification.component').then(m => m.CompanyVerificationComponent) },
              { path: ':identifier', loadComponent: () => import('./views/admin/validations/company-verification-detail.component').then(m => m.CompanyVerificationDetailComponent) }
            ]
          },
          { 
            path: 'reports', 
            children: [
              { path: '', loadComponent: () => import('./views/admin/reports/admin-reports.component').then(m => m.AdminReportsComponent) },
              { path: ':identifier', loadComponent: () => import('./views/admin/reports/report-detail.component').then(m => m.ReportDetailComponent) }
            ]
          },
          { 
            path: 'offres', 
            children: [
              { path: '', loadComponent: () => import('./views/admin/offres/admin-offers.component').then(m => m.AdminOffersComponent) },
              { path: ':identifier', loadComponent: () => import('./views/admin/offres/admin-offer-detail.component').then(m => m.AdminOfferDetailComponent) }
            ]
          },
          { path: 'reference-data', loadComponent: () => import('./views/admin/reference-data/admin-reference-data.component').then(m => m.AdminReferenceDataComponent) },
          { path: 'operations', loadComponent: () => import('./views/admin/operations/admin-ops-kpis.component').then(m => m.AdminOpsKpisComponent) },
          { path: 'matching', loadComponent: () => import('./views/admin/matching/admin-matching.component').then(m => m.AdminMatchingComponent) },
          { 
            path: 'utilisateurs',
            children: [
              { path: '', loadComponent: () => import('./views/admin/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent) },
              { path: 'nouveau', loadComponent: () => import('./views/admin/utilisateurs/user-create.component').then(m => m.UserCreateComponent) },
              { path: ':id', loadComponent: () => import('./views/admin/utilisateurs/user-form.component').then(m => m.UserFormComponent) }
            ]
          }
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
    loadComponent: () => import('./views/pages/register-company/register-company.component').then(m => m.RegisterCompanyComponent),
    data: { title: 'Inscription entreprise' },
    pathMatch: 'full'
  },
  {
    path: 'accept-invitation',
    loadComponent: () => import('./views/pages/accept-invitation/accept-invitation.component').then(m => m.AcceptInvitationComponent),
    data: { title: 'Invitation entreprise' }
  },
  {
    path: 'register-company',
    loadComponent: () => import('./views/pages/register-company/register-company.component').then(m => m.RegisterCompanyComponent),
    data: { title: 'Inscription entreprise' }
  },
  {
    path: 'register-institution',
    loadComponent: () => import('./views/pages/register-institution/register-institution.component').then(m => m.RegisterInstitutionComponent),
    data: { title: 'Inscription établissement' }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./views/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: { title: 'Mot de passe oublié' }
  },
  { path: '**', redirectTo: '404' }
];
