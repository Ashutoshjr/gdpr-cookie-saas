import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ConsentService } from '../../core/services/consent.service';
import { WebsiteService } from '../../core/services/website.service';
import { ConsentModel } from '../../shared/models/consent.model';
import { WebsiteModel } from '../../shared/models/website.model';

@Component({
  selector: 'app-consent-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    MatTableModule, MatSelectModule, MatFormFieldModule, MatPaginatorModule,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule, MatTooltipModule
  ],
  template: `
    <div class="page-header">
      <h2>Consent Logs</h2>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="website-select">
          <mat-label>Filter by Website</mat-label>
          <mat-select [(ngModel)]="selectedWebsiteId" (ngModelChange)="onWebsiteChange()">
            @for (w of websites(); track w.id) {
              <mat-option [value]="w.id">{{ w.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (selectedWebsiteId && totalCount() > 0) {
          <button mat-stroked-button color="primary" (click)="exportCsv()" [disabled]="exporting()">
            <mat-icon>download</mat-icon>
            {{ exporting() ? 'Exporting…' : 'Export CSV' }}
          </button>
        }
      </div>
    </div>

    @if (loadingWebsites()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else if (!selectedWebsiteId) {
      <mat-card class="empty-state">
        <mat-card-content>
          <mat-icon class="empty-icon">filter_list</mat-icon>
          <h3>Select a website</h3>
          <p>Choose a website from the dropdown above to view its consent logs.</p>
        </mat-card-content>
      </mat-card>
    } @else if (loading()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else if (consents().length === 0) {
      <mat-card class="empty-state">
        <mat-card-content>
          <mat-icon class="empty-icon">fact_check</mat-icon>
          <h3>No consent records yet</h3>
          <p>Consent records will appear here once visitors interact with your cookie banner.</p>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="consents()" class="full-width">

          <ng-container matColumnDef="consentGiven">
            <th mat-header-cell *matHeaderCellDef>Decision</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [color]="c.consentGiven ? 'primary' : 'warn'" selected>
                <mat-icon>{{ c.consentGiven ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ c.consentGiven ? 'Accepted' : 'Rejected' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="categories">
            <th mat-header-cell *matHeaderCellDef>Categories</th>
            <td mat-cell *matCellDef="let c">
              <span class="categories-text" [matTooltip]="c.categories">
                {{ formatCategories(c.categories) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="sessionId">
            <th mat-header-cell *matHeaderCellDef>Session ID</th>
            <td mat-cell *matCellDef="let c">
              <code class="session-id">{{ c.sessionId.substring(0, 8) }}…</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Timestamp</th>
            <td mat-cell *matCellDef="let c">{{ c.timestamp | date:'medium' }}</td>
          </ng-container>

          <ng-container matColumnDef="ipAddress">
            <th mat-header-cell *matHeaderCellDef>IP Address</th>
            <td mat-cell *matCellDef="let c">{{ c.ipAddress }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize"
          [pageIndex]="page - 1"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1e293b; }
    .header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .website-select { min-width: 240px; margin-bottom: 0; }
    .header-actions button mat-icon { margin-right: 6px; font-size: 18px; height: 18px; width: 18px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .categories-text { font-size: 12px; color: #475569; max-width: 200px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: help; }
    .session-id { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    mat-chip mat-icon { font-size: 16px; height: 16px; width: 16px; margin-right: 4px; }
    .empty-state mat-card-content { text-align: center; padding: 40px 24px; }
    .empty-icon { font-size: 56px; width: 56px; height: 56px; color: #94a3b8; margin-bottom: 12px; }
    .empty-state h3 { margin: 0 0 8px; } .empty-state p { color: #64748b; margin-bottom: 20px; }
  `]
})
export class ConsentListComponent implements OnInit {
  private consentService = inject(ConsentService);
  private websiteService = inject(WebsiteService);

  loadingWebsites = signal(true);
  loading = signal(false);
  exporting = signal(false);
  websites = signal<WebsiteModel[]>([]);
  consents = signal<ConsentModel[]>([]);
  totalCount = signal(0);

  selectedWebsiteId = '';
  page = 1;
  pageSize = 20;
  columns = ['consentGiven', 'categories', 'sessionId', 'timestamp', 'ipAddress'];

  ngOnInit() {
    this.websiteService.getAll().subscribe({
      next: (sites) => {
        this.websites.set(sites);
        this.loadingWebsites.set(false);
        if (sites.length > 0) {
          this.selectedWebsiteId = sites[0].id;
          this.loadConsents();
        }
      },
      error: () => this.loadingWebsites.set(false)
    });
  }

  onWebsiteChange() {
    this.page = 1;
    this.loadConsents();
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadConsents();
  }

  loadConsents() {
    if (!this.selectedWebsiteId) return;
    this.loading.set(true);
    this.consentService.getByWebsite(this.selectedWebsiteId, this.page, this.pageSize).subscribe({
      next: (result) => {
        this.consents.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  exportCsv() {
    if (!this.selectedWebsiteId) return;
    this.exporting.set(true);
    const websiteName = this.websites().find(w => w.id === this.selectedWebsiteId)?.name ?? 'consent';
    this.consentService.exportCsv(this.selectedWebsiteId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${websiteName.toLowerCase().replace(/\s+/g, '-')}-consent-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false)
    });
  }

  formatCategories(json: string): string {
    try {
      const obj = JSON.parse(json);
      return Object.entries(obj).map(([k, v]) => `${k}: ${v ? 'yes' : 'no'}`).join(', ');
    } catch {
      return json;
    }
  }
}
