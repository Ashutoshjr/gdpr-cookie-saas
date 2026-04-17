import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebsiteService } from '../../../core/services/website.service';
import { WebsiteModel } from '../../../shared/models/website.model';
import { environment } from '../../../../environments/environment';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-website-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatListModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, ClipboardModule,
    MatDividerModule
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
            <div class="regen-row">
              <button mat-stroked-button color="warn" [disabled]="regenerating()"
                      (click)="confirmRegenerate(w.id)">
                <mat-icon>refresh</mat-icon>
                {{ regenerating() ? 'Regenerating…' : 'Regenerate API Key' }}
              </button>
              <span class="regen-hint">Old key stops working immediately. Update your embed snippet.</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Edit Website Info Card -->
        <mat-card>
          <mat-card-header>
            <mat-card-title><mat-icon>edit</mat-icon> Edit Website</mat-card-title>
            <mat-card-subtitle>Update the website name or domain</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="infoForm" (ngSubmit)="saveInfo(w.id)" class="info-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Website Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Domain</mat-label>
                <input matInput formControlName="domain" placeholder="https://example.com">
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="savingInfo()">
                <mat-icon>save</mat-icon>
                {{ savingInfo() ? 'Saving…' : 'Save' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Banner Customization Card -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>palette</mat-icon> Banner Customization
            </mat-card-title>
            <mat-card-subtitle>Customize how your cookie banner looks on your website</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="appearanceForm" (ngSubmit)="saveAppearance(w.id)" class="appearance-form">

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Banner Title</mat-label>
                <input matInput formControlName="bannerTitle" placeholder="We use cookies">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Banner Description</mat-label>
                <textarea matInput formControlName="bannerDescription" rows="2"
                  placeholder="We use cookies to improve your experience..."></textarea>
              </mat-form-field>

              <div class="color-position-row">
                <div class="color-field">
                  <span class="label">Primary Color</span>
                  <div class="color-input-row">
                    <input type="color" formControlName="primaryColor" class="color-picker">
                    <span class="color-value">{{ appearanceForm.get('primaryColor')?.value }}</span>
                  </div>
                </div>

                <mat-form-field appearance="outline" class="position-select">
                  <mat-label>Banner Position</mat-label>
                  <mat-select formControlName="bannerPosition">
                    <mat-option value="bottom">Bottom</mat-option>
                    <mat-option value="top">Top</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="color-position-row">
                <mat-form-field appearance="outline" class="position-select">
                  <mat-label>Banner Language</mat-label>
                  <mat-select formControlName="language">
                    <mat-option value="en">🇬🇧 English</mat-option>
                    <mat-option value="de">🇩🇪 German</mat-option>
                    <mat-option value="fr">🇫🇷 French</mat-option>
                    <mat-option value="es">🇪🇸 Spanish</mat-option>
                    <mat-option value="it">🇮🇹 Italian</mat-option>
                    <mat-option value="pt">🇵🇹 Portuguese</mat-option>
                    <mat-option value="nl">🇳🇱 Dutch</mat-option>
                    <mat-option value="pl">🇵🇱 Polish</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="geo-toggle">
                  <mat-slide-toggle formControlName="geoRestrictionEnabled" color="primary">
                    EU Visitors Only
                  </mat-slide-toggle>
                  <span class="geo-hint">When enabled, banner only shows to visitors from EU/EEA countries</span>
                </div>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Privacy Policy URL</mat-label>
                <input matInput formControlName="privacyPolicyUrl" placeholder="https://example.com/privacy-policy">
                <mat-icon matPrefix>policy</mat-icon>
                <mat-hint>Shown as a link in your cookie banner (optional)</mat-hint>
              </mat-form-field>

              <!-- Live Preview -->
              <div class="preview-label">Preview</div>
              <div class="banner-preview" [style.borderColor]="appearanceForm.get('primaryColor')?.value">
                <div class="preview-content">
                  <div class="preview-position-badge">{{ appearanceForm.get('bannerPosition')?.value }}</div>
                  <p class="preview-title">{{ appearanceForm.get('bannerTitle')?.value || 'We use cookies' }}</p>
                  <p class="preview-desc">{{ appearanceForm.get('bannerDescription')?.value }}</p>
                </div>
                <div class="preview-buttons">
                  <span class="preview-btn preview-btn-accept"
                    [style.background]="appearanceForm.get('primaryColor')?.value">Accept All</span>
                  <span class="preview-btn preview-btn-reject">Reject All</span>
                  <span class="preview-btn-link"
                    [style.color]="appearanceForm.get('primaryColor')?.value">Customize</span>
                </div>
              </div>

              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                <mat-icon>save</mat-icon>
                {{ saving() ? 'Saving…' : 'Save Appearance' }}
              </button>
            </form>
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
            <mat-card-title><mat-icon>code</mat-icon> Embed Script</mat-card-title>
            <mat-card-subtitle>Add this snippet to your website's &lt;head&gt; tag</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <pre class="snippet-code">{{ getSnippet(w) }}</pre>
            <button mat-raised-button color="primary" (click)="copy(getSnippet(w), 'Snippet copied!')">
              <mat-icon>content_copy</mat-icon> Copy Snippet
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Cookie Policy Generator Card -->
        <mat-card class="snippet-card">
          <mat-card-header>
            <mat-card-title><mat-icon>description</mat-icon> Cookie Policy Generator</mat-card-title>
            <mat-card-subtitle>Auto-generate a cookie policy page from your categories</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="policy-actions">
              <button mat-raised-button color="primary" [disabled]="loadingPolicy()"
                      (click)="generatePolicy(w.id)">
                <mat-icon>auto_awesome</mat-icon>
                {{ loadingPolicy() ? 'Generating…' : 'Generate Cookie Policy' }}
              </button>
              @if (policyHtml()) {
                <button mat-stroked-button (click)="copy(policyRaw(), 'Policy HTML copied!')">
                  <mat-icon>content_copy</mat-icon> Copy HTML
                </button>
              }
            </div>
            @if (policyHtml()) {
              <mat-divider style="margin: 16px 0"></mat-divider>
              <p class="policy-hint">Preview — paste this HTML into your website's cookie policy page:</p>
              <div class="policy-preview" [innerHTML]="policyHtml()"></div>
            }
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

    /* Info Form */
    .info-form { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .regen-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
    .regen-hint { font-size: 11px; color: #94a3b8; max-width: 260px; line-height: 1.4; }

    /* Cookie Policy */
    .policy-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
    .policy-hint { font-size: 12px; color: #94a3b8; margin: 0 0 12px; }
    .policy-preview { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; background: #fff;
      font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #1e293b; max-height: 480px; overflow-y: auto; }
    .policy-preview h1 { font-size: 22px; margin: 0 0 8px; }
    .policy-preview h2 { font-size: 17px; margin: 20px 0 6px; color: #1a73e8; }
    .policy-preview h3 { font-size: 15px; margin: 14px 0 4px; }
    .policy-preview p { margin: 0 0 10px; }
    .policy-preview a { color: #1a73e8; }

    /* Appearance Form */
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    .appearance-form { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
    .full-width { width: 100%; }
    .color-position-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .color-field { display: flex; flex-direction: column; gap: 6px; }
    .color-input-row { display: flex; align-items: center; gap: 10px; }
    .color-picker { width: 48px; height: 38px; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; padding: 2px; }
    .color-value { font-size: 13px; color: #475569; font-family: monospace; }
    .position-select { min-width: 160px; }

    /* Geo toggle */
    .geo-toggle { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
    .geo-hint { font-size: 11px; color: #94a3b8; max-width: 220px; line-height: 1.4; }

    /* Preview */
    .preview-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
    .banner-preview { border: 2px solid; border-radius: 8px; padding: 14px 16px; background: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .preview-content { flex: 1; min-width: 180px; }
    .preview-position-badge { font-size: 10px; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-bottom: 6px; text-transform: uppercase; }
    .preview-title { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111; }
    .preview-desc { margin: 0; font-size: 12px; color: #666; }
    .preview-buttons { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .preview-btn { padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .preview-btn-reject { background: #f1f3f4; color: #333; }
    .preview-btn-link { font-size: 12px; text-decoration: underline; cursor: pointer; }

    @media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class WebsiteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private websiteService = inject(WebsiteService);
  private sanitizer = inject(DomSanitizer);
  private snack = inject(MatSnackBar);
  private clipboard = inject(Clipboard);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  savingInfo = signal(false);
  regenerating = signal(false);
  loadingPolicy = signal(false);
  policyHtml = signal<SafeHtml | null>(null);
  policyRaw = signal('');
  website = signal<WebsiteModel | null>(null);

  infoForm = this.fb.group({
    name: ['', Validators.required],
    domain: ['', Validators.required]
  });

  appearanceForm = this.fb.group({
    primaryColor: ['#1a73e8', Validators.required],
    bannerTitle: ['We use cookies', Validators.required],
    bannerDescription: ['We use cookies to improve your experience. You can choose which categories to allow.', Validators.required],
    bannerPosition: ['bottom', Validators.required],
    language: ['en', Validators.required],
    geoRestrictionEnabled: [false],
    privacyPolicyUrl: ['']
  });

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
      next: (w) => {
        this.website.set(w);
        this.infoForm.patchValue({ name: w.name, domain: w.domain });
        this.appearanceForm.patchValue({
          primaryColor: w.primaryColor || '#1a73e8',
          bannerTitle: w.bannerTitle || 'We use cookies',
          bannerDescription: w.bannerDescription || 'We use cookies to improve your experience.',
          bannerPosition: w.bannerPosition || 'bottom',
          language: w.language || 'en',
          geoRestrictionEnabled: w.geoRestrictionEnabled || false,
          privacyPolicyUrl: w.privacyPolicyUrl || ''
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveInfo(websiteId: string) {
    if (this.infoForm.invalid) return;
    this.savingInfo.set(true);
    this.websiteService.updateInfo(websiteId, this.infoForm.value as any).subscribe({
      next: (updated) => {
        this.website.set(updated);
        this.savingInfo.set(false);
        this.snack.open('Website info saved!', '', { duration: 3000 });
      },
      error: () => {
        this.savingInfo.set(false);
        this.snack.open('Failed to save website info', '', { duration: 3000 });
      }
    });
  }

  saveAppearance(websiteId: string) {
    if (this.appearanceForm.invalid) return;
    this.saving.set(true);
    this.websiteService.updateAppearance(websiteId, this.appearanceForm.value as any).subscribe({
      next: (updated) => {
        this.website.set(updated);
        this.saving.set(false);
        this.snack.open('Banner appearance saved!', '', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Failed to save appearance', '', { duration: 3000 });
      }
    });
  }

  confirmRegenerate(websiteId: string) {
    const ok = window.confirm(
      'Are you sure you want to regenerate the API key?\n\nThe old key will stop working immediately. You must update the embed snippet on your website.'
    );
    if (!ok) return;
    this.regenerating.set(true);
    this.websiteService.regenerateKey(websiteId).subscribe({
      next: (updated) => {
        this.website.set(updated);
        this.regenerating.set(false);
        this.snack.open('API key regenerated! Update your embed snippet.', '', { duration: 5000 });
      },
      error: () => {
        this.regenerating.set(false);
        this.snack.open('Failed to regenerate API key', '', { duration: 3000 });
      }
    });
  }

  generatePolicy(websiteId: string) {
    this.loadingPolicy.set(true);
    this.policyHtml.set('');
    this.websiteService.getCookiePolicy(websiteId).subscribe({
      next: (res) => {
        this.policyRaw.set(res.html);
        this.policyHtml.set(this.sanitizer.bypassSecurityTrustHtml(res.html));
        this.loadingPolicy.set(false);
        this.snack.open('Cookie policy generated!', '', { duration: 2000 });
      },
      error: () => {
        this.loadingPolicy.set(false);
        this.snack.open('Failed to generate policy', '', { duration: 3000 });
      }
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
