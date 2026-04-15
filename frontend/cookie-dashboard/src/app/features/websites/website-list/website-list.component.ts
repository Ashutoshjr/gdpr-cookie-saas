import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { WebsiteService } from '../../../core/services/website.service';
import { WebsiteModel } from '../../../shared/models/website.model';

@Component({
  selector: 'app-website-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, MatSnackBarModule, ClipboardModule
  ],
  template: `
    <div class="page-header">
      <h2>Websites</h2>
      <a mat-raised-button color="primary" routerLink="/websites/new">
        <mat-icon>add</mat-icon> Add Website
      </a>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else if (websites().length === 0) {
      <mat-card class="empty-state">
        <mat-card-content>
          <mat-icon class="empty-icon">language</mat-icon>
          <h3>No websites yet</h3>
          <p>Add your first website to get started with cookie consent management.</p>
          <a mat-raised-button color="primary" routerLink="/websites/new">Add Website</a>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="websites()" class="full-width">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let w">
              <strong>{{ w.name }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="domain">
            <th mat-header-cell *matHeaderCellDef>Domain</th>
            <td mat-cell *matCellDef="let w">
              <a [href]="w.domain" target="_blank" class="domain-link">{{ w.domain }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="apiKey">
            <th mat-header-cell *matHeaderCellDef>API Key</th>
            <td mat-cell *matCellDef="let w">
              <div class="api-key-cell">
                <code class="api-key-preview">{{ w.apiKey.substring(0, 8) }}…</code>
                <button mat-icon-button [matTooltip]="'Copy API key'"
                        (click)="copyApiKey(w.apiKey); $event.stopPropagation()">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let w">{{ w.createdAt | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let w">
              <button mat-icon-button [matTooltip]="'View details'" (click)="viewDetail(w.id)">
                <mat-icon>settings</mat-icon>
              </button>
              <button mat-icon-button color="warn" [matTooltip]="'Delete website'" (click)="confirmDelete(w)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="table-row" (click)="viewDetail(row.id)"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1e293b; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .api-key-cell { display: flex; align-items: center; gap: 4px; }
    .api-key-preview { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #475569; }
    .domain-link { color: #1a73e8; text-decoration: none; }
    .domain-link:hover { text-decoration: underline; }
    .table-row { cursor: pointer; transition: background .15s; }
    .table-row:hover { background: #f8fafc; }
    .empty-state mat-card-content { text-align: center; padding: 40px 24px; }
    .empty-icon { font-size: 56px; width: 56px; height: 56px; color: #94a3b8; margin-bottom: 12px; }
    .empty-state h3 { margin: 0 0 8px; } .empty-state p { color: #64748b; margin-bottom: 20px; }
  `]
})
export class WebsiteListComponent implements OnInit {
  private websiteService = inject(WebsiteService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private clipboard = inject(Clipboard);

  loading = signal(true);
  websites = signal<WebsiteModel[]>([]);
  columns = ['name', 'domain', 'apiKey', 'createdAt', 'actions'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.websiteService.getAll().subscribe({
      next: (data) => { this.websites.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  viewDetail(id: string) { this.router.navigate(['/websites', id]); }

  copyApiKey(key: string) {
    this.clipboard.copy(key);
    this.snack.open('API key copied to clipboard!', '', { duration: 2000 });
  }

  confirmDelete(w: WebsiteModel) {
    if (!confirm(`Delete "${w.name}"? This will remove all consent logs for this website.`)) return;
    this.websiteService.delete(w.id).subscribe({
      next: () => { this.snack.open('Website deleted.', '', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Failed to delete website.', 'Close', { duration: 4000 })
    });
  }
}
