import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav #sidenav [mode]="isHandset ? 'over' : 'side'"
                   [opened]="!isHandset" class="shell-sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">cookie</mat-icon>
          <span class="logo-text">CookieConsent</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/websites" routerLinkActive="active-link">
            <mat-icon matListItemIcon>language</mat-icon>
            <span matListItemTitle>Websites</span>
          </a>
          <a mat-list-item routerLink="/consents" routerLinkActive="active-link">
            <mat-icon matListItemIcon>fact_check</mat-icon>
            <span matListItemTitle>Consent Logs</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <div class="user-info" *ngIf="user$ | async as user">
            <mat-icon>account_circle</mat-icon>
            <span>{{ user.fullName }}</span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="shell-toolbar">
          <button mat-icon-button *ngIf="isHandset" (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-toolbar>
        <main class="shell-main">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }
    .shell-sidenav { width: 240px; background: #1e293b; color: #fff; }
    .sidenav-header { display: flex; align-items: center; gap: 10px; padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
    .logo-icon { color: #60a5fa; font-size: 28px; width: 28px; height: 28px; }
    .logo-text { font-size: 18px; font-weight: 700; color: #fff; }
    mat-nav-list a { color: rgba(255,255,255,.8) !important; border-radius: 8px; margin: 2px 8px; }
    mat-nav-list a:hover { background: rgba(255,255,255,.1) !important; }
    mat-nav-list a.active-link { background: rgba(96,165,250,.2) !important; color: #60a5fa !important; }
    mat-nav-list a.active-link mat-icon { color: #60a5fa; }
    mat-nav-list mat-icon { color: rgba(255,255,255,.6); }
    .sidenav-footer { position: absolute; bottom: 0; width: 100%; padding: 8px 0; }
    .user-info { display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: rgba(255,255,255,.7); font-size: 13px; }
    .shell-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-spacer { flex: 1; }
    .shell-main { padding: 24px; max-width: 1200px; margin: 0 auto; }
    @media (max-width: 768px) { .shell-main { padding: 16px; } }
  `]
})
export class ShellComponent {
  private auth = inject(AuthService);
  private bp = inject(BreakpointObserver);

  user$ = this.auth.user$;
  isHandset = false;

  constructor() {
    this.bp.observe(Breakpoints.Handset).pipe(map(r => r.matches))
      .subscribe(v => this.isHandset = v);
  }

  logout() { this.auth.logout(); }
}
