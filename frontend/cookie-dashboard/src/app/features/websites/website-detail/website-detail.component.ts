import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { WebsiteService } from '../../../core/services/website.service';
import { WebsiteModel } from '../../../shared/models/website.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-website-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatListModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule, ClipboardModule
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/websites"><mat-icon>arrow_back</mat-icon></button>
      <h2>{{ website()?.name || 'Website Details' }}</h2>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else if (website(); as w) {
      <div class="detail-grid">

        <!-- Info Card -->
        <mat-card>
          <mat-card-header><mat-card-title>Website Info</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <span class="label">Name</span>
              <span>{{ w.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Domain</span>
              <a [href]="w.domain" target="_blank" class="domain-link">{{ w.domain }}</a>
            </div>
            <div class="info-row">
              <span class="label">API Key</span>
              <div class="api-key-row">
                <code class="api-key">{{ w.apiKey }}</code>
                <button mat-icon-button [matTooltip]="'Copy API key'" (click)="copy(w.apiKey, 'API key copied!')">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Categories Card -->
        <mat-card>
          <mat-card-header><mat-card-title>Cookie Categories</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-list>
              @for (cat of w.categories; track cat.id) {
                <mat-list-item>
                  <mat-icon matListItemIcon>{{ cat.isRequired ? 'lock' : 'tune' }}</mat-icon>
                  <span matListItemTitle>{{ cat.name | titlecase }}</span>
                  <span matListItemLine>{{ cat.description }}</span>
                  <mat-chip-set matListItemMeta>
                    <mat-chip [color]="cat.isRequired ? 'warn' : 'primary'" selected>
                      {{ cat.isRequired ? 'Required' : 'Optional' }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Snippet Card -->
        <mat-card class="snippet-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>code</mat-icon> Embed Script
            </mat-card-title>
            <mat-card-subtitle>Add this snippet to your website's &lt;head&gt; tag</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <pre class="snippet-code">{{ getSnippet(w) }}</pre>
            <button mat-raised-button color="primary" (click)="copy(getSnippet(w), 'Snippet copied!')">
              <mat-icon>content_copy</mat-icon> Copy Snippet
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Usage Card -->
        <mat-card>
          <mat-card-header><mat-card-title>Block Scripts Until Consent</mat-card-title></mat-card-header>
          <mat-card-content>
            <p style="color:#64748b;font-size:14px;margin-top:0">
              Add <code>type="text/plain"</code> and <code>data-category</code> to any script you want to block until user consents:
            </p>
            <pre class="snippet-code">{{ blockingExample }}</pre>
            <button mat-stroked-button (click)="copy(blockingExample, 'Example copied!')">
              <mat-icon>content_copy</mat-icon> Copy Example
            </button>
          </mat-card-content>
        </mat-card>

      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1e293b; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 20px; }
    .info-row { display: flex; flex-direction: column; gap: 2px; margin-bottom: 16px; }
    .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
    .domain-link { color: #1a73e8; text-decoration: none; }
    .api-key-row { display: flex; align-items: center; gap: 4px; }
    .api-key { background: #f1f5f9; padding: 4px 10px; border-radius: 4px; font-size: 12px; word-break: break-all; }
    .snippet-card { grid-column: 1 / -1; }
    .snippet-card mat-card-title { display: flex; align-items: center; gap: 8px; }
    .snippet-code { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 13px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; margin-bottom: 12px; }
    @media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class WebsiteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private websiteService = inject(WebsiteService);
  private snack = inject(MatSnackBar);
  private clipboard = inject(Clipboard);

  loading = signal(true);
  website = signal<WebsiteModel | null>(null);

  blockingExample = `<!-- Block analytics scripts until consent -->
<script type="text/plain" data-category="analytics">
  // Your Google Analytics or similar code here
  console.log('Analytics loaded after consent');
</script>

<!-- Block marketing scripts until consent -->
<script type="text/plain" data-category="marketing">
  // Your Facebook Pixel or similar code here
  console.log('Marketing loaded after consent');
</script>`;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.websiteService.getById(id).subscribe({
      next: (w) => { this.website.set(w); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getSnippet(w: WebsiteModel): string {
    return `<!-- Add to your website's <head> tag -->
<script src="${environment.sdkUrl}"
        data-api-key="${w.apiKey}"
        data-api-url="${environment.apiUrl}">
</script>`;
  }

  copy(text: string, message: string) {
    this.clipboard.copy(text);
    this.snack.open(message, '', { duration: 2000 });
  }
}
