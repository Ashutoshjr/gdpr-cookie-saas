import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of, catchError } from 'rxjs';
import { WebsiteService } from '../../core/services/website.service';
import { ConsentService } from '../../core/services/consent.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h2>Welcome back, {{ user?.fullName }}!</h2>
      <p class="subtitle">Here's an overview of your cookie consent activity.</p>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon websites"><mat-icon>language</mat-icon></div>
            <div class="stat-value">{{ websiteCount() }}</div>
            <div class="stat-label">Websites</div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/websites">Manage Websites</a>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon consents"><mat-icon>fact_check</mat-icon></div>
            <div class="stat-value">{{ totalConsents() }}</div>
            <div class="stat-label">Total Consents Recorded</div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/consents">View Logs</a>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <a mat-raised-button color="primary" routerLink="/websites/new">
          <mat-icon>add</mat-icon> Add New Website
        </a>
        <a mat-stroked-button routerLink="/consents" style="margin-left:12px">
          <mat-icon>list</mat-icon> View Consent Logs
        </a>
      </div>

      @if (websiteCount() === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">rocket_launch</mat-icon>
            <h3>Get started in minutes</h3>
            <p>Add your first website to get your API key and embed the cookie consent banner.</p>
            <a mat-raised-button color="primary" routerLink="/websites/new">Add Your First Website</a>
          </mat-card-content>
        </mat-card>
      }
    }
  `,
  styles: [`
    .page-header { margin-bottom: 28px; }
    .page-header h2 { margin: 0 0 4px; font-size: 24px; color: #1e293b; }
    .subtitle { margin: 0; color: #64748b; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card mat-card-content { text-align: center; padding: 24px 16px 8px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
    .stat-icon.websites { background: #dbeafe; } .stat-icon.websites mat-icon { color: #2563eb; font-size: 28px; }
    .stat-icon.consents { background: #dcfce7; } .stat-icon.consents mat-icon { color: #16a34a; font-size: 28px; }
    .stat-value { font-size: 40px; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 14px; color: #64748b; margin-top: 4px; }
    .quick-actions { margin-bottom: 32px; } .quick-actions h3 { margin-bottom: 12px; color: #1e293b; }
    .empty-state mat-card-content { text-align: center; padding: 40px 24px; }
    .empty-icon { font-size: 56px; width: 56px; height: 56px; color: #94a3b8; margin-bottom: 12px; }
    .empty-state h3 { margin: 0 0 8px; } .empty-state p { color: #64748b; margin-bottom: 20px; }
  `]
})
export class DashboardComponent implements OnInit {
  private websiteService = inject(WebsiteService);
  private consentService = inject(ConsentService);
  private authService = inject(AuthService);

  loading = signal(true);
  websiteCount = signal(0);
  totalConsents = signal(0);
  user = this.authService.getCurrentUser();

  ngOnInit() {
    this.websiteService.getAll().subscribe({
      next: (sites) => {
        this.websiteCount.set(sites.length);
        if (sites.length > 0) {
          // Sum consents across all websites (first page gives totalCount)
          const requests = sites.map(s =>
            this.consentService.getByWebsite(s.id, 1, 1).pipe(catchError(() => of(null)))
          );
          forkJoin(requests).subscribe(results => {
            const total = results.reduce((sum, r) => sum + (r?.totalCount ?? 0), 0);
            this.totalConsents.set(total);
            this.loading.set(false);
          });
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }
}
