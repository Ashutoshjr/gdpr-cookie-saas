import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'websites',
        loadComponent: () => import('./features/websites/website-list/website-list.component').then(m => m.WebsiteListComponent)
      },
      {
        path: 'websites/new',
        loadComponent: () => import('./features/websites/website-new/website-new.component').then(m => m.WebsiteNewComponent)
      },
      {
        path: 'websites/:id',
        loadComponent: () => import('./features/websites/website-detail/website-detail.component').then(m => m.WebsiteDetailComponent)
      },
      {
        path: 'consents',
        loadComponent: () => import('./features/consents/consent-list.component').then(m => m.ConsentListComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
